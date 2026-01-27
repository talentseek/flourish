import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🎯 listing Enrichment Batch 1 (Top 5 Priority Targets)...\n");

    // Strategy: Find largest Shopping Centres that have a WEBSITE (so we can research them)
    // but are missing key operational data (Parking, Opening Hours, etc).
    const targets = await prisma.location.findMany({
        where: {
            type: 'SHOPPING_CENTRE',
            website: { not: null }, // Must have website to research
            OR: [
                { parkingSpaces: null },
                { openingHours: { equals: Prisma.DbNull } },
                { numberOfStores: null },
                { owner: null }
            ]
        },
        orderBy: [
            { numberOfStores: 'desc' }, // Focus on big ones first
            { name: 'asc' }
        ],
        skip: 35, // Batch 1 (5) + Batch 2 (10) + Batch 3 (20) done
        take: 20, // Batch 4
        select: {
            id: true,
            name: true,
            city: true,
            website: true
        }
    });

    console.table(targets);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
