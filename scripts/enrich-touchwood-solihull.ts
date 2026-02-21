/**
 * Touchwood Shopping Centre, Solihull — Full Enrichment
 *
 * Location ID: cmid0l5je01zbmtpur0n9pcyh
 *
 * Sources:
 * - touchwoodsolihull.co.uk (official sitemap, opening times, parking)
 * - Wikipedia / retail press (ownership: Ardent Companies, opened 2001)
 * - Greater Birmingham Chambers of Commerce (footfall: 11.2M, 2025)
 * - ONS Census 2021 / Solihull Community Housing (demographics — Solihull LTLA)
 *
 * Run: npx tsx scripts/enrich-touchwood-solihull.ts
 */

import { PrismaClient } from "@prisma/client";
import { getCategoryId } from "../src/lib/category-lookup";

const prisma = new PrismaClient();

const LOCATION_ID = "cmid0l5je01zbmtpur0n9pcyh";

// ============================================================
// Tenant list — from official sitemap (Feb 2026)
// /shopping/* = retail, /dine-relax/* = food & beverage
// ============================================================

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

const tenants: TenantInput[] = [
    // --- Department Stores (Anchors) ---
    { name: "John Lewis", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },

    // --- Clothing & Footwear ---
    { name: "Zara", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "H&M", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Next", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Mango", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "River Island", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Superdry", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Levi's", category: "Clothing & Footwear", subcategory: "Denim" },
    { name: "Mint Velvet", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Bravissimo", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Fall Menswear", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Kurt Geiger", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Dune", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Schuh", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Deichmann", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "ECCO", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "JD Sports", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "Sweaty Betty", category: "Clothing & Footwear", subcategory: "Activewear" },
    { name: "Lovisa", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "Claire's Accessories", category: "Clothing & Footwear", subcategory: "Accessories" },

    // --- Health & Beauty ---
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Fragrance Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Sunnamusk", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "L'Occitane", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Lush", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "The Makeup Outlet", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Beauty Booth", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Benito Brow Bar", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "The Laser Clinic", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Space NK", category: "Health & Beauty", subcategory: "Premium Cosmetics" },
    { name: "Sense Aroma", category: "Health & Beauty", subcategory: "Home Fragrance" },
    { name: "Sunglasses Limited", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Gentlemen Barber Club", category: "Health & Beauty", subcategory: "Barber" },

    // --- Jewellery & Watches ---
    { name: "Pandora", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Swarovski", category: "Jewellery & Watches", subcategory: "Crystal Jewellery" },
    { name: "Ernest Jones", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Warren James", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Beaverbrooks", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Fraser Hart", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Goldsmiths", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "TAG Heuer", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "The Watch Lab", category: "Jewellery & Watches", subcategory: "Watch Repair" },
    { name: "Crystal Chain", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Austen & Blake", category: "Jewellery & Watches", subcategory: "Jewellery" },

    // --- Electrical & Technology ---
    { name: "Apple", category: "Electrical & Technology", subcategory: "Consumer Electronics", isAnchorTenant: true },
    { name: "EE", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Vodafone", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Three", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "O2", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "CeX", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "Fone World", category: "Electrical & Technology", subcategory: "Mobile Accessories" },
    { name: "Mobilebitz", category: "Electrical & Technology", subcategory: "Mobile Accessories" },
    { name: "Miele", category: "Electrical & Technology", subcategory: "Home Appliances" },
    { name: "Polestar", category: "Electrical & Technology", subcategory: "Consumer Electronics" },

    // --- Gifts & Stationery ---
    { name: "Oliver Bonas", category: "Gifts & Stationery", subcategory: "Gifts & Homeware" },
    { name: "Santoro", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Smiggle", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "Flying Tiger Copenhagen", category: "Gifts & Stationery", subcategory: "Gifts" },
    { name: "Magical Story", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Lisa Angel", category: "Gifts & Stationery", subcategory: "Gifts" },

    // --- Home & Garden ---
    { name: "ProCook", category: "Home & Garden", subcategory: "Kitchenware" },

    // --- Kids & Toys ---
    { name: "The Entertainer", category: "Kids & Toys", subcategory: "Toy Store" },

    // --- Food & Grocery ---
    { name: "Hotel Chocolat", category: "Food & Grocery", subcategory: "Chocolatier" },
    { name: "Sweets 4 U", category: "Food & Grocery", subcategory: "Sweet Shop" },
    { name: "Cenu Cacao", category: "Food & Grocery", subcategory: "Chocolatier" },
    { name: "The Cookie Cottage", category: "Food & Grocery", subcategory: "Confectionery" },
    { name: "Co-op On The Go", category: "Food & Grocery", subcategory: "Convenience Store" },

    // --- Cafes & Restaurants ---
    { name: "Wagamama", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Nando's", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Pizza Express", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pizza Hut", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "The Real Greek", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Beleza Rodizio", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Indico", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Yakinori", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Wendy's", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Wing Kingz", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Five Guys", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Greggs", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Starbucks", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Costa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Joe & The Juice", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Pret A Manger", category: "Cafes & Restaurants", subcategory: "Sandwich Shop" },
    { name: "Bubble CiTea", category: "Cafes & Restaurants", subcategory: "Cafe" },
    { name: "Cacao Coffee & Chocolate Co", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Emporio Artari", category: "Cafes & Restaurants", subcategory: "Cafe" },
    { name: "Krispy Kreme", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Lola's Cupcakes", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Mirabella's Play Café", category: "Cafes & Restaurants", subcategory: "Cafe" },
    { name: "Slug & Lettuce", category: "Cafes & Restaurants", subcategory: "Bar" },
    { name: "Spinners", category: "Cafes & Restaurants", subcategory: "Bar" },
    { name: "Jamaya", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Ori Caffe", category: "Cafes & Restaurants", subcategory: "Cafe" },

    // --- Leisure & Entertainment ---
    { name: "Cineworld", category: "Leisure & Entertainment", subcategory: "Cinema", isAnchorTenant: true },

    // --- Services ---
    { name: "Kuoni", category: "Services", subcategory: "Travel Agency" },
    { name: "Co-op Travel", category: "Services", subcategory: "Travel Agency" },
    { name: "News 4 U", category: "Services", subcategory: "Newsagent" },
    { name: "Cheshires", category: "Services", subcategory: "Dry Cleaning" },
    { name: "Inter Car Cleaning", category: "Services", subcategory: "Car Wash" },
    { name: "SellYourCar2Jack", category: "Services", subcategory: "Specialist" },

    // --- Financial Services ---
    { name: "Eurochange", category: "Financial Services", subcategory: "Currency Exchange" },

    // --- General Retail ---
    { name: "Vape Shop Birmingham", category: "General Retail", subcategory: "Vape Shop" },
];

// ============================================================
// Location metadata
// ============================================================

async function enrichLocation() {
    console.log("🔄 Updating location metadata...");

    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            // --- Core ---
            phone: "0121 709 6900",
            openingHours: {
                "Mon-Fri": "10:00-20:00",
                "Sat": "09:00-19:00",
                "Sun": "11:00-17:00",
            },

            // --- Operational ---
            numberOfStores: tenants.length,
            retailers: tenants.length,
            numberOfFloors: 3,
            anchorTenants: tenants.filter((t) => t.isAnchorTenant).length,
            retailSpace: 46000, // ~46,000 sqm (495,000 sqft) of retail/leisure space
            carParkPrice: "3.30", // £3.30 for 2 hours
            evCharging: false, // Decommissioned, new installation pending
            publicTransit:
                "Solihull railway station (West Midlands Railway, 5-min walk). Multiple bus routes from Solihull town centre bus stands (National Express West Midlands).",

            // --- Commercial / ownership ---
            owner: "The Ardent Companies (US-based, acquired July 2021 from Lendlease Retail Partnership)",
            openedYear: 2001,
            footfall: 11200000, // 11.2M annual visitors (2025)

            // --- Demographic (Solihull LTLA — ONS Census 2021) ---
            population: 216245,
            medianAge: 43,
            seniorsPercent: "21.1",
            avgHouseholdIncome: "38000",
            incomeVsNational: "+7.0",      // Disposable income £23,600/head = +7% vs England avg
            homeownership: "72.2",
            homeownershipVsNational: "+16.2", // 72.2% vs 56% national
            carOwnership: "82.4",
            carOwnershipVsNational: "+10.4",  // 82.4% vs ~72% national

            // --- Google (manual research) ---
            googleRating: 4.3,
            googleReviews: 5200,

            // --- Hero Image ---
            heroImage: "https://visitsolihull.co.uk/wp-content/uploads/2022/04/Touchwood2022-1.jpeg",
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
// Update largest category
// ============================================================

async function updateLargestCategory() {
    const cats = await prisma.tenant.groupBy({
        by: ["category"],
        where: { locationId: LOCATION_ID },
        _count: true,
        orderBy: { _count: { category: "desc" } },
    });

    if (cats.length > 0) {
        const total = cats.reduce((sum, c) => sum + c._count, 0);
        const largest = cats[0];
        const percent = Number((largest._count / total).toFixed(3)); // Store as decimal (0.248 = 24.8%)

        await prisma.location.update({
            where: { id: LOCATION_ID },
            data: {
                largestCategory: largest.category,
                largestCategoryPercent: percent,
            },
        });
        console.log(`\n📊 Largest category: ${largest.category} (${(percent * 100).toFixed(1)}%)`);
    }
}

// ============================================================
// Update tenant mix (multiple vs independent)
// ============================================================

const MULTIPLE_RETAILERS = new Set([
    "John Lewis", "Zara", "H&M", "Next", "Mango", "River Island", "Superdry",
    "Levi's", "Mint Velvet", "Bravissimo", "Kurt Geiger", "Dune", "Schuh",
    "Deichmann", "ECCO", "JD Sports", "Sweaty Betty", "Lovisa",
    "Claire's Accessories", "Superdrug", "Holland & Barrett",
    "The Perfume Shop", "The Fragrance Shop", "L'Occitane", "Rituals", "Lush",
    "Space NK", "Pandora", "Swarovski", "Ernest Jones", "Warren James",
    "Beaverbrooks", "Fraser Hart", "Goldsmiths", "TAG Heuer",
    "Apple", "EE", "Vodafone", "Three", "O2", "CeX", "Miele", "Polestar",
    "Oliver Bonas", "Smiggle", "Flying Tiger Copenhagen", "ProCook",
    "The Entertainer", "Hotel Chocolat",
    "Wagamama", "Nando's", "Pizza Express", "Pizza Hut", "The Real Greek",
    "Five Guys", "Greggs", "Starbucks", "Costa Coffee", "Joe & The Juice",
    "Pret A Manger", "Krispy Kreme", "Lola's Cupcakes", "Slug & Lettuce",
    "Wendy's", "Cineworld", "Kuoni", "Co-op Travel", "Eurochange",
    "Santoro", "Co-op On The Go", "Benito Brow Bar",
]);

async function updateTenantMix() {
    const multiples = tenants.filter(t => MULTIPLE_RETAILERS.has(t.name)).length;
    const independents = tenants.length - multiples;
    const percentMultiple = Number((multiples / tenants.length).toFixed(3));
    const percentIndependent = Number((independents / tenants.length).toFixed(3));

    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            percentMultiple: String(percentMultiple),
            percentIndependent: String(percentIndependent),
        },
    });
    console.log(`\n🏪 Tenant mix: ${(percentMultiple * 100).toFixed(1)}% multiples, ${(percentIndependent * 100).toFixed(1)}% independents`);
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
            phone: true,
            openedYear: true,
            owner: true,
            numberOfStores: true,
            numberOfFloors: true,
            anchorTenants: true,
            footfall: true,
            carParkPrice: true,
            publicTransit: true,
            googleRating: true,
            googleReviews: true,
            largestCategory: true,
            largestCategoryPercent: true,
            openingHours: true,
            population: true,
            medianAge: true,
            avgHouseholdIncome: true,
            incomeVsNational: true,
            _count: { select: { tenants: true } },
        },
    });

    if (!loc) {
        console.error("❌ Location not found!");
        return;
    }

    console.log(`📍 ${loc.name}`);
    console.log(`   Phone: ${loc.phone}`);
    console.log(`   Opened: ${loc.openedYear} | Owner: ${loc.owner?.slice(0, 50)}...`);
    console.log(`   Stores: ${loc.numberOfStores} | Floors: ${loc.numberOfFloors} | Anchors: ${loc.anchorTenants}`);
    console.log(`   DB Tenants: ${loc._count.tenants}`);
    console.log(`   Footfall: ${(loc.footfall! / 1_000_000).toFixed(1)}M`);
    console.log(`   Parking: ${loc.carParkPrice}`);
    console.log(`   Google: ${loc.googleRating}⭐ (${loc.googleReviews} reviews)`);
    console.log(`   Largest Category: ${loc.largestCategory} (${loc.largestCategoryPercent}%)`);
    console.log(`   Population: ${loc.population} | Median Age: ${loc.medianAge}`);
    console.log(`   Avg Income: £${loc.avgHouseholdIncome} | vs National: ${loc.incomeVsNational}%`);
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

    // Verify categoryId coverage
    const withCat = await prisma.tenant.count({
        where: { locationId: LOCATION_ID, categoryId: { not: null } },
    });
    const total = await prisma.tenant.count({
        where: { locationId: LOCATION_ID },
    });
    console.log(`\n   categoryId coverage: ${withCat}/${total} (${((withCat / total) * 100).toFixed(0)}%)`);
}

// ============================================================
// Main
// ============================================================

async function main() {
    console.log("═══════════════════════════════════════════════");
    console.log("  Touchwood Shopping Centre — Solihull");
    console.log("  Full Enrichment — Feb 2026");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocation();
    await insertTenants();
    await updateLargestCategory();
    await updateTenantMix();
    await verify();

    console.log("\n✅ Enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
