
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Park Centre...');

    // Target: Park Centre (Belfast)
    // ID: cmksmaxor000bx52r1itnn0k8
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksmaxor000bx52r1itnn0k8'
        },
        data: {
            website: 'https://theparkcentre.co.uk/',
            openingHours: {
                "Mon-Tue": "09:00-17:30",
                "Wed-Fri": "09:00-21:00",
                "Sat": "09:00-17:30",
                "Sun": "13:00-17:00"
            },
            parkingSpaces: 500, // Estimate based on surface + deck
            carParkPrice: 0.00, // 4 hours free
            owner: 'Latt Limited',
            management: 'Latt Ltd',

            facebook: 'https://www.facebook.com/ParkCentreBelfast/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
