
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EAST_MIDLANDS_TERMS = [
    // Counties
    "Derbyshire", "Leicestershire", "Lincolnshire", "Northamptonshire", "Nottinghamshire", "Rutland",
    // Cities/Towns
    "Nottingham", "Leicester", "Derby", "Lincoln", "Northampton", "Chesterfield", "Mansfield",
    "Loughborough", "Kettering", "Corby", "Wellingborough", "Boston", "Grantham", "Hinckley",
    "Newark", "Skegness", "Spalding", "Stamford", "Worksop", "Ilkeston", "Long Eaton"
];

async function main() {
    console.log("🔍 Listing East Midlands Targets...\n");

    const locations = await prisma.location.findMany({
        where: {
            isManaged: false,
            type: 'SHOPPING_CENTRE',
            OR: [
                { website: null },
                { website: '' }
            ],
            OR: [
                ...EAST_MIDLANDS_TERMS.map(t => ({ county: { contains: t, mode: 'insensitive' } })),
                ...EAST_MIDLANDS_TERMS.map(t => ({ city: { contains: t, mode: 'insensitive' } }))
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
