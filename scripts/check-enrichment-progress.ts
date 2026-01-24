
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking Remaining Enrichment Targets...");

    const targets = await prisma.location.findMany({
        where: {
            type: 'SHOPPING_CENTRE',
            OR: [
                { totalFloorArea: null },
                { totalFloorArea: 0 }
            ],
            management: { not: null }
        },
        select: { name: true, city: true, management: true }
    });

    console.log(`Remaining Managed Targets: ${targets.length}`);
    targets.forEach(t => console.log(`- ${t.name} (${t.city})`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
