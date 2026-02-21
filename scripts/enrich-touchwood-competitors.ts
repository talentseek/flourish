/**
 * Touchwood Competitors — Solihull Area (5-mile radius)
 *
 * Locations:
 *   1. Mell Square, Solihull (cmid0kwn101q1mtpuy9ugbvmw)
 *   2. Parkgate Shopping Centre, Shirley (cmkvo0gon0000bt6m4nclb8uy)
 *   3. Resorts World Birmingham (cmid0kz9401srmtputzihehh2)
 *   4. St John's Way, Knowle (cmkvo0gx1000xbt6mirlbs8t7)
 *
 * Also deletes duplicate "Parkgate" entry (cmid0ky5x01romtpumhlvys3e)
 *
 * Sources:
 *   - mellsquare-shopping.com, solihull.gov.uk (Mell Square)
 *   - parkgateshirley.com, business-live.co.uk (Parkgate)
 *   - resortsworldbirmingham.co.uk, Wikipedia (Resorts World)
 *   - cylex-uk.co.uk, visitknowle.co.uk (St John's Way)
 *
 * Run: npx tsx scripts/enrich-touchwood-competitors.ts
 */

import { PrismaClient } from "@prisma/client";
import { getCategoryId } from "../src/lib/category-lookup";

const prisma = new PrismaClient();

// ============================================================
// Tenant data per location
// ============================================================

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

interface CompetitorLocation {
    id: string;
    name: string;
    metadata: Record<string, any>;
    tenants: TenantInput[];
}

const competitors: CompetitorLocation[] = [
    // ─────────────────────────────────────────────
    // 1. Mell Square, Solihull
    // ─────────────────────────────────────────────
    {
        id: "cmid0kwn101q1mtpuy9ugbvmw",
        name: "Mell Square",
        metadata: {
            phone: "0121 711 3832",
            website: "https://mellsquare-shopping.com",
            openingHours: { "Mon-Sat": "09:00-17:30", "Sun": "10:30-16:30" },
            numberOfFloors: 2,
            owner: "Solihull Metropolitan Borough Council (acquired April 2021; redevelopment via Muse as 'Holbeche Place')",
            management: "Solihull Council",
            openedYear: 1966,
            publicTransit: "Solihull railway station (West Midlands Railway, 3-min walk). Multiple bus routes from Solihull town centre.",
            googleRating: 3.8,
            googleReviews: 1200,
        },
        tenants: [
            // --- Department / General ---
            { name: "TK Maxx", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
            { name: "Argos", category: "General Retail", subcategory: "Variety Store", isAnchorTenant: true },
            // --- Clothing & Footwear ---
            { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
            { name: "Roman", category: "Clothing & Footwear", subcategory: "Womenswear" },
            { name: "Fat Face", category: "Clothing & Footwear", subcategory: "Casual" },
            { name: "Moss Bros", category: "Clothing & Footwear", subcategory: "Menswear" },
            { name: "Edinburgh Woollen Mill", category: "Clothing & Footwear", subcategory: "Country" },
            // --- Health & Beauty ---
            { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy", isAnchorTenant: true },
            { name: "Savers", category: "Health & Beauty", subcategory: "Cosmetics" },
            { name: "Specsavers", category: "Health & Beauty", subcategory: "Optician" },
            // --- Home & Garden ---
            { name: "Dunelm", category: "Home & Garden", subcategory: "Homeware", isAnchorTenant: true },
            { name: "Farrow & Ball", category: "Home & Garden", subcategory: "Home & Lifestyle" },
            { name: "Loaf", category: "Home & Garden", subcategory: "Furniture" },
            { name: "Sharps Bedrooms", category: "Home & Garden", subcategory: "Furniture" },
            { name: "Arlo & Jacob", category: "Home & Garden", subcategory: "Furniture" },
            { name: "Quorn Stone", category: "Home & Garden", subcategory: "Homeware" },
            // --- Gifts & Stationery ---
            { name: "WH Smith", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
            { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
            // --- Financial Services ---
            { name: "Barclays", category: "Financial Services", subcategory: "Bank" },
            // --- Cafes & Restaurants ---
            { name: "Caffè Nero", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
            { name: "Costa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
            { name: "Carluccio's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
            { name: "Côte", category: "Cafes & Restaurants", subcategory: "Restaurant" },
            { name: "Porto Douro", category: "Cafes & Restaurants", subcategory: "Restaurant" },
            // --- Food & Grocery ---
            { name: "Liv's", category: "Food & Grocery", subcategory: "Deli" },
            // --- Services ---
            { name: "Post Office", category: "Services", subcategory: "Post Office" },
        ],
    },

    // ─────────────────────────────────────────────
    // 2. Parkgate Shopping Centre, Shirley
    // ─────────────────────────────────────────────
    {
        id: "cmkvo0gon0000bt6m4nclb8uy",
        name: "Parkgate Shopping Centre",
        metadata: {
            website: "https://www.parkgateshirley.com",
            openingHours: { "Mon-Sat": "09:00-17:30", "Sun": "10:00-16:00" },
            numberOfFloors: 1,
            publicTransit: "Whitlocks End station (West Midlands Railway, 15-min walk). Bus routes along Stratford Road.",
            googleRating: 3.5,
            googleReviews: 800,
        },
        tenants: [
            // --- General Retail ---
            { name: "ASDA", category: "Food & Grocery", subcategory: "Supermarket", isAnchorTenant: true },
            { name: "B&M", category: "General Retail", subcategory: "Discount Store", isAnchorTenant: true },
            { name: "Poundland", category: "General Retail", subcategory: "Discount Store" },
            // --- Clothing & Footwear ---
            { name: "Peacocks", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
            { name: "Shoe Zone", category: "Clothing & Footwear", subcategory: "Footwear" },
            { name: "WED2B", category: "Clothing & Footwear", subcategory: "Occasion Wear" },
            // --- Health & Beauty ---
            { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
            // --- Electrical & Technology ---
            { name: "Fonehouse", category: "Electrical & Technology", subcategory: "Mobile Accessories" },
            { name: "Mobile PC", category: "Electrical & Technology", subcategory: "Mobile Repair" },
            // --- Cafes & Restaurants ---
            { name: "Greggs", category: "Cafes & Restaurants", subcategory: "Bakery" },
            { name: "Heavenly Desserts", category: "Cafes & Restaurants", subcategory: "Dessert" },
            { name: "Indico", category: "Cafes & Restaurants", subcategory: "Restaurant" },
            { name: "JAQKS", category: "Cafes & Restaurants", subcategory: "Fast Food" },
            { name: "Lounge Café Bars", category: "Cafes & Restaurants", subcategory: "Bar" },
            { name: "The Pump House", category: "Cafes & Restaurants", subcategory: "Pub" },
            // --- Home & Garden ---
            { name: "Poplar Carpets", category: "Home & Garden", subcategory: "Furniture" },
            // --- Services ---
            { name: "Shirley Library", category: "Services", subcategory: "Community" },
            { name: "TUI", category: "Services", subcategory: "Travel Agency" },
            // --- Leisure ---
            { name: "The Gym", category: "Leisure & Entertainment", subcategory: "Gym", isAnchorTenant: true },
        ],
    },

    // ─────────────────────────────────────────────
    // 3. Resorts World Birmingham
    // ─────────────────────────────────────────────
    {
        id: "cmid0kz9401srmtputzihehh2",
        name: "Resorts World Birmingham",
        metadata: {
            phone: "0121 273 1777",
            website: "https://www.resortsworldbirmingham.co.uk",
            openingHours: { "Mon-Sat": "10:00-21:00", "Sun": "11:00-17:00" },
            numberOfFloors: 3,
            owner: "Genting Group",
            management: "Genting UK",
            openedYear: 2015,
            publicTransit: "Birmingham International station (West Midlands Railway / Avanti West Coast, adjacent). NEC Interchange monorail.",
            googleRating: 3.9,
            googleReviews: 4500,
        },
        tenants: [
            // --- Clothing & Footwear ---
            { name: "Nike Factory Store", category: "Clothing & Footwear", subcategory: "Outlet", isAnchorTenant: true },
            { name: "Next Outlet", category: "Clothing & Footwear", subcategory: "Outlet", isAnchorTenant: true },
            { name: "Levi's Outlet", category: "Clothing & Footwear", subcategory: "Outlet" },
            { name: "The North Face", category: "Clothing & Footwear", subcategory: "Outdoor" },
            { name: "Ben Sherman", category: "Clothing & Footwear", subcategory: "Menswear" },
            { name: "Carhartt", category: "Clothing & Footwear", subcategory: "Casual" },
            { name: "Luke Clearance", category: "Clothing & Footwear", subcategory: "Menswear" },
            { name: "Skopes", category: "Clothing & Footwear", subcategory: "Menswear" },
            { name: "Skechers Outlet", category: "Clothing & Footwear", subcategory: "Footwear" },
            { name: "Trespass Outlet", category: "Clothing & Footwear", subcategory: "Outdoor" },
            { name: "Vans", category: "Clothing & Footwear", subcategory: "Footwear" },
            { name: "Kurt Geiger Outlet", category: "Clothing & Footwear", subcategory: "Footwear" },
            // --- Health & Beauty ---
            { name: "Beauty Outlet", category: "Health & Beauty", subcategory: "Cosmetics" },
            { name: "The Fragrance Shop", category: "Health & Beauty", subcategory: "Fragrance" },
            // --- Home & Garden ---
            { name: "Bedeck", category: "Home & Garden", subcategory: "Bedding" },
            { name: "Ministry of Design", category: "Home & Garden", subcategory: "Homeware" },
            // --- Gifts & Stationery ---
            { name: "Hallmark Outlet", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
            { name: "The Gift Company", category: "Gifts & Stationery", subcategory: "Gifts" },
            { name: "WHSmith", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
            { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
            // --- Food & Grocery ---
            { name: "Lindt", category: "Food & Grocery", subcategory: "Chocolatier" },
            // --- Electrical & Technology ---
            { name: "Sony", category: "Electrical & Technology", subcategory: "Consumer Electronics" },
            // --- Leisure & Entertainment ---
            { name: "Cineworld", category: "Leisure & Entertainment", subcategory: "Cinema", isAnchorTenant: true },
            { name: "Genting Casino", category: "Leisure & Entertainment", subcategory: "Casino", isAnchorTenant: true },
        ],
    },

    // ─────────────────────────────────────────────
    // 4. St John's Way, Knowle
    // ─────────────────────────────────────────────
    {
        id: "cmkvo0gx1000xbt6mirlbs8t7",
        name: "St John's Way",
        metadata: {
            openingHours: { "Mon-Sat": "09:00-17:30", "Sun": "Closed" },
            numberOfFloors: 1,
            publicTransit: "No direct rail. Bus 87/88 from Solihull town centre (15 min).",
            googleRating: 3.6,
            googleReviews: 200,
        },
        tenants: [
            // --- Food & Grocery ---
            { name: "Mister Plumbs", category: "Food & Grocery", subcategory: "Farm Shop" },
            { name: "Thorntons", category: "Food & Grocery", subcategory: "Chocolatier" },
            // --- Clothing & Footwear ---
            { name: "Cristal", category: "Clothing & Footwear", subcategory: "Womenswear" },
            // --- Health & Beauty ---
            { name: "Bannister Eyecare", category: "Health & Beauty", subcategory: "Optician" },
            { name: "852 Barber", category: "Health & Beauty", subcategory: "Barber" },
            // --- Gifts & Stationery ---
            { name: "Stephanies Floral Design House", category: "Gifts & Stationery", subcategory: "Gifts" },
            // --- Cafes & Restaurants ---
            { name: "The New Deli Cafe", category: "Cafes & Restaurants", subcategory: "Cafe" },
            { name: "Monicas Bakes", category: "Cafes & Restaurants", subcategory: "Bakery" },
            // --- Services ---
            { name: "Knowle Driving School", category: "Services", subcategory: "Education" },
            { name: "Love Property", category: "Services", subcategory: "Specialist" },
            { name: "Xact Mortgages", category: "Financial Services", subcategory: "Building Society" },
            // --- General Retail ---
            { name: "Pets World", category: "General Retail", subcategory: "Specialist" },
        ],
    },
];

// ============================================================
// Delete duplicate Parkgate entry
// ============================================================

const DUPLICATE_PARKGATE_ID = "cmid0ky5x01romtpumhlvys3e";

async function deleteDuplicate() {
    try {
        const del = await prisma.tenant.deleteMany({ where: { locationId: DUPLICATE_PARKGATE_ID } });
        await prisma.location.delete({ where: { id: DUPLICATE_PARKGATE_ID } });
        console.log(`🗑️  Deleted duplicate 'Parkgate' (${del.count} tenants removed)\n`);
    } catch {
        console.log("ℹ️  Duplicate 'Parkgate' already deleted or not found\n");
    }
}

// ============================================================
// Enrich each competitor
// ============================================================

async function enrichCompetitor(comp: CompetitorLocation) {
    console.log(`\n─── ${comp.name} ───`);

    // Update metadata
    await prisma.location.update({
        where: { id: comp.id },
        data: {
            ...comp.metadata,
            numberOfStores: comp.tenants.length,
            retailers: comp.tenants.length,
            anchorTenants: comp.tenants.filter((t) => t.isAnchorTenant).length,
        },
    });
    console.log("  ✅ Metadata updated");

    // Delete old tenants + re-insert
    const deleted = await prisma.tenant.deleteMany({ where: { locationId: comp.id } });
    console.log(`  🗑️  Deleted ${deleted.count} old tenants`);

    let created = 0;
    let skipped = 0;
    for (const t of comp.tenants) {
        try {
            const categoryId = await getCategoryId(prisma, t.category, t.subcategory);
            await prisma.tenant.create({
                data: {
                    locationId: comp.id,
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
    console.log(`  📦 ${created} inserted, ${skipped} skipped`);

    // Update largest category
    const cats = await prisma.tenant.groupBy({
        by: ["category"],
        where: { locationId: comp.id },
        _count: true,
        orderBy: { _count: { category: "desc" } },
    });
    if (cats.length > 0) {
        const total = cats.reduce((sum, c) => sum + c._count, 0);
        const largest = cats[0];
        const pct = Number((largest._count / total).toFixed(3));
        await prisma.location.update({
            where: { id: comp.id },
            data: { largestCategory: largest.category, largestCategoryPercent: pct },
        });
        console.log(`  📊 Largest: ${largest.category} (${(pct * 100).toFixed(1)}%)`);
    }
}

// ============================================================
// Verification
// ============================================================

async function verify() {
    console.log("\n═══════════════════════════════════════════════");
    console.log("  Verification — All Competitors");
    console.log("═══════════════════════════════════════════════\n");

    for (const comp of competitors) {
        const loc = await prisma.location.findUnique({
            where: { id: comp.id },
            select: {
                name: true, numberOfStores: true, anchorTenants: true,
                largestCategory: true, largestCategoryPercent: true,
                googleRating: true,
                _count: { select: { tenants: true } },
            },
        });
        if (!loc) continue;

        const withCat = await prisma.tenant.count({
            where: { locationId: comp.id, categoryId: { not: null } },
        });

        console.log(`📍 ${loc.name}: ${loc._count.tenants} tenants | ${loc.anchorTenants} anchors | ${loc.largestCategory} (${((Number(loc.largestCategoryPercent) || 0) * 100).toFixed(1)}%) | ⭐ ${loc.googleRating} | categoryId: ${withCat}/${loc._count.tenants}`);
    }
}

// ============================================================
// Main
// ============================================================

async function main() {
    console.log("═══════════════════════════════════════════════");
    console.log("  Touchwood Competitors — Solihull Area");
    console.log("  Full Enrichment — Feb 2026");
    console.log("═══════════════════════════════════════════════");

    await deleteDuplicate();

    for (const comp of competitors) {
        await enrichCompetitor(comp);
    }

    await verify();

    console.log("\n✅ All competitors enriched!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
