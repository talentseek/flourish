
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Candidates for 'The Avenue'...\n");

    // Search for "Avenue"
    const locs = await prisma.location.findMany({
        where: { name: { contains: 'Avenue', mode: 'insensitive' } },
        select: { id: true, name: true, city: true, postcode: true }
    });

    console.table(locs);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
