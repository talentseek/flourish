
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LONDON_TERMS = [
    // Region/County
    "London", "Greater London", "Middlesex",
    // Major Areas/Boroughs
    "Westfield", "Stratford", "Shepherd's Bush", "White City", "Brent Cross", "Croydon",
    "Romford", "Uxbridge", "Harrow", "Ealing", "Wandsworth", "Wimbledon", "Bromley",
    "Bexleyheath", "Kingston", "Sutton", "Enfield", "Wood Green", "Lewisham", "Ilford",
    "Walthamstow", "Peckham", "Brixton", "Clapham", "Hammersmith", "Fulham", "Kensington",
    "Chelsea", "Islington", "Canary Wharf", "Greenwich", "Woolwich", "Richmond", "Hounslow",
    "Barnet", "Edgware", "Haringey", "Hackney", "Southwark", "Lambeth", "Westminster"
];

async function main() {
    console.log("🔍 Listing London Targets...\n");

    const locations = await prisma.location.findMany({
        where: {
            isManaged: false,
            type: 'SHOPPING_CENTRE',
            OR: [
                { website: null },
                { website: '' }
            ],
            OR: [
                ...LONDON_TERMS.map(t => ({ county: { contains: t, mode: 'insensitive' } })),
                ...LONDON_TERMS.map(t => ({ city: { contains: t, mode: 'insensitive' } })),
                ...LONDON_TERMS.map(t => ({ address: { contains: t, mode: 'insensitive' } }))
            ]
        },
        select: {
            name: true,
            city: true,
            county: true
        }
    });

    console.log(`Found ${locations.length} locations associated with London terms.`);
    console.table(locations);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
