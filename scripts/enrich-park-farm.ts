
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Park Farm...');

    // Target: Park Farm Shopping Centre (Allestree)
    // ID: cmicxw4ne001113hxrga7j3df
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmicxw4ne001113hxrga7j3df'
        },
        data: {
            website: 'https://www.parkfarmshoppingcentre.co.uk',
            openingHours: {
                "Mon-Sat": "09:00-17:30", // General retail hours
                "Sun": null // Often closed except Co-op
            },
            parkingSpaces: 400, // Estimate for district centre
            carParkPrice: 0.00, // Free for 2-3 hours
            owner: 'Private Investor', // Managed by FHP
            management: 'FHP Property Consultants',

            facebook: 'https://www.facebook.com/ParkFarmShoppingCentre/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
