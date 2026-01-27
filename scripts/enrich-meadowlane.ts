
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Meadowlane...');

    // Target: Meadowlane Shopping Centre (Magherafelt)
    // ID: cmksmaxqj000dx52rejboacd3
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksmaxqj000dx52rejboacd3'
        },
        data: {
            website: 'https://meadowlaneshoppingcentre.co.uk',
            openingHours: {
                "Mon-Tue": "08:30-18:00",
                "Wed": "08:30-20:00",
                "Thu-Fri": "08:30-21:00",
                "Sat": "08:30-18:00",
                "Sun": "13:00-18:00"
            },
            parkingSpaces: 500,
            carParkPrice: 1.60, // 2 hours
            owner: 'Sea Eagle Properties Ltd',
            management: 'Lambert Smith Hampton',

            facebook: 'https://www.facebook.com/MeadowlaneShoppingCentre/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
