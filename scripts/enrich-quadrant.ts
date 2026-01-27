
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching The Quadrant...');

    // Target: The Quadrant Shopping Centre (Dunstable)
    // ID: cmicxw4po001613hxo327mv0i
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmicxw4po001613hxo327mv0i'
        },
        data: {
            website: 'https://quadrantshopping.co.uk',
            openingHours: {
                "Mon-Sat": "09:00-17:30",
                "Sun": "10:00-16:00"
            },
            parkingSpaces: 280, // NCP Estimate
            carParkPrice: 1.00, // Cheap rate
            owner: 'Signal Capital / Edinburgh House Estates', // Acquired 2021
            management: 'ESTAMA UK',

            facebook: 'https://www.facebook.com/QuadrantDunstable/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
