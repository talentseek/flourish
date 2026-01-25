
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🏥 Running Database Health Check...\n");

    const allLocations = await prisma.location.findMany();
    const total = allLocations.length;

    console.log(`Total Locations: ${total}`);

    // Categorize
    const managed = allLocations.filter(l => l.management && l.management.length > 0);
    const unmanaged = allLocations.filter(l => !l.management || l.management.length === 0);

    console.log(`- Managed Assets: ${managed.length}`);
    console.log(`- Unmanaged/Towns: ${unmanaged.length}\n`);

    // Scoring Logic (Simplified)
    const scoreLocation = (loc: any) => {
        let score = 0;
        if (loc.website) score += 20;
        if (loc.instagram) score += 10;
        if (loc.facebook) score += 10;
        if (loc.parkingSpaces !== null && loc.parkingSpaces !== undefined) score += 10;
        if (loc.address) score += 10;
        if (loc.city) score += 10;
        if (loc.postcode) score += 10;
        if (loc.description) score += 10;
        // Max 90 without deep data
        return score;
    };

    const scored = allLocations.map(l => ({ ...l, score: scoreLocation(l) }));

    const critical = scored.filter(s => s.score < 30);
    const partial = scored.filter(s => s.score >= 30 && s.score < 60);
    const good = scored.filter(s => s.score >= 60 && s.score < 80);
    const excellent = scored.filter(s => s.score >= 80);

    console.log("📊 Data Enrichment Levels:");
    console.log(`- 🔴 Critical (<30%): ${critical.length} (Typically raw imports)`);
    console.log(`- 🟠 Partial (30-60%): ${partial.length} (Basic seeded)`);
    console.log(`- 🟡 Good (60-80%): ${good.length} (Website + Socials)`);
    console.log(`- 🟢 Excellent (>80%): ${excellent.length} (Full Suite + Parking/Ops)`);

    console.log("\n🔍 Managed Assets Health:");
    const managedScored = scored.filter(s => s.management && s.management.length > 0);
    const managedCritical = managedScored.filter(s => s.score < 30);
    const managedGood = managedScored.filter(s => s.score >= 60);

    console.log(`- Managed Total: ${managedScored.length}`);
    console.log(`- Managed Critical Needs: ${managedCritical.length}`);
    console.log(`- Managed Well Enriched: ${managedGood.length} (${Math.round((managedGood.length / managedScored.length) * 100)}%)`);

    // Missing Fields Analysis (Top 500 by size/priority assumption - just taking managed for now)
    const missingWeb = managedScored.filter(l => !l.website).length;
    const missingSocial = managedScored.filter(l => !l.instagram && !l.facebook).length;
    const missingParking = managedScored.filter(l => l.parkingSpaces === null).length;

    console.log("\n📉 Managed Gap Analysis:");
    console.log(`- Missing Website: ${missingWeb}`);
    console.log(`- Missing Socials: ${missingSocial}`);
    console.log(`- Missing Parking Data: ${missingParking}`);

}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
