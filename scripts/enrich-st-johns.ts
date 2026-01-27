
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching St Johns Centre...');

    // Target: St Johns Centre (Leeds)
    // ID: cmkss209p0004cy3u0lt3u0fr
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmkss209p0004cy3u0lt3u0fr'
        },
        data: {
            website: 'https://stjohnsleeds.co.uk',
            openingHours: {
                "Mon-Sat": "09:00-18:00", // Checking precise hours, general retail
                "Sun": "11:00-17:00"
            },
            parkingSpaces: 280, // Q-Park St Johns
            carParkPrice: null, // Paid
            owner: 'Global Mutual / Patron Capital',
            management: 'Centre Management',

            facebook: 'https://www.facebook.com/stjohnsleeds/',
            instagram: 'https://www.instagram.com/stjohnsleeds/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
