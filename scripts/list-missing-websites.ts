
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("📝 Listing REAL Shopping Centres with Missing Websites...\n");

    const missing = await prisma.location.findMany({
        where: {
            type: 'SHOPPING_CENTRE',
            name: { not: { contains: '(Other)' } }, // Filter out aggregates
            OR: [
                { website: null },
                { website: '' }
            ]
        },
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            city: true,
            postcode: true
        }
    });

    console.table(missing);
    console.log(`\nFound ${missing.length} valid targets (excluding aggregates).`);

    // Output list for direct copy-paste to enrichment script
    console.log("\n--- JSON FOR SCRIPT ---");
    console.log(JSON.stringify(missing.map(m => ({ name: m.name, city: m.city })), null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
