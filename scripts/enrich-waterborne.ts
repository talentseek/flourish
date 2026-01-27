
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Waterborne Walk...');

    // Target: Waterborne Walk (Leighton Buzzard)
    // ID: cmicxw4xq001n13hxin90rbjb
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmicxw4xq001n13hxin90rbjb'
        },
        data: {
            website: 'https://waterbornewalk.co.uk',
            openingHours: {
                "Mon-Sat": "09:00-17:30",
                "Sun": "10:00-16:00"
            },
            parkingSpaces: 266, // West Street Multi-storey (Adjoining) - Council
            carParkPrice: null, // Paid
            owner: 'Private Investor', // Punch Partnerships or similar?
            management: 'LCP / Evolve', // Historic mgmt

            facebook: 'https://www.facebook.com/WaterborneWalk/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
