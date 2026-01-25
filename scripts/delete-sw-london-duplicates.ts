
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// IDs identified as lower-quality duplicates or conflicting records
const idsToDelete = [
    "cmid0l6q0020imtpuo2dduq16", // Westfield London (Generic/Empty duplicate)
    // "cmid0l5n501zfmtpuou3k88lv", // Trafford Palazzo - Keep, it's a real place
    // "cmid0kl2w01ecmtpunl3loufi", // Trafford Retail Park - Keep
];

async function main() {
    console.log("🗑️ DELETING DUPLICATES");

    for (const id of idsToDelete) {
        try {
            const loc = await prisma.location.findUnique({ where: { id } });
            if (loc) {
                console.log(`Deleting: [${loc.id}] ${loc.name} (${loc.city})`);
                await prisma.location.delete({ where: { id } });
                console.log("   ✅ Deleted");
            } else {
                console.log(`   ⚠️ ID ${id} not found`);
            }
        } catch (e) {
            console.error(`   ❌ Error deleting ${id}:`, e);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
