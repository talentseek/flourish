
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Address Integrity Audit (1,000 SCs)");

    const centres = await prisma.location.findMany({
        where: { type: 'SHOPPING_CENTRE' }
    });
    console.log(`Total Shopping Centres: ${centres.length}`);

    // 1. Postcode Health
    const missingPostcode = centres.filter(c => !c.postcode || c.postcode === 'UNKNOWN');
    console.log(`❌ Missing Postcodes: ${missingPostcode.length}`);
    if (missingPostcode.length > 0) {
        missingPostcode.forEach(c => console.log(`   - ${c.name} (${c.city})`));
    }

    // 2. City/County Health
    const missingCity = centres.filter(c => !c.city || c.city === 'Unknown');
    const missingCounty = centres.filter(c => !c.county || c.county === 'Unknown');
    console.log(`❌ Missing City:      ${missingCity.length}`);
    console.log(`⚠️ Missing County:    ${missingCounty.length}`);

    // 3. Duplicate Health (Fuzzy)
    const nameMap = new Map();
    const potentialDupes = [];

    centres.forEach(c => {
        // Key: "Name|City" (simplified)
        const simName = c.name.toLowerCase().replace(/shopping|centre|center|mall|park/g, '').trim();
        const key = `${simName}|${c.city.toLowerCase()}`;

        if (nameMap.has(key)) {
            potentialDupes.push({
                original: nameMap.get(key),
                duplicate: c
            });
        } else {
            nameMap.set(key, c);
        }
    });

    console.log(`⚠️ Potential Duplicates: ${potentialDupes.length}`);
    if (potentialDupes.length > 0) {
        console.log("   (Sample Dupes):");
        potentialDupes.slice(0, 5).forEach(d => {
            console.log(`   - ${d.duplicate.name} vs ${d.original.name}`);
        });
    }

    console.log("Address Audit Complete");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
