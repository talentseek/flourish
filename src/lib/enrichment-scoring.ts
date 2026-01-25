import { Location } from "@prisma/client";

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

export interface EnrichmentScore {
    score: number;
    missing: string[];
    grade: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
}

export function calculateEnrichmentScore(location: Partial<Location>): EnrichmentScore {
    let score = 0;
    const missing: string[] = [];

    // 1. Social (20 pts)
    if (location.instagram || location.facebook) score += WEIGHTS.social;
    else missing.push('social');

    // 2. Operational (20 pts)
    if (location.parkingSpaces !== null && location.parkingSpaces !== undefined) score += WEIGHTS.operational;
    else missing.push('parking');

    // 3. Reviews (15 pts)
    if (location.googleRating) score += WEIGHTS.reviews;
    else missing.push('reviews');

    // 4. Demographics (15 pts) - checking population as proxy for demographics
    if (location.population) score += WEIGHTS.demographics;
    else missing.push('demographics');

    // 5. Year (10 pts)
    if (location.openedYear) score += WEIGHTS.year;
    else missing.push('year');

    // 6. Contact (10 pts)
    if (location.website || location.phone) score += WEIGHTS.contact;
    else missing.push('contact');

    // 7. Base (10 pts)
    if (location.totalFloorArea || location.numberOfStores) score += WEIGHTS.base;
    else missing.push('base');

    // Determine Grade
    let grade: EnrichmentScore['grade'] = 'POOR';
    if (score >= 76) grade = 'EXCELLENT';
    else if (score >= 51) grade = 'GOOD';
    else if (score >= 26) grade = 'FAIR';

    return {
        score,
        missing,
        grade
    };
}
