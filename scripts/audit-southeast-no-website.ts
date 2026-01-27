
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SE_COUNTIES = [
    'Kent', 'Surrey', 'East Sussex', 'West Sussex', 'Sussex',
    'Hampshire', 'Berkshire', 'Buckinghamshire', 'Oxfordshire',
    'Isle of Wight', 'Hertfordshire', 'West Berkshire'
];

async function main() {
    console.log("🔍 Searching for Unmanaged South East Shopping Centres without websites...");

    const locations = await prisma.location.findMany({
        where: {
            isManaged: false,
            type: 'SHOPPING_CENTRE',
            OR: [
                { website: null },
                { website: '' }
            ],
            // County filter
            OR: SE_COUNTIES.map(c => ({ county: { contains: c, mode: 'insensitive' } }))
        },
        select: {
            id: true,
            name: true,
            city: true,
            county: true,
            totalFloorArea: true
        },
        orderBy: {
            totalFloorArea: 'desc'
        }
    });

    if (locations.length === 0) {
        console.log("No matching locations found.");
    } else {
        console.log(`⚠️ Found ${locations.length} unmanaged South East centres needing websites:\n`);
        console.table(locations.map(l => ({
            name: l.name,
            city: l.city,
            county: l.county,
            sqFt: l.totalFloorArea
        })));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
