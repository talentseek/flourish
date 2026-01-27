
import { PrismaClient, LocationType } from '@prisma/client'

const prisma = new PrismaClient()

// Research Data Source: Jan 26, 2026
const LOCATIONS = [
    // --- WORCESTER CITY ---
    {
        name: "Friary Walk", // Part of Crowngate but often listed distinctly or merged
        type: LocationType.SHOPPING_CENTRE,
        address: "Angel Place",
        street: "Angel Place",
        city: "Worcester",
        county: "Worcestershire",
        postcode: "WR1 3LE",
        tenants: ["New Look", "Vision Express", "Superdrug"],
        anchors: ["New Look"],
        description: "Bustling mall section of Crowngate."
    },
    {
        name: "Chapel Walk", // Premium part of Crowngate
        type: LocationType.SHOPPING_CENTRE,
        address: "Broad Street",
        street: "Broad Street",
        city: "Worcester",
        county: "Worcestershire",
        postcode: "WR1 3LE",
        tenants: ["Jo Malone", "White Stuff", "House of Fraser", "Primark"],
        anchors: ["House of Fraser", "Primark"],
        description: "Premium open-air quarter of Crowngate."
    },
    {
        name: "St Martin’s Quarter",
        type: LocationType.RETAIL_PARK, // Open air mix
        address: "Silver Street",
        street: "Silver Street",
        city: "Worcester",
        county: "Worcestershire",
        postcode: "WR1 2DA",
        tenants: ["Asda", "B&M", "Costa", "Sports Direct"],
        anchors: ["Asda"],
        description: "Modern retail, dining and leisure quarter."
    },
    {
        name: "Tybridge Retail Park",
        type: LocationType.RETAIL_PARK,
        address: "Tybridge Street",
        street: "Tybridge Street",
        city: "Worcester",
        county: "Worcestershire",
        postcode: "WR2 5BA",
        tenants: ["Aldi", "McDonalds", "The Range"],
        anchors: ["Aldi", "The Range"],
        description: "Convenience retail park west of the river."
    },

    // --- KIDDERMINSTER ---
    {
        name: "Spennells Valley Retail", // Cluster around Morrisons
        type: LocationType.RETAIL_PARK,
        address: "Spennells Valley Road",
        street: "Spennells Valley Road",
        city: "Kidderminster",
        county: "Worcestershire",
        postcode: "DY10 1XS", // Industrial/Retail area
        tenants: ["Morrisons", "Trade Counters"],
        anchors: ["Morrisons"],
        description: "Retail and trade cluster anchored by Morrisons."
    },

    // --- MALVERN ---
    {
        name: "Great Malvern Town Centre",
        type: LocationType.HIGH_STREET,
        address: "Church Street",
        street: "Church Street",
        city: "Malvern",
        county: "Worcestershire",
        postcode: "WR14 2AA",
        tenants: ["Waitrose", "Independent Bookshops", "Antique Dealers", "FatFace"],
        anchors: ["Waitrose"],
        description: "Historic spa town centre with independent focus."
    },

    // --- DROITWICH ---
    {
        name: "St Andrews Square",
        type: LocationType.SHOPPING_CENTRE,
        address: "St Andrews Street",
        street: "St Andrews Street",
        city: "Droitwich",
        county: "Worcestershire",
        postcode: "WR9 8HE",
        tenants: ["Morrisons", "Wilko", "Boots"],
        anchors: ["Morrisons"],
        description: "Open air shopping precinct in Droitwich."
    }
]

async function main() {
    console.log("Starting Worcestershire Enrichment...")

    for (const loc of LOCATIONS) {
        console.log(`Processing ${loc.name}...`)

        let location = await prisma.location.findFirst({
            where: {
                OR: [
                    { name: loc.name },
                    { postcode: loc.postcode, name: { contains: loc.name.split(' ')[0] } }
                ]
            }
        })

        const data = {
            name: loc.name,
            type: loc.type,
            address: loc.address,
            street: loc.street,
            town: loc.city,
            city: loc.city,
            county: loc.county,
            region: "West Midlands",
            country: "England",
            postcode: loc.postcode,
            latitude: 0,
            longitude: 0,
            anchorTenants: loc.anchors.length,
            numberOfStores: loc.tenants.length,
            isManaged: false // Default to false unless explicitly known
        }

        if (location) {
            console.log(`Found existing ${loc.name}, updating...`)
            location = await prisma.location.update({
                where: { id: location.id },
                data: data
            })
        } else {
            console.log(`Creating new ${loc.name}...`)
            location = await prisma.location.create({
                data: data
            })
        }

        // Tenants
        console.log(`Seeding ${loc.tenants.length} tenants...`)
        for (const t of loc.tenants) {
            await prisma.tenant.upsert({
                where: {
                    locationId_name: {
                        locationId: location.id,
                        name: t
                    }
                },
                update: {
                    isAnchorTenant: loc.anchors.includes(t)
                },
                create: {
                    locationId: location.id,
                    name: t,
                    category: "Retail",
                    isAnchorTenant: loc.anchors.includes(t)
                }
            })
        }
    }

    console.log("Worcestershire Enrichment Complete.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
