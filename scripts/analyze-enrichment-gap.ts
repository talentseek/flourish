
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("📊 Enrichment Gap Analysis");

    const centres = await prisma.location.findMany({
        where: { type: 'SHOPPING_CENTRE' }
    });

    const metrics = {
        total: centres.length,
        missingData: 0,
        missingFloorArea: 0,
        missingStores: 0,
        missingParking: 0,
        tier1_Enriched: 0,
        tier2_Managed_Missing: 0,
        tier3_Unmanaged_Missing: 0
    };

    centres.forEach(c => {
        const hasArea = c.totalFloorArea && c.totalFloorArea > 0;
        const hasStores = c.numberOfStores && c.numberOfStores > 0;
        const hasParking = c.parkingSpaces !== null; // 0 is valid for town centres

        if (!hasArea) metrics.missingFloorArea++;
        if (!hasStores) metrics.missingStores++;
        if (!hasParking) metrics.missingParking++;

        const isFullyEnriched = hasArea && hasStores; // Basic definition

        if (isFullyEnriched) {
            metrics.tier1_Enriched++;
        } else {
            metrics.missingData++;
            // Segmentation
            const isManaged = c.management || c.isManaged;
            if (isManaged) {
                metrics.tier2_Managed_Missing++;
            } else {
                metrics.tier3_Unmanaged_Missing++;
            }
        }
    });

    console.log(`\n--- Gap Analysis Summary ---`);
    console.log(`Total Shopping Centres: ${metrics.total}`);
    console.log(`✅ Fully Enriched:      ${metrics.tier1_Enriched} (${Math.round(metrics.tier1_Enriched / metrics.total * 100)}%)`);
    console.log(`❌ Missing Core Data:   ${metrics.missingData} (${Math.round(metrics.missingData / metrics.total * 100)}%)`);

    console.log(`\n--- Missing Data Breakdown ---`);
    console.log(`Managed Centres (Savills/Workman/M Core) Missing Data: ${metrics.tier2_Managed_Missing}`);
    console.log(`Unmanaged Centres (Long Tail) Missing Data:            ${metrics.tier3_Unmanaged_Missing}`);

    console.log(`\n--- Field Gaps ---`);
    console.log(`Missing Floor Area: ${metrics.missingFloorArea}`);
    console.log(`Missing Store Count: ${metrics.missingStores}`);
    console.log(`Missing Parking:    ${metrics.missingParking}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
