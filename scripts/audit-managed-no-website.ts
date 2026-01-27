
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Searching for Managed Shopping Centres without websites...");

    const locations = await prisma.location.findMany({
        where: {
            isManaged: true,
            type: 'SHOPPING_CENTRE',
            OR: [
                { website: null },
                { website: '' }
            ]
        },
        select: {
            id: true,
            name: true,
            city: true,
            postcode: true
        }
    });

    if (locations.length === 0) {
        console.log("✅ Good news! All managed shopping centres have websites.");
    } else {
        console.log(`⚠️ Found ${locations.length} managed centres needing websites:\n`);
        console.table(locations);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
