
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Debugging Wales/NI Records...");

    const targets = [
        "Bridgend",
        "Victoria Centre",
        "Riverside",
        "Abbey Centre"
    ];

    for (const t of targets) {
        console.log(`\nSearching for: ${t}`);
        const results = await prisma.location.findMany({
            where: {
                name: { contains: t, mode: 'insensitive' }
            }
        });
        console.log(JSON.stringify(results, null, 2));
    }
}

main()
    .finally(async () => await prisma.$disconnect());
