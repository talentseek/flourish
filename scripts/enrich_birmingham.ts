
import { PrismaClient, LocationType } from '@prisma/client'

const prisma = new PrismaClient()

// Research Data Source: Jan 26, 2026
const LOCATIONS = [
    // --- CITY CENTRE ARCADES & MALLS ---
    {
        name: "The Square Shopping Centre", // "The Square"
        type: LocationType.SHOPPING_CENTRE,
        address: "The Priory Queensway",
        street: "The Priory Queensway",
        city: "Birmingham",
        county: "West Midlands",
        postcode: "B4 7LJ",
        tenants: ["Greggs", "CEX", "McDonalds", "Shoe Zone"],
        anchors: [],
        description: "Value-focused mall near Bull Street."
    },
    {
        name: "Great Western Arcade",
        type: LocationType.SHOPPING_CENTRE,
        address: "Colmore Row",
        street: "Colmore Row",
        city: "Birmingham",
        county: "West Midlands",
        postcode: "B2 5HU",
        tenants: ["Loki Wine", "The Whisky Shop", "Mr Simms", "Independent Boutiques"],
        anchors: [],
        description: "Elegant Victorian arcade known for independents."
    },
    {
        name: "Piccadilly Arcade",
        type: LocationType.SHOPPING_CENTRE,
        address: "New Street",
        street: "New Street",
        city: "Birmingham",
        county: "West Midlands",
        postcode: "B2 4EU",
        tenants: ["Cotswold Outdoor", "Faculty Coffee", "Onyx Jewellers", "Shepherds Barber"],
        anchors: [],
        description: "Historic arcade connecting New Street and Station Street."
    },
    {
        name: "City Arcade",
        type: LocationType.SHOPPING_CENTRE,
        address: "Union Street",
        street: "Union Street",
        city: "Birmingham",
        county: "West Midlands",
        postcode: "B2 4TX",
        tenants: ["Tilt", "Barbers", "Cafe"],
        anchors: [],
        description: "Small surviving section of a Victorian arcade."
    },
    {
        name: "Bullring Markets", // "Rag Market", "Indoor Market"
        type: LocationType.HIGH_STREET,
        address: "Edgbaston Street",
        street: "Edgbaston Street",
        city: "Birmingham",
        county: "West Midlands",
        postcode: "B5 4RB",
        tenants: ["Fish Market", "Rag Market", "Open Market", "Haberdashery"],
        anchors: [],
        description: "Historic markets including the famous Rag Market."
    },

    // --- RETAIL PARKS ---
    {
        name: "Urban Exchange",
        type: LocationType.RETAIL_PARK,
        address: "Aston Hall Road",
        street: "Aston Hall Road",
        city: "Birmingham",
        county: "West Midlands",
        postcode: "B6 7FE",
        tenants: ["Go Outdoors", "Outlet Retailers"],
        anchors: ["Go Outdoors"],
        description: "Retail park on the ring road."
    },
    {
        name: "Princess Alice Retail Park", // New Oscott
        type: LocationType.RETAIL_PARK,
        address: "Princess Alice Drive",
        street: "Princess Alice Drive",
        city: "Birmingham", // Sutton Coldfield border
        county: "West Midlands",
        postcode: "B73 6RB",
        tenants: ["Tesco Extra", "Next", "Marks & Spencer", "Boots", "Costa"],
        anchors: ["Tesco Extra", "Next", "Marks & Spencer"],
        description: "Major retail cluster in New Oscott."
    },

    // --- SUTTON COLDFIELD ---
    {
        name: "The Gracechurch Centre",
        type: LocationType.SHOPPING_CENTRE,
        address: "Parade",
        street: "Parade",
        city: "Sutton Coldfield",
        county: "West Midlands",
        postcode: "B72 1PA",
        tenants: ["H&M", "River Island", "Pandora", "House of Fraser", "Lakeland"],
        anchors: ["House of Fraser"],
        description: "Main shopping centre in Sutton Coldfield."
    },
    {
        name: "Mulberry Walk",
        type: LocationType.RETAIL_PARK, // Lifestyle centre
        address: "Mere Green Road",
        street: "Mere Green Road",
        city: "Sutton Coldfield",
        county: "West Midlands",
        postcode: "B75 5BS",
        tenants: ["Marks & Spencer Foodhall", "Boots", "Gusto", "Bistrot Pierre"],
        anchors: ["Marks & Spencer Foodhall"],
        description: "Premium lifestyle development in Mere Green."
    },
    {
        name: "The Red Rose Centre",
        type: LocationType.SHOPPING_CENTRE,
        address: "Lower Parade",
        street: "Lower Parade",
        city: "Sutton Coldfield",
        county: "West Midlands",
        postcode: "B72 1XX", // Approx
        tenants: ["Wilko", "Specsavers", "Library"], // Wilko historical
        anchors: [],
        description: "Secondary precinct in Sutton Coldfield."
    },

    // --- SUBURBAN HIGH STREETS ---
    {
        name: "Kings Heath High Street",
        type: LocationType.HIGH_STREET,
        address: "High Street",
        street: "High Street",
        city: "Birmingham",
        county: "West Midlands",
        postcode: "B14 7JZ",
        tenants: ["Asda", "Sainsburys", "The Range", "Iceland", "Wilko"],
        anchors: ["Asda", "Sainsburys"],
        description: "One of Birmingham's busiest high streets."
    },
    {
        name: "Harborne High Street",
        type: LocationType.HIGH_STREET,
        address: "High Street",
        street: "High Street",
        city: "Birmingham",
        county: "West Midlands",
        postcode: "B17 9PP",
        tenants: ["Waitrose", "Marks & Spencer Foodhall", "Oliver Bonas", "Charity Shops"],
        anchors: ["Waitrose"],
        description: "Affluent high street with premium food and independent retail."
    },

    // --- DISTRICTS ---
    {
        name: "Jewellery Quarter",
        type: LocationType.HIGH_STREET, // District
        address: "Vyse Street",
        street: "Vyse Street",
        city: "Birmingham",
        county: "West Midlands",
        postcode: "B18 6JS",
        tenants: ["Jewellers", "Workshops", "Independent Bars"],
        anchors: [],
        description: "Historic district with over 100 jewellery retailers."
    },
    {
        name: "Balti Triangle",
        type: LocationType.HIGH_STREET, // District
        address: "Ladypool Road",
        street: "Ladypool Road",
        city: "Birmingham",
        county: "West Midlands",
        postcode: "B12 8JY",
        tenants: ["Restaurants", "Asian Fashion", "Fabric Shops"],
        anchors: [],
        description: "Famous dining and retail triangle."
    }
]

async function main() {
    console.log("Starting Birmingham Enrichment...")

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
            isManaged: false // Default to false
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

    console.log("Birmingham Enrichment Complete.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
