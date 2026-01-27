
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Victoria Leeds...');

    // Target: Victoria Leeds (Victoria Quarter / Victoria Gate)
    // ID: cmkss20180001cy3uy1jydr55
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmkss20180001cy3uy1jydr55'
        },
        data: {
            website: 'https://victoria-leeds.co.uk/',
            openingHours: {
                "Mon-Sat": "10:00-18:00", // Boutique hours typical
                "Sun": "11:00-17:00"
            },
            parkingSpaces: 805, // Victoria Gate Multi-storey
            carParkPrice: 4.75, // Starting rate high
            owner: 'Redical Holdings AG', // Acquired from Hammerson
            management: 'Redical',

            facebook: 'https://www.facebook.com/VictoriaLeedsShopping/',
            instagram: 'https://www.instagram.com/victorialeeds_/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
