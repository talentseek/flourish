
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Merging The Strand (Bootle)...");

    // Survivor: cmicxw4vz001j13hx8u2cfpiu (The one I enriched in Batch 5)
    // Victim: cmid0l53f01yumtpuu96pohzh (The empty one found by Audit)

    const survivorId = "cmicxw4vz001j13hx8u2cfpiu";
    const victimId = "cmid0l53f01yumtpuu96pohzh";

    // 1. Check if both exist
    const survivor = await prisma.location.findUnique({ where: { id: survivorId } });
    const victim = await prisma.location.findUnique({ where: { id: victimId } });

    if (!survivor) {
        console.error("Survivor ID not found!");
        return;
    }

    console.log(`Survivor: ${survivor.name} (${survivor.id}) - Enriched? ${survivor.lastEnriched ? 'Yes' : 'No'}`);

    if (victim) {
        console.log(`Victim: ${victim.name} (${victim.id}) - Enriched? ${victim.lastEnriched ? 'Yes' : 'No'}`);

        // 2. Delete Victim
        await prisma.location.delete({ where: { id: victimId } });
        console.log("✅ Deleted duplicate (Victim) record.");
    } else {
        console.log("Victim record not found (already deleted?).");
    }

    // 3. Ensure Survivor has the canonical name
    if (survivor.name !== "The Strand Shopping Centre") {
        await prisma.location.update({
            where: { id: survivorId },
            data: { name: "The Strand Shopping Centre" }
        });
        console.log("✅ Updated Survivor name to canonical 'The Strand Shopping Centre'.");
    }

    console.log("\nDeduplication for Bootle complete.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
