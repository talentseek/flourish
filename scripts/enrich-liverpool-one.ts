/**
 * Liverpool ONE Enrichment
 *
 * ~170 tenants — major open-air shopping/dining destination.
 * Owner: Grosvenor. Opened 2008. 42 acres, 5 districts.
 * 30M+ annual footfall. 130,000m² retail space.
 *
 * Sources: liverpool-one.com/shopping/ (official directory, Feb 2026)
 *          liverpool-one.com food/drink listings, web search
 *
 * Run: npx tsx scripts/enrich-liverpool-one.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCATION_ID = "cmid0kw0e01pdmtpu3jwhpqaf";

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

const tenants: TenantInput[] = [
    // ═══════════════════════════════════
    // DEPARTMENT STORES / ANCHORS
    // ═══════════════════════════════════
    { name: "John Lewis & Partners", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "M&S", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },

    // ═══════════════════════════════════
    // CLOTHING & FOOTWEAR
    // ═══════════════════════════════════
    { name: "& Other Stories", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Ann Summers", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Anthropologie", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "ARNE", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Bershka", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "BOSS", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Boux Avenue", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Bravissimo", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Dirty", category: "Clothing & Footwear", subcategory: "Streetwear" },
    { name: "Dr Martens", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Foot Locker", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "Footasylum", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "Fred Perry", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Hobbs, Whistles, Phase Eight", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Hollister", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "JD Sports", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "Kenji", category: "Clothing & Footwear", subcategory: "Streetwear" },
    { name: "Levi's", category: "Clothing & Footwear", subcategory: "Denim" },
    { name: "Mint Velvet", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Montirex", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Office", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Pull & Bear", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Red Run", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "Reiss", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "schuh", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "schuh kids", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "size?", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Skechers", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Stradivarius", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Sweaty Betty", category: "Clothing & Footwear", subcategory: "Activewear" },
    { name: "The North Face", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Under Armour", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "UNIQLO", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Urban Outfitters", category: "Clothing & Footwear", subcategory: "Lifestyle" },
    { name: "Vans", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Victoria's Secret", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "White Stuff", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Zara", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },

    // ═══════════════════════════════════
    // HEALTH & BEAUTY
    // ═══════════════════════════════════
    { name: "Barber Barber", category: "Health & Beauty", subcategory: "Barber" },
    { name: "Bath & Body Works", category: "Health & Beauty", subcategory: "Body Care" },
    { name: "Charlotte Tilbury", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "Jo Malone London", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Kiehl's", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "KIKO Milano", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "L'Occitane", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "MAC", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Molton Brown", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Penhaligon's", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Sally", category: "Health & Beauty", subcategory: "Hair Care" },
    { name: "Sephora", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Smileworks", category: "Health & Beauty", subcategory: "Dental" },
    { name: "Space NK", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Specsavers", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "The Body Shop", category: "Health & Beauty", subcategory: "Body Care" },
    { name: "The Fragrance Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Thérapie Clinic", category: "Health & Beauty", subcategory: "Aesthetics" },

    // ═══════════════════════════════════
    // JEWELLERY & WATCHES
    // ═══════════════════════════════════
    { name: "Breitling", category: "Jewellery & Watches", subcategory: "Watches" },
    { name: "David M Robinson", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Ernest Jones", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Goldsmiths", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "H. Samuel", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "OMEGA", category: "Jewellery & Watches", subcategory: "Watches" },
    { name: "Pandora", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Rox", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Swarovski", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Swatch", category: "Jewellery & Watches", subcategory: "Watches" },
    { name: "TAG Heuer", category: "Jewellery & Watches", subcategory: "Watches" },
    { name: "Watch Lab", category: "Jewellery & Watches", subcategory: "Watches" },
    { name: "Vincentius", category: "Jewellery & Watches", subcategory: "Art & Jewellery" },

    // ═══════════════════════════════════
    // ELECTRICAL & TECHNOLOGY
    // ═══════════════════════════════════
    { name: "Apple", category: "Electrical & Technology", subcategory: "Consumer Electronics", isAnchorTenant: true },
    { name: "CEX", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "EE Store", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "iSmash", category: "Electrical & Technology", subcategory: "Mobile Repair" },
    { name: "Nespresso", category: "Electrical & Technology", subcategory: "Home Appliances" },
    { name: "O2 Shop", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Samsung", category: "Electrical & Technology", subcategory: "Consumer Electronics" },
    { name: "Sky", category: "Electrical & Technology", subcategory: "Telecoms" },
    { name: "Three Store", category: "Electrical & Technology", subcategory: "Mobile Network" },

    // ═══════════════════════════════════
    // GIFTS & STATIONERY
    // ═══════════════════════════════════
    { name: "Build A Bear Workshop", category: "Gifts & Stationery", subcategory: "Toys" },
    { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Claire's Accessories", category: "Gifts & Stationery", subcategory: "Accessories" },
    { name: "Clarendon Fine Art", category: "Gifts & Stationery", subcategory: "Art Gallery" },
    { name: "Lindt", category: "Gifts & Stationery", subcategory: "Chocolatier" },
    { name: "Menkind Store", category: "Gifts & Stationery", subcategory: "Gadgets & Gifts" },
    { name: "MINISO", category: "Gifts & Stationery", subcategory: "Lifestyle" },
    { name: "Oliver Bonas", category: "Gifts & Stationery", subcategory: "Gifts & Homeware" },
    { name: "POP MART", category: "Gifts & Stationery", subcategory: "Collectibles" },
    { name: "The Entertainer", category: "Gifts & Stationery", subcategory: "Toys" },
    { name: "Waterstones", category: "Gifts & Stationery", subcategory: "Books" },
    { name: "WHSmith", category: "Gifts & Stationery", subcategory: "Books & Stationery" },

    // ═══════════════════════════════════
    // HOME & GARDEN
    // ═══════════════════════════════════
    { name: "The White Company", category: "Home & Garden", subcategory: "Home & Lifestyle" },
    { name: "Utility", category: "Home & Garden", subcategory: "Kitchen & Home" },

    // ═══════════════════════════════════
    // FOOD & GROCERY
    // ═══════════════════════════════════
    { name: "Home Bargains", category: "General Retail", subcategory: "Discount Store" },
    { name: "Tesco", category: "Food & Grocery", subcategory: "Supermarket" },
    { name: "Hotel Chocolat", category: "Food & Grocery", subcategory: "Chocolatier" },

    // ═══════════════════════════════════
    // SPORTS (separate stores)
    // ═══════════════════════════════════
    { name: "Liverpool FC Store", category: "General Retail", subcategory: "Sport Merchandise" },
    { name: "Everton Two Shop", category: "General Retail", subcategory: "Sport Merchandise" },
    { name: "Michael Franks", category: "General Retail", subcategory: "Specialist" },

    // ═══════════════════════════════════
    // FINANCIAL SERVICES
    // ═══════════════════════════════════
    { name: "Barclays", category: "Financial Services", subcategory: "Bank" },
    { name: "eurochange", category: "Financial Services", subcategory: "Currency Exchange" },
    { name: "Yorkshire Building Society", category: "Financial Services", subcategory: "Building Society" },

    // ═══════════════════════════════════
    // SERVICES
    // ═══════════════════════════════════
    { name: "Kuoni", category: "Services", subcategory: "Travel Agency" },
    { name: "Virgin Holidays", category: "Services", subcategory: "Travel Agency" },
    { name: "S&S News", category: "Services", subcategory: "Newsagent" },

    // ═══════════════════════════════════
    // LEISURE & ENTERTAINMENT
    // ═══════════════════════════════════
    { name: "The Gym Group", category: "Leisure & Entertainment", subcategory: "Gym" },
    { name: "ODEON Cinema", category: "Leisure & Entertainment", subcategory: "Cinema", isAnchorTenant: true },
    { name: "Gravity MAX", category: "Leisure & Entertainment", subcategory: "Entertainment" },
    { name: "Flight Club", category: "Leisure & Entertainment", subcategory: "Social Gaming" },
    { name: "Junkyard Golf Club", category: "Leisure & Entertainment", subcategory: "Social Gaming" },
    { name: "Roxy Ball Room", category: "Leisure & Entertainment", subcategory: "Social Gaming" },

    // ═══════════════════════════════════
    // CAFES & RESTAURANTS
    // ═══════════════════════════════════
    { name: "Nando's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Five Guys", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Wagamama", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pizza Express", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pizza Hut", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "TGI Fridays", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Côte Brasserie", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Las Iguanas", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "The Botanist", category: "Cafes & Restaurants", subcategory: "Restaurant Bar" },
    { name: "Browns Brasserie & Bar", category: "Cafes & Restaurants", subcategory: "Restaurant Bar" },
    { name: "Cosy Club", category: "Cafes & Restaurants", subcategory: "Restaurant Bar" },
    { name: "Lunya", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Piccolino", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Mamasan Bar & Brasserie", category: "Cafes & Restaurants", subcategory: "Restaurant Bar" },
    { name: "Gordon Ramsay Bread Street Kitchen", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Gordon Ramsay Street Pizza", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Wahaca", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Turtle Bay", category: "Cafes & Restaurants", subcategory: "Restaurant Bar" },
    { name: "Thaikhun", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Maggie Fu", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Bem Brasil", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "COSMO", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Smashburger", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Heavenly Desserts", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "KFC", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Chopstix", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Greggs", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Barburrito", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Jerk Junction", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Auntie Anne's Pretzels", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Mooboo", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "Costa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Caffè Nero", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Pret a Manger", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "JOE & THE JUICE", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Black Sheep Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Loretta's Parkside Tavern", category: "Cafes & Restaurants", subcategory: "Pub" },
    { name: "Bierkeller", category: "Cafes & Restaurants", subcategory: "Bar" },
    { name: "Brewski", category: "Cafes & Restaurants", subcategory: "Bar" },
    { name: "Slug and Lettuce", category: "Cafes & Restaurants", subcategory: "Bar" },
    { name: "Yates", category: "Cafes & Restaurants", subcategory: "Bar" },
    { name: "Neapolitan Pizza & Bar", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pizza Punks", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "The Real Greek", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Red Dog Saloon", category: "Cafes & Restaurants", subcategory: "Restaurant" },
];

// ============================================================
// Location metadata
// ============================================================

async function enrichLocation() {
    console.log("🔄 Updating Liverpool ONE metadata...");
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            website: "https://www.liverpool-one.com",
            numberOfStores: tenants.length,
            retailers: tenants.length,
            openedYear: 2008,
            totalFloorArea: 1399307, // 130,000m² ≈ 1,399,307 sqft
            numberOfFloors: 3,
            parkingSpaces: 2600,
            owner: "Grosvenor Group",
            management: "Grosvenor Group — open-air retail/leisure destination spanning 42 acres across 5 districts",
            openingHours: { "Mon-Fri": "10:00-20:00", Sat: "09:00-19:00", Sun: "11:00-17:00" },
            publicTransit: "Liverpool Central station (Merseyrail, adjacent). Liverpool Lime Street main line station 10-min walk. Q1 bus station integrated.",
            instagram: "https://www.instagram.com/liverpoolone/",
            facebook: "https://www.facebook.com/LiverpoolONE",
            twitter: null,
        },
    });
    console.log("✅ Location metadata updated");
}

// ============================================================
// Tenant operations
// ============================================================

async function insertTenants() {
    const deleted = await prisma.tenant.deleteMany({ where: { locationId: LOCATION_ID } });
    console.log(`\n🗑️  Deleted ${deleted.count} old tenants`);
    console.log(`📦 Inserting ${tenants.length} tenants...\n`);

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
            openedYear: true,
            owner: true,
            management: true,
            parkingSpaces: true,
            numberOfFloors: true,
            publicTransit: true,
            largestCategory: true,
            largestCategoryPercent: true,
            _count: { select: { tenants: true } },
        },
    });

    if (loc) {
        console.log(`📍 ${loc.name}`);
        console.log(`   Opened: ${loc.openedYear} | Owner: ${loc.owner}`);
        console.log(`   Stores: ${loc.numberOfStores} | DB Tenants: ${loc._count.tenants}`);
        console.log(`   Floors: ${loc.numberOfFloors} | Parking: ${loc.parkingSpaces}`);
        console.log(`   Management: ${loc.management?.slice(0, 80)}...`);
        console.log(`   Transit: ${loc.publicTransit?.slice(0, 100)}...`);
        console.log(`   Largest: ${loc.largestCategory} (${((Number(loc.largestCategoryPercent) || 0) * 100).toFixed(1)}%)`);
    }

    const cats = await prisma.tenant.groupBy({
        by: ["category"],
        where: { locationId: LOCATION_ID },
        _count: true,
        orderBy: { _count: { category: "desc" } },
    });

    console.log("\n   Category Breakdown:");
    for (const c of cats) {
        console.log(`     ${c.category}: ${c._count}`);
    }

    const anchors = await prisma.tenant.findMany({
        where: { locationId: LOCATION_ID, isAnchorTenant: true },
        select: { name: true },
    });
    console.log(`\n   Anchors (${anchors.length}): ${anchors.map((a) => a.name).join(", ")}`);
}

// ============================================================
// Main
// ============================================================

async function main() {
    console.log("═══════════════════════════════════════════════");
    console.log("  Liverpool ONE — Full Enrichment — Feb 2026");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocation();
    await insertTenants();
    await updateLargestCategory();
    await verify();

    console.log("\n✅ Liverpool ONE enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
