
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching One Stop...');

    // Target: One Stop Shopping Centre (Birmingham)
    // ID: cmicxw4m0000y13hxetux3i04
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmicxw4m0000y13hxetux3i04'
        },
        data: {
            website: 'https://onestop-shopping.co.uk/',
            openingHours: {
                "Mon-Wed": "08:30-20:00",
                "Thu-Fri": "08:30-22:00",
                "Sat": "08:00-20:00",
                "Sun": "09:30-17:00"
            },
            parkingSpaces: 1200,
            carParkPrice: 0.00, // 4 hours free
            owner: 'Northdale Asset Management / Magnetar Capital',
            management: 'Northdale',

            facebook: 'https://www.facebook.com/OneStopShoppingBirmingham/',

            isManaged: true,
            numberOfStores: 60
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
