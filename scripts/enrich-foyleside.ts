
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Foyleside...');

    // Target: Foyleside Shopping Centre (Derry)
    // ID: cmksmaxcs0000x52rv4ucv2x9
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksmaxcs0000x52rv4ucv2x9'
        },
        data: {
            // Confirmed Fields
            website: 'https://foyleside.co.uk/',
            openingHours: {
                "Mon-Tue": "09:00-18:00",
                "Wed-Fri": "09:00-21:00",
                "Sat": "09:00-19:00",
                "Sun": "13:00-18:00"
            },
            parkingSpaces: 1530, // Estimate based on East+West car parks
            owner: 'Foyleside Acquisitions Ltd',
            management: 'Savills',

            // Socials
            facebook: 'https://www.facebook.com/FoylesideShoppingCentre', // Inferred 

            // Operations
            isManaged: true,
            publicTransit: 'Foyle Street Bus Centre nearby'
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
