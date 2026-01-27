
import { PrismaClient, LocationType } from '@prisma/client'

const prisma = new PrismaClient()

// Research Data Source: Jan 26, 2026
const LOCATIONS = [
    // --- SHREWSBURY ---
    {
        name: "Darwin Shopping Centre",
        type: LocationType.SHOPPING_CENTRE,
        address: "Raven Meadows",
        street: "Raven Meadows",
        city: "Shrewsbury",
        county: "Shropshire",
        postcode: "SY1 1PL",
        tenants: ["Marks & Spencer", "Primark", "H&M", "Home Bargains", "JD Sports", "New Look", "River Island", "Pandora"],
        anchors: ["Marks & Spencer", "Primark"],
        description: "Shrewsbury's premier indoor shopping centre."
    },
    {
        name: "Harlescott Retail Park",
        type: LocationType.RETAIL_PARK,
        address: "Harlescott Lane",
        street: "Harlescott Lane",
        city: "Shrewsbury",
        county: "Shropshire",
        postcode: "SY1 3AH", // Matalan
        tenants: ["Matalan", "Iceland", "B&M", "Farmfoods"],
        anchors: ["Matalan"],
        description: "Retail park in North Shrewsbury."
    },
    {
        name: "Arrowpoint Retail Park",
        type: LocationType.RETAIL_PARK,
        address: "Brixton Way",
        street: "Brixton Way",
        city: "Shrewsbury",
        county: "Shropshire",
        postcode: "SY1 3GB",
        tenants: ["Charlies Stores", "Poundstretcher", "British Heart Foundation"],
        anchors: ["Charlies Stores"],
        description: "Located adjacent to Harlescott."
    },

    // --- OSWESTRY ---
    {
        name: "Powis Hall Indoor Market",
        type: LocationType.SHOPPING_CENTRE, // Market Hall
        address: "Bailey Head",
        street: "Bailey Head",
        city: "Oswestry",
        county: "Shropshire",
        postcode: "SY11 1PZ",
        tenants: ["Black Forest Deli", "Evan's Fruit & Veg", "Record Stall", "Haberdashery"],
        anchors: [],
        description: "Historic indoor market hall."
    },
    // Note: Island Green is Wrexham (Wales), excluding from "Shropshire" sweep to avoid data contamination.

    // --- BRIDGNORTH ---
    {
        name: "Central Court Shopping Centre",
        type: LocationType.SHOPPING_CENTRE, // Open air precinct
        address: "High Street",
        street: "High Street",
        city: "Bridgnorth",
        county: "Shropshire",
        postcode: "WV16 4DB",
        tenants: ["Voodoo Valley Records", "Coffee Shop", "Boutiques"],
        anchors: [],
        description: "Open air shopping precinct."
    },
    {
        name: "Bridgnorth Retail Park", // Generic name for Chartwell/Stourbridge Rd area
        type: LocationType.RETAIL_PARK,
        address: "Stourbridge Road",
        street: "Stourbridge Road",
        city: "Bridgnorth",
        county: "Shropshire",
        postcode: "WV15 6AP", // Area around M&S/B&M
        tenants: ["M&S Foodhall", "B&M", "McDonalds"],
        anchors: ["B&M", "M&S Foodhall"],
        description: "Retail cluster on Stourbridge Road."
    },

    // --- MARKET TOWNS ---
    {
        name: "St Mary's Arcade",
        type: LocationType.SHOPPING_CENTRE,
        address: "High Street",
        street: "High Street",
        city: "Whitchurch",
        county: "Shropshire",
        postcode: "SY13 1QY",
        tenants: ["Card Factory", "Specsavers"],
        anchors: [],
        description: "Small arcade connecting High St to car park."
    },
    {
        name: "Waymills Retail Park", // Trade counter area
        type: LocationType.RETAIL_PARK,
        address: "Waymills",
        street: "Waymills",
        city: "Whitchurch",
        county: "Shropshire",
        postcode: "SY13 1TT",
        tenants: ["Screwfix", "Homebase", "Trade Counters"],
        anchors: [],
        description: "Mixed retail and trade location."
    },
    {
        name: "Market Drayton Retail", // Cluster
        type: LocationType.RETAIL_PARK,
        address: "Frogmore Road",
        street: "Frogmore Road",
        city: "Market Drayton",
        county: "Shropshire",
        postcode: "TF9 3AU", // Morrisons area
        tenants: ["Morrisons", "Asda", "Argos"],
        anchors: ["Morrisons"],
        description: "Key supermarket/retail cluster."
    },

    // --- VILLAGE DESTINATIONS ---
    {
        name: "Ludlow Food Centre",
        type: LocationType.OUTLET_CENTRE, // Farm / Food Village
        address: "Bromfield",
        street: "Bromfield",
        city: "Ludlow",
        county: "Shropshire",
        postcode: "SY8 2JR",
        isManaged: true,
        tenants: ["Ludlow Farmshop", "Ludlow Kitchen", "The Clive Arms", "Ludlow Distillery", "Gift Shop"],
        anchors: ["Ludlow Farmshop"],
        description: "Award-winning food shopping village."
    },
    {
        name: "Apley Farm Shop",
        type: LocationType.OUTLET_CENTRE, // Retail Village
        address: "Norton",
        street: "Norton",
        city: "Shifnal",
        county: "Shropshire",
        postcode: "TF11 9EF",
        isManaged: true,
        tenants: ["Apley Farm Shop", "Pigg's Playbarn", "Alley Katz Toy Shop", "Lottie's Fashion", "Elizabeth Beckett Skincare"],
        anchors: ["Apley Farm Shop"],
        description: "Retail and leisure village."
    },
    {
        name: "British Ironwork Centre",
        type: LocationType.OUTLET_CENTRE, // Destination Retail
        address: "Whitehall Aston",
        street: "Whitehall Aston",
        city: "Oswestry",
        county: "Shropshire",
        postcode: "SY11 4JH",
        isManaged: true,
        tenants: ["Showrooms", "The Forge Cafe", "Sculpture Park"],
        anchors: [],
        description: "Destination retail for metalwork and gifts."
    }
]

async function main() {
    console.log("Starting Shropshire Enrichment...")

    for (const loc of LOCATIONS) {
        console.log(`Processing ${loc.name}...`)

        // 1. Check if exists
        let location = await prisma.location.findFirst({
            where: {
                OR: [
                    { name: loc.name },
                    { postcode: loc.postcode }
                ]
            }
        })

        if (location) {
            console.log(`Found existing ${loc.name}, updating...`)
            location = await prisma.location.update({
                where: { id: location.id },
                data: {
                    name: loc.name,
                    type: loc.type,
                    address: loc.address,
                    street: loc.street, // Pre-populated standard street
                    city: loc.city,
                    county: loc.county,
                    anchorTenants: loc.anchors.length,
                    numberOfStores: loc.tenants.length,
                    isManaged: loc.isManaged || false
                }
            })
        } else {
            console.log(`Creating new ${loc.name}...`)
            location = await prisma.location.create({
                data: {
                    name: loc.name,
                    type: loc.type,
                    address: loc.address,
                    street: loc.street,
                    town: loc.city, // Seed town
                    city: loc.city,
                    county: loc.county,
                    region: "West Midlands", // Hardcode region as we know it
                    country: "England",
                    postcode: loc.postcode,
                    latitude: 0,
                    longitude: 0,
                    anchorTenants: loc.anchors.length,
                    numberOfStores: loc.tenants.length,
                    isManaged: loc.isManaged || false
                }
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

    console.log("Shropshire Enrichment Complete.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
