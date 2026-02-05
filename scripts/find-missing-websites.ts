import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    const locs = await prisma.location.findMany({
        where: {
            isManaged: true,
            OR: [
                { website: null },
                { website: { contains: 'thisisflourish.co.uk' } }
            ]
        },
        select: { id: true, name: true, city: true, postcode: true }
    });
    console.log(JSON.stringify(locs, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
