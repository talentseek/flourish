
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Windsor Royal Station...');

    // Target: Windsor Royal Station (Windsor)
    // ID: cmicxw4zk001r13hxqcet4qy7
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmicxw4zk001r13hxqcet4qy7'
        },
        data: {
            website: 'https://windsorroyalstation.co.uk',
            openingHours: {
                "Mon-Sat": "09:30-18:00",
                "Sun": "11:00-17:00"
            },
            parkingSpaces: 600, // Q-Park Windsor Yards/Station
            carParkPrice: null, // Paid
            owner: 'AEW UK Investment Management',
            management: 'AEW',
            openedYear: 1851, // Historic station conversion 1997

            facebook: 'https://www.facebook.com/WindsorRoyalStation/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
