
import { PrismaClient, LocationType } from '@prisma/client'

const prisma = new PrismaClient()

// Research Data Source: Jan 26, 2026
const LOCATIONS = [
    // 1. The Rosebird Centre (Stratford) - Main Anchor: Waitrose
    {
        name: "The Rosebird Centre",
        type: LocationType.RETAIL_PARK,
        address: "Shipston Road",
        city: "Stratford-upon-Avon",
        county: "Warwickshire",
        postcode: "CV37 8LU",
        tenants: ["Waitrose", "Costa Coffee Drive-Thru", "Little Pioneers Nursery", "Rosebird Community Hall"],
        anchors: ["Waitrose"],
        description: "Retail park anchored by a large Waitrose and community facilities."
    },

    // 2. Elliott's Field Shopping Park (Rugby) - Premier destination
    {
        name: "Elliott's Field Shopping Park",
        type: LocationType.RETAIL_PARK,
        address: "Leicester Road",
        city: "Rugby",
        county: "Warwickshire",
        postcode: "CV21 1SR",
        owner: "British Land", // Confirmed
        tenants: [
            "M&S", "Next", "H&M", "Fat Face", "River Island", "TK Maxx",
            "New Look", "HomeSense", "Dunelm", "Clarks", "Nando's", "Caffè Nero",
            "DFS", "Furniture Village", "Nike"
        ],
        anchors: ["M&S", "Next", "H&M", "Nike", "TK Maxx"],
        description: "The premier retail destination in Rugby featuring major fashion and home stores."
    },

    // 3. Bermuda Park (Nuneaton) - Leisure focus
    {
        name: "Bermuda Park",
        type: LocationType.RETAIL_PARK, // Mix of leisure and retail
        address: "St Davids Way",
        city: "Nuneaton",
        county: "Warwickshire",
        postcode: "CV10 7SD",
        tenants: [
            "Bermuda Adventure Soft Play World",
            "Nuffield Health Fitness & Wellbeing Gym",
            "Odeon Cinema",
            "Superbowl UK",
            "Bermuda Phoenix Centre"
        ],
        anchors: ["Odeon Cinema", "Nuffield Health"],
        description: "Leisure park featuring cinema, bowling, soft play, and fitness facilities."
    },

    // 4. Newtown Retail Park (Nuneaton) - Limited info but confirmed existence
    {
        name: "Newtown Retail Park",
        type: LocationType.RETAIL_PARK,
        address: "Newtown Road",
        city: "Nuneaton",
        county: "Warwickshire",
        postcode: "CV11 4FL", // Approx based on location
        tenants: ["Currys", "Halfords", "The Works"], // From research snippets
        anchors: ["Currys", "Halfords"],
        description: "Central retail park in Nuneaton."
    },

    // 5. Talisman Shopping Centre (Kenilworth) - Open air
    {
        name: "Talisman Shopping Centre",
        type: LocationType.SHOPPING_CENTRE,
        address: "Talisman Square",
        city: "Kenilworth",
        county: "Warwickshire",
        postcode: "CV8 1JB",
        tenants: [
            "Waitrose", "Boots", "Costa Coffee", "Anytime Fitness",
            "The Jones Family Jewellers", "Kenilworth Books", "TGJones"
        ],
        anchors: ["Waitrose", "Boots"],
        description: "Open-air shopping square in the town centre."
    },

    // 6. Hatton Shopping Village (Warwick) - Outlet/Indie
    {
        name: "Hatton Shopping Village",
        type: LocationType.OUTLET_CENTRE, // Fits "Village" vibe best
        address: "Dark Lane",
        city: "Warwick",
        county: "Warwickshire",
        postcode: "CV35 8XA",
        isManaged: true, // Likely managed as a destination
        tenants: [
            "Hatton Garden Centre", "The Spinning Jenny", "Granite Transformations",
            "The Sweet Shop", "Hatton Arms", "Alfresco Style", "Adorn Jewellery"
        ],
        anchors: ["Hatton Garden Centre"],
        description: "Unique shopping village with independent boutiques in converted farm buildings."
    },

    // 7. Hoar Park Shopping & Leisure Village (Nuneaton) - Rural/Craft
    {
        name: "Hoar Park Shopping & Leisure Village",
        type: LocationType.OUTLET_CENTRE,
        address: "Ansley",
        city: "Nuneaton",
        county: "Warwickshire",
        postcode: "CV10 0QU",
        isManaged: true,
        tenants: [
            "Hoar Park Saddlery", "Farm Shop", "Garden Centre", "Children's Farm",
            "Angel & Co Antiques", "The Lake View Tearooms", "Helen's Chocolate Box"
        ],
        anchors: ["Hoar Park Saddlery", "Garden Centre"],
        description: "Rural shopping village in converted 17th-century barns."
    }
]

async function main() {
    console.log("Starting Warwickshire Enrichment...")

    for (const loc of LOCATIONS) {
        console.log(`Processing ${loc.name}...`)

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
                    city: loc.city,
                    county: loc.county,
                    owner: loc.owner || null, // Optional
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
                    city: loc.city,
                    county: loc.county,
                    postcode: loc.postcode,
                    latitude: 0, // Geocoder to fill
                    longitude: 0,
                    owner: loc.owner || null,
                    anchorTenants: loc.anchors.length,
                    numberOfStores: loc.tenants.length,
                    isManaged: loc.isManaged || false
                }
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
                    category: "Retail", // Simplification
                    isAnchorTenant: loc.anchors.includes(t)
                }
            })
        }
    }

    console.log("Warwickshire Enrichment Complete.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
