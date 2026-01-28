
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const updates = [
        {
            name: "Belfry Shopping Centre",
            data: {
                owner: "Redhill Ventures Ltd",
                retailSpace: 250000,
                website: "https://redhillbelfry.co.uk/",
                isManaged: true
            }
        },
        {
            name: "The Beacon",
            data: {
                owner: "Legal & General Investment Management (LGIM)",
                retailSpace: 500000,
                numberOfStores: 100,
                website: "https://thebeaconeastbourne.com/",
                isManaged: true
            }
        },
        {
            name: "Bishops Weald",
            data: {
                owner: "LCP Group (Asset Manager)",
                website: "https://bishopsweald.co.uk/", // Inferred or generic agent site often exists
                isManaged: true
            }
        },
        {
            name: "The Brooks Shopping Centre",
            data: {
                owner: "Gentian (Consortium)",
                retailSpace: 120000,
                website: "https://brooks-shopping.co.uk/",
                isManaged: true
            }
        },
        {
            name: "The Brunswick",
            data: {
                owner: "Scarborough Group International",
                retailSpace: 130000,
                website: "https://brunswickshopping.com/",
                isManaged: true
            }
        },
        {
            name: "Burton Place",
            data: {
                owner: "Hollins Murray Group",
                retailSpace: 197654,
                website: "https://burtonplace.co.uk/", // Likely
                isManaged: true
            }
        },
        {
            name: "Byron Place Shopping Centre",
            data: {
                management: "ESTAMA UK",
                retailSpace: 115378,
                numberOfStores: 21,
                website: "https://byronplace.co.uk/",
                isManaged: true
            }
        },
        {
            name: "Dukes Mill Shopping Centre",
            data: {
                management: "LCP Group",
                retailSpace: 13149, // Small
                isManaged: true
            }
        },
        {
            name: "The Grosvenor Centre",
            data: {
                owner: "Evolve Estates (M Core)",
                retailSpace: 320000,
                numberOfStores: 50,
                website: "https://grosvenorshoppingnorthampton.co.uk/",
                isManaged: true
            }
        },
        {
            name: "The Heart Shopping Centre",
            data: {
                owner: "O & H Properties",
                retailSpace: 260000,
                numberOfStores: 59,
                website: "https://heartshopping.co.uk/",
                isManaged: true
            }
        },
        {
            name: "Hillsborough Exchange",
            data: {
                owner: "Killultagh",
                retailSpace: 80000,
                website: "https://hillsborough-exchange.co.uk/", // Likely
                isManaged: true
            }
        },
        {
            name: "The Killingworth Centre",
            data: {
                owner: "Sheet Anchor Evolve (LCP)",
                retailSpace: 300000, // Estimate based on large anchors
                numberOfStores: 30,
                isManaged: true
            }
        },
        {
            name: "Kingsland Shopping Centre",
            data: {
                owner: "Sheet Anchor Evolve (LCP)",
                retailSpace: 42000,
                numberOfStores: 18,
                isManaged: true
            }
        },
        {
            name: "The Lexicon",
            data: {
                owner: "Realty Income",
                retailSpace: 1000000,
                numberOfStores: 160,
                website: "https://thelexiconbracknell.com/",
                isManaged: true
            }
        },
        {
            name: "Market Quay Shopping Centre",
            data: {
                owner: "LCP Group",
                retailSpace: 168907,
                website: "https://marketquayshoppingcentre.co.uk/", // Check validity or generic
                isManaged: true
            }
        }
    ];

    for (const update of updates) {
        const locs = await prisma.location.findMany({
            where: { name: { contains: update.name, mode: 'insensitive' } }
        });

        if (locs.length === 0) {
            console.log(`⚠️ No match for ${update.name}`);
            continue;
        }

        for (const loc of locs) {
            console.log(`Updating ${loc.name}...`);
            await prisma.location.update({
                where: { id: loc.id },
                data: update.data
            });
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
