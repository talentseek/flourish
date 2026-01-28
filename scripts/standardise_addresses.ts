
const { PrismaClient } = require('@prisma/client')
const axios = require('axios')

const prisma = new PrismaClient()

// Postcodes.io Bulk Lookup Type
type BulkPostcodeResponse = {
    result: {
        query: string
        result: {
            postcode: string
            quality: number
            eastings: number
            northings: number
            country: string
            nhs_ha: string
            longitude: number
            latitude: number
            european_electoral_region: string
            primary_care_trust: string
            region: string
            lsoa: string
            msoa: string
            incode: string
            outcode: string
            parliamentary_constituency: string
            admin_district: string
            parish: string
            admin_county: string | null
            admin_ward: string
            ced: string | null
            ccg: string
            nuts: string
            codes: {
                admin_district: string
                admin_county: string
                admin_ward: string
                parish: string
                parliamentary_constituency: string
                ccg: string
                ced: string
                nuts: string
            }
        } | null
    }[]
}

async function main() {
    console.log('Starting Address Standardization...')

    // 1. Get all locations with a postcode
    const locations = await prisma.location.findMany({
        where: {
            postcode: { not: '' }
        },
        select: { id: true, postcode: true, city: true, address: true, name: true }
    })

    console.log(`Found ${locations.length} locations to process.`)

    // 2. Procss in batches of 100 (Postcodes.io limit)
    const BATCH_SIZE = 100
    for (let i = 0; i < locations.length; i += BATCH_SIZE) {
        const batch = locations.slice(i, i + BATCH_SIZE)
        const postcodes = batch.map(b => b.postcode)

        console.log(`Processing batch ${i} - ${i + batch.length}...`)

        try {
            const response = await axios.post<BulkPostcodeResponse>('https://api.postcodes.io/postcodes', {
                postcodes: postcodes
            })

            const results = response.data.result

            for (const item of results) {
                const data = item.result
                if (!data) continue // Invalid postcode

                const loc = batch.find(l => l.postcode === item.query)
                if (!loc) continue

                // Heuristic: Ensure "Town" isn't a County name
                // Many records have City="Kent". We want Town="Ashford" (e.g. from Admin District if generic)
                // Or keep existing City if it looks like a town

                let town = loc.city
                const BAD_CITY_NAMES = ['Kent', 'Surrey', 'Essex', 'Greater London', 'West Midlands', 'Merseyside', 'Tyne and Wear']

                if (BAD_CITY_NAMES.includes(loc.city) || !loc.city) {
                    // Fallback to Admin District first (often "Warwick"), or Parliamentary Constituency ("Warwick and Leamington")
                    // Ideally we want "Leamington Spa". Postcodes.io doesn't strictly give "Post Town".
                    // Let's use Admin District as a safe administrative fallback for now, often better than "Kent".
                    town = data.admin_district
                }

                // Street extraction (First line of address that isn't city/postcode)
                // Simple heuristic: Take first part of comma split
                let street = loc.address.split(',')[0].trim()
                if (street === loc.name || street === loc.city || street === loc.postcode) {
                    street = "" // Clear if it's just repeating data
                }

                await prisma.location.update({
                    where: { id: loc.id },
                    data: {
                        region: data.region || data.european_electoral_region, // Fallback for Wales/Scotland sometimes
                        country: data.country,
                        district: data.admin_district,
                        town: town, // Standardized or Preserved
                        street: street,
                        latitude: data.latitude, // Bonus: standardise coords
                        longitude: data.longitude
                    }
                })
            }

        } catch (err) {
            console.error(`Batch failed:`, err)
        }
    }

    console.log('Standardization Complete.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
