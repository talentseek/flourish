import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const bridgeSites = await prisma.location.findMany({
        where: { name: { contains: 'The Bridges' } }
    });
    console.log(JSON.stringify(bridgeSites, null, 2));
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
