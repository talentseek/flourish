
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Deep Audit: Location Enrichment Progress");

    const locations = await prisma.location.findMany({
        where: { type: 'SHOPPING_CENTRE' }
    });

    const total = locations.length;
    let missingSocial = 0;
    let missingParking = 0;
    let missingDemographics = 0;
    let missingReviews = 0;
    let missingOpenedYear = 0;

    locations.forEach(loc => {
        // Social
        if (!loc.instagram && !loc.facebook) missingSocial++;

        // Operational
        if (loc.parkingSpaces === null) missingParking++;

        // Demographics (marketingStats often holds this JSON)
        if (!loc.marketingStats) missingDemographics++;

        // Reviews
        if (!loc.googleRating) missingReviews++;

        // History
        if (!loc.openedYear) missingOpenedYear++;
    });

    console.log(`\n--- Enrichment Status (Total: ${total}) ---`);
    console.log(`❌ Missing Social (Insta/FB): ${missingSocial} (${Math.round(missingSocial / total * 100)}%)`);
    console.log(`❌ Missing Parking Data:      ${missingParking} (${Math.round(missingParking / total * 100)}%)`);
    console.log(`❌ Missing Demographics:      ${missingDemographics} (${Math.round(missingDemographics / total * 100)}%)`);
    console.log(`❌ Missing Google Ratings:    ${missingReviews} (${Math.round(missingReviews / total * 100)}%)`);
    console.log(`❌ Missing Opened Year:       ${missingOpenedYear} (${Math.round(missingOpenedYear / total * 100)}%)`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
