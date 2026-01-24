
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting Global Duplicate Check...");

    // Fetch all managed locations
    const locations = await prisma.location.findMany({
        where: { isManaged: true },
        select: { id: true, name: true, city: true, postcode: true }
    });

    console.log(`Scanning ${locations.length} managed locations for potential duplicates...`);

    const potentialDupes = [];
    const nameMap = new Map();

    for (const loc of locations) {
        // Normalize name for checking (simple lowercase)
        const simplifiedName = loc.name.toLowerCase().replace('shopping', '').replace('centre', '').replace('center', '').trim();
        const key = `${simplifiedName}|${loc.city}`;

        if (nameMap.has(key)) {
            potentialDupes.push({
                original: nameMap.get(key),
                duplicate: loc
            });
        } else {
            nameMap.set(key, loc);
        }
    }

    if (potentialDupes.length === 0) {
        console.log("✅ No obvious name+city duplicates found.");
    } else {
        console.log(`⚠️ Found ${potentialDupes.length} potential duplicates:`);
        potentialDupes.forEach(pair => {
            console.log(`  - MATCH: "${pair.original.name}" (${pair.original.id}) vs "${pair.duplicate.name}" (${pair.duplicate.id}) in ${pair.original.city}`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
