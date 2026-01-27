
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking for duplicates (Same Website + Same Postcode)...')

    // Fetch all locations with valid website
    // Postcode is required in schema so theoretically exists, but could be empty string
    const locations = await prisma.location.findMany({
        where: {
            website: { not: null }
        },
        select: {
            id: true,
            name: true,
            website: true,
            postcode: true,
            town: true
        }
    })

    console.log(`Scanning ${locations.length} locations with website...`)

    // Grouping
    const groups = new Map<string, typeof locations>()

    for (const loc of locations) {
        if (!loc.website || !loc.postcode) continue
        if (loc.website.trim() === '' || loc.postcode.trim() === '') continue

        // Normalize
        const cleanPostcode = loc.postcode.replace(/\s+/g, '').toUpperCase()
        const cleanWebsite = loc.website.trim().toLowerCase().replace(/\/$/, '') // Remove trailing slash

        const key = `${cleanPostcode}|${cleanWebsite}`

        if (!groups.has(key)) {
            groups.set(key, [])
        }
        groups.get(key)?.push(loc)
    }

    // Filter for duplicates
    const duplicates = Array.from(groups.values()).filter(g => g.length > 1)

    if (duplicates.length === 0) {
        console.log('✅ No duplicates found based on Website + Postcode.')
    } else {
        console.log(`⚠️  Found ${duplicates.length} duplicate sets:`)
        console.log('------------------------------------------------')

        duplicates.forEach((group, index) => {
            console.log(`Set #${index + 1}: [Postcode: ${group[0].postcode}, Web: ${group[0].website}]`)
            group.forEach(loc => {
                console.log(`  - ID: ${loc.id} | Name: "${loc.name}" | Town: ${loc.town}`)
            })
            console.log('')
        })
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
