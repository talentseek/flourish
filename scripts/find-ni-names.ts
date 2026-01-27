
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const terms = ['Sprucefield', 'Boulevard', 'Junction', 'Connswater', 'Boucher', 'Shane'];

    console.log('Searching for NI Site matches...');

    for (const term of terms) {
        const results = await prisma.location.findMany({
            where: {
                name: { contains: term, mode: 'insensitive' }
            },
            select: { id: true, name: true, city: true, type: true }
        });

        if (results.length > 0) {
            console.log(`\nMatches for "${term}":`);
            console.table(results);
        } else {
            console.log(`\nNo matches for "${term}"`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
