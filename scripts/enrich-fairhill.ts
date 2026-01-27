
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Fairhill...');

    // Target: Fairhill Shopping Centre (Ballymena)
    // ID: cmksmaxjl0006x52rbtjq7bfb
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksmaxjl0006x52rbtjq7bfb'
        },
        data: {
            // Confirmed Fields
            website: 'https://fairhillshopping.co.uk/',
            openingHours: {
                "Mon-Wed": "09:00-17:30",
                "Thu-Fri": "09:00-21:00",
                "Sat": "09:00-18:00",
                "Sun": "13:00-18:00"
            },
            parkingSpaces: 900, // Verified (897)
            carParkPrice: null, // Paid
            owner: 'Magmel (Ballymena) Ltd / Magell',
            management: 'Magmel',

            // Socials
            instagram: 'https://www.instagram.com/fairhillballymena/',
            facebook: 'https://www.facebook.com/Fairhillshoppingcentre/',
            tiktok: 'https://www.tiktok.com/@fairhillballymena',

            // Operations
            isManaged: true,
            anchorTenants: 1 // M&S
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
