
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Priors Hall Park...');

    // Target: Priors Hall Park (Weldon)
    // ID: cmjr5j00c00007slzpxmybwjt
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmjr5j00c00007slzpxmybwjt'
        },
        data: {
            website: 'https://priorshallparkmanagement.co.uk/',
            openingHours: {
                "Mon-Sun": "07:00-23:00" // Sainsbury's Local hours typical
            },
            parkingSpaces: 50, // District centre parking
            carParkPrice: 0.00,
            owner: 'Urban&Civic', // Master Developer
            management: 'Priors Hall Park Management',

            facebook: 'https://www.facebook.com/PriorsHallPark/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
