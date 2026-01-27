
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🌍 Auditing Global Coordinate Gaps...");

    // Find all locations with invalid coordinates
    const broken = await prisma.location.findMany({
        where: {
            OR: [
                { latitude: { equals: 0 } },
                { longitude: { equals: 0 } }
            ]
        },
        select: {
            id: true,
            name: true,
            postcode: true,
            city: true,
            latitude: true,
            longitude: true
        }
    });

    console.log(`\n❌ Total Locations Missing Coordinates: ${broken.length}`);

    // Group by status
    const hasPostcode = broken.filter(l => l.postcode && l.postcode.length > 3).length;
    const noPostcode = broken.filter(l => !l.postcode || l.postcode.length <= 3).length;

    console.log(`- With Postcode: ${hasPostcode} (Recoverable via Postcodes.io)`);
    console.log(`- No Postcode: ${noPostcode} (Manual intervention required)`);

    console.log("\n📋 Sample of Broken Locations (With Postcodes):");
    broken.filter(l => l.postcode && l.postcode.length > 3).slice(0, 10).forEach(l => {
        console.log(`- ${l.name} (${l.city}) [${l.postcode}]`);
    });

    console.log("\n📋 Sample of Broken Locations (No Postcodes):");
    broken.filter(l => !l.postcode || l.postcode.length <= 3).slice(0, 5).forEach(l => {
        console.log(`- ${l.name} (${l.city})`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
