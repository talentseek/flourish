
import { PrismaClient, LocationType } from '@prisma/client'

const prisma = new PrismaClient()

// Research Data Source: Jan 26, 2026
const LOCATIONS = [
    // --- CITY CENTRE ---
    {
        name: "Coventry Market",
        type: LocationType.HIGH_STREET, // Treated as High Street/Market
        address: "Queen Victoria Road",
        street: "Queen Victoria Road",
        city: "Coventry",
        county: "West Midlands",
        postcode: "CV1 3HT",
        tenants: ["Fresh Produce", "Fishmongers", "Haberdashery"],
        anchors: [],
        description: "Historic indoor circular market."
    },
    {
        name: "Upper Precinct",
        type: LocationType.HIGH_STREET, // Pedestrianised Precinct
        address: "Upper Precinct",
        street: "Upper Precinct",
        city: "Coventry",
        county: "West Midlands",
        postcode: "CV1 1DD",
        tenants: ["JD Sports", "River Island", "Foot Locker", "H&M"],
        anchors: ["JD Sports"],
        description: "Newly regenerated pedestrian core of the city centre."
    },
    {
        name: "Fargo Village",
        type: LocationType.SHOPPING_CENTRE, // Creative Quarter / Independent Mall style
        address: "Far Gosford Street",
        street: "Far Gosford Street",
        city: "Coventry",
        county: "West Midlands",
        postcode: "CV1 5ED",
        tenants: ["Twisted Barrel Ale", "Bubble Boba", "Independent Artists", "Vintage Clothing"],
        anchors: [],
        description: "Creative quarter with independent makers and retailers."
    },

    // --- SUBURBAN ---
    {
        name: "Jubilee Crescent",
        type: LocationType.HIGH_STREET, // Shopping Parade
        address: "Jubilee Crescent",
        street: "Jubilee Crescent",
        city: "Coventry",
        county: "West Midlands",
        postcode: "CV6 3ES",
        tenants: ["Tesco Express", "Greggs", "Subway", "Post Office"],
        anchors: ["Tesco Express"],
        description: "Major suburban shopping crescent in Radford."
    }
]

async function main() {
    console.log("Starting Coventry Enrichment...")

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

    console.log("Coventry Enrichment Complete.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
