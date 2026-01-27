
import { PrismaClient, LocationType } from '@prisma/client'

const prisma = new PrismaClient()

// Research Data Source: Jan 26, 2026
const LOCATIONS = [
    // --- WEST BROMWICH ---
    {
        name: "New Square Shopping Centre",
        type: LocationType.SHOPPING_CENTRE,
        address: "New Square",
        street: "New Square",
        city: "West Bromwich",
        county: "West Midlands",
        postcode: "B70 7PP",
        tenants: ["Primark", "Tesco Extra", "Next", "JD Sports", "Odeon"],
        anchors: ["Tesco Extra", "Primark"],
        description: "Modern shopping and leisure destination in West Bromwich."
    },

    // --- WEDNESBURY ---
    {
        name: "Axletree Way Retail Park", // Cluster near Gallagher
        type: LocationType.RETAIL_PARK,
        address: "Axletree Way",
        street: "Axletree Way",
        city: "Wednesbury",
        county: "West Midlands",
        postcode: "WS10 9QY",
        tenants: ["Next", "Morrisons", "Furniture Outlets"],
        anchors: ["Morrisons"],
        description: "Big box retail cluster near J9."
    },
    {
        name: "Union Street",
        type: LocationType.HIGH_STREET,
        address: "Union Street",
        street: "Union Street",
        city: "Wednesbury",
        county: "West Midlands",
        postcode: "WS10 7HD",
        tenants: ["Morrisons", "Greggs", "Market Stalls"],
        anchors: ["Morrisons"],
        description: "Traditional high street and market area."
    },

    // --- SMETHWICK ---
    {
        name: "Windmills Shopping Park",
        type: LocationType.RETAIL_PARK,
        address: "Cape Hill",
        street: "Cape Hill",
        city: "Smethwick",
        county: "West Midlands",
        postcode: "B66 3PR",
        tenants: ["Asda", "Matalan", "Boots", "Home Bargains"],
        anchors: ["Asda"],
        description: "Primary retail hub for Smethwick."
    },
    {
        name: "Bearwood Road",
        type: LocationType.HIGH_STREET,
        address: "Bearwood Road",
        street: "Bearwood Road",
        city: "Smethwick",
        county: "West Midlands",
        postcode: "B66 4BH",
        tenants: ["Aldi", "Argos", "Greggs", "Poundland"],
        anchors: ["Aldi"],
        description: "Major high street district."
    },

    // --- ROWLEY REGIS ---
    {
        name: "Blackheath Town Centre",
        type: LocationType.HIGH_STREET,
        address: "High Street",
        street: "High Street",
        city: "Rowley Regis", // Blackheath
        county: "West Midlands",
        postcode: "B65 0EB",
        tenants: ["Sainsburys", "Lidl", "Market"],
        anchors: ["Sainsburys"],
        description: " Retail hub for Rowley Regis."
    }
]

async function main() {
    console.log("Starting Sandwell Enrichment...")

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

    console.log("Sandwell Enrichment Complete.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
