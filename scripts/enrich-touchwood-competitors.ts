/**
 * Touchwood Competitors — Solihull Area (5-mile radius)
 *
 * Locations:
 *   1. Mell Square, Solihull (cmid0kwn101q1mtpuy9ugbvmw) — 26 tenants
 *   2. Parkgate Shopping Centre, Shirley (cmkvo0gon0000bt6m4nclb8uy) — 22 tenants
 *   3. Resorts World Birmingham (cmid0kz9401srmtputzihehh2) — 42 tenants
 *   4. St John's Way, Knowle (cmkvo0gx1000xbt6mirlbs8t7) — 12 tenants (under reno)
 *
 * Sources:
 *   - mellsquare-shopping.com, solihull.gov.uk, completelyretail.co.uk
 *   - parkgateshirley.com (direct scrape)
 *   - resortsworldbirmingham.co.uk (direct scrape)
 *   - cylex-uk.co.uk, visitknowle.co.uk
 *
 * Run: npx tsx scripts/enrich-touchwood-competitors.ts
 */

import { PrismaClient } from "@prisma/client";
import { getCategoryId } from "../src/lib/category-lookup";

const prisma = new PrismaClient();

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
    //    500,000 sqft open shopping centre, council-owned
    // ─────────────────────────────────────────────
    {
        id: "cmid0kwn101q1mtpuy9ugbvmw",
        name: "Mell Square",
        metadata: {
            phone: "0121 711 3832",
            website: "https://mellsquare-shopping.com",
            heroImage: "https://mellsquare-shopping.com/wp-content/uploads/2020/03/Mell-Square-Outside.jpg",
            openingHours: { "Mon-Sat": "09:00-17:30", "Sun": "10:30-16:30" },
            numberOfFloors: 2,
            retailSpace: 46000, // ~500,000 sqft ≈ 46,000 sqm
            footfall: 6000000, // ~6M (Solihull town centre area share)
            owner: "Solihull Metropolitan Borough Council (acquired April 2021; redevelopment via Muse as 'Holbeche Place')",
            openedYear: 1966,
            publicTransit: "Solihull railway station (West Midlands Railway, 3-min walk). Multiple bus routes from Solihull town centre.",
            googleRating: 3.8,
            googleReviews: 1200,
        },
        tenants: [
            { name: "TK Maxx", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
            { name: "Argos", category: "General Retail", subcategory: "Variety Store", isAnchorTenant: true },
            { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
            { name: "Roman", category: "Clothing & Footwear", subcategory: "Womenswear" },
            { name: "Fat Face", category: "Clothing & Footwear", subcategory: "Casual" },
            { name: "Moss Bros", category: "Clothing & Footwear", subcategory: "Menswear" },
            { name: "Edinburgh Woollen Mill", category: "Clothing & Footwear", subcategory: "Country" },
            { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy", isAnchorTenant: true },
            { name: "Savers", category: "Health & Beauty", subcategory: "Cosmetics" },
            { name: "Specsavers", category: "Health & Beauty", subcategory: "Optician" },
            { name: "Dunelm", category: "Home & Garden", subcategory: "Homeware", isAnchorTenant: true },
            { name: "Farrow & Ball", category: "Home & Garden", subcategory: "Home & Lifestyle" },
            { name: "Loaf", category: "Home & Garden", subcategory: "Furniture" },
            { name: "Sharps Bedrooms", category: "Home & Garden", subcategory: "Furniture" },
            { name: "Arlo & Jacob", category: "Home & Garden", subcategory: "Furniture" },
            { name: "Quorn Stone", category: "Home & Garden", subcategory: "Homeware" },
            { name: "WH Smith", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
            { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
            { name: "Barclays", category: "Financial Services", subcategory: "Bank" },
            { name: "Caffè Nero", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
            { name: "Costa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
            { name: "Carluccio's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
            { name: "Côte", category: "Cafes & Restaurants", subcategory: "Restaurant" },
            { name: "Porto Douro", category: "Cafes & Restaurants", subcategory: "Restaurant" },
            { name: "Liv's", category: "Food & Grocery", subcategory: "Deli" },
            { name: "Post Office", category: "Services", subcategory: "Post Office" },
        ],
    },

    // ─────────────────────────────────────────────
    // 2. Parkgate Shopping Centre, Shirley
    //    560,000 sqft, 6M+ footfall, 2,250 free parking
    //    Tenant list from parkgateshirley.com (Feb 2026)
    // ─────────────────────────────────────────────
    {
        id: "cmkvo0gon0000bt6m4nclb8uy",
        name: "Parkgate Shopping Centre",
        metadata: {
            website: "https://www.parkgateshirley.com",
            heroImage: "https://www.bam.co.uk/images/default-source/default-album/parkgateimg$.jpg",
            openingHours: { "Mon-Sat": "09:00-17:30", "Sun": "10:00-16:00" },
            numberOfFloors: 1,
            retailSpace: 52000, // ~560,000 sqft ≈ 52,000 sqm
            footfall: 6000000, // 6M+ annual
            publicTransit: "Whitlocks End station (West Midlands Railway, 15-min walk). Bus routes along Stratford Road.",
            googleRating: 3.5,
            googleReviews: 800,
        },
        tenants: [
            // SHOP (from website)
            { name: "ASDA", category: "Food & Grocery", subcategory: "Supermarket", isAnchorTenant: true },
            { name: "B&M", category: "General Retail", subcategory: "Discount Store", isAnchorTenant: true },
            { name: "Poundland", category: "General Retail", subcategory: "Discount Store" },
            { name: "Peacocks", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
            { name: "Shoe Zone", category: "Clothing & Footwear", subcategory: "Footwear" },
            { name: "WED2B", category: "Clothing & Footwear", subcategory: "Occasion Wear" },
            { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
            { name: "Bei Capelli", category: "Health & Beauty", subcategory: "Hair Salon" },
            { name: "Fonehouse", category: "Electrical & Technology", subcategory: "Mobile Accessories" },
            { name: "Mobile PC", category: "Electrical & Technology", subcategory: "Mobile Repair" },
            { name: "Poplar Carpets", category: "Home & Garden", subcategory: "Furniture" },
            { name: "TUI", category: "Services", subcategory: "Travel Agency" },
            // EAT (from website)
            { name: "Greggs", category: "Cafes & Restaurants", subcategory: "Bakery" },
            { name: "JAQKS", category: "Cafes & Restaurants", subcategory: "Fast Food" },
            { name: "Lounge Café Bars", category: "Cafes & Restaurants", subcategory: "Bar" },
            { name: "Fatto a Napoli", category: "Cafes & Restaurants", subcategory: "Restaurant" },
            { name: "Burger & Sauce", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
            { name: "Heavenly Desserts", category: "Cafes & Restaurants", subcategory: "Dessert" },
            { name: "The Pump House", category: "Cafes & Restaurants", subcategory: "Pub" },
            { name: "BLNDED", category: "Cafes & Restaurants", subcategory: "Cafe" },
            // MEET (from website)
            { name: "Rainforest Soft Play", category: "Leisure & Entertainment", subcategory: "Children's Play" },
            { name: "Shirley Library", category: "Services", subcategory: "Community" },
            { name: "The Gym", category: "Leisure & Entertainment", subcategory: "Gym", isAnchorTenant: true },
        ],
    },

    // ─────────────────────────────────────────────
    // 3. Resorts World Birmingham
    //    430,000 sqft, 3.5M footfall, Genting-owned
    //    Tenant list from resortsworldbirmingham.co.uk (Feb 2026)
    // ─────────────────────────────────────────────
    {
        id: "cmid0kz9401srmtputzihehh2",
        name: "Resorts World Birmingham",
        metadata: {
            phone: "0121 273 1777",
            website: "https://www.resortsworldbirmingham.co.uk",
            heroImage: "https://multi.eu/wp-content/uploads/2024/05/resorts_world_high_res_7.jpg",
            openingHours: { "Mon-Sat": "10:00-21:00", "Sun": "11:00-17:00" },
            numberOfFloors: 3,
            retailSpace: 40000, // ~430,000 sqft ≈ 40,000 sqm
            footfall: 3500000, // 3.5M annual
            owner: "Genting Group",
            openedYear: 2015,
            publicTransit: "Birmingham International station (West Midlands Railway / Avanti West Coast, adjacent). NEC Interchange monorail.",
            googleRating: 3.9,
            googleReviews: 4500,
        },
        tenants: [
            // SHOP (from website)
            { name: "Nike Factory Store", category: "Clothing & Footwear", subcategory: "Outlet", isAnchorTenant: true },
            { name: "Next Outlet", category: "Clothing & Footwear", subcategory: "Outlet", isAnchorTenant: true },
            { name: "Levi's Outlet", category: "Clothing & Footwear", subcategory: "Outlet" },
            { name: "The North Face", category: "Clothing & Footwear", subcategory: "Outdoor" },
            { name: "Luke Clearance", category: "Clothing & Footwear", subcategory: "Menswear" },
            { name: "Skopes", category: "Clothing & Footwear", subcategory: "Menswear" },
            { name: "Skechers Outlet", category: "Clothing & Footwear", subcategory: "Footwear" },
            { name: "Trespass Outlet", category: "Clothing & Footwear", subcategory: "Outdoor" },
            { name: "Kurt Geiger Outlet", category: "Clothing & Footwear", subcategory: "Footwear" },
            { name: "Beauty Outlet", category: "Health & Beauty", subcategory: "Cosmetics" },
            { name: "The Fragrance Shop", category: "Health & Beauty", subcategory: "Fragrance" },
            { name: "Bedeck", category: "Home & Garden", subcategory: "Bedding" },
            { name: "Ministry of Design", category: "Home & Garden", subcategory: "Homeware" },
            { name: "Hallmark Outlet", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
            { name: "The Gift Company", category: "Gifts & Stationery", subcategory: "Gifts" },
            { name: "WHSmith", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
            { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
            { name: "Lindt", category: "Food & Grocery", subcategory: "Chocolatier" },
            // EAT & DRINK (from website)
            { name: "Costa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
            { name: "Dave's Hot Chicken", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
            { name: "Five Guys", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
            { name: "Karaage", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
            { name: "Las Iguanas", category: "Cafes & Restaurants", subcategory: "Restaurant" },
            { name: "Miller & Carter", category: "Cafes & Restaurants", subcategory: "Restaurant" },
            { name: "Miss Macaroon", category: "Cafes & Restaurants", subcategory: "Dessert" },
            { name: "Nando's", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
            { name: "Pizza Express", category: "Cafes & Restaurants", subcategory: "Restaurant" },
            { name: "TGI Fridays", category: "Cafes & Restaurants", subcategory: "Restaurant" },
            { name: "Vietnamese Street Kitchen", category: "Cafes & Restaurants", subcategory: "Restaurant" },
            { name: "Zizzi", category: "Cafes & Restaurants", subcategory: "Restaurant" },
            { name: "High Line Bar & Lounge", category: "Cafes & Restaurants", subcategory: "Bar" },
            { name: "Sky Bar & Restaurant", category: "Cafes & Restaurants", subcategory: "Bar" },
            { name: "Sports Bar", category: "Cafes & Restaurants", subcategory: "Bar" },
            { name: "The World Bar", category: "Cafes & Restaurants", subcategory: "Bar" },
            { name: "Hollywood Bowl Diner", category: "Cafes & Restaurants", subcategory: "Restaurant" },
            // ENTERTAINMENT (from website)
            { name: "Cineworld", category: "Leisure & Entertainment", subcategory: "Cinema", isAnchorTenant: true },
            { name: "Genting Casino", category: "Leisure & Entertainment", subcategory: "Casino", isAnchorTenant: true },
            { name: "Hollywood Bowl", category: "Leisure & Entertainment", subcategory: "Bowling" },
            { name: "Escape Hunt", category: "Leisure & Entertainment", subcategory: "Escape Room" },
        ],
    },

    // ─────────────────────────────────────────────
    // 4. St John's Way, Knowle (under renovation)
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
            { name: "Mister Plumbs", category: "Food & Grocery", subcategory: "Farm Shop" },
            { name: "Thorntons", category: "Food & Grocery", subcategory: "Chocolatier" },
            { name: "Cristal", category: "Clothing & Footwear", subcategory: "Womenswear" },
            { name: "Bannister Eyecare", category: "Health & Beauty", subcategory: "Optician" },
            { name: "852 Barber", category: "Health & Beauty", subcategory: "Barber" },
            { name: "Stephanies Floral Design House", category: "Gifts & Stationery", subcategory: "Gifts" },
            { name: "The New Deli Cafe", category: "Cafes & Restaurants", subcategory: "Cafe" },
            { name: "Monicas Bakes", category: "Cafes & Restaurants", subcategory: "Bakery" },
            { name: "Knowle Driving School", category: "Services", subcategory: "Education" },
            { name: "Love Property", category: "Services", subcategory: "Specialist" },
            { name: "Xact Mortgages", category: "Financial Services", subcategory: "Building Society" },
            { name: "Pets World", category: "General Retail", subcategory: "Specialist" },
        ],
    },
];

// ============================================================
// Enrich each competitor
// ============================================================

async function enrichCompetitor(comp: CompetitorLocation) {
    console.log(`\n─── ${comp.name} ───`);

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

    // Largest category
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
                name: true, numberOfStores: true, anchorTenants: true, footfall: true, retailSpace: true,
                largestCategory: true, largestCategoryPercent: true, googleRating: true, heroImage: true,
                _count: { select: { tenants: true } },
            },
        });
        if (!loc) continue;

        const withCat = await prisma.tenant.count({
            where: { locationId: comp.id, categoryId: { not: null } },
        });

        console.log(`📍 ${loc.name}`);
        console.log(`   Tenants: ${loc._count.tenants} | Anchors: ${loc.anchorTenants} | Largest: ${loc.largestCategory} (${((Number(loc.largestCategoryPercent) || 0) * 100).toFixed(1)}%)`);
        console.log(`   Footfall: ${loc.footfall ? (loc.footfall / 1_000_000).toFixed(1) + "M" : "N/A"} | Retail Space: ${loc.retailSpace ? loc.retailSpace.toLocaleString() + " sqm" : "N/A"}`);
        console.log(`   Google: ${loc.googleRating}⭐ | Hero: ${loc.heroImage ? "✅" : "❌"} | categoryId: ${withCat}/${loc._count.tenants}`);
    }
}

// ============================================================
// Main
// ============================================================

async function main() {
    console.log("═══════════════════════════════════════════════");
    console.log("  Touchwood Competitors — Solihull Area");
    console.log("  Full Enrichment v2 — Feb 2026");
    console.log("═══════════════════════════════════════════════");

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
