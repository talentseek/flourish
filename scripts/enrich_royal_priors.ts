
import { PrismaClient, LocationType } from '@prisma/client'

const prisma = new PrismaClient()

const ROYAL_PRIORS_DATA = {
    name: "Royal Priors Shopping Centre",
    type: LocationType.SHOPPING_CENTRE,
    address: "Royal Priors Shopping Centre, Warwick Street",
    city: "Royal Leamington Spa",
    county: "Warwickshire",
    postcode: "CV32 4XT",
    latitude: 52.2925,
    longitude: -1.5356,

    // Contact & Digital
    website: "https://www.royalpriors.com/",
    phone: "+44 1926 450150",
    instagram: "https://www.instagram.com/royalpriors/",
    facebook: "https://www.facebook.com/RoyalPriors/",
    twitter: "https://twitter.com/royalpriors",

    // Operational
    openingHours: {
        "Monday": "09:00 - 17:30",
        "Tuesday": "09:00 - 17:30",
        "Wednesday": "09:00 - 17:30",
        "Thursday": "09:00 - 17:30",
        "Friday": "09:00 - 17:30",
        "Saturday": "09:00 - 17:30",
        "Sunday": "10:00 - 17:00"
    },
    parkingSpaces: 470,
    carParkPrice: 2.50,
    evCharging: false,
    evChargingSpaces: 0,
    publicTransit: "Leamington Spa Railway Station is a 10-15 minute walk. Bus stops are located immediately outside on the Parade and Warwick Street.",

    // Physical & Commercial
    totalFloorArea: 160000,
    retailSpace: 160000,
    numberOfFloors: 2,
    numberOfStores: 60,
    anchorTenants: 5,
    owner: "LaSalle Investment Management",
    management: "Nicola Cormell",
    managementContact: "Nicola Cormell",
    managementEmail: "info@royalpriors.com",
    managementPhone: "+44 1926 450150",
    openedYear: 1988,

    // Demographics (Warwick District)
    population: 148500,
    medianAge: 40, // 39.7 rounded
    // avgHouseholdIncome: 37500, // Prisma Decimal
    familiesPercent: 31.0,
    seniorsPercent: 20.6,
    incomeVsNational: 8.0,
    homeownership: 66.0,
    homeownershipVsNational: 3.0,
    carOwnership: 83.4,
    carOwnershipVsNational: 7.0,

    // Performance
    footfall: 7000000,
    googleRating: 4.0,
    googleReviews: 3563,
    facebookRating: 4.1,
    facebookReviews: 2800
}

async function main() {
    console.log(`Starting enrichment for ${ROYAL_PRIORS_DATA.name}...`)

    // Upsert Location
    const location = await prisma.location.upsert({
        where: {
            id: "royal-priors-seed" // Using a deterministic ID for seeding if possible, but schema uses cuid default.
            // Actually we can't force ID easily in upsert unless we know it. 
            // Let's search by name/postcode first to avoid duplicates.
        },
        update: {
            ...ROYAL_PRIORS_DATA
        },
        create: {
            ...ROYAL_PRIORS_DATA
        }
    }).catch(async (e) => {
        // If ID based upsert failed (because we don't have ID), do find first
        const existing = await prisma.location.findFirst({
            where: {
                postcode: ROYAL_PRIORS_DATA.postcode
            }
        })

        if (existing) {
            console.log(`Found existing location ${existing.id}, updating...`)
            return prisma.location.update({
                where: { id: existing.id },
                data: ROYAL_PRIORS_DATA
            })
        } else {
            console.log(`Creating new location...`)
            return prisma.location.create({
                data: ROYAL_PRIORS_DATA
            })
        }
    })

    console.log(`Location Enriched: ${location.name} (${location.id})`)

    // Tenants
    const tenants = [
        "Sports Direct", "Superdry", "New Look", "Hobbs", "The Entertainer",
        "Waterstones", "Pandora", "Sostrene Grene"
    ]

    console.log(`Seeding ${tenants.length} key tenants...`)

    for (const t of tenants) {
        await prisma.tenant.upsert({
            where: {
                locationId_name: {
                    locationId: location.id,
                    name: t
                }
            },
            update: {
                isAnchorTenant: ["Sports Direct", "Superdry", "New Look", "Hobbs", "The Entertainer"].includes(t)
            },
            create: {
                locationId: location.id,
                name: t,
                category: "Retail", // Placeholder
                isAnchorTenant: ["Sports Direct", "Superdry", "New Look", "Hobbs", "The Entertainer"].includes(t)
            }
        })
    }

    console.log("Tenants seeded.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
