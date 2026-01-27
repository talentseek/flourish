
import { PrismaClient, LocationType } from '@prisma/client'

const prisma = new PrismaClient()

// Research Data Source: Jan 26, 2026
const LOCATIONS = [
    // --- STOKE-ON-TRENT ---
    {
        name: "Festival Retail Park", // "Festival Park"
        type: LocationType.RETAIL_PARK,
        address: "Ridgehouse Drive",
        street: "Ridgehouse Drive",
        city: "Stoke-on-Trent",
        county: "Staffordshire",
        postcode: "ST1 5SD",
        tenants: ["Next", "Boots", "JD Sports", "Argos", "B&M", "Go Outdoors"],
        anchors: ["Next", "Boots"],
        description: "Major retail park on the former Garden Festival site."
    },

    // --- CANNOCK ---
    {
        name: "McArthurGlen Designer Outlet West Midlands",
        type: LocationType.OUTLET_CENTRE,
        address: "Eastern Way",
        street: "Eastern Way",
        city: "Cannock",
        county: "Staffordshire",
        postcode: "WS11 7JZ",
        isManaged: true,
        tenants: ["Boss", "Nike", "Adidas", "Coach", "Haribo", "Tommy Hilfiger", "Calvin Klein"],
        anchors: ["Nike", "Adidas"],
        description: "Premier designer outlet for the West Midlands."
    },

    // --- BURTON UPON TRENT ---
    {
        name: "The Octagon Shopping Centre",
        type: LocationType.SHOPPING_CENTRE,
        address: "New Street",
        street: "New Street",
        city: "Burton upon Trent",
        county: "Staffordshire",
        postcode: "DE14 3TN",
        tenants: ["TK Maxx", "Iceland", "Poundland", "Hinds"],
        anchors: ["TK Maxx"],
        description: "Key indoor shopping centre in Burton."
    },

    // --- RUGELEY ---
    {
        name: "Brewery Street Shopping Centre",
        type: LocationType.SHOPPING_CENTRE, // Arcade style
        address: "Brewery Street",
        street: "Brewery Street",
        city: "Rugeley",
        county: "Staffordshire",
        postcode: "WS15 2DY",
        tenants: ["Beauty Lounge", "Independent Shops", "Cafe"],
        anchors: [],
        description: "Local arcade with independent retailers."
    },

    // --- LEEK (DESTINATION) ---
    {
        name: "Getliffes Yard",
        type: LocationType.OUTLET_CENTRE, // Historic Yard / Boutique Cluster
        address: "Derby Street",
        street: "Derby Street",
        city: "Leek",
        county: "Staffordshire",
        postcode: "ST13 6HU",
        isManaged: true,
        tenants: ["Moorlands Wool", "Leek Bar & Grill", "Luxe Boutique", "Independent Cafes"],
        anchors: [],
        description: "Historic glass-covered cobbled yard with boutiques."
    }
]

async function main() {
    console.log("Starting Staffordshire Enrichment...")

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
            isManaged: loc.isManaged || false
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

    console.log("Staffordshire Enrichment Complete.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
