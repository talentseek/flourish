
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping of Regions to the "County" (Post Town) values found in the DB (Same as before)
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
    ]
};

async function main() {
    const targetLocations = REGION_MAPPING["North West"];

    const locations = await prisma.location.findMany({
        where: {
            type: 'RETAIL_PARK',
            isManaged: false, // Only unenriched
            OR: [
                { county: { in: targetLocations } },
                { city: { in: targetLocations } }
            ]
        },
        orderBy: {
            numberOfStores: 'desc'
        },
        take: 20,
        select: {
            id: true,
            name: true,
            city: true,
            county: true,
            numberOfStores: true
        }
    });

    console.log(`Top 20 Unenriched Retail Parks in North West:`);
    console.table(locations.map(l => ({
        name: l.name,
        town: l.county || l.city,
        stores: l.numberOfStores
    })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
