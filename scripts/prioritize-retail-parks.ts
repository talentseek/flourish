
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Prioritizing Top 50 Retail Parks...');

    const topParks = await prisma.location.findMany({
        where: {
            type: 'RETAIL_PARK',
            // Prioritize those with high commercial potential but missing core data
            OR: [
                { website: null },
                { owner: null }
            ]
        },
        orderBy: [
            { totalFloorArea: 'desc' }, // Size first
            { numberOfStores: 'desc' }  // Then density
        ],
        take: 50,
        select: {
            id: true,
            name: true,
            city: true,
            totalFloorArea: true,
            numberOfStores: true,
            management: true
        }
    });

    console.table(topParks.map(p => ({
        name: p.name,
        city: p.city,
        sqft: p.totalFloorArea?.toLocaleString(),
        stores: p.numberOfStores
    })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
