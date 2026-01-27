
import { PrismaClient, LocationType } from '@prisma/client'

const prisma = new PrismaClient()

// Research Data Source: Jan 26, 2026
const LOCATIONS = [
    // --- CITY CENTRE ---
    {
        name: "St Johns Retail Park",
        type: LocationType.RETAIL_PARK,
        address: "St Johns Road",
        street: "St Johns Road",
        city: "Wolverhampton",
        county: "West Midlands",
        postcode: "WV2 4SJ",
        tenants: ["Next", "Currys", "The Food Warehouse", "The Gym Group"],
        anchors: ["Next", "The Food Warehouse"],
        description: "Major big box destination near city centre."
    },
    {
        name: "Dudley Street",
        type: LocationType.HIGH_STREET,
        address: "Dudley Street",
        street: "Dudley Street",
        city: "Wolverhampton",
        county: "West Midlands",
        postcode: "WV1 3ER",
        tenants: ["Marks & Spencer", "River Island", "Banks"],
        anchors: ["Marks & Spencer"],
        description: "Main pedestrianised high street."
    },
    {
        name: "Wolverhampton City Market",
        type: LocationType.HIGH_STREET, // Market
        address: "Cleveland Street",
        street: "Cleveland Street",
        city: "Wolverhampton",
        county: "West Midlands",
        postcode: "WV1 3HH",
        tenants: ["Market Traders"],
        anchors: [],
        description: "Historic city market."
    },

    // --- WEDNESFIELD ---
    {
        name: "Wednesfield High Street",
        type: LocationType.HIGH_STREET,
        address: "High Street",
        street: "High Street",
        city: "Wednesfield",
        county: "West Midlands",
        postcode: "WV11 1SX",
        tenants: ["Local Shops", "Post Office"],
        anchors: [],
        description: "Traditional high street adjacent to Bentley Bridge."
    },

    // --- BILSTON ---
    {
        name: "Bilston Market",
        type: LocationType.HIGH_STREET, // Market
        address: "Market Way",
        street: "Market Way",
        city: "Bilston",
        county: "West Midlands",
        postcode: "WV14 0DN",
        tenants: ["Market Traders", "Food Stalls"],
        anchors: [],
        description: "Famous indoor and outdoor market."
    },
    {
        name: "Bilston High Street",
        type: LocationType.HIGH_STREET,
        address: "High Street",
        street: "High Street",
        city: "Bilston",
        county: "West Midlands",
        postcode: "WV14 0EH",
        tenants: ["Morrisons", "Argos", "Poundland"],
        anchors: ["Morrisons"],
        description: "Pedestrianised high street."
    },

    // --- SUBURBAN ---
    {
        name: "Tettenhall", // Upper Green
        type: LocationType.HIGH_STREET,
        address: "Upper Green",
        street: "Upper Green",
        city: "Wolverhampton",
        county: "West Midlands",
        postcode: "WV6 8QQ",
        tenants: ["Boutiques", "Cafes", "Co-op"],
        anchors: [],
        description: "Village green feel with independent shops."
    },
    {
        name: "Codsall Station Retail", // Station Rd
        type: LocationType.HIGH_STREET,
        address: "Station Road",
        street: "Station Road",
        city: "Codsall",
        county: "Staffordshire", // Border but serves Wolves
        postcode: "WV8 1BX",
        tenants: ["Local Businesses", "The Station Pub"],
        anchors: [],
        description: "Retail parade near the station."
    }
]

async function main() {
    console.log("Starting Wolverhampton Enrichment...")

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

    console.log("Wolverhampton Enrichment Complete.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
