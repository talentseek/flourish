
import { PrismaClient, LocationType } from '@prisma/client'

const prisma = new PrismaClient()

// Research Data Source: Jan 26, 2026
const LOCATIONS = [
    // --- MERRY HILL HUB ---
    {
        name: "Merry Hill Shopping Centre",
        type: LocationType.SHOPPING_CENTRE,
        address: "Pedmore Road",
        street: "Pedmore Road",
        city: "Brierley Hill",
        county: "West Midlands",
        postcode: "DY5 1QX",
        tenants: ["Primark", "Marks & Spencer", "Next", "H&M", "Flannels"],
        anchors: ["Marks & Spencer", "Primark", "Next"],
        description: "Super-regional indoor mall."
    },
    {
        name: "Merry Hill Retail Park", // The Boulevard
        type: LocationType.RETAIL_PARK,
        address: "The Boulevard",
        street: "The Boulevard",
        city: "Brierley Hill",
        county: "West Midlands",
        postcode: "DY5 1SY",
        tenants: ["The Range", "Currys", "DFS", "Wren Kitchens", "Hobbycraft"],
        anchors: ["The Range"],
        description: "Retail park surrounding the main centre."
    },
    {
        name: "The Waterfront",
        type: LocationType.RETAIL_PARK, // Mixed Leisure/Office
        address: "Waterfront Way",
        street: "Waterfront Way",
        city: "Brierley Hill",
        county: "West Midlands",
        postcode: "DY5 1XN",
        tenants: ["Wetherspoons", "Digbeth Dining Club", "Offices"],
        anchors: [],
        description: "Leisure and dining hub near Merry Hill."
    },

    // --- DUDLEY TOWN ---
    {
        name: "Castle Gate Leisure Park",
        type: LocationType.RETAIL_PARK, // Leisure Park
        address: "Castlegate Way",
        street: "Castlegate Way",
        city: "Dudley",
        county: "West Midlands",
        postcode: "DY1 4TA",
        tenants: ["Showcase Cinema", "Tenpin Bowling", "Nandos", "Frankie & Benny's"],
        anchors: ["Showcase Cinema"],
        description: "Major leisure destination on Birmingham Road."
    },
    {
        name: "Priory Park Retail", // Tesco Extra Hub
        type: LocationType.RETAIL_PARK,
        address: "Birmingham Road",
        street: "Birmingham Road",
        city: "Dudley",
        county: "West Midlands",
        postcode: "DY1 4RP",
        tenants: ["Tesco Extra"],
        anchors: ["Tesco Extra"],
        description: "Large Tesco Extra hub."
    },

    // --- STOURBRIDGE ---
    {
        name: "Victoria Passage",
        type: LocationType.SHOPPING_CENTRE, // Arcade
        address: "High Street",
        street: "High Street",
        city: "Stourbridge",
        county: "West Midlands",
        postcode: "DY8 1DP",
        tenants: ["Independent Boutiques", "Cafes"],
        anchors: [],
        description: "Historic arcade in Stourbridge."
    },
    {
        name: "Crown Centre",
        type: LocationType.SHOPPING_CENTRE,
        address: "Crown Lane",
        street: "Crown Lane",
        city: "Stourbridge",
        county: "West Midlands",
        postcode: "DY8 1YD",
        tenants: ["Tesco Extra", "Town Hall", "Library"], // Tesco is the main retail
        anchors: ["Tesco Extra"],
        description: "Civic and retail complex."
    },
    {
        name: "Withymoor Sainsbury's", // Standalone hub
        type: LocationType.RETAIL_PARK, // Supermarket
        address: "Sandringham Way",
        street: "Sandringham Way",
        city: "Brierley Hill", // Technically Brierley Hill / Amblecote border
        county: "West Midlands",
        postcode: "DY5 3JR",
        tenants: ["Sainsburys", "Argos"],
        anchors: ["Sainsburys"],
        description: "Large standalone Sainsbury's serving Amblecote."
    },

    // --- HALESOWEN ---
    {
        name: "Peckingham Street",
        type: LocationType.HIGH_STREET,
        address: "Peckingham Street",
        street: "Peckingham Street",
        city: "Halesowen",
        county: "West Midlands",
        postcode: "B63 3AW",
        tenants: ["Specsavers", "Banks", "Local Retail"],
        anchors: [],
        description: "Main pedestrianised high street."
    },

    // --- OTHER ---
    {
        name: "Townsend Place",
        type: LocationType.SHOPPING_CENTRE, // Precinct
        address: "Townsend Place",
        street: "Townsend Place",
        city: "Kingswinford",
        county: "West Midlands",
        postcode: "DY6 9JL",
        tenants: ["Boots", "Local Services", "Morrisons nearby"],
        anchors: [],
        description: "Shopping precinct in Kingswinford."
    },
    {
        name: "Louise Street",
        type: LocationType.HIGH_STREET,
        address: "Louise Street",
        street: "Louise Street",
        city: "Dudley", // Gornal
        county: "West Midlands",
        postcode: "DY3 2UA",
        tenants: ["Co-op", "Butchers", "Bakers"],
        anchors: [],
        description: "High street for Lower Gornal."
    }
]

async function main() {
    console.log("Starting Dudley Enrichment...")

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

    console.log("Dudley Enrichment Complete.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
