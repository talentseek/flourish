
import { PrismaClient, LocationType } from '@prisma/client'

const prisma = new PrismaClient()

const LOCATIONS = [
    {
        name: "Leamington Shopping Park",
        type: LocationType.RETAIL_PARK,
        address: "Tachbrook Park Drive",
        city: "Royal Leamington Spa",
        county: "Warwickshire",
        postcode: "CV34 6RH",
        owner: "CBRE Investment Management",
        website: "https://leamingtonshoppingpark.co.uk/",
        tenants: ["M&S", "Next", "Boots", "TK Maxx", "Costa", "Card Factory", "JD Sports", "Subway", "Clarks", "Greggs", "Caffe Nero", "Halfords", "Five Guys", "KFC", "The Range"],
        anchors: ["M&S", "Next", "TK Maxx", "The Range"],
        description: "Main destination for big box retail and convenient parking."
    },
    {
        name: "Regent Court",
        type: LocationType.SHOPPING_CENTRE, // Open air mall
        address: "Livery Street",
        city: "Royal Leamington Spa",
        county: "Warwickshire",
        postcode: "CV32 4NG", // Main shopping area
        website: "https://www.regent-court.co.uk/",
        tenants: ["Nando's", "Turtle Bay", "Las Iguanas", "Wagamama", "YO! Sushi", "Gourmet Burger Kitchen", "SpaceNK", "Gail's Bakery", "Presto Music"],
        anchors: ["Wagamama", "Las Iguanas"],
        description: "Open-air, pedestrianised boutique shopping and dining destination."
    },
    {
        name: "The Parade",
        type: LocationType.HIGH_STREET,
        address: "The Parade",
        city: "Royal Leamington Spa",
        county: "Warwickshire",
        postcode: "CV32 4BA", // Representative postcode (Boots)
        tenants: ["Next", "H&M", "River Island", "WHSmith", "Whittard's", "Boots", "Oliver Bonas", "Morrisons Daily", "Tesco"],
        anchors: ["Tesco", "H&M", "River Island"],
        description: "The main boulevard featuring major high street names."
    }
]

async function main() {
    console.log("Starting Leamington Area Gap Fill...")

    for (const loc of LOCATIONS) {
        console.log(`Processing ${loc.name}...`)

        // 1. Upsert Location
        // We use postcode matching primarily as we don't have IDs
        let location = await prisma.location.findFirst({
            where: { postcode: loc.postcode }
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
                    owner: loc.owner,
                    website: loc.website,
                    anchorTenants: loc.anchors.length,
                    numberOfStores: loc.tenants.length // Approximate from our list
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
                    latitude: 0, // Will be geocoded later
                    longitude: 0,
                    owner: loc.owner,
                    website: loc.website,
                    anchorTenants: loc.anchors.length,
                    numberOfStores: loc.tenants.length
                }
            })
        }

        // 2. Upsert Tenants
        console.log(`Seeding ${loc.tenants.length} tenants for ${loc.name}...`)
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

    console.log("Gap fill complete.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
