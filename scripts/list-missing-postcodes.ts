
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Fixing 28 Missing Postcodes...");

    // 1. Fetch Targets
    const targets = await prisma.location.findMany({
        where: {
            type: 'SHOPPING_CENTRE',
            postcode: 'UNKNOWN'
        },
        select: { id: true, name: true, city: true }
    });

    console.log(`Targets: ${targets.length}`);
    targets.forEach(t => console.log(`${t.name} | ${t.city}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
