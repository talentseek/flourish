
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🏥 Final Database Health Check");

    const total = await prisma.location.count({ where: { type: 'SHOPPING_CENTRE' } });
    const managed = await prisma.location.count({ where: { type: 'SHOPPING_CENTRE', management: { not: null } } });

    const missingPostcode = await prisma.location.count({ where: { type: 'SHOPPING_CENTRE', postcode: 'UNKNOWN' } });
    const enriched = await prisma.location.count({
        where: {
            type: 'SHOPPING_CENTRE',
            totalFloorArea: { gt: 0 },
            numberOfStores: { gt: 0 }
        }
    });

    console.log(`Total Shopping Centres: ${total}`);
    console.log(`Managed Centres:        ${managed}`);
    console.log(`Fully Enriched:         ${enriched} (${Math.round(enriched / total * 100)}%)`);
    console.log(`Missing Postcodes:      ${missingPostcode} (Target 0, except outliers)`);

    // Verify recent fixes
    const marlowes = await prisma.location.findMany({ where: { name: { contains: 'Marlowes' } } });
    console.log(`Marlowes Duplicates:    ${marlowes.length} (Should be 1)`);

    const castle = await prisma.location.findMany({ where: { name: { contains: 'Castle Court' } } });
    console.log(`Castle Court Duplicates: ${castle.length} (Should be 1)`);

    console.log("\n--- Top 10 Largest Managed Centres ---");
    const top10 = await prisma.location.findMany({
        where: { type: 'SHOPPING_CENTRE', management: { not: null } },
        orderBy: { totalFloorArea: 'desc' },
        take: 10,
        select: { name: true, totalFloorArea: true, management: true }
    });
    top10.forEach((t, i) => console.log(`${i + 1}. ${t.name}: ${t.totalFloorArea?.toLocaleString()} sqft (${t.management})`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
