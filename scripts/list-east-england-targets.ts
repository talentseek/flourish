
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EAST_ENGLAND_TERMS = [
    // Counties
    "Bedfordshire", "Cambridgeshire", "Essex", "Hertfordshire", "Norfolk", "Suffolk",
    // Cities/Towns
    "Norwich", "Ipswich", "Cambridge", "Peterborough", "Watford", "Luton",
    "Southend", "Chelmsford", "Colchester", "Basildon", "Harlow", "Stevenage",
    "St Albans", "Hemel Hempstead", "Bedford", "Lowestoft", "Great Yarmouth",
    "King's Lynn", "Bury St Edmunds", "Bishop's Stortford", "Welwyn Garden City",
    "Hatfield", "Brentwood", "Braintree", "Clacton"
];

async function main() {
    console.log("🔍 Listing East of England Targets...\n");

    const locations = await prisma.location.findMany({
        where: {
            isManaged: false,
            type: 'SHOPPING_CENTRE',
            OR: [
                { website: null },
                { website: '' }
            ],
            OR: [
                ...EAST_ENGLAND_TERMS.map(t => ({ county: { contains: t, mode: 'insensitive' } })),
                ...EAST_ENGLAND_TERMS.map(t => ({ city: { contains: t, mode: 'insensitive' } }))
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
