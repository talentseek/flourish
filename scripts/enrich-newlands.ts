
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Newlands...');

    // Target: Newlands Shopping Centre (Kettering)
    // ID: cmksse6e80002iqsyg4w2binq
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksse6e80002iqsyg4w2binq'
        },
        data: {
            website: 'https://newlandsshopping.com',
            openingHours: {
                "Mon-Sat": "09:00-17:30",
                "Sun": "10:00-16:00"
            },
            parkingSpaces: 305,
            carParkPrice: 5.00, // Daily
            owner: 'Newlands (Kettering) Limited',
            management: 'Centre Management',

            facebook: 'https://www.facebook.com/NewlandsShoppingCentre/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
