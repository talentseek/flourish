
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Merton Abbey Mills...');

    // Target: Merton Abbey Mills (Merton)
    // ID: cmkt05rme0005xh3vgr65kt04
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmkt05rme0005xh3vgr65kt04'
        },
        data: {
            website: 'https://www.mertonabbeymills.org.uk',
            openingHours: {
                "Mon-Sun": "10:00-17:00" // Market/Shop core hours
            },
            parkingSpaces: 0, // Council managed nearby
            owner: 'Private / Wandle Heritage (Volunteers)', // Complex tenure
            management: 'Merton Abbey Mills Management',
            openedYear: 1724, // Historic print works

            instagram: 'https://www.instagram.com/mertonabbeymills/',
            facebook: 'https://www.facebook.com/MertonAbbeyMills/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
