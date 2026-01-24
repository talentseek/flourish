
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log("Listing Enrichment Targets...");

    const targets = await prisma.location.findMany({
        where: {
            type: 'SHOPPING_CENTRE',
            OR: [
                { totalFloorArea: null },
                { totalFloorArea: 0 },
                { numberOfStores: null },
                { numberOfStores: 0 }
            ],
            // Only Managed ones (Tier 2) to start with, as per plan.
            management: { not: null }
        },
        select: { id: true, name: true, city: true, management: true }
    });

    console.log(`Found ${targets.length} targets (Managed but missing data).`);
    // Filter out "Unknown" management just in case.
    const realTargets = targets.filter(t => t.management !== 'Unknown' && t.management !== 'Internal');
    console.log(`Filtered to ${realTargets.length} valid managed targets.`);

    fs.writeFileSync('enrichment_targets.json', JSON.stringify(realTargets, null, 2));
    console.log("Saved to enrichment_targets.json");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
