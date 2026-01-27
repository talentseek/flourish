
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Richmond Gardens...');

    // Target: Richmond Gardens Shopping Centre (Bournemouth)
    // ID: cmicxw4qj001813hxaoq2y2y0
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmicxw4qj001813hxaoq2y2y0'
        },
        data: {
            website: 'https://richmondgardensshoppingcentre.co.uk/',
            openingHours: {
                "Mon-Sat": "08:00-18:00", // Standard retail hours
                "Sun": "10:00-16:00"
            },
            parkingSpaces: 859, // Council Multi-storey
            carParkPrice: 3.20, // 2 hours
            owner: 'Evolve Estates',
            management: 'LCP / Evolve',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
