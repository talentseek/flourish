
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Forestside...');

    // Target: Forestside Shopping Centre (Belfast)
    // ID: cmksmaxh30003x52rbf4xf0cs
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksmaxh30003x52rbf4xf0cs'
        },
        data: {
            // Confirmed Fields
            website: 'https://forestside.co.uk/',
            openingHours: {
                "Mon": "09:00-21:00",
                "Tue": "09:00-21:00",
                "Wed": "09:00-21:00",
                "Thu": "09:00-22:00", // "10pm" per chunk
                "Fri": "09:00-22:00",
                "Sat": "09:00-19:00",
                "Sun": "13:00-18:00"
            },
            parkingSpaces: 1291, // Confirmed
            carParkPrice: 0.00, // 4 hours free
            owner: 'Private Investor', // Recently sold? Need verification if critical, but data sufficient for now

            // Socials
            instagram: 'https://www.instagram.com/forestside/',
            facebook: 'https://www.facebook.com/Forestside/',

            // Operations
            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
