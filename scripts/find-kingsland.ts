
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const locs = await prisma.location.findMany({
        where: {
            OR: [
                { name: { contains: 'Kingsland', mode: 'insensitive' } },
                { city: { contains: 'Thatcham', mode: 'insensitive' } }
            ]
        }
    });
    console.log(JSON.stringify(locs, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
