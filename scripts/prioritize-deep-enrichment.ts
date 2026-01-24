
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
    console.log("📊 Prioritizing Deep Enrichment Targets (Strict Shopping Centres)...");

    const locations = await prisma.location.findMany({
        where: { type: 'SHOPPING_CENTRE' }
    });

    const scored = locations
        .filter(loc => {
            // Strict Filter: Exclude "(Other)" placeholders and generic Town names
            if (loc.name.includes('(Other)')) return false;

            // Exclude if name is suspiciously short/generic AND unmanaged (likely a town marker)
            // e.g. "Abbots Langley" vs "Abbots Langley"
            // But keep if it has "Centre", "Mall", "Park", "Walk", "Arcade", "Court", "Place", "Square"
            const keywords = ['Centre', 'Mall', 'Park', 'Walk', 'Arcade', 'Court', 'Place', 'Square', 'Outlet', 'Galleria', 'Village', 'Works', 'Mills', 'Quarter', 'Precinct'];
            const hasKeyword = keywords.some(k => loc.name.includes(k));

            // If it doesn't have a keyword, it MUST be Managed to be valid
            if (!hasKeyword && !loc.management) return false;

            return true;
        })
        .map(loc => {
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

    const batchSize = 25;
    const batch = scored.slice(0, batchSize);

    console.log(`\nIdentified Top ${batchSize} Strict Priority Targets (Lowest Scores):`);
    batch.forEach(t => console.log(`[${t.score}%] ${t.name} (${t.city}) [${t.management || 'Unmanaged'}] - Missing: ${t.missing.join(', ')}`));

    fs.writeFileSync('deep_enrichment_batch_5.json', JSON.stringify(batch, null, 2));
    console.log(`\n✅ Saved to deep_enrichment_batch_5.json`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
