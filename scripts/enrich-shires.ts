
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching The Shires...');

    // Target: The Shires Shopping Centre (Trowbridge)
    // ID: cmicxw4vi001i13hx33e93z49
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmicxw4vi001i13hx33e93z49'
        },
        data: {
            website: 'https://shirescentre.co.uk',
            openingHours: {
                "Mon-Sat": "08:00-18:00",
                "Sun": "10:00-16:00"
            },
            parkingSpaces: 1000,
            carParkPrice: 0.60, // Estimate / First hour free often
            owner: 'LCP (M Core)',
            management: 'LCP',

            facebook: 'https://www.facebook.com/ShiresShopping/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
