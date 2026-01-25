import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targets = [
    "Westfield London", "Trafford", "Swindon", "Cribbs", "Lewisham"
];

async function main() {
    console.log("🔍 DUPLICATE DEBUG");

    for (const t of targets) {
        const results = await prisma.location.findMany({
            where: { name: { contains: t, mode: "insensitive" } },
            select: { id: true, name: true, city: true, website: true, parkingSpaces: true, facebook: true }
        });
        console.log(`\nSearched: "${t}"`);
        if (results.length > 0) {
            results.forEach(r => {
                const isHealthy = r.website && r.parkingSpaces && r.facebook;
                console.log(`   FOUND: [${r.id}] "${r.name}" (${r.city}) - Healthy: ${isHealthy ? "✅" : "❌"}`);
            });
        } else {
            console.log("   ❌ NO MATCH");
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
