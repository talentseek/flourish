
import { PrismaClient, LocationType } from '@prisma/client'

const prisma = new PrismaClient()

// Research Data Source: Jan 26, 2026
const LOCATIONS = [
    // --- WALSALL TOWN ---
    {
        name: "Saddlers Shopping Centre",
        type: LocationType.SHOPPING_CENTRE,
        address: "Park Street",
        street: "Park Street",
        city: "Walsall",
        county: "West Midlands",
        postcode: "WS2 9NW",
        tenants: ["Claire's", "Costa", "TJ Hughes", "Burger King"],
        anchors: ["TJ Hughes"],
        description: "Main indoor mall connected to train station."
    },
    {
        name: "Old Square Shopping Centre",
        type: LocationType.SHOPPING_CENTRE,
        address: "Old Square",
        street: "Old Square",
        city: "Walsall",
        county: "West Midlands",
        postcode: "WS1 1QA",
        tenants: ["Primark", "Co-op Food", "Savers", "CEX"],
        anchors: ["Primark"],
        description: "Shopping centre near the market area."
    },
    {
        name: "Victorian Arcade",
        type: LocationType.SHOPPING_CENTRE, // Arcade
        address: "The Arcade",
        street: "The Arcade",
        city: "Walsall",
        county: "West Midlands",
        postcode: "WS1 1RE",
        tenants: ["Independent Specialists", "Cafes"],
        anchors: [],
        description: "Historic L-shaped arcade."
    },

    // --- BROWNHILLS ---
    {
        name: "Brownhills High Street",
        type: LocationType.HIGH_STREET,
        address: "High Street",
        street: "High Street",
        city: "Brownhills",
        county: "West Midlands",
        postcode: "WS8 6HW", // Generic High St postcode 
        tenants: ["Tesco Superstore", "B&M", "Poundland"],
        anchors: ["Tesco Superstore"],
        description: "Main retail corridor for Brownhills."
    },
    {
        name: "Ravens Court",
        type: LocationType.SHOPPING_CENTRE, // Precinct
        address: "High Street",
        street: "High Street",
        city: "Brownhills",
        county: "West Midlands",
        postcode: "WS8 6EJ",
        tenants: ["Local Shops"],
        anchors: [],
        description: "Shopping precinct off High Street."
    },
    {
        name: "Silver Court",
        type: LocationType.SHOPPING_CENTRE, // Parade
        address: "Silver Court",
        street: "Silver Court",
        city: "Brownhills",
        county: "West Midlands",
        postcode: "WS8 6HA",
        tenants: ["Local Parade"],
        anchors: [],
        description: "Small shopping parade."
    },

    // --- TOWNS ---
    {
        name: "Bloxwich High Street",
        type: LocationType.HIGH_STREET,
        address: "High Street",
        street: "High Street",
        city: "Bloxwich",
        county: "West Midlands",
        postcode: "WS3 3JX",
        tenants: ["Asda", "Greggs", "Specsavers"],
        anchors: ["Asda"],
        description: "Long traditional high street."
    },
    {
        name: "Willenhall Town Centre", // Market Place
        type: LocationType.HIGH_STREET,
        address: "Market Place",
        street: "Market Place",
        city: "Willenhall",
        county: "West Midlands",
        postcode: "WV13 2AA",
        tenants: ["Lidl", "Morrisons nearby", "Market"],
        anchors: ["Lidl"],
        description: "Town centre centred around Market Place."
    },
    {
        name: "Darlaston Town Centre", // Asda Hub
        type: LocationType.HIGH_STREET,
        address: "St Lawrence Way",
        street: "St Lawrence Way",
        city: "Darlaston",
        county: "West Midlands",
        postcode: "WS10 8UZ",
        tenants: ["Asda", "Local Shops"],
        anchors: ["Asda"],
        description: "Town centre dominated by Asda superstore."
    }
]

async function main() {
    console.log("Starting Walsall Enrichment...")

    for (const loc of LOCATIONS) {
        console.log(`Processing ${loc.name}...`)

        // 1. Check existence
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
            isManaged: false
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

        // 2. Tenants
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

    console.log("Walsall Enrichment Complete.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
