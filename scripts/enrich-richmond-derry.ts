
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Richmond Centre...');

    // Target: Richmond Centre (Derry)
    // ID: cmksmaxrd000ex52rx1dtcbzj
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksmaxrd000ex52rx1dtcbzj'
        },
        data: {
            website: 'https://richmondcentre.co.uk/',
            openingHours: {
                "Mon-Wed": "09:00-18:00",
                "Thu-Fri": "09:00-21:00",
                "Sat": "09:00-18:00",
                "Sun": "13:00-18:00"
            },
            parkingSpaces: 0, // Uses City Car Parks (Foyle Street)
            owner: 'Martin Property Group',
            management: 'Centre Management',

            facebook: 'https://www.facebook.com/RichmondCentreDerry/',
            instagram: 'https://www.instagram.com/richmondcentrederry/',

            isManaged: true,
            numberOfStores: 40
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
