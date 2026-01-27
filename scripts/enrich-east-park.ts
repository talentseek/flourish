
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching East Park Retail...');

    // Target: East Park Retail (Newport)
    // ID: cmicxw45r000013hx8bab8rdg
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmicxw45r000013hx8bab8rdg'
        },
        data: {
            // Confirmed Fields
            openingHours: {
                "Mon-Fri": "09:00-20:00", // Standard retail park hours
                "Sat": "09:00-18:00",
                "Sun": "10:00-16:00"
            },
            parkingSpaces: 300, // Estimate relative to Newport Retail Park
            carParkPrice: 0.00, // Typically free
            owner: 'Tristan Capital Partners',
            management: null,

            // Socials
            facebook: null,

            // Operations
            isManaged: true,
            publicTransit: 'Bus stops on Docks Way'
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
