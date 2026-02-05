import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🐝 [Buzz] Managed Location Enrichment Plan Generator");
    console.log("=".repeat(60));

    // Fetch managed locations
    const locations = await prisma.location.findMany({
        where: { isManaged: true },
        select: {
            id: true,
            name: true,
            city: true,
            postcode: true,
            regionalManager: true,
            website: true,
            parkingSpaces: true,
            googleRating: true,
            instagram: true,
            facebook: true,
            _count: { select: { tenants: true } }
        },
        orderBy: { name: 'asc' }
    });

    console.log(`🏢 Found ${locations.length} managed locations.`);

    // Group by Manager
    const byManager: Record<string, any[]> = {};
    locations.forEach(loc => {
        const mgr = loc.regionalManager || "Unassigned";
        if (!byManager[mgr]) byManager[mgr] = [];
        byManager[mgr].push(loc);
    });

    const report = [];
    report.push("# 📋 Managed Location Enrichment Backlog\n");
    report.push("This report identifies missing data for managed locations, grouped by Regional Manager.\n");

    for (const [mgr, sites] of Object.entries(byManager)) {
        report.push(`## 👤 RM: ${mgr} (${sites.length} sites)`);
        report.push("| Location | Tenants | Social | Parking | Ratings | Website |");
        report.push("| :--- | :---: | :---: | :---: | :---: | :--- |");
        
        sites.forEach(loc => {
            const hasSocial = (loc.instagram || loc.facebook) ? "✅" : "❌";
            const hasParking = loc.parkingSpaces !== null ? "✅" : "❌";
            const hasRatings = loc.googleRating !== null ? "✅" : "❌";
            const hasWebsite = (loc.website && !loc.website.includes('thisisflourish.co.uk')) ? "✅" : "❌";
            const tenantCount = loc._count.tenants;
            
            report.push(`| ${loc.name} | ${tenantCount} | ${hasSocial} | ${hasParking} | ${hasRatings} | ${hasWebsite} |`);
        });
        report.push("\n");
    }

    console.log(report.join("\n"));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
