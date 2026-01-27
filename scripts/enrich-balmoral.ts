
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Balmoral Shopping Centre...');

    // Target: Balmoral Shopping Centre (Scarborough)
    // ID: cmicxw47m000313hxvu495jmw
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmicxw47m000313hxvu495jmw'
        },
        data: {
            // Confirmed Fields
            website: 'https://balmoralcentre.co.uk', // SSL invalid but exists
            openingHours: {
                "Mon-Sat": "08:00-18:00",
                "Sun": "10:00-17:00"
            },
            parkingSpaces: 200, // Estimate based on multi-story NCP
            carParkPrice: null, // NCP variable
            owner: null, // Unclear
            management: 'NCP (Parking)',

            // Socials
            instagram: null,
            facebook: null,

            // Operations
            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
