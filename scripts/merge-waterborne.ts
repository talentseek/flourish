
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Merging Waterborne Walk (Leighton Buzzard)...");

    // Survivor: cmicxw4xq001n13hxin90rbjb (Enriched)
    // Victim: cmid0l6at0204mtpubk59eh8q (Empty)

    const survivorId = "cmicxw4xq001n13hxin90rbjb";
    const victimId = "cmid0l6at0204mtpubk59eh8q";

    try {
        await prisma.location.delete({ where: { id: victimId } });
        console.log("✅ Deleted duplicate (Victim) record.");
    } catch (e) {
        console.log("Victim record not found (already deleted?).");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
