
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Grand Central...');

    // Target: Grand Central (Birmingham)
    // ID: cmkst1zvg00002zgsusb90jkh
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmkst1zvg00002zgsusb90jkh'
        },
        data: {
            // Data verified via Search
            website: 'https://grandcentralbirmingham.com',
            openingHours: {
                "Mon-Sat": "09:00-20:00",
                "Sun": "11:00-17:00"
            },
            parkingSpaces: 450, // Dedicated Grand Central CP
            carParkPrice: null,
            owner: 'Hammerson',
            management: 'Hammerson',

            // Socials
            instagram: 'https://www.instagram.com/bullring/', // Joint account usually
            facebook: 'https://www.facebook.com/GrandCentralBirmingham/',

            // Operations
            isManaged: true,
            anchorTenants: 1 // Link to Bullring effectively
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
