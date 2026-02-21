/**
 * The Strand Shopping Centre, Bootle — Full Enrichment
 *
 * Location ID: cmicxw4vz001j13hx8u2cfpiu
 *
 * Sources:
 * - strandshoppingcentre.com (official site + sitemap)
 * - Wikipedia (history, opened year, ownership)
 * - Sefton Council (ownership, regeneration)
 * - Liverpool Echo (hero image)
 * - ONS Census 2021 / NOMIS (demographics — Sefton LTLA)
 * - Moovit / bustimes.org (public transit)
 *
 * Run: npx tsx scripts/enrich-strand-bootle.ts
 */

import { PrismaClient } from "@prisma/client";
import { getCategoryId } from "../src/lib/category-lookup";

const prisma = new PrismaClient();

const LOCATION_ID = "cmicxw4vz001j13hx8u2cfpiu";

// ============================================================
// Tenant list — from official sitemap (Feb 2026)
// https://www.strandshoppingcentre.com/wp-sitemap-posts-page-1.xml
// All URLs under /shopping/* are stores
// ============================================================

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

const tenants: TenantInput[] = [
    // --- Department Stores ---
    { name: "TJ Hughes", category: "Department Stores", isAnchorTenant: true },
    // --- General Retail (discount / variety) ---
    { name: "B&M", category: "General Retail", subcategory: "Discount Store", isAnchorTenant: true },
    { name: "Home Bargains", category: "General Retail", subcategory: "Discount Store", isAnchorTenant: true },
    { name: "Poundland", category: "General Retail", subcategory: "Discount Store" },
    // --- Clothing & Footwear ---
    { name: "New Look", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Peacocks", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Pep & Co", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "North West Fashion", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "O.L.L.Y", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Admiral", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "JD Sports", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "Wynsors", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Shoe Zone", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Shoemaster", category: "Clothing & Footwear", subcategory: "Footwear" },
    // --- Jewellery & Watches ---
    { name: "Warren James", category: "Jewellery & Watches", subcategory: "Jewellery" },
    // --- Health & Beauty ---
    { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy", isAnchorTenant: true },
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Savers", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "The Fragrance Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "Specsavers", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Bootle Eyecare", category: "Health & Beauty", subcategory: "Optician" },
    { name: "David Pluck", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Hairlucinations", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "L20 Nails", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "Singhar Beauty Centre", category: "Health & Beauty", subcategory: "Beauty Salon" },
    // --- Food & Grocery ---
    { name: "Iceland", category: "Food & Grocery", subcategory: "Supermarket" },
    { name: "Heron Food", category: "Food & Grocery", subcategory: "Supermarket" },
    { name: "Longton Hall Farms", category: "Food & Grocery", subcategory: "Farm Shop" },
    // --- Cafes & Restaurants ---
    { name: "Burger King", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Subway", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Greggs", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Greenhalghs", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Poundbakery", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Mapi Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "The Coffee House", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "The Café at TJ's", category: "Cafes & Restaurants", subcategory: "Cafe" },
    { name: "The Big Onion", category: "Cafes & Restaurants", subcategory: "Cafe" },
    { name: "In Another Place", category: "Cafes & Restaurants", subcategory: "Cafe" },
    // --- Gifts & Stationery ---
    { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
    { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Best Gift", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    // --- Electrical & Technology ---
    { name: "CeX", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "Digital Spot", category: "Electrical & Technology", subcategory: "Mobile Accessories" },
    { name: "EE", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Mobilise", category: "Electrical & Technology", subcategory: "Mobile Repair" },
    // --- Home & Garden ---
    { name: "Kingsley & Co", category: "Home & Garden", subcategory: "Homeware" },
    // --- Financial Services ---
    { name: "Halifax", category: "Financial Services", subcategory: "Bank" },
    { name: "TSB", category: "Financial Services", subcategory: "Bank" },
    { name: "Eurochange", category: "Financial Services", subcategory: "Currency Exchange" },
    { name: "HT Pawnbrokers", category: "Financial Services", subcategory: "Pawnbroker" },
    { name: "Ramsdens", category: "Financial Services", subcategory: "Pawnbroker" },
    { name: "Cash Generators", category: "Financial Services", subcategory: "Pawnbroker" },
    // --- Services ---
    { name: "Post Office", category: "Services", subcategory: "Post Office" },
    { name: "Max Spielmann", category: "Services", subcategory: "Photo Printing" },
    { name: "Hays Travel", category: "Services", subcategory: "Travel Agency" },
    { name: "William Hill", category: "Services", subcategory: "Betting" },
    { name: "Ladbrokes", category: "Services", subcategory: "Betting" },
    { name: "Sew Sew", category: "Services", subcategory: "Alterations" },
    { name: "News Factor", category: "Services", subcategory: "Newsagent" },
    // --- General Retail (vape / specialist) ---
    { name: "Vape Store HQ", category: "General Retail", subcategory: "Vape Shop" },
    { name: "Kaboom Vapes", category: "General Retail", subcategory: "Vape Shop" },
    // --- Charity & Second Hand ---
    { name: "Daisy Disability", category: "Charity & Second Hand", subcategory: "Charity" },
    // --- Community / Other ---
    { name: "The Bootle Hive", category: "Other", subcategory: "Community Hub" },
    { name: "Inspire", category: "Other", subcategory: "Community" },
    { name: "Sefton Work", category: "Other", subcategory: "Employment Services" },
    { name: "Strand By Me", category: "Other", subcategory: "Community" },
    { name: "The A World CIC", category: "Other", subcategory: "Community" },
];

// ============================================================
// Location metadata
// ============================================================

async function enrichLocation() {
    console.log("🔄 Updating location metadata...");

    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            // --- Core (update opening hours from official website) ---
            openingHours: {
                "Mon-Sat": "08:00-18:00",
                Sun: "10:00-16:00",
            },

            // --- Operational ---
            numberOfStores: tenants.length,
            retailers: tenants.length,
            numberOfFloors: 2,
            anchorTenants: tenants.filter((t) => t.isAnchorTenant).length,
            publicTransit:
                "Bootle New Strand railway station (Merseyrail Northern Line, adjacent). Bootle Bus Station (2-min walk) with 20+ bus routes to Liverpool, Southport, and Crosby.",

            // --- Commercial / ownership ---
            openedYear: 1968,
            management: "Sefton Council (in-house since 2017 acquisition for £32.5M, formerly Ellandi 2014-2017)",

            // --- Digital ---
            twitter: null, // Previous value was a share-intent URL, not a real profile
            heroImage:
                "https://i2-prod.liverpoolecho.co.uk/article27932293.ece/ALTERNATES/s1200/0_JMP_LEC_180419BOOTLESTRAND_12JPG.jpg",

            // --- Demographic (Sefton LTLA — ONS Census 2021) ---
            // population: 32000 already set (Bootle ward)
            // medianAge: 38 already set
            familiesPercent: "28.5", // Sefton avg
            incomeVsNational: "-38.2", // £21k vs £34k national median
            homeownershipVsNational: "-19.7", // 45% vs 56% national
            carOwnershipVsNational: "-16.7", // 60% vs 72% national (approximately)
        },
    });

    console.log("✅ Location metadata updated");
}

// ============================================================
// Tenant upsert — clean slate + re-insert from sitemap
// ============================================================

async function insertTenants() {
    const deleted = await prisma.tenant.deleteMany({
        where: { locationId: LOCATION_ID },
    });
    console.log(`\n🗑️  Deleted ${deleted.count} old tenants`);
    console.log(`📦 Inserting ${tenants.length} tenants from official sitemap...\n`);

    let created = 0;
    let skipped = 0;

    for (const t of tenants) {
        try {
            const categoryId = await getCategoryId(prisma, t.category, t.subcategory);
            await prisma.tenant.create({
                data: {
                    locationId: LOCATION_ID,
                    name: t.name,
                    category: t.category,
                    subcategory: t.subcategory || null,
                    categoryId,
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
// Verification
// ============================================================

async function verify() {
    console.log("\n═══════════════════════════════════════════════");
    console.log("  Verification");
    console.log("═══════════════════════════════════════════════\n");

    const loc = await prisma.location.findUnique({
        where: { id: LOCATION_ID },
        select: {
            name: true,
            openedYear: true,
            numberOfStores: true,
            numberOfFloors: true,
            anchorTenants: true,
            publicTransit: true,
            management: true,
            heroImage: true,
            twitter: true,
            familiesPercent: true,
            incomeVsNational: true,
            openingHours: true,
            _count: { select: { tenants: true } },
        },
    });

    if (!loc) {
        console.error("❌ Location not found!");
        return;
    }

    console.log(`📍 ${loc.name}`);
    console.log(`   Opened: ${loc.openedYear}`);
    console.log(`   Stores: ${loc.numberOfStores} | Floors: ${loc.numberOfFloors} | Anchors: ${loc.anchorTenants}`);
    console.log(`   DB Tenants: ${loc._count.tenants}`);
    console.log(`   Management: ${loc.management}`);
    console.log(`   Public Transit: ${loc.publicTransit?.slice(0, 80)}...`);
    console.log(`   Hero Image: ${loc.heroImage ? "✅ Set" : "❌ Missing"}`);
    console.log(`   Twitter: ${loc.twitter ?? "(cleared)"}`);
    console.log(`   Families%: ${loc.familiesPercent} | IncomeVsNat: ${loc.incomeVsNational}`);
    console.log(`   Opening Hours: ${JSON.stringify(loc.openingHours)}`);

    // Category breakdown
    const cats = await prisma.tenant.groupBy({
        by: ["category"],
        where: { locationId: LOCATION_ID },
        _count: true,
        orderBy: { _count: { category: "desc" } },
    });
    console.log(`\n   Category Breakdown:`);
    for (const c of cats) {
        console.log(`     ${c.category}: ${c._count}`);
    }
}

// ============================================================
// Main
// ============================================================

async function main() {
    console.log("═══════════════════════════════════════════════");
    console.log("  The Strand Shopping Centre — Bootle");
    console.log("  Full Enrichment — Feb 2026");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocation();
    await insertTenants();
    await verify();

    console.log("\n✅ Enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
