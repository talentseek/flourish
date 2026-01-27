
import { PrismaClient } from '@prisma/client';
import { calculateEnrichmentScore } from '../src/lib/enrichment-scoring';

const prisma = new PrismaClient();
const LOCATION_ID = "cmicxw4gi000m13hx9mghuxqm";

async function main() {
    const loc = await prisma.location.findUnique({
        where: { id: LOCATION_ID }
    });

    if (!loc) throw new Error("Location not found");

    console.log("Stats for", loc.name);
    console.log("--------------------------------");
    console.log("Google Rating:", loc.googleRating);
    console.log("Opened Year:", loc.openedYear);
    console.log("Instagram:", loc.instagram);
    console.log("Facebook:", loc.facebook);
    console.log("Website:", loc.website);
    console.log("Phone:", loc.phone);
    console.log("Parking:", loc.parkingSpaces);
    console.log("Population:", loc.population);
    console.log("Total Floor:", loc.totalFloorArea);
    console.log("Stores:", loc.numberOfStores);

    const result = calculateEnrichmentScore(loc);
    console.log("\nCalculated Score:", result.score);
    console.log("Grade:", result.grade);
    console.log("Missing Fields:", result.missing);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
