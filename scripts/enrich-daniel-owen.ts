
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Daniel Owen Centre...');

    // Target: Daniel Owen Centre (Mold)
    // ID: cmksluw4o00026h2obkubxlfw
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmksluw4o00026h2obkubxlfw'
        },
        data: {
            // Data verified via Search (Website down)
            openingHours: {
                "Mon-Sat": "09:00-17:00",
                "Sun": null
            },
            parkingSpaces: 0, // Uses Council Car Parks
            owner: 'Daniel Owen Community Association',
            management: 'Karen Hodgkinson (Centre Manager)',

            // Socials
            facebook: 'https://www.facebook.com/danielowencentre', // Inferred

            // Operations
            isManaged: true,
            publicTransit: 'Bus Station adjacent'
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
