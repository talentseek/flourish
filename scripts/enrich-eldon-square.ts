/**
 * Eldon Square — Full Re-Enrichment (LDC Taxonomy)
 *
 * Major shopping centre in Newcastle upon Tyne city centre.
 * 140+ stores, opened 1976, owned by XPE Group (60%) + Newcastle City Council (40%).
 *
 * This re-enrichment:
 *   1. Re-inserts all tenants with canonical LDC 3-Tier taxonomy
 *   2. Sets hero image
 *   3. Computes largestCategory / largestCategoryPercent
 *   4. Confirms metadata
 *
 * Sources:
 *   - eldonsquare.co.uk/store-sitemap.xml (tenant list, Feb 2026)
 *   - Wikipedia, press releases (metadata)
 *
 * Run: npx tsx scripts/enrich-eldon-square.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCATION_ID = "cmid0kti401msmtpuxbhb3zhp";

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

// ============================================================
// Tenants — from eldonsquare.co.uk/store-sitemap.xml
// Categories use canonical LDC 3-Tier Taxonomy
// ============================================================

const tenants: TenantInput[] = [
    // --- Anchors / Department Stores ---
    { name: "Fenwick", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "Fenwick Home", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "John Lewis & Partners", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "M&S", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "Next", category: "Clothing & Footwear", subcategory: "Mid-Range", isAnchorTenant: true },
    { name: "Apple", category: "Electrical & Technology", subcategory: "Consumer Electronics", isAnchorTenant: true },

    // --- Clothing & Footwear ---
    { name: "Accessorize", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "AllSaints", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "Ann Summers", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Bravissimo", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Charles Clinkard Fine Footwear", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Claire's", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "Clarks", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Damaged Society", category: "Clothing & Footwear", subcategory: "Streetwear" },
    { name: "Foot Locker", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "H&M", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Hollister", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Levi's", category: "Clothing & Footwear", subcategory: "Denim" },
    { name: "Mango", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Office", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "River Island", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Schuh", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Skechers", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Superdry", category: "Clothing & Footwear", subcategory: "Contemporary" },

    // --- Health & Beauty ---
    { name: "Bath & Body Works", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Boots (Blackett Street)", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Boots (St George's Way)", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Boots Opticians", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Cochani London", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Cover Beauty", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Eldon Barbers", category: "Health & Beauty", subcategory: "Barber" },
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "KIKO Milano", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Lush", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Molton Brown", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Pop Specs", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "PURESEOUL", category: "Health & Beauty", subcategory: "K-Beauty" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Body Care" },
    { name: "Sephora", category: "Health & Beauty", subcategory: "Premium Cosmetics" },
    { name: "Specsavers", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Sunglass Hut", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Supercuts", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "The Body Shop", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "The Fragrance Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Thérapie Clinic", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Vision Express", category: "Health & Beauty", subcategory: "Optician" },

    // --- Jewellery & Watches ---
    { name: "Austen Blake", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Beaverbrooks", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Ernest Jones", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "In-Time (within John Lewis & Partners)", category: "Jewellery & Watches", subcategory: "Watch Repair" },
    { name: "Jewells", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Lovisa", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Nomination Italy", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Pandora", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Swarovski", category: "Jewellery & Watches", subcategory: "Crystal Jewellery" },
    { name: "Swatch", category: "Jewellery & Watches", subcategory: "Watches" },
    { name: "Warren James", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Warren James (Eldon Way)", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Watch Repair Centre", category: "Jewellery & Watches", subcategory: "Watch Repair" },

    // --- Electrical & Technology ---
    { name: "EE", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Fone Xtras Kiosk (Blackett Bridge)", category: "Electrical & Technology", subcategory: "Mobile Accessories" },
    { name: "Fone Xtras Kiosk (Eldon Way)", category: "Electrical & Technology", subcategory: "Mobile Accessories" },
    { name: "hmv", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "iSmash", category: "Electrical & Technology", subcategory: "Mobile Repair" },
    { name: "Mac Repairs Newcastle", category: "Electrical & Technology", subcategory: "Mobile Repair" },
    { name: "Mobile Phone Essentials", category: "Electrical & Technology", subcategory: "Mobile Accessories" },
    { name: "O2", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Sky (Eldon Way)", category: "Electrical & Technology", subcategory: "Telecoms" },
    { name: "Three", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Vodafone", category: "Electrical & Technology", subcategory: "Mobile Network" },

    // --- Home & Garden ---
    { name: "Oliver Bonas", category: "Home & Garden", subcategory: "Home & Lifestyle" },
    { name: "Søstrene Grene", category: "Home & Garden", subcategory: "Homeware" },
    { name: "Sharps", category: "Home & Garden", subcategory: "Furniture" },
    { name: "Whittard of Chelsea", category: "Home & Garden", subcategory: "Kitchenware" },

    // --- Gifts & Stationery ---
    { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Clintons", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Menkind", category: "Gifts & Stationery", subcategory: "Gadgets & Gifts" },
    { name: "Ryman", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "Smiggle", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
    { name: "Typo", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "Be More Geek", category: "Gifts & Stationery", subcategory: "Gifts" },
    { name: "The Back Page", category: "Gifts & Stationery", subcategory: "Gifts" },

    // --- General Retail ---
    { name: "Argos", category: "General Retail", subcategory: "Variety Store" },
    { name: "MINISO", category: "General Retail", subcategory: "Variety Store" },
    { name: "Poundland (St George's Way)", category: "General Retail", subcategory: "Discount Store" },
    { name: "Poundland (Clayton Street)", category: "General Retail", subcategory: "Discount Store" },
    { name: "Oseyo", category: "General Retail", subcategory: "Specialist" },
    { name: "Robin Valley", category: "General Retail", subcategory: "Specialist" },
    { name: "Serendipity", category: "General Retail", subcategory: "Specialist" },
    { name: "The Geordie Witch", category: "General Retail", subcategory: "Specialist" },

    // --- Food & Grocery ---
    { name: "Hotel Chocolat", category: "Food & Grocery", subcategory: "Chocolate Shop" },
    { name: "Hiyou Supermarket", category: "Food & Grocery", subcategory: "Convenience Store" },
    { name: "Tesco Metro", category: "Food & Grocery", subcategory: "Supermarket" },

    // --- Cafes & Restaurants ---
    { name: "ASK Italian", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Bella Italia", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Boost", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Bubbleology", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Caffè Nero", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Chaophraya", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Chatime", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Chiquito", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Chit 'n' Chaat", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "COSMO", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Costa Coffee (Blackett Bridge)", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Costa Coffee (St George's Way)", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Crêpeaffaire", category: "Cafes & Restaurants", subcategory: "Cafe" },
    { name: "Frankie & Benny's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Greggs", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "KFC", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Krispy Kreme", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Maki & Ramen", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Millie's Cookies", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Mr. Pretzels", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Nando's", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Ori Caffe", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Pret A Manger", category: "Cafes & Restaurants", subcategory: "Sandwich Shop" },
    { name: "Smashburger", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Starbucks (St George's Way)", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Starbucks (St Andrews Way)", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "The Alchemist", category: "Cafes & Restaurants", subcategory: "Restaurant Bar" },
    { name: "The Bagel Factory", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "The Bake One", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Tortilla", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Umai Mi Oriental Kitchen", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Wagamama", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Wingstop", category: "Cafes & Restaurants", subcategory: "Fast Casual" },

    // --- Leisure & Entertainment ---
    { name: "Digital Catapult 5G Immersive Lab", category: "Leisure & Entertainment", subcategory: "Virtual Reality" },
    { name: "Flight Club", category: "Leisure & Entertainment", subcategory: "Social Gaming" },
    { name: "Peloton", category: "Leisure & Entertainment", subcategory: "Gym" },
    { name: "The Exchange", category: "Leisure & Entertainment", subcategory: "Arcade" },

    // --- Services ---
    { name: "Cosy News", category: "Services", subcategory: "Newsagent" },
    { name: "Ladbrokes", category: "Services", subcategory: "Betting" },
    { name: "Timpson", category: "Services", subcategory: "Shoe Repair" },

    // --- Financial Services ---
    { name: "eurochange", category: "Financial Services", subcategory: "Currency Exchange" },
    { name: "Ramsdens", category: "Financial Services", subcategory: "Pawnbroker" },
    { name: "The Holiday Money Shop", category: "Financial Services", subcategory: "Currency Exchange" },

    // --- Charity & Second Hand ---
    { name: "British Heart Foundation", category: "Charity & Second Hand", subcategory: "Charity Shop" },
];

// ============================================================
// Location metadata
// ============================================================

async function enrichLocation() {
    console.log("🔄 Enriching Eldon Square metadata...");
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            heroImage:
                "https://www.getintonewcastle.co.uk/images/uploads/eldon-square.jpg",
            website: "https://eldonsquare.co.uk",
            phone: "0191 261 1891",
            openingHours: { "Mon-Sat": "09:00-18:00", Thu: "09:00-20:00", Sun: "11:00-17:00" },
            parkingSpaces: 942,
            retailSpace: 1400000,
            numberOfStores: tenants.length,
            retailers: tenants.length,
            numberOfFloors: 3,
            anchorTenants: 6,
            publicTransit:
                "Monument and Haymarket Metro stations adjacent. Newcastle Central station 10-min walk. Eldon Square Bus Concourse underneath.",
            owner: "XPE Group (60%) / Newcastle City Council (40%)",
            management: "XPE Group",
            openedYear: 1976,
            footfall: 26400000,
            evCharging: true,
            evChargingSpaces: 6,
            carParkPrice: 3.5,
            instagram: "https://www.instagram.com/eldonsqnewcastle",
            facebook: "https://www.facebook.com/EldonSquareNewcastle",
            googleRating: 4.2,
            googleReviews: 18000,
            totalFloorArea: 1400000,
        },
    });
    console.log("  ✅ Location metadata updated");
}

// ============================================================
// Tenant upsert — clean + re-insert with LDC taxonomy
// ============================================================

async function insertTenants() {
    const deleted = await prisma.tenant.deleteMany({ where: { locationId: LOCATION_ID } });
    console.log(`\n🗑️  Deleted ${deleted.count} old tenants`);
    console.log(`📦 Inserting ${tenants.length} tenants (LDC taxonomy)...`);

    let created = 0;
    let skipped = 0;

    for (const t of tenants) {
        try {
            await prisma.tenant.create({
                data: {
                    locationId: LOCATION_ID,
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
// Update largest category fields
// ============================================================

async function updateLargestCategory() {
    const cats = await prisma.tenant.groupBy({
        by: ["category"],
        where: { locationId: LOCATION_ID },
        _count: true,
        orderBy: { _count: { category: "desc" } },
    });
    const total = cats.reduce((sum, c) => sum + c._count, 0);
    if (cats.length > 0 && total > 0) {
        await prisma.location.update({
            where: { id: LOCATION_ID },
            data: {
                largestCategory: cats[0].category,
                largestCategoryPercent: Number((cats[0]._count / total).toFixed(3)),
            },
        });
        console.log(
            `\n📊 Largest category: ${cats[0].category} (${((cats[0]._count / total) * 100).toFixed(1)}%)`
        );
    }
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
            numberOfStores: true,
            owner: true,
            openedYear: true,
            parkingSpaces: true,
            footfall: true,
            retailSpace: true,
            heroImage: true,
            largestCategory: true,
            largestCategoryPercent: true,
            address: true,
            _count: { select: { tenants: true } },
        },
    });

    if (loc) {
        console.log(`📍 ${loc.name}`);
        console.log(`   Address: ${loc.address}`);
        console.log(`   Owner: ${loc.owner}`);
        console.log(`   Opened: ${loc.openedYear}`);
        console.log(`   Parking: ${loc.parkingSpaces}`);
        console.log(`   Footfall: ${loc.footfall}`);
        console.log(`   Retail Space: ${loc.retailSpace}`);
        console.log(`   Hero Image: ${loc.heroImage ? "✅ Set" : "❌ Missing"}`);
        console.log(`   DB Tenants: ${loc._count.tenants}`);
        console.log(
            `   Largest: ${loc.largestCategory} (${((Number(loc.largestCategoryPercent) || 0) * 100).toFixed(1)}%)`
        );

        const cats = await prisma.tenant.groupBy({
            by: ["category"],
            where: { locationId: LOCATION_ID },
            _count: true,
            orderBy: { _count: { category: "desc" } },
        });
        console.log(
            `   Categories: ${cats.map((c) => `${c.category}(${c._count})`).join(", ")}`
        );
    }
}

// ============================================================
// Main
// ============================================================

async function main() {
    console.log("═══════════════════════════════════════════════");
    console.log("  Eldon Square — LDC Re-Enrichment");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocation();
    await insertTenants();
    await updateLargestCategory();
    await verify();

    console.log("\n✅ Eldon Square enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
