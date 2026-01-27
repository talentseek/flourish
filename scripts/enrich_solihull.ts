
import { PrismaClient, LocationType } from '@prisma/client'

const prisma = new PrismaClient()

// Research Data Source: Jan 26, 2026
const LOCATIONS = [
    // --- SHIRLEY ---
    {
        name: "Parkgate Shopping Centre",
        type: LocationType.SHOPPING_CENTRE,
        address: "Stratford Road",
        street: "Stratford Road",
        city: "Shirley",
        county: "West Midlands",
        postcode: "B90 3GG",
        tenants: ["Asda", "B&M", "Peacocks", "Greggs", "Prezzo"],
        anchors: ["Asda"],
        description: "New open-air heart of Shirley."
    },
    {
        name: "Stratford Road (Shirley)",
        type: LocationType.HIGH_STREET,
        address: "Stratford Road",
        street: "Stratford Road",
        city: "Shirley",
        county: "West Midlands",
        postcode: "B90 3AH",
        tenants: ["Morrisons", "Aldi", "Independent Retailers"],
        anchors: ["Morrisons"],
        description: "Major retail corridor along the A34."
    },

    // --- MONKSPATH ---
    {
        name: "Solihull Retail Park", // Chalford Way
        type: LocationType.RETAIL_PARK,
        address: "Chalford Way",
        street: "Chalford Way",
        city: "Solihull",
        county: "West Midlands",
        postcode: "B90 4LD",
        tenants: ["Currys", "B&Q", "Hobbycraft", "Pets at Home"],
        anchors: ["B&Q"],
        description: "Main retail park for the town area."
    },

    // --- VILLAGES ---
    {
        name: "Knowle High Street",
        type: LocationType.HIGH_STREET,
        address: "High Street",
        street: "High Street",
        city: "Knowle",
        county: "West Midlands",
        postcode: "B93 0NA",
        tenants: ["Tesco Metro", "Boutiques", "Post Office"],
        anchors: [],
        description: "Affluent village high street."
    },
    {
        name: "St John's Way",
        type: LocationType.SHOPPING_CENTRE, // Precinct
        address: "St John's Way",
        street: "St John's Way",
        city: "Knowle",
        county: "West Midlands",
        postcode: "B93 0LE",
        tenants: ["Tesco Express", "Local Services"],
        anchors: ["Tesco Express"],
        description: "Shopping precinct in Knowle."
    },
    {
        name: "Dorridge Station Retail", // Forest Court area
        type: LocationType.HIGH_STREET, // Station Parade / Precinct
        address: "Station Road",
        street: "Station Road",
        city: "Dorridge",
        county: "West Midlands",
        postcode: "B93 8FG",
        tenants: ["Sainsburys", "Local Shops"],
        anchors: ["Sainsburys"],
        description: "Retail hub centred around Dorridge Station."
    }
]

async function main() {
    console.log("Starting Solihull Enrichment...")

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

    console.log("Solihull Enrichment Complete.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
