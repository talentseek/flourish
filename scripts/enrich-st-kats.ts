
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching St Katharine Docks...');

    // Target: St Katharine Docks (London)
    // ID: cmicxw4s5001b13hx3a7yehoo
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmicxw4s5001b13hx3a7yehoo'
        },
        data: {
            website: 'https://www.skdocks.co.uk/',
            openingHours: {
                "Mon-Sun": "00:00-23:59" // Public access, shops vary
            },
            parkingSpaces: 0, // Nearby Waitrose/Q-Park
            owner: 'City Developments Limited (CDL)',
            management: 'St Katharine Docks Management',

            instagram: 'https://www.instagram.com/stkatsdocks/',
            facebook: 'https://www.facebook.com/stkats/',

            isManaged: true,
            publicTransit: 'Tower Hill Tube'
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
