
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// The Definitive Top 45 List (from Research)
// We want to ensure these exist as specific entities.
// If they match a generic "Town" name (e.g. "Watford"), we might rename/sharpen it.
// If they match a bad "Retail Park" (Lakeside), we create a new one.

const targets = [
    // London & South East
    { name: "Westfield London", city: "London", postcode: "W12 7GF" },
    { name: "Westfield Stratford City", city: "London", postcode: "E20 1EJ" },
    { name: "Bluewater Shopping Centre", city: "Stone", postcode: "DA9 9ST" },
    { name: "Lakeside Shopping Centre", city: "West Thurrock", postcode: "RM20 2ZP" }, // Fix: Not "Lakeside Retail Park"
    { name: "The Lexicon", city: "Bracknell", postcode: "RG12 1AP" }, // Already Managed
    { name: "Brent Cross Shopping Centre", city: "London", postcode: "NW4 3FP" },
    { name: "Whitgift Shopping Centre", city: "Croydon", postcode: "CR0 1LP" },
    { name: "The Oracle", city: "Reading", postcode: "RG1 2AG" },
    { name: "Festival Place", city: "Basingstoke", postcode: "RG21 7BA" }, // Missing
    { name: "Eden Shopping Centre", city: "High Wycombe", postcode: "HP11 2DQ" },
    { name: "Westquay", city: "Southampton", postcode: "SO15 1QF" },
    { name: "The Centre:MK", city: "Milton Keynes", postcode: "MK9 3ES" }, // Missing
    { name: "Queensgate", city: "Peterborough", postcode: "PE1 1NT" },
    { name: "Royal Victoria Place", city: "Tunbridge Wells", postcode: "TN1 2SS" },

    // Midlands
    { name: "Bullring & Grand Central", city: "Birmingham", postcode: "B5 4BU" },
    { name: "Merry Hill", city: "Brierley Hill", postcode: "DY5 1QX" }, // Fix: Not Retail Park
    { name: "Highcross", city: "Leicester", postcode: "LE1 4AN" },
    { name: "Victoria Centre", city: "Nottingham", postcode: "NG1 3QN" },
    { name: "Derbion", city: "Derby", postcode: "DE1 2PL" },
    { name: "Telford Centre", city: "Telford", postcode: "TF3 4BX" },
    { name: "Kingfisher Shopping Centre", city: "Redditch", postcode: "B97 4HJ" }, // Fix: Not "Business Centre"

    // North
    { name: "Metrocentre", city: "Gateshead", postcode: "NE11 9YG" },
    { name: "The Trafford Centre", city: "Manchester", postcode: "M17 8AA" }, // Ensure "The"
    { name: "Manchester Arndale", city: "Manchester", postcode: "M4 3AQ" }, // Fix: Not "Arndale West Yorks"
    { name: "Liverpool ONE", city: "Liverpool", postcode: "L1 8JQ" },
    { name: "Meadowhall", city: "Sheffield", postcode: "S9 1EP" },
    { name: "White Rose Centre", city: "Leeds", postcode: "LS11 8LU" },
    { name: "Trinity Leeds", city: "Leeds", postcode: "LS1 5ER" },
    { name: "Eldon Square", city: "Newcastle", postcode: "NE1 7JB" },
    { name: "Frenchgate", city: "Doncaster", postcode: "DN1 1SR" },
    { name: "Merrion Centre", city: "Leeds", postcode: "LS2 8NG" },

    // South West & Wales
    { name: "Cabot Circus", city: "Bristol", postcode: "BS1 3BX" },
    { name: "Cribbs Causeway (The Mall)", city: "Bristol", postcode: "BS34 5DG" }, // Fix Name
    { name: "St David's Dewi Sant", city: "Cardiff", postcode: "CF10 2EF" }, // Missing
    { name: "Cwmbran Centre", city: "Cwmbran", postcode: "NP44 1PB" },

    // Scotland & NI
    { name: "St James Quarter", city: "Edinburgh", postcode: "EH1 3SS" },
    { name: "Silverburn", city: "Glasgow", postcode: "G53 6AG" },
    { name: "Braehead Shopping Centre", city: "Glasgow", postcode: "G51 4BN" }, // Fix: Not Retail Park
    { name: "East Kilbride Shopping Centre", city: "East Kilbride", postcode: "G74 1LL" }, // Missing
    { name: "St. Enoch Centre", city: "Glasgow", postcode: "G1 4BW" },
    { name: "The Centre, Livingston", city: "Livingston", postcode: "EH54 6HR" }, // Added
    { name: "Victoria Square", city: "Belfast", postcode: "BT1 4QG" }, // Missing
];

async function main() {
    console.log("Seeding Top 45 Shopping Centres (Market Data)...");

    for (const t of targets) {
        // Check for existing by fuzzy match OR Postcode (Postcode is safer)
        const existing = await prisma.location.findFirst({
            where: {
                OR: [
                    { postcode: t.postcode }, // Exact postcode match
                    { name: { contains: t.name, mode: 'insensitive' } } // Name match
                ]
            }
        });

        if (existing) {
            console.log(`[EXISTS] ${t.name} (ID: ${existing.id})`);

            // Optional: Rename if the existing name is bad (e.g. "Retail Park")
            if (existing.name.includes("Retail Park") && !t.name.includes("Retail Park")) {
                console.log(`   -> WARNING: Existing is '${existing.name}'. Creating NEW record to avoid Retail Park polution.`);
                await createNew(t);
            } else {
                // Just update Name to Canonical if it's generic?
                // No, let's just log it for now.
            }
        } else {
            console.log(`[MISSING] ${t.name} -> Creating...`);
            await createNew(t);
        }
    }
}

async function createNew(t) {
    await prisma.location.create({
        data: {
            name: t.name,
            city: t.city,
            postcode: t.postcode,
            address: "Seeded Market Data",
            isManaged: false, // Market Data
            county: t.city, // Placeholder
            type: "SHOPPING_CENTRE",
            latitude: 0.0,
            longitude: 0.0
        }
    });
    console.log(`   -> Created ${t.name}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
