
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Culver Square...');

    // Target: Culver Square (Colchester)
    // ID: cmkswynsd0003d3izopfxfr5y
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmkswynsd0003d3izopfxfr5y'
        },
        data: {
            // Data verified via Search (Website timeout)
            openingHours: {
                "Mon-Fri": "09:00-17:30",
                "Sat": "09:00-18:00",
                "Sun": "10:30-16:30"
            },
            parkingSpaces: 0, // Uses Council Car Parks (St Johns/Osbourne)
            carParkPrice: null,
            owner: 'Private Investor', // Solid from M&G recently
            management: 'Green & Partners (Agent)', // Likely managing agent

            // Socials
            instagram: 'https://www.instagram.com/culversquare/', // Inferred
            facebook: 'https://www.facebook.com/CulverSquare/', // Inferred

            // Operations
            isManaged: true,
            anchorTenants: 2 // H&M, TK Maxx
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
