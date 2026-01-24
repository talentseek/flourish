
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Borough Parade
    console.log("Merging Borough Parade duplicates...");
    const boroughSurvivor = "cmicxw49t000813hxr6frnapt";
    const boroughVictim = "cmid0kq7501jimtpuqxgrzca9";

    try {
        await prisma.location.delete({ where: { id: boroughVictim } });
        console.log("✅ Deleted duplicate Borough Parade record.");
    } catch (e) {
        console.log("Borough Parade duplicate not found.");
    }

    // 2. St Martins Walk
    // I suspect the victim is found by the audit script.
    // I'll search for it first.
    const potentialVictim = await prisma.location.findFirst({
        where: { name: { contains: "St Martins Walk" }, id: { not: "cmicxw4sn001c13hx4ilp5yh6" } }
    });

    if (potentialVictim) {
        console.log(`Merging St Martins Walk (Victim: ${potentialVictim.id})...`);
        try {
            await prisma.location.delete({ where: { id: potentialVictim.id } });
            console.log("✅ Deleted duplicate St Martins Walk record.");
        } catch (e) { console.error(e); }
    } else {
        console.log("No duplicate St Martins Walk found. Maybe simple query mismatch?");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
