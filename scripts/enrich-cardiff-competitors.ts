/**
 * Cardiff Competitor Enrichment — Gap Analysis support for St David's
 *
 * Locations within 5-mile radius of St David's Dewi Sant:
 * 1. Queens Arcade Shopping Centre (CF10 2BY) — Under redevelopment, mostly closed
 * 2. Mermaid Quay (CF10 5BZ) — Waterfront leisure/F&B destination, Cardiff Bay
 * 3. District Shopping Centre (CF14 9BB) — Small community retail, Llanishen
 *
 * Sources: mermaidquay.co.uk, web research, cylex-uk.co.uk
 * Run: npx tsx scripts/enrich-cardiff-competitors.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

// -----------------------------------------------------------
// 1. Queens Arcade — Under demolition/redevelopment
//    Lower mall gutted, upper mall has ~2 remaining tenants
//    Planned: mixed-use (retail ground floor, offices, hotel, apartments)
// -----------------------------------------------------------
const queensArcadeTenants: TenantInput[] = [
    { name: "Christopher George", category: "Jewellery & Accessories", subcategory: "Jewellery" },
    { name: "Halifax", category: "Services", subcategory: "Bank" },
];

// -----------------------------------------------------------
// 2. Mermaid Quay — Cardiff Bay waterfront
//    ~28 tenants across Eat & Drink, Quick Bites, Shopping, Leisure, Services
//    Sources: mermaidquay.co.uk nav + web search + Savills listing
// -----------------------------------------------------------
const mermaidQuayTenants: TenantInput[] = [
    // Eat & Drink (sit-down restaurants)
    { name: "Bill's", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "The Botanist", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Cosy Club", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Côte Brasserie", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "The Dock", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Giggling Squid", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Las Iguanas", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Pizza Express", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Wagamama", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Yakitori1", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Zizzi", category: "Food & Beverage", subcategory: "Restaurant" },
    // Quick Bites (cafes, grab-and-go)
    { name: "Coffi Co", category: "Food & Beverage", subcategory: "Coffee Shop" },
    { name: "Full Fat Social", category: "Food & Beverage", subcategory: "Cafe" },
    { name: "Hub Box", category: "Food & Beverage", subcategory: "Fast Casual" },
    { name: "Picton & Co Delicatessen", category: "Food & Beverage", subcategory: "Deli" },
    { name: "Urban Chocolatier", category: "Food & Beverage", subcategory: "Dessert Shop" },
    // Shopping
    { name: "Ken Picton Salon", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Tesco Express", category: "Food & Beverage", subcategory: "Supermarket" },
    // Leisure
    { name: "Everyman Cinema", category: "Leisure", subcategory: "Cinema", isAnchorTenant: true },
    { name: "The Glee Club", category: "Leisure", subcategory: "Entertainment" },
    // Services
    // (parking, management office — not retail tenants)
];

// -----------------------------------------------------------
// 3. District Shopping Centre — Llanishen/Thornhill, small community
//    Anchored by Sainsbury's
// -----------------------------------------------------------
const districtTenants: TenantInput[] = [
    { name: "Sainsbury's", category: "Food & Beverage", subcategory: "Supermarket", isAnchorTenant: true },
    { name: "Argos (in Sainsbury's)", category: "Homeware & Lifestyle", subcategory: "Variety Store" },
    { name: "Oxfam", category: "Services", subcategory: "Charity Shop" },
    { name: "Insync Corporate Healthcare", category: "Health & Beauty", subcategory: "Dental" },
    { name: "Explore Learning", category: "Services", subcategory: "Education" },
];

// ============================================================
// Location metadata enrichment
// ============================================================

async function enrichLocations() {
    console.log("🔄 Enriching Queens Arcade...");
    await prisma.location.update({
        where: { id: "cmid0kz1o01sjmtpuytgzm9vg" },
        data: {
            website: "https://www.queensarcadecardiff.co.uk",
            owner: "Rightacres Property / Cardiff Council",
            numberOfStores: 2,
            // Under redevelopment — lower mall demolished
            // Planned: mixed-use with ground-floor retail, offices, hotel, apartments
        },
    });

    console.log("🔄 Enriching Mermaid Quay...");
    await prisma.location.update({
        where: { id: "cmid0kwqu01q5mtpugw1xvtmg" },
        data: {
            website: "https://www.mermaidquay.co.uk",
            owner: "Shoppertainment Management",
            management: "Shoppertainment Management",
            numberOfStores: 21,
            footfall: 6000000, // ~6M annual visitors (from Savills marketing)
            googleRating: 4.3,
            googleReviews: 7500,
            openedYear: 1999,
            openingHours: {
                "Mon-Sun": "Restaurant hours vary, typically 10:00-23:00",
            },
        },
    });

    console.log("🔄 Enriching District Shopping Centre...");
    await prisma.location.update({
        where: { id: "cmid0kt2c01mcmtpusqr9c87o" },
        data: {
            numberOfStores: 5,
            openingHours: {
                "Sainsbury's": "07:00-22:00 Mon-Sat, 10:00-16:00 Sun",
            },
        },
    });
}

// ============================================================
// Tenant upsert
// ============================================================

async function insertTenants(
    locationId: string,
    locationName: string,
    tenants: TenantInput[]
) {
    // Clean slate
    const deleted = await prisma.tenant.deleteMany({
        where: { locationId },
    });
    console.log(`\n🗑️  Deleted ${deleted.count} old tenants for ${locationName}`);
    console.log(`📦 Inserting ${tenants.length} tenants for ${locationName}...`);

    let created = 0;
    let skipped = 0;

    for (const t of tenants) {
        try {
            await prisma.tenant.create({
                data: {
                    locationId,
                    name: t.name,
                    category: t.category,
                    subcategory: t.subcategory || null,
                    isAnchorTenant: t.isAnchorTenant || false,
                },
            });
            created++;
        } catch (err: any) {
            console.warn(`  ⚠️ Skipped "${t.name}": ${err.message.slice(0, 80)}`);
            skipped++;
        }
    }

    console.log(`  ✅ ${created} inserted, ${skipped} skipped`);
}

// ============================================================
// Main
// ============================================================

async function main() {
    console.log("═══════════════════════════════════════════════");
    console.log("  Cardiff Competitor Enrichment — Feb 2026");
    console.log("  Gap Analysis for St David's Dewi Sant");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocations();

    await insertTenants(
        "cmid0kz1o01sjmtpuytgzm9vg",
        "Queens Arcade Shopping Centre",
        queensArcadeTenants
    );
    await insertTenants(
        "cmid0kwqu01q5mtpugw1xvtmg",
        "Mermaid Quay",
        mermaidQuayTenants
    );
    await insertTenants(
        "cmid0kt2c01mcmtpusqr9c87o",
        "District Shopping Centre",
        districtTenants
    );

    // Verify
    console.log("\n═══════════════════════════════════════════════");
    console.log("  Verification");
    console.log("═══════════════════════════════════════════════\n");

    const ids = [
        { id: "cmks95l980005fajkx22y1ctx", label: "📍 St David's (subject)" },
        { id: "cmid0kz1o01sjmtpuytgzm9vg", label: "📍 Queens Arcade (competitor)" },
        { id: "cmid0kwqu01q5mtpugw1xvtmg", label: "📍 Mermaid Quay (competitor)" },
        { id: "cmid0kt2c01mcmtpusqr9c87o", label: "📍 District (competitor)" },
    ];

    for (const { id, label } of ids) {
        const loc = await prisma.location.findUnique({
            where: { id },
            select: {
                name: true,
                owner: true,
                numberOfStores: true,
                footfall: true,
                googleRating: true,
                _count: { select: { tenants: true } },
            },
        });
        if (loc) {
            console.log(`${label}`);
            console.log(
                `   ${loc.name} | Owner: ${loc.owner} | Stores: ${loc.numberOfStores} | DB Tenants: ${loc._count.tenants}`
            );
            console.log(
                `   Footfall: ${loc.footfall?.toLocaleString() || "N/A"} | Rating: ${loc.googleRating || "N/A"}`
            );

            // Category breakdown
            const cats = await prisma.tenant.groupBy({
                by: ["category"],
                where: { locationId: id },
                _count: true,
                orderBy: { _count: { category: "desc" } },
            });
            console.log(
                `   Categories: ${cats.map((c) => `${c.category}(${c._count})`).join(", ")}`
            );
            console.log();
        }
    }

    console.log("✅ Cardiff competitor enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
