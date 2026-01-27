
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Leadenhall Market...');

    // Target: Leadenhall Market (City of London)
    // ID: cmkt05rno0006xh3v6mhzq2ag
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmkt05rno0006xh3v6mhzq2ag'
        },
        data: {
            website: 'https://leadenhallmarket.co.uk/',
            openingHours: {
                "Mon-Fri": "10:00-18:00", // Shop hours vs Market access (24/7)
                "Sat-Sun": null // Often closed/quiet
            },
            parkingSpaces: 0, // Pedestrian
            owner: 'City of London Corporation',
            management: 'City of London',
            openedYear: 1321, // Historic market

            instagram: 'https://www.instagram.com/leadenhallmarket/',
            facebook: 'https://www.facebook.com/LeadenhallMarket/',

            isManaged: true,
            publicTransit: 'Monument / Bank Tube'
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
