
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Kennedy Centre...');

    // Target: Kennedy Centre (Belfast)
    // ID: cmksmaxik0005x52rh4x074cy
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksmaxik0005x52rh4x074cy'
        },
        data: {
            website: 'https://kennedycentre.co.uk/',
            openingHours: {
                "Mon-Wed": "09:00-18:00", // Adjusted per search (Mon 6, Tue-Fri 9)
                "Tue-Fri": "09:00-21:00", // Search said Tue-Fri 9-9
                "Sat": "09:00-18:00",
                "Sun": "13:00-18:00"
            },
            parkingSpaces: 800,
            carParkPrice: 0.00, // Free
            owner: 'Kennedy Family (Hugh Kennedy)',
            management: 'Kennedy Centre Management',

            instagram: 'https://www.instagram.com/kennedycentre/',
            facebook: 'https://www.facebook.com/KennedyCentreBelfast/',

            isManaged: true,
            numberOfStores: 45
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
