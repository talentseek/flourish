import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🐝 [Buzz] Strategic Quality Control Audit");
    console.log("=========================================");

    const totalLocations = await prisma.location.count();
    const managedLocations = await prisma.location.findMany({
        where: { isManaged: true },
        include: { _count: { select: { tenants: true } } }
    });

    const unmanagedCount = totalLocations - managedLocations.length;

    console.log(`📊 Total Database: ${totalLocations} sites`);
    console.log(`🏢 Managed Sites:  ${managedLocations.length}`);
    console.log(`🌍 Unmanaged Sites: ${unmanagedCount}`);

    // High-level Gap Analysis for Managed Sites
    let noWebsite = 0;
    let noSocial = 0;
    let lowTenants = 0;
    let noParking = 0;
    let noRating = 0;
    let unassigned = 0;

    managedLocations.forEach(loc => {
        if (!loc.website || loc.website.includes('thisisflourish.co.uk')) noWebsite++;
        if (!loc.instagram && !loc.facebook) noSocial++;
        if (loc._count.tenants < (loc.numberOfStores || 10) * 0.5) lowTenants++;
        if (loc.parkingSpaces === null) noParking++;
        if (loc.googleRating === null) noRating++;
        if (!loc.regionalManager) unassigned++;
    });

    console.log("\n❌ Critical Gaps in Managed Portfolio:");
    console.log(`- Missing/Invalid Website: ${noWebsite} (${Math.round(noWebsite / managedLocations.length * 100)}%)`);
    console.log(`- Missing Social Links:    ${noSocial} (${Math.round(noSocial / managedLocations.length * 100)}%)`);
    console.log(`- Low Tenant Data (<50%): ${lowTenants} (${Math.round(lowTenants / managedLocations.length * 100)}%)`);
    console.log(`- Missing Parking Data:    ${noParking} (${Math.round(noParking / managedLocations.length * 100)}%)`);
    console.log(`- Missing Google Ratings:  ${noRating} (${Math.round(noRating / managedLocations.length * 100)}%)`);
    console.log(`- Unassigned to RM:        ${unassigned}`);

    // Strategic Recommendations
    const backlog = [];
    backlog.push("\n## 🚀 Strategic Recommendations\n");
    
    if (noWebsite > 0) backlog.push("1. **Targeted Web Search**: Use `web_search` to find official URLs for the " + noWebsite + " managed sites missing them.");
    if (noSocial > 0) backlog.push("2. **Social Deep Scrape**: Run `scripts/enrich-social-media-deep.ts` on all sites with a valid website.");
    if (lowTenants > 0) backlog.push("3. **AI Tenant Extraction**: Use `scripts/enrich-managed-crawl4ai.ts` specifically for high-priority sites with low coverage.");
    
    console.log(backlog.join("\n"));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
