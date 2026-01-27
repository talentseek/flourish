
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Runcorn Shopping City...');

    // Target: Runcorn Shopping City (Runcorn)
    // ID: cmksmwvfa0002l9k3urotknc5
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksmwvfa0002l9k3urotknc5'
        },
        data: {
            website: 'https://shopping-city.co.uk',
            openingHours: {
                "Mon-Sat": "09:00-17:30",
                "Sun": "10:00-16:00"
            },
            parkingSpaces: 2200, // Estimate based on 3 large decks
            carParkPrice: 0.00, // Free
            owner: 'Runcorn Capital Ventures Limited',
            management: 'Centre Management',

            facebook: 'https://www.facebook.com/ShoppingCityRuncorn/',

            isManaged: true,
            numberOfStores: 60
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
