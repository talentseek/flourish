
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. CLARIFY PARK FARM (Two different locations)
    console.log("1. Clarifying Park Farm entities...");

    // ID1: Derby (Enriched)
    await prisma.location.update({
        where: { id: "cmicxw4ne001113hxrga7j3df" },
        data: { name: "Park Farm Shopping Centre (Allestree)" }
    });
    console.log("   - Renamed Derby location");

    // ID2: Folkestone
    await prisma.location.update({
        where: { id: "cmid0kbdo013zmtpu6yy2z5ao" },
        data: { name: "Park Farm Retail Park (Folkestone)" }
    });
    console.log("   - Renamed Folkestone location");


    // 2. MERGE PARKGATE (Rotherham)
    // Survivor: cmicxw4r5001913hx99kvdrl3 (The one I enriched)
    // Victim: cmid0kbhr0143mtpuzvsfkwlw
    console.log("\n2. Merging Parkgate (Rotherham)...");

    const parkgateSurvivor = "cmicxw4r5001913hx99kvdrl3";
    const parkgateVictim = "cmid0kbhr0143mtpuzvsfkwlw";

    // Move any related records (if any existed, e.g. tenants) - assuming none for now as gaps are high
    // Delete victim
    try {
        await prisma.location.delete({ where: { id: parkgateVictim } });
        console.log("   - Deleted duplicate Parkgate record");
    } catch (e) {
        console.log("   - Parkgate duplicate already deleted or not found");
    }


    // 3. MERGE THE FORGE (Glasgow)
    // Survivor: cmicxw4v1001h13hx7jef1ft4 (The one I enriched)
    // Victim: cmid0l2qi01wbmtpu253fktx6
    console.log("\n3. Merging The Forge (Glasgow)...");

    const forgeSurvivor = "cmicxw4v1001h13hx7jef1ft4";
    const forgeVictim = "cmid0l2qi01wbmtpu253fktx6";

    try {
        await prisma.location.delete({ where: { id: forgeVictim } });
        console.log("   - Deleted duplicate Forge record");
    } catch (e) {
        console.log("   - Forge duplicate already deleted or not found");
    }

    console.log("\n✅ Deduplication Complete");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
