
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching The Mailbox...');

    // Target: The Mailbox (Birmingham)
    // ID: cmicxw4j7000s13hxzkrmasy0
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmicxw4j7000s13hxzkrmasy0'
        },
        data: {
            website: 'https://mailboxlife.com',
            openingHours: {
                "Mon-Sun": "00:00-23:59" // Public access 24/7, retail 10-6
            },
            parkingSpaces: 687, // Q-Park Mailbox
            carParkPrice: null, // Paid
            owner: 'Mailbox REIT (M7 Real Estate)',
            management: 'M7 Real Estate',

            facebook: 'https://www.facebook.com/mailboxlife/',
            instagram: 'https://www.instagram.com/mailboxlife/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
