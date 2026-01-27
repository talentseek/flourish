
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("📊 Database Statistics\n");

    const total = await prisma.location.count();
    const shoppingCentres = await prisma.location.count({ where: { type: 'SHOPPING_CENTRE' } });

    const noWebsiteTotal = await prisma.location.count({
        where: {
            OR: [
                { website: null },
                { website: '' }
            ]
        }
    });

    const noWebsiteSC = await prisma.location.count({
        where: {
            type: 'SHOPPING_CENTRE',
            OR: [
                { website: null },
                { website: '' }
            ]
        }
    });

    console.log(`Total Locations: ${total}`);
    console.log(`Shopping Centres: ${shoppingCentres}`);
    console.log(`\nMISSING WEBSITES:`);
    console.log(`- Total: ${noWebsiteTotal}`);
    console.log(`- Shopping Centres ONLY: ${noWebsiteSC}`);
    console.log(`\nCoverage (SCs): ${((shoppingCentres - noWebsiteSC) / shoppingCentres * 100).toFixed(1)}%`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
