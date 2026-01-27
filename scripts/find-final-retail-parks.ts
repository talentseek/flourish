
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Identifying Final Batch Candidates...');

    // Get current list of 50-60 to find the last few big ones
    const nextParks = await prisma.location.findMany({
        where: {
            type: 'RETAIL_PARK',
            OR: [
                { website: null },
                { owner: null }
            ]
        },
        orderBy: [
            { totalFloorArea: 'desc' },
            { numberOfStores: 'desc' }
        ],
        skip: 48, // Skip the ones we (should have) processed or listed
        take: 10,
        select: {
            id: true,
            name: true,
            city: true,
            numberOfStores: true
        }
    });

    console.table(nextParks.map(p => ({
        name: p.name,
        city: p.city,
        stores: p.numberOfStores
    })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
