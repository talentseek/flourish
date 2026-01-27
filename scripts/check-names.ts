
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const terms = ['Angouleme', 'Astley', 'Birchwood'];

    for (const term of terms) {
        const locs = await prisma.location.findMany({
            where: { name: { contains: term, mode: 'insensitive' } },
            select: { id: true, name: true, type: true }
        });
        console.log(`\nSearch for "${term}":`);
        console.table(locs);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
