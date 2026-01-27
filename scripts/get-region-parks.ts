
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping of Regions to the "County" (Post Town) values found in the DB
const REGION_MAPPING: Record<string, string[]> = {
    "North West": [
        'Accrington', 'Altrincham', 'Ashton-Under-Lyne', 'Barrow-In-Furness', 'Birkenhead',
        'Blackburn', 'Blackpool', 'Bolton', 'Bootle', 'Burnley', 'Bury', 'Carlisle',
        'Chester', 'Chorley', 'Colne', 'Crewe', 'Ellesmere Port', 'Fleetwood', 'Kendal',
        'Lancaster', 'Leigh', 'Liverpool', 'Lytham St Annes', 'Macclesfield', 'Manchester',
        'Morecambe', 'Nelson', 'Northwich', 'Oldham', 'Ormskirk', 'Penrith', 'Prescot',
        'Preston', 'Rochdale', 'Runcorn', 'Sale', 'Salford', 'Skelmersdale', 'Southport',
        'St Helens', 'Stockport', 'Ulverston', 'Wallasey', 'Warrington', 'Whitehaven',
        'Widnes', 'Wigan', 'Wilmslow', 'Winsford', 'Workington'
    ],
    // Add other regions in Phase 2
};

async function main() {
    const regionArg = process.argv[2]; // e.g. "North West"

    if (!regionArg) {
        console.error(`Please provide a region name. Available: ${Object.keys(REGION_MAPPING).join(', ')}`);
        process.exit(1);
    }

    const targetLocations = REGION_MAPPING[regionArg];
    if (!targetLocations) {
        console.error(`Region "${regionArg}" not found in mapping.`);
        process.exit(1);
    }

    console.log(`Searching for Retail Parks in ${regionArg} (${targetLocations.length} towns)...`);

    const locations = await prisma.location.findMany({
        where: {
            type: 'RETAIL_PARK',
            OR: [
                { county: { in: targetLocations } },
                { city: { in: targetLocations } }
            ],
            // OR logic for missing fields
            OR: [
                { website: null },
                { owner: null },
                { openingHours: { equals: Prisma.DbNull } }
            ]
        },
        select: {
            id: true,
            name: true,
            city: true,
            county: true,
            website: true,
            owner: true
        }
    });

    console.log(`Found ${locations.length} Retail Parks in "${regionArg}" needing enrichment.`);

    if (process.argv.includes('--json')) {
        console.log(JSON.stringify(locations, null, 2));
    } else {
        console.table(locations.map(l => ({
            name: l.name,
            town: l.county || l.city,
            missing: `${!l.website ? 'Web ' : ''}${!l.owner ? 'Own ' : ''}`.trim()
        })));
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
