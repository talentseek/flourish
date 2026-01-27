
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Verifying Kingdom Centre Records...\n");

    const matches = await prisma.location.findMany({
        where: {
            OR: [
                { name: { contains: 'Kingdom', mode: 'insensitive' } },
                { city: { contains: 'Glenrothes', mode: 'insensitive' } }
            ]
        }
    });
    console.log(matches);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
