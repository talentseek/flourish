
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Borough Parade...');

    // Target: Borough Parade (Chippenham)
    // ID: cmicxw49t000813hxr6frnapt
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmicxw49t000813hxr6frnapt'
        },
        data: {
            // Confirmed Fields
            phone: '01252 315315',
            website: 'https://boroughparade.co.uk',
            openingHours: {
                "Mon-Sat": "09:00-17:30",
                "Sun": "10:00-16:30"
            },
            parkingSpaces: 200, // Estimate for Multi-Story
            carParkPrice: 1.50, // Typical paid pricing
            owner: 'LCP / M Core',
            management: 'LCP',
            managementContact: 'Sam Cohen',
            managementPhone: '0207 228 6508',

            // Socials
            facebook: 'https://www.facebook.com/boroughparade',

            // Operations
            isManaged: true,
            anchorTenants: 1, // Waitrose
            evCharging: false // Not mentioned
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
