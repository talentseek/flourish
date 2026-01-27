
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("📝 Listing Deep Sweep Batches 2-5 (Top 80 Remaining)...\n");

    const missing = await prisma.location.findMany({
        where: {
            type: 'SHOPPING_CENTRE',
            name: { not: { contains: '(Other)' } }, // Exclude aggregates
            website: null // Only get currently missing ones (excludes Batch 1 fixes)
        },
        orderBy: [
            { numberOfStores: 'desc' },
            { name: 'asc' }
        ],
        take: 100, // Batches 6-10
        select: {
            id: true,
            name: true,
            city: true
        }
    });

    console.table(missing);

    console.log("\n--- SEARCH MANIFEST ---");
    for (const m of missing) {
        console.log(`- ${m.name} ${m.city} official website`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
