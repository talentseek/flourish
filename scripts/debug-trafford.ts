
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 TRAFFORD CENTRE DEBUG");

    // Search by various likely names
    const searches = ["Trafford Centre", "The Trafford Centre", "Trafford"];

    for (const term of searches) {
        console.log(`\nSearching for: "${term}"...`);
        const results = await prisma.location.findMany({
            where: {
                name: { contains: term, mode: "insensitive" }
            }
        });

        if (results.length === 0) {
            console.log("   No matches found.");
        } else {
            results.forEach(loc => {
                console.log(`   MATCH FOUND: [${loc.id}] "${loc.name}" in ${loc.city}`);
                console.log(`      - Website: ${loc.website ? "✅ " + loc.website : "❌ MISSING"}`);
                console.log(`      - Parking: ${loc.parkingSpaces ? "✅ " + loc.parkingSpaces : "❌ MISSING"}`);
                console.log(`      - Facebook: ${loc.facebook ? "✅ " + loc.facebook : "❌ MISSING"}`);
                console.log(`      - Instagram: ${loc.instagram ? "✅ " + loc.instagram : "❌ MISSING"}`);

                // Audit logic check
                const isHealthy = Boolean(
                    loc.website &&
                    loc.parkingSpaces &&
                    (loc.facebook || loc.instagram)
                );
                console.log(`      - Audit Status: ${isHealthy ? "✅ HEALTHY" : "❌ UNHEALTHY"}`);
            });
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
