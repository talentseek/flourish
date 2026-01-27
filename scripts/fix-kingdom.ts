
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔧 Fixing Kingdom Centre URL...\n");

    const kingdom = await prisma.location.updateMany({
        where: { name: 'The Kingdom Centre' },
        data: { website: 'https://kingdomshoppingcentre.co.uk/' }
    });

    console.log(`✅ Updated ${kingdom.count} record(s) for The Kingdom Centre.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
