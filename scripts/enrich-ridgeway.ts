
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching The Ridgeway...');

    // Target: The Ridgeway Shopping Centre (Plympton)
    // ID: cmicxw4t5001d13hx2pyeqfy3
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmicxw4t5001d13hx2pyeqfy3'
        },
        data: {
            website: 'https://plymptonridgeway.co.uk',
            openingHours: {
                "Mon-Sat": "09:00-17:30",
                "Sun": "10:00-16:00"
            },
            parkingSpaces: 200, // Estimate for surface car park
            carParkPrice: 0.00, // 3 hours free (Council)
            owner: 'Multiple / District Centre',
            management: 'Ridgeway Plympton Management Co',

            facebook: 'https://www.facebook.com/PlymptonRidgeway/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
