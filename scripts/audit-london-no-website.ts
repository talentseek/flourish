
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Searching for Unmanaged London Shopping Centres without websites...");

    const locations = await prisma.location.findMany({
        where: {
            isManaged: false,
            type: 'SHOPPING_CENTRE',
            OR: [
                { website: null },
                { website: '' }
            ],
            // Location filter: London (City or Region)
            AND: [
                {
                    OR: [
                        { city: { contains: 'London', mode: 'insensitive' } },
                        { county: { contains: 'London', mode: 'insensitive' } },
                        { address: { contains: 'London', mode: 'insensitive' } }
                    ]
                }
            ]
        },
        select: {
            id: true,
            name: true,
            city: true,
            postcode: true,
            totalFloorArea: true
        },
        orderBy: {
            totalFloorArea: 'desc' // Prioritize larger ones
        }
    });

    if (locations.length === 0) {
        console.log("No matching locations found.");
    } else {
        console.log(`⚠️ Found ${locations.length} unmanaged London centres needing websites:\n`);
        console.table(locations.map(l => ({
            name: l.name,
            postcode: l.postcode,
            city: l.city,
            sqFt: l.totalFloorArea
        })));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
