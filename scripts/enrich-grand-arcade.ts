
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Grand Arcade...');

    // Target: Grand Arcade (Wigan)
    // ID: cmksmwvid0003l9k3spm79g1d
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksmwvid0003l9k3spm79g1d'
        },
        data: {
            // Data verified via Search
            website: 'https://grandarcade.co.uk/',
            openingHours: {
                "Mon-Sat": "09:00-17:30",
                "Sun": "10:30-16:30"
            },
            parkingSpaces: 850, // APCOA Wigan (Grand Arcade)
            carParkPrice: 3.50, // Typical daily rate
            owner: 'RDI REIT',
            management: 'APCOA (Parking) / RDI',

            // Socials
            facebook: 'https://www.facebook.com/GrandArcadeWigan/',
            instagram: 'https://www.instagram.com/grandarcadewigan/',

            // Operations
            isManaged: true,
            numberOfStores: 39
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
