
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SOUTH_WEST_TERMS = [
    // Counties/Regions
    "Cornwall", "Devon", "Dorset", "Somerset", "Bristol", "Gloucestershire", "Wiltshire",
    // Cities/Towns
    "Plymouth", "Exeter", "Torquay", "Bath", "Bournemouth", "Poole", "Cheltenham",
    "Gloucester", "Swindon", "Taunton", "Yeovil", "Truro", "Falmouth", "Weston-super-Mare",
    "Trowbridge", "Salisbury", "Chippenham", "Stroud", "Tewkesbury", "Cirencester"
];

async function main() {
    console.log("🔍 Listing South West Targets...\n");

    const locations = await prisma.location.findMany({
        where: {
            isManaged: false,
            type: 'SHOPPING_CENTRE',
            OR: [
                { website: null },
                { website: '' }
            ],
            OR: [
                ...SOUTH_WEST_TERMS.map(t => ({ county: { contains: t, mode: 'insensitive' } })),
                ...SOUTH_WEST_TERMS.map(t => ({ city: { contains: t, mode: 'insensitive' } }))
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
