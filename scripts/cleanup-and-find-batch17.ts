
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Cleanup Duplicates
    console.log("Cleaning duplicates for Friary & Southside...");

    // Friary: Keep cmid0l2t401wemtpum0f892js (Enriched), Delete cmid0jbi70036mtpu9sk3nsid (Seeded)
    try {
        await prisma.location.delete({ where: { id: 'cmid0jbi70036mtpu9sk3nsid' } });
        console.log("✅ Deleted Seeded Friary.");
    } catch (e) {
        console.log("Seeded Friary not found.");
    }

    // Southside: Keep cmid0l05h01tqmtputt1s1h9v (Enriched), Delete cmid0jfth007gmtpu9osyhl9q (Seeded)
    try {
        await prisma.location.delete({ where: { id: 'cmid0jfth007gmtpu9osyhl9q' } });
        console.log("✅ Deleted Seeded Southside.");
    } catch (e) {
        console.log("Seeded Southside not found.");
    }

    // 2. Find Batch 17 IDs
    const targets = [
        "Touchwood",
        "West Orchards",
        "Grand Arcade",
        "Lion Yard",
        "Chantry Place",
        "High Chelmer",
        "Bond Street",
        "Atria Watford",
        "The Beacon",
        "Regent Arcade"
    ];

    console.log("\nSearching for Batch 17 Candidates:");
    const locations = await prisma.location.findMany({
        where: {
            OR: targets.map(t => ({ name: { contains: t } }))
        },
        select: {
            id: true,
            name: true,
            city: true,
            isManaged: true
        }
    });

    locations.forEach(loc => {
        console.log(`ID: ${loc.id} | Name: ${loc.name} | City: ${loc.city}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
