
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const locs = await prisma.location.findMany({
        where: {
            OR: [
                { name: { contains: 'Nicholas', mode: 'insensitive' } },
                { city: { contains: 'Sutton', mode: 'insensitive' } }
            ]
        }
    });
    console.log("Matches:", locs.map(l => `${l.name} (${l.city}) - Website: ${l.website}`));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
