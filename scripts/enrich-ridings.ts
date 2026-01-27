
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching The Ridings...');

    // Target: The Ridings Shopping Centre (Wakefield)
    // ID: cmkss20660003cy3uhy5h7yn7
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmkss20660003cy3uhy5h7yn7'
        },
        data: {
            website: 'https://ridingscentre.com/',
            openingHours: {
                "Mon-Sat": "09:00-17:00",
                "Sun": "10:30-16:30"
            },
            parkingSpaces: 1000, // Multi-storey
            carParkPrice: 1.20, // 1 hour
            owner: 'Z&F Properties (Zahid Iqbal)', // Acquired recently
            management: 'Z&F Properties',

            facebook: 'https://www.facebook.com/ridingscentre/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
