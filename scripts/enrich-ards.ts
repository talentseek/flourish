
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Ards Shopping Centre...');

    // Target: Ards Shopping Centre (Newtownards)
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksmaxl60008x52r1r2zsztq'
        },
        data: {
            // Confirmed Fields
            phone: '028 9181 5444',
            website: 'https://ardsshoppingcentre.com/',
            openingHours: {
                "Mon-Fri": "09:00-21:00",
                "Sat": "09:00-17:30",
                "Sun": "13:00-17:30"
            },
            parkingSpaces: 1200,
            carParkPrice: 0.00, // Free
            owner: 'Belfast Office Properties / Comer Group',
            management: 'Lambert Smith Hampton', // Historical, verify if still current
            managementEmail: 'info@ardsshoppingcentre.com',

            // Socials
            instagram: 'https://www.instagram.com/ardsshoppingcentre/',
            facebook: 'https://en-gb.facebook.com/ardsshoppingcentre/',

            // Address Refinement
            address: '22c Circular Rd',
            postcode: 'BT23 4EU',

            // Operations
            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
