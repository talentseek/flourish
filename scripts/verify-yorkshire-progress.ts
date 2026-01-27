
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGETS = [
    "Alhambra", "Captain Cook", "Carlton Lanes", "Cleveland", "Coppergate",
    "Craven Court", "Crossgates", "Dundas", "Flemingate", "Frenchgate",
    "Hildreds", "Hillstreet", "Hillsborough", "Isaac Newton", "Kingsgate",
    "Kirkgate", "Corn Exchange", "Market Cross", "Meadowhall", "Merrion",
    "Packhorse", "Pescod", "Princess Of Wales", "Promenades", "Prospect",
    "Ridings", "St. Johns", "St Stephens", "Glass Works", "Trinity Walk",
    "Victoria Leeds", "White Rose", "Woolshops"
];

async function main() {
    console.log("🔍 Verifying Yorkshire Updates...\n");

    const locations = await prisma.location.findMany({
        where: {
            OR: TARGETS.map(t => ({ name: { contains: t, mode: 'insensitive' } }))
        },
        select: { name: true, website: true }
    });

    const updated = locations.filter(l => l.website && l.website.length > 0);
    const missing = locations.filter(l => !l.website);

    console.log(`✅ Updated: ${updated.length}`);
    console.log(`❌ Missing: ${missing.length}`);

    if (missing.length > 0) {
        console.log("\nTop 10 Missing:");
        console.table(missing.slice(0, 10));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
