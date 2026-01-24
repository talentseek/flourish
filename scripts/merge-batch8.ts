
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Totton
    console.log("Merging Totton duplicates...");
    const tottonSurvivor = "cmicxw4xc001m13hx3v8lgjni";
    const tottonVictim = "cmid0kksm01e1mtpuxlpz9p99";

    try {
        await prisma.location.delete({ where: { id: tottonVictim } });
        console.log("✅ Deleted duplicate Totton record.");
    } catch (e) {
        console.log("Totton duplicate not found.");
    }

    // 2. Hillsborough
    console.log("Merging Hillsborough duplicates...");
    const hillsSurvivor = "cmicxw4fi000k13hxblnhl921";
    const hillsVictim = "cmid0kv2p01odmtpu4jkvlt19";

    try {
        await prisma.location.delete({ where: { id: hillsVictim } });
        console.log("✅ Deleted duplicate Hillsborough record.");
    } catch (e) {
        console.log("Hillsborough duplicate not found.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
