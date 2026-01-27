
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Hay\'s Galleria...');

    // Target: Hay's Galleria (London Bridge)
    // ID: cmkt05rl00004xh3vf476uy4l
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmkt05rl00004xh3vf476uy4l'
        },
        data: {
            // Data verified via Search
            website: 'https://hays-galleria.com/',
            openingHours: {
                "Mon-Fri": "08:00-23:00", // Open late for dining
                "Sat": "09:00-23:00",
                "Sun": "09:00-22:00"
            },
            parkingSpaces: 0, // No on-site parking
            owner: 'St Martins Property Corporation',
            management: 'Lambert Smith Hampton', // Managing agents usually

            // Socials
            instagram: 'https://www.instagram.com/haysgalleria/',

            // Operations
            isManaged: true,
            publicTransit: 'London Bridge Station'
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
