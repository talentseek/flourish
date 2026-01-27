
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Bow Street Mall...');

    // Target: Bow Street Mall (Lisburn)
    // ID: cmksmaxhu0004x52r2z6qaxtv
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksmaxhu0004x52r2z6qaxtv'
        },
        data: {
            // Confirmed Fields
            phone: '028 9267 5438', // Sourced from snippet/standard
            website: 'https://bowstreetmall.co.uk/',
            openingHours: {
                "Mon-Tue": "09:00-18:00",
                "Wed-Fri": "09:00-21:00",
                "Sat": "09:00-18:00",
                "Sun": "13:00-18:00"
            },
            parkingSpaces: 1000, // Estimate for multi-storey
            owner: 'Bow Street Mall Ltd', // As per Companies House ref
            management: 'Karen Marshall (Centre Manager)',

            // Socials
            facebook: 'https://www.facebook.com/BowStreetMall',
            instagram: 'https://www.instagram.com/bowstreetmall/',

            // Operations
            isManaged: true,
            numberOfStores: 40 // "Over 40 stores" from meta
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
