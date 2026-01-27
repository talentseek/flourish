
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NW_TERMS = [
    // Counties
    "Lancashire", "Greater Manchester", "Merseyside", "Cheshire", "Cumbria",
    // Cities/Districts
    "Liverpool", "Manchester", "Bolton", "Wigan", "Warrington", "Chester", "Carlisle",
    "Preston", "Blackpool", "Blackburn", "Stockport", "Oldham", "Rochdale", "Bury",
    "St. Helens", "Southport", "Birkenhead", "Crewe", "Macclesfield"
];

async function main() {
    console.log("🔍 Listing North West Targets...\n");

    const locations = await prisma.location.findMany({
        where: {
            isManaged: false,
            type: 'SHOPPING_CENTRE',
            OR: [
                { website: null },
                { website: '' }
            ],
            OR: [
                ...NW_TERMS.map(t => ({ county: { contains: t, mode: 'insensitive' } })),
                ...NW_TERMS.map(t => ({ city: { contains: t, mode: 'insensitive' } }))
            ]
        },
        select: {
            name: true,
            city: true,
            county: true
        }
    });

    console.log(`Found ${locations.length} locations.`);
    console.table(locations);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
