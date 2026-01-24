
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const candidates = [
    "The Oracle", "Highcross", "Merry Hill", "Westgate Oxford", "Churchill Square",
    "Festival Place", "Fosse Park", "Friary Centre", "Drake Circus", "Princes Quay",
    "St. Enoch Centre", "The Mall Cribbs Causeway", "Trinity Leeds", "Eldon Square",
    "Manchester Arndale", "Derbion", "Centre:MK", "Meadowhall", "Bluewater",
    "Trafford Centre", "Metrocentre", "Liverpool ONE", "Westfield Stratford City",
    "Bullring & Grand Central", "St James Quarter", "Lakeside Shopping Centre",
    "Westfield London", "Victoria Centre", "Brent Cross", "White Rose Centre",
    "Silverburn", "East Kilbride", "Cabot Circus", "Kingfisher", "Frenchgate",
    "Royal Victoria Place", "Telford Centre", "The Lexicon", "The Centre, Livingston",
    "Eden", "Victoria Square", "Queensgate", "Westgate Oxford", "Merrion Centre",
    "Whitgift", "Braehead", "Grand Central", "St. David's"
];

// New Candidates (Ranks 46-100 inferred from list minus Top 45)
// Let's filter out what we KNOW we have processed in Top 45.
// Processed: Westfield, Metrocentre, Trafford, Bluewater, Lakeside, Bullring, Merry Hill, St James, Liverpool One, Meadowhall, Eldon, Derbion, Cabot, Braehead, Silverburn, Highcross, Telford, Cribbs, Westquay, Royal Victoria, Trinity Leeds, Lexicon, The Centre, Victoria, Brent Cross, Luton, White Rose, Cwmbran, Eden, St Enoch, Victoria Sq, Queensgate, Westgate, Merrion, Whitgift, Frenchgate, Oracle.

// Potential NEW targets from the search list:
// - Churchill Square (Brighton)
// - Fosse Park (Leicester) - ACTUALLY A RETAIL PARK? Check.
// - Friary Centre (Guildford)
// - Drake Circus (Plymouth)
// - Princes Quay (Hull)
// - Grand Central (Birmingham) - Merged with Bullring?
// - The Mall (Luton/Cribbs)
// - ... NEED MORE from the list. The list I got was repetitive.

async function main() {
    console.log("Checking Ranks 46-100 Candidates...");

    const potentialNew = [
        "Churchill Square",
        "Fosse Park",
        "Friary Centre",
        "Drake Circus",
        "Princes Quay",
        "Grand Central",
        "Southide Shopping Centre", // Wandsworth
        "The Glades", // Bromley
        "Touchwood", // Solihull
        "Gunwharf Quays", // Portsmouth (Outlet?)
        "Chantry Place", // Norwich (formerly Chapelfield)
        "CastleQuay", // Banbury
        "County Mall", // Crawley
        "Golden Square", // Warrington
        "The Bentall Centre", // Kingston
        "Lion Yard", // Cambridge
        "Grand Arcade", // Cambridge
        "West Orchards", // Coventry
        "Lower Precinct", // Coventry (We did this in Batch 10!)
        "The Harlequin", // Watford (Now Atria)
        "Atria Watford"
    ];

    for (const t of potentialNew) {
        const found = await prisma.location.findFirst({
            where: { name: { contains: t } },
            select: { id: true, name: true, isManaged: true, city: true }
        });

        if (found) {
            console.log(`[FOUND] ${t} -> ${found.name} (${found.city}) [Managed: ${found.isManaged}]`);
        } else {
            console.log(`[MISSING] ${t}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
