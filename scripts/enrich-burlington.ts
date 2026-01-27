
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Burlington Arcade...');

    // Target: Burlington Arcade (Mayfair)
    // ID: cmkt05rjo0003xh3v5xogv9an
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmkt05rjo0003xh3v5xogv9an'
        },
        data: {
            // Confirmed Fields
            website: 'https://www.burlingtonarcade.com',
            openingHours: {
                "Mon-Fri": "10:00-19:00",
                "Sat": "09:00-18:30",
                "Sun": "12:00-18:00"
            },
            parkingSpaces: 0, // Pedestrian Arcade
            carParkPrice: null,

            owner: 'Reuben Brothers',
            management: 'Burlington Arcade Management',
            openedYear: 1819, // Historic fact

            numberOfStores: 47,
            retailers: 47,

            // Socials
            instagram: 'https://www.instagram.com/burlingtonarcade/',
            facebook: 'https://www.facebook.com/BurlingtonArcade/',

            // Operations
            isManaged: true,
            publicTransit: 'Green Park / Piccadilly Circus Tube'
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
