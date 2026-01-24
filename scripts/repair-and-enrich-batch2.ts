
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🛠️ Repairing and Enriching Batch 2 Targets...");

    // 1. Repair Addlestone (Promote 'Addlestone (Surrey)' to 'Addlestone One')
    const addlestone = await prisma.location.findFirst({
        where: { name: 'Addlestone', postcode: { contains: 'KT15' } }
    });
    if (addlestone) {
        await prisma.location.update({
            where: { id: addlestone.id },
            data: {
                name: 'Addlestone One',
                city: 'Addlestone', // Ensure city is correct
                website: "https://addlestoneone.co.uk",
                instagram: "https://www.instagram.com/addlestoneone",
                facebook: "https://www.facebook.com/AddlestoneOne",
                parkingSpaces: 350,
                type: 'SHOPPING_CENTRE' // Ensure type
            }
        });
        console.log("✅ Repaired & Enriched Addlestone One");
    } else {
        console.log("⚠️ Could not find Addlestone record to repair.");
    }

    // 2. Repair Wellington (Fix City: Hampshire -> Aldershot)
    const wellington = await prisma.location.findFirst({
        where: { name: 'The Wellington Centre', postcode: { contains: 'GU11' } }
    });
    if (wellington) {
        await prisma.location.update({
            where: { id: wellington.id },
            data: {
                city: 'Aldershot',
                website: "https://thewellingtoncentre.co.uk",
                parkingSpaces: 400
            }
        });
        console.log("✅ Repaired & Enriched The Wellington Centre");
    }

    // 3. Repair Friars Square (Fix City: Buckinghamshire -> Aylesbury)
    const friars = await prisma.location.findFirst({
        where: { name: 'Friars Square Shopping Centre', postcode: { contains: 'HP20' } }
    });
    if (friars) {
        await prisma.location.update({
            where: { id: friars.id },
            data: {
                city: 'Aylesbury',
                website: "https://friarssquareshopping.com",
                parkingSpaces: 360
            }
        });
        console.log("✅ Repaired & Enriched Friars Square");
    }

    // 4. Repair The Spires (Fix City: Greater London -> Barnet)
    const spires = await prisma.location.findFirst({
        where: { name: 'The Spires Shopping Centre', postcode: { contains: 'EN5' } }
    });
    if (spires) {
        await prisma.location.update({
            where: { id: spires.id },
            data: {
                city: 'Barnet',
                website: "https://thespiresbarnet.co.uk",
                parkingSpaces: 440
            }
        });
        console.log("✅ Repaired & Enriched The Spires");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
