
import { PrismaClient, LocationType } from '@prisma/client'

const prisma = new PrismaClient()

// Research Data Source: Jan 26, 2026
const LOCATIONS = [
    // --- HEREFORD CITY ---
    {
        name: "High Town",
        type: LocationType.HIGH_STREET,
        address: "High Town",
        street: "High Town",
        city: "Hereford",
        county: "Herefordshire",
        postcode: "HR1 2AA",
        tenants: ["Marks & Spencer", "Primark", "Boots", "WHSmith", "River Island"],
        anchors: ["Marks & Spencer", "Primark"],
        description: "Main pedestrianised shopping precinct."
    },

    // --- HEREFORD RETAIL PARKS ---
    {
        name: "Salmon Retail Park",
        type: LocationType.RETAIL_PARK,
        address: "Holmer Road",
        street: "Holmer Road",
        city: "Hereford",
        county: "Herefordshire",
        postcode: "HR4 9SA",
        tenants: ["B&M", "Oak Furnitureland", "Dreams", "Food Warehouse"],
        anchors: ["B&M", "Food Warehouse"],
        description: "Retail park on Holmer Road."
    },
    {
        name: "Holmer Road Retail Park",
        type: LocationType.RETAIL_PARK,
        address: "Holmer Road",
        street: "Holmer Road",
        city: "Hereford",
        county: "Herefordshire",
        postcode: "HR4 9SA", // Adjacent to Salmon, often same postcode area
        tenants: ["Home Bargains", "Bensons for Beds"],
        anchors: ["Home Bargains"],
        description: "Modern cluster on Holmer Road."
    },

    // --- ROSS-ON-WYE ---
    {
        name: "Ross-on-Wye Town Centre", // Market Place focus
        type: LocationType.HIGH_STREET,
        address: "Market Place",
        street: "Market Place",
        city: "Ross-on-Wye",
        county: "Herefordshire",
        postcode: "HR9 5NX",
        tenants: ["Made in Ross", "Independent Boutiques", "Antique Shops", "Cookware"],
        anchors: [],
        description: "Independent retail scene around Market Place."
    },

    // --- LEDBURY ---
    {
        name: "Hop Pocket Shopping Village",
        type: LocationType.OUTLET_CENTRE, // Shopping Village
        address: "Bishops Frome",
        street: "Bishops Frome",
        city: "Worcester", // Postcode is WR6, practically Herefordshire border but postal Worcester
        county: "Herefordshire", // Administratively Herefordshire
        postcode: "WR6 5BT",
        isManaged: true,
        tenants: ["The Foodhall", "The Wine Shop", "Meyer & Marsh Furniture", "The Craft Centre", "Garden Centre"],
        anchors: ["The Foodhall", "Garden Centre"],
        description: "Rural shopping village in converted farm buildings."
    },
    {
        name: "Ledbury Town Centre",
        type: LocationType.HIGH_STREET,
        address: "High Street",
        street: "High Street",
        city: "Ledbury",
        county: "Herefordshire",
        postcode: "HR8 1DX",
        tenants: ["Tesco Superstore", "Independent Shops"],
        anchors: ["Tesco Superstore"],
        description: "Historic market town centre."
    },

    // --- LEOMINSTER ---
    {
        name: "Drapers Lane",
        type: LocationType.HIGH_STREET,
        address: "Drapers Lane",
        street: "Drapers Lane",
        city: "Leominster",
        county: "Herefordshire",
        postcode: "HR6 8ND",
        tenants: ["Drapers Lane Delicatessen", "Rossiter Books", "Motif", "Antiques"],
        anchors: [],
        description: "Hub for independent shops and antiques."
    },
    {
        name: "Southern Avenue Trade Park",
        type: LocationType.RETAIL_PARK,
        address: "Southern Avenue",
        street: "Southern Avenue",
        city: "Leominster",
        county: "Herefordshire",
        postcode: "HR6 0QF",
        tenants: ["Trade Counters", "Leominster Construction", "Industrial Units"],
        anchors: [],
        description: "Industrial and trade retail area."
    },

    // --- DESTINATIONS ---
    {
        name: "Oakchurch Farm Shop",
        type: LocationType.OUTLET_CENTRE, // "Harrods of Herefordshire"
        address: "Staunton-on-Wye",
        street: "Brecon Road",
        city: "Hereford",
        county: "Herefordshire",
        postcode: "HR4 7NH",
        isManaged: true,
        tenants: ["Food Hall", "Butchery", "Garden Centre", "Clothing Boutique", "Restaurant"],
        anchors: ["Food Hall", "Garden Centre"],
        description: "Large rural destination store."
    }
]

async function main() {
    console.log("Starting Herefordshire Enrichment...")

    for (const loc of LOCATIONS) {
        console.log(`Processing ${loc.name}...`)

        let location = await prisma.location.findFirst({
            where: {
                OR: [
                    { name: loc.name },
                    { postcode: loc.postcode, name: { contains: loc.name.split(' ')[0] } } // Fuzzy postcode match
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
            region: "West Midlands", // Hardcode for consistency
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

    console.log("Herefordshire Enrichment Complete.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
