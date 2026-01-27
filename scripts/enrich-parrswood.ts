
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Parrswood Leisure Park...');

    // Target: Parrswood Leisure Park (Manchester)
    // ID: cmksemaiz000aoqpnh9mahtp7
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksemaiz000aoqpnh9mahtp7'
        },
        data: {
            website: 'https://parrswoodmanchester.co.uk/',
            openingHours: {
                "Mon-Sun": "06:00-23:59" // Leisure park access
            },
            parkingSpaces: 1000, // Large surface car park
            carParkPrice: 0.00, // Free
            owner: 'Landsec',
            management: 'Landsec',

            facebook: 'https://www.facebook.com/ParrsWood',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
