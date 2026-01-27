
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching The Quays...');

    // Target: The Quays Shopping Centre (Newry)
    // ID: cmksmaxgg0002x52r40elgqcd
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksmaxgg0002x52r40elgqcd'
        },
        data: {
            website: 'https://thequays.co.uk/',
            openingHours: {
                "Mon-Tue": "09:00-18:00",
                "Wed-Fri": "09:00-21:00",
                "Sat": "09:00-18:00",
                "Sun": "13:00-18:00"
            },
            parkingSpaces: 1000,
            carParkPrice: 1.00, // Per hour
            owner: 'Urban Green Private', // Acquired Jan 2024
            management: 'Centre Management',

            facebook: 'https://www.facebook.com/TheQuaysNewry/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
