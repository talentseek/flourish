
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Kingdom Centre...');

    // Target: The Kingdom Centre (Glenrothes)
    // ID: cmksclxvf000e9atsl1syc0gh
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksclxvf000e9atsl1syc0gh'
        },
        data: {
            website: 'https://kingdomshoppingcentre.co.uk/',
            openingHours: {
                "Mon-Sun": "09:00-17:30"
            },
            parkingSpaces: 1500, // Majority 3h free
            carParkPrice: 0.00, // 3 hours free
            owner: 'Focus Estate Fund', // Acquired June 2024
            management: 'Centre Management',

            facebook: 'https://www.facebook.com/KingdomShoppingCentre/',

            isManaged: true,
            numberOfStores: 100
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
