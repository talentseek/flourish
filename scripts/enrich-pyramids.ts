
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Pyramids Shopping Centre...');

    // Target: Pyramids Shopping Centre (Birkenhead)
    // ID: cmksmwvd00000l9k3w4uln2jw
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksmwvd00000l9k3w4uln2jw'
        },
        data: {
            website: 'https://pyramidsshoppingcentre.co.uk',
            openingHours: {
                "Mon-Thu": "09:00-17:30",
                "Fri-Sat": "09:00-18:00",
                "Sun": "10:00-16:30"
            },
            parkingSpaces: 1100,
            carParkPrice: 2.00, // Daily
            owner: 'Wirral Council',
            management: 'JLL',

            facebook: 'https://www.facebook.com/PyramidsShoppingCentre/',
            twitter: 'https://twitter.com/PyramidsSC',

            isManaged: true,
            numberOfStores: 120
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
