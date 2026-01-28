
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting Batch 1 Enrichment for Managed Locations...');

    const updates = [
        {
            name: "Arcade",
            searchMatch: "Ashford", // Ambiguous. Skipping or setting minimal. 
            // Research showed "Virtual Recreation" or specific places, not a shopping centre named "Arcade".
            // Decision: Skip enrichment for now or flag as possible false positive / needs rename.
            skip: true
        },
        {
            name: "Borough Parade",
            data: {
                owner: "Sheet Anchor Evolve (M Core)",
                retailSpace: 81823,
                numberOfStores: 27,
                website: "https://boroughparade.co.uk/", // Inferred
                isManaged: true
            }
        },
        {
            name: "Bowen Square",
            data: {
                owner: "LCP Group",
                retailSpace: 110395,
                numberOfStores: 38,
                website: "https://mbowensquare.co.uk/",
                isManaged: true
            }
        },
        {
            name: "Cascades Shopping Centre",
            data: {
                owner: "Railpen Investment Management",
                retailSpace: 440000,
                numberOfStores: 60,
                website: "https://cascades-shopping.co.uk/", // Likely
                isManaged: true
            }
        },
        {
            name: "Castle Quay",
            data: {
                owner: "Cherwell District Council",
                retailSpace: 444000,
                numberOfStores: 60,
                website: "https://castlequay.co.uk/",
                isManaged: true
            }
        },
        {
            name: "Castle Walk",
            data: {
                // Fragmented ownership. Skip owner or put "Various / Private"
                retailSpace: 100000, // Approx largest building
                numberOfStores: 25, // Estimate based on unit lists
                isManaged: true
                // Website unclear
            }
        },
        {
            name: "Chilterns Shopping Centre",
            data: {
                owner: "Dandara Living",
                retailSpace: 90000,
                website: "https://chilterns-hw.info/", // Redevelopment site
                isManaged: true
            }
        },
        {
            name: "Churchill Shopping Centre",
            data: {
                owner: "LCP Group",
                retailSpace: 130000,
                website: "https://thechurchillshoppingcentre.co.uk/",
                isManaged: true
            }
        },
        {
            name: "Cornmill Shopping Centre",
            data: {
                owner: "NewRiver Retail",
                retailSpace: 220000,
                numberOfStores: 50,
                website: "https://cornmillcentre.co.uk/",
                isManaged: true
            }
        },
        {
            name: "Crown Glass",
            // Search was ambiguous (glass companies). 
            // Likely "Crown Glass Shopping Centre" in Nailsea based on typical names.
            // Let's search specifically for "Crown Glass Shopping Centre Nailsea" or skip.
            // Decision: Skip for now, mark for manual check.
            skip: true
        },
        {
            name: "Emery Gate",
            data: {
                owner: "Acorn Property Group",
                retailSpace: 90000,
                website: "https://emerygate.co.uk/",
                isManaged: true
            }
        },
        {
            name: "Horsefair Shopping Centre",
            data: {
                owner: "NewRiver Retail",
                retailSpace: 92000,
                website: "https://horsefairshoppingcentre.co.uk/",
                isManaged: true
            }
        },
        {
            name: "Lakeside Village",
            data: {
                owner: "Kent County Council (Managed by Multi-Realm)",
                retailSpace: 147000,
                numberOfStores: 53,
                website: "https://lakeside-village.co.uk/",
                isManaged: true
            }
        },
        {
            name: "Meridian Shopping Centre",
            data: {
                owner: "Callander Properties",
                retailSpace: 113662,
                website: "https://meridianshoppingcentre.com/",
                isManaged: true
            }
        }
        // "M62" was motorway. Found "Junction 32". 
        // If location is named "M62", it's bad data. Skip.
    ];

    for (const update of updates) {
        if (update.skip) {
            console.log(`Skipping ${update.name} (Ambiguous/Bad Data)`);
            continue;
        }

        const locs = await prisma.location.findMany({
            where: { name: { contains: update.name, mode: 'insensitive' } }
        });

        if (locs.length === 0) {
            console.log(`⚠️ No match for ${update.name}`);
            continue;
        }

        for (const loc of locs) {
            console.log(`Updating ${loc.name} (${loc.id})...`);
            await prisma.location.update({
                where: { id: loc.id },
                data: update.data
            });
        }
    }

    console.log("Batch 1 Enrichment Complete.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
