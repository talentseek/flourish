
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Tower Centre...');

    // Target: Tower Centre (Ballymena)
    // ID: cmksmaxmv000ax52r5v01evmx
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksmaxmv000ax52r5v01evmx'
        },
        data: {
            website: 'https://towercentre.com/',
            openingHours: {
                "Mon-Wed": "09:00-17:30",
                "Thu-Fri": "09:00-21:00",
                "Sat": "09:00-18:00",
                "Sun": "13:00-18:00"
            },
            parkingSpaces: 200, // Multi-storey associated
            carParkPrice: 1.00, // Paid
            owner: 'Frasers Group', // Acquired May 2025
            management: 'Centre Management',

            facebook: 'https://www.facebook.com/TowerCentreBallymena/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
