/**
 * Cabot Circus — Full Enrichment (LDC Taxonomy)
 *
 * Major shopping centre in Bristol city centre.
 * 120+ stores, opened 2008, owned by Hammerson plc.
 *
 * Sources:
 *   - cabotcircus.co.uk/sitemap.xml (tenant list, Feb 2026)
 *   - Wikipedia, Hammerson, press releases (metadata)
 *
 * Run: npx tsx scripts/enrich-cabot-circus.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCATION_ID = "cmid0kqvk01k8mtpuayhfr4ca";

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

// ============================================================
// Tenants — from cabotcircus.co.uk/sitemap.xml
// Categories use canonical LDC 3-Tier Taxonomy
// ============================================================

const tenants: TenantInput[] = [
    // --- Anchors ---
    { name: "Harvey Nichols", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "Marks & Spencer", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "Zara", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "H&M", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Next", category: "Clothing & Footwear", subcategory: "Mid-Range", isAnchorTenant: true },
    { name: "JD Sports", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "Odeon Luxe", category: "Leisure & Entertainment", subcategory: "Cinema", isAnchorTenant: true },

    // --- Clothing & Footwear ---
    { name: "AllSaints", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "Ann Summers", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Bershka", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Fat Face", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Foot Locker", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Goose & Gander", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "HUGO BOSS", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Hyped Economy", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Jack & Jones", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "John Anthony (Flannels)", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Levi's", category: "Clothing & Footwear", subcategory: "Denim" },
    { name: "Lounge Underwear", category: "Clothing & Footwear", subcategory: "Loungewear" },
    { name: "Moss", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Office", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Pull & Bear", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Reiss", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "River Island", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Schuh", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Stradivarius", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "The North Face", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Urban Outfitters", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "& Other Stories", category: "Clothing & Footwear", subcategory: "Contemporary" },

    // --- Health & Beauty ---
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "Laser Clinics", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Lush", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Body Care" },
    { name: "Sunnamusk", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Body Shop", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Fig 1", category: "Health & Beauty", subcategory: "Skincare" },

    // --- Jewellery & Watches ---
    { name: "Astrid & Miyu", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Goldsmiths", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "H. Samuel", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Lovisa", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Pandora", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },

    // --- Electrical & Technology ---
    { name: "EE", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Samsung", category: "Electrical & Technology", subcategory: "Consumer Electronics" },
    { name: "Three", category: "Electrical & Technology", subcategory: "Mobile Network" },

    // --- Home & Garden ---
    { name: "Oliver Bonas", category: "Home & Garden", subcategory: "Home & Lifestyle" },
    { name: "ProCook", category: "Home & Garden", subcategory: "Kitchenware" },
    { name: "Yankee Candle", category: "Home & Garden", subcategory: "Home Fragrance" },

    // --- Gifts & Stationery ---
    { name: "Castle Fine Art", category: "Gifts & Stationery", subcategory: "Art Gallery" },
    { name: "Scribbler", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Typo", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "Zebel", category: "Gifts & Stationery", subcategory: "Gifts" },

    // --- General Retail ---
    { name: "Flying Tiger Copenhagen", category: "General Retail", subcategory: "Variety Store" },
    { name: "MINISO", category: "General Retail", subcategory: "Variety Store" },

    // --- Kids & Toys ---
    { name: "LEGO Store", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "The Entertainer", category: "Kids & Toys", subcategory: "Toy Store" },

    // --- Food & Grocery ---
    { name: "Hotel Chocolat", category: "Food & Grocery", subcategory: "Chocolate Shop" },

    // --- Financial Services ---
    { name: "HSBC", category: "Financial Services", subcategory: "Bank" },
    { name: "Lloyds Bank", category: "Financial Services", subcategory: "Bank" },
    { name: "Nationwide", category: "Financial Services", subcategory: "Building Society" },
    { name: "Santander", category: "Financial Services", subcategory: "Bank" },

    // --- Cafes & Restaurants ---
    { name: "Ben's Cookies", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Bubbleology", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Bunsik", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Costa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Côte", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "CUPP", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Five Guys", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Frankie & Benny's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "German Doner Kebab", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Harvey Nichols Second Floor Restaurant & Bar", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Honest Burgers", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Honi Poké", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "KFC", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Krispy Kreme", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "L'Osteria", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Nando's", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Piccolino", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "PizzaExpress", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pret A Manger", category: "Cafes & Restaurants", subcategory: "Sandwich Shop" },
    { name: "Six by Nico", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Slim Chickens", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "SOHO Coffee Co.", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Thai Express", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "The Real Greek", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Tortilla", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Wagamama", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Wingstop", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Zizzi", category: "Cafes & Restaurants", subcategory: "Restaurant" },

    // --- Leisure & Entertainment ---
    { name: "Escape Hunt", category: "Leisure & Entertainment", subcategory: "Escape Room" },
    { name: "King Pins", category: "Leisure & Entertainment", subcategory: "Bowling" },
    { name: "Treetop Golf", category: "Leisure & Entertainment", subcategory: "Mini Golf" },
];

// ============================================================
// Location metadata
// ============================================================

async function enrichLocation() {
    console.log("🔄 Enriching Cabot Circus metadata...");
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            heroImage:
                "https://assets.simpleviewinc.com/simpleview/image/upload/c_limit,h_1200,q_75,w_1200/v1/clients/bristol/Cabot_Circus_at_night_Credit_Giles_Rocholl_d70b0554-067f-4df5-8056-b6334a5a3199.jpg",
            website: "https://www.cabotcircus.co.uk",
            phone: "0117 927 6444",
            openingHours: { "Mon-Fri": "10:00-20:00", Sat: "09:00-19:00", Sun: "11:00-17:00" },
            parkingSpaces: 2500,
            retailSpace: 1000000,
            numberOfStores: tenants.length,
            retailers: tenants.length,
            numberOfFloors: 3,
            anchorTenants: 7,
            publicTransit:
                "Bristol Temple Meads station 10-min walk. Broadmead bus hub adjacent. Multiple First Bus and Metrobus routes.",
            owner: "Hammerson plc",
            management: "Hammerson plc",
            openedYear: 2008,
            footfall: 17000000,
            evCharging: true,
            evChargingSpaces: 20,
            carParkPrice: 4.0,
            instagram: "https://www.instagram.com/cabotcircus",
            facebook: "https://www.facebook.com/cabotcircus",
            twitter: "https://twitter.com/cabotcircus",
            googleRating: 4.2,
            googleReviews: 15000,
            totalFloorArea: 1000000,
        },
    });
    console.log("  ✅ Location metadata updated");
}

// ============================================================
// Tenant upsert
// ============================================================

async function insertTenants() {
    const deleted = await prisma.tenant.deleteMany({ where: { locationId: LOCATION_ID } });
    console.log(`\n🗑️  Deleted ${deleted.count} old tenants`);
    console.log(`📦 Inserting ${tenants.length} tenants...`);

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
// Update largest category
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
            name: true, numberOfStores: true, owner: true, openedYear: true,
            parkingSpaces: true, footfall: true, retailSpace: true, heroImage: true,
            largestCategory: true, largestCategoryPercent: true, address: true,
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
    console.log("  Cabot Circus — Full Enrichment");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocation();
    await insertTenants();
    await updateLargestCategory();
    await verify();

    console.log("\n✅ Cabot Circus enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
