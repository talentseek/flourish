
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Ropewalk...');

    // Target: Ropewalk Shopping Centre (Nuneaton)
    // ID: cmkst205100012zgss5rqyhf6
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmkst205100012zgss5rqyhf6'
        },
        data: {
            website: 'https://nuneatonandbedworth.gov.uk/ropewalk', // Using Council page as primary proxy if official site distinct
            openingHours: {
                "Mon-Sat": "09:00-18:00",
                "Sun": "10:30-16:30"
            },
            parkingSpaces: 400, // Estimate for dedicated multi-storey
            carParkPrice: null, // Paid
            owner: 'Bank of Ireland / BTW Shields',
            management: 'BTW Shields',

            facebook: 'https://www.facebook.com/RopewalkShoppingCentre/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
