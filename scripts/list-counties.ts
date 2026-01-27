
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const locations = await prisma.location.findMany({
        where: { type: 'RETAIL_PARK' },
        select: { county: true }
    });

    const counties = [...new Set(locations.map(l => l.county).filter(Boolean))].sort();
    console.log(counties);
}

main().catch(console.error).finally(() => prisma.$disconnect());
