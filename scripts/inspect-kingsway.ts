
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Inspecting Kingsway Records...");

    const kingsways = await prisma.location.findMany({
        where: {
            name: { contains: "Kingsway" }
        }
    });

    kingsways.forEach(k => {
        console.log(`[ID: ${k.id}] ${k.name} (${k.city}) - Web: ${k.website}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
