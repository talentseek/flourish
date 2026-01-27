
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Rushmere...');

    // Target: Rushmere Shopping Centre (Craigavon)
    // ID: cmksmaxeo0001x52rlhi54u98
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksmaxeo0001x52rlhi54u98'
        },
        data: {
            website: 'https://rushmereshopping.com/',
            openingHours: {
                "Mon-Fri": "09:00-21:00",
                "Sat": "09:00-18:00",
                "Sun": "13:00-18:00"
            },
            parkingSpaces: 1800, // Confirmed
            carParkPrice: 0.00, // Free
            owner: 'Killahoey Ltd',
            management: 'Centre Management',

            facebook: 'https://www.facebook.com/RushmereShoppingCentre/',
            instagram: 'https://www.instagram.com/rushmereshoppingcentre/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
