
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching The Strand...');

    // Target: The Strand Shopping Centre (Bootle)
    // ID: cmicxw4vz001j13hx8u2cfpiu
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmicxw4vz001j13hx8u2cfpiu'
        },
        data: {
            website: 'https://strandshoppingcentre.com',
            openingHours: {
                "Mon-Sat": "09:00-17:30",
                "Sun": "10:00-16:00"
            },
            parkingSpaces: 500,
            carParkPrice: 1.80, // Up to 2 hours
            owner: 'Sefton Council',
            management: 'Metquarter / Ellandi (historic management)', // Council manages directly or via agent

            facebook: 'https://www.facebook.com/StrandShoppingCentre/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
