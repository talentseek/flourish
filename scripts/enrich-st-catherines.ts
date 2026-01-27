
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching St Catherine\'s Walk...');

    // Target: St Catherine's Walk (Carmarthen)
    // ID: cmksluvzy00006h2o34qcqd5n
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksluvzy00006h2o34qcqd5n'
        },
        data: {
            website: 'https://stcatherineswalk.com/',
            openingHours: {
                "Mon-Sat": "09:00-17:30",
                "Sun": "10:00-16:00"
            },
            parkingSpaces: 950, // APCOA
            carParkPrice: null, // Paid
            owner: 'Private Investor', // Managed by APCOA/Agents
            management: 'Montagu Evans (Managing Agents)', // Likely

            facebook: 'https://www.facebook.com/stcatherineswalk/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
