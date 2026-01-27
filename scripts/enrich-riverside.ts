
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Riverside...');

    // Target: Riverside Shopping Centre (Evesham)
    // ID: cmjr5j01800017slz0m0lc073
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmjr5j01800017slz0m0lc073'
        },
        data: {
            website: 'http://www.riversideshopping.co.uk/',
            openingHours: {
                "Mon-Sat": "09:00-17:30",
                "Sun": "10:00-16:00"
            },
            parkingSpaces: 260,
            carParkPrice: 1.00, // Estimate
            owner: 'PJK Investments', // Recent acquisition 2024
            management: 'Chase Commercial', // Historic/current?

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
