
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Fields and their weights for "Enrichment Score" (0-100)
const WEIGHTS = {
    social: 20,      // Instagram/Facebook (High value for sentiment)
    operational: 20, // Parking/EV (High value for utility)
    reviews: 15,     // Google Rating (High value for trust)
    demographics: 15,// Census (High value for analytics)
    year: 10,        // Opened Year (History)
    contact: 10,     // Website/Phone (Base contact)
    base: 10         // Floor/Stores (Base stats)
};

async function main() {
    console.log("📊 Prioritizing Managed Shopping Centres...");

    const locations = await prisma.location.findMany({
        where: {
            type: 'SHOPPING_CENTRE',
            NOT: {
                management: null
            }
        }
    });

    // Valid management check (exclude empty strings if any)
    const validLocations = locations.filter(l => l.management && l.management.trim().length > 0);

    console.log(`Found ${validLocations.length} Managed Shopping Centres.`);

    const scored = validLocations.map(loc => {
        let score = 0;
        let missing = [];

        // 1. Social (20 pts)
        if (loc.instagram || loc.facebook) score += WEIGHTS.social;
        else missing.push('social');

        // 2. Operational (20 pts)
        if (loc.parkingSpaces !== null) score += WEIGHTS.operational;
        else missing.push('parking');

        // 3. Reviews (15 pts)
        if (loc.googleRating) score += WEIGHTS.reviews;
        else missing.push('reviews');

        // 4. Demographics (15 pts)
        if (loc.marketingStats) score += WEIGHTS.demographics; // JSON field
        else missing.push('demographics');

        // 5. Year (10 pts)
        if (loc.openedYear) score += WEIGHTS.year;
        else missing.push('year');

        // 6. Contact (10 pts)
        if (loc.website || loc.phone) score += WEIGHTS.contact;
        else missing.push('contact');

        // 7. Base (10 pts)
        if (loc.totalFloorArea || loc.numberOfStores) score += WEIGHTS.base;
        else missing.push('base');

        return {
            id: loc.id,
            name: loc.name,
            city: loc.city,
            score: score,
            missing: missing,
            management: loc.management
        };
    });

    // Sort by Score ASC (Least info first)
    scored.sort((a, b) => a.score - b.score);

    const batchSize = 50;
    const batch = scored.slice(0, batchSize);

    console.log(`\nIdentified Top ${batchSize} Priority Targets (Managed, Lowest Scores):`);
    batch.forEach(t => console.log(`[${t.score}%] ${t.name} (${t.city}) [${t.management}] - Missing: ${t.missing.join(', ')}`));

    // Also stats on scores
    const lowScore = scored.filter(s => s.score < 20).length;
    const midScore = scored.filter(s => s.score >= 20 && s.score < 40).length;
    const highScore = scored.filter(s => s.score >= 40).length;

    console.log(`\nStats:`);
    console.log(`- 0-20% (Critical): ${lowScore}`);
    console.log(`- 20-40% (Partial): ${midScore}`);
    console.log(`- 40%+ (Good): ${highScore}`);

    fs.writeFileSync('managed_enrichment_queue.json', JSON.stringify(scored, null, 2));
    console.log(`\n✅ Saved all ${scored.length} sorted targets to managed_enrichment_queue.json`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
