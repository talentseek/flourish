
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const locs = await prisma.location.findMany({
        where: { city: 'Bolton', type: 'RETAIL_PARK' },
        select: { name: true }
    });
    console.table(locs);
}

main().catch(console.error).finally(() => prisma.$disconnect());
