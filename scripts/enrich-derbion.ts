/**
 * Derbion — Full Enrichment
 *
 * Major shopping centre in Derby city centre.
 * 170+ stores, originally opened 1975 as Eagle Centre,
 * expanded 2007 as Westfield Derby, rebranded Derbion 2021.
 * Owned by Cale Street Investments.
 *
 * Sources:
 *   - derbion.com/sitemap.xml (tenant list, Feb 2026)
 *   - Wikipedia, press releases, Google Maps (metadata)
 *
 * Run: npx tsx scripts/enrich-derbion.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCATION_ID = "cmid0kt1h01mbmtpuxlfwu51p";

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

// ============================================================
// Tenants — from derbion.com/sitemap.xml
// Categories use canonical LDC 3-Tier Taxonomy
// ============================================================

const tenants: TenantInput[] = [
    // --- Anchors ---
    { name: "Marks & Spencer", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "Frasers", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "Next", category: "Clothing & Footwear", subcategory: "Mid-Range", isAnchorTenant: true },
    { name: "Zara", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "H&M", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "JD Sports", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "Sports Direct", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "Showcase Cinema de Lux", category: "Leisure & Entertainment", subcategory: "Cinema", isAnchorTenant: true },

    // --- Clothing & Footwear ---
    { name: "Accessorize", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "AllSaints", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "Ann Summers", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Apricot", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "BOSS", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Boux Avenue", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Castore", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "Claire's", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "Clarks", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Crew Clothing Company", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Damaged Society", category: "Clothing & Footwear", subcategory: "Streetwear" },
    { name: "Deichmann", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "FLANNELS", category: "Clothing & Footwear", subcategory: "Designer", isAnchorTenant: true },
    { name: "Foot Locker", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Footasylum", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "H&M Home", category: "Home & Garden", subcategory: "Homeware" },
    { name: "Hobbs", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Jack & Jones", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Luke 1977", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Mango", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "Matalan", category: "Clothing & Footwear", subcategory: "Value" },
    { name: "Moss", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Mountain Warehouse", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Pavers", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Quiz", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "River Island", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Schuh", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Seasalt", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Shoe Zone", category: "Clothing & Footwear", subcategory: "Value" },
    { name: "Skechers", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Timberland", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Tommy Hilfiger", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Trespass", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Victoria's Secret", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "White Stuff", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Yours Clothing", category: "Clothing & Footwear", subcategory: "Plus Size" },

    // --- Health & Beauty ---
    { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Boots Opticians", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "KIKO Milano", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Laser Clinics", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Lush", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Marks & Spencer Opticians", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Optique Vision", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Body Care" },
    { name: "Supercuts", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "The Body Shop", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Unico Aesthetics", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Vision Express", category: "Health & Beauty", subcategory: "Optician" },

    // --- Jewellery & Watches ---
    { name: "Beaverbrooks", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "F. Hinds", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Goldsmiths", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Goldsmiths (Level 2)", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "H. Samuel", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Judith Hart Jewellers", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Lovisa", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Pandora", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Swarovski", category: "Jewellery & Watches", subcategory: "Crystal Jewellery" },
    { name: "The Watch Lab", category: "Jewellery & Watches", subcategory: "Watch Repair" },
    { name: "Warren James", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Spirit Crystals", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },

    // --- Electrical & Technology ---
    { name: "CeX Entertainment Exchange", category: "Electrical & Technology", subcategory: "Second Hand Electronics" },
    { name: "CeX Mobile Exchange", category: "Electrical & Technology", subcategory: "Second Hand Electronics" },
    { name: "EE", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "FoneWorld", category: "Electrical & Technology", subcategory: "Mobile Accessories" },
    { name: "GAME", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "hmv", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "KRCS Computer Store", category: "Electrical & Technology", subcategory: "Consumer Electronics" },
    { name: "Mobile Lab", category: "Electrical & Technology", subcategory: "Mobile Repair" },
    { name: "O2", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Sky", category: "Electrical & Technology", subcategory: "Telecoms" },
    { name: "Three", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Vodafone", category: "Electrical & Technology", subcategory: "Mobile Network" },

    // --- Home & Garden ---
    { name: "Sharps", category: "Home & Garden", subcategory: "Furniture" },
    { name: "Søstrene Grene", category: "Home & Garden", subcategory: "Homeware" },
    { name: "Yankee Candle", category: "Home & Garden", subcategory: "Home Fragrance" },
    { name: "Home Bargains", category: "Home & Garden", subcategory: "Homeware" },

    // --- Gifts & Stationery ---
    { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Cards Direct", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Castle Fine Art", category: "Gifts & Stationery", subcategory: "Art Gallery" },
    { name: "Clarendon Fine Art", category: "Gifts & Stationery", subcategory: "Art Gallery" },
    { name: "Clintons", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Menkind", category: "Gifts & Stationery", subcategory: "Gadgets & Gifts" },
    { name: "Ryman", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "Smiggle", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "The Gift Company", category: "Gifts & Stationery", subcategory: "Gifts" },
    { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
    { name: "Typo", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "Xpress Framing", category: "Gifts & Stationery", subcategory: "Art" },

    // --- General Retail ---
    { name: "B&M", category: "General Retail", subcategory: "Discount Store" },
    { name: "MINISO", category: "General Retail", subcategory: "Variety Store" },
    { name: "Poundland", category: "General Retail", subcategory: "Discount Store" },
    { name: "Flying Tiger Copenhagen", category: "General Retail", subcategory: "Variety Store" },
    { name: "Revolve", category: "General Retail", subcategory: "Specialist" },
    { name: "Design 44", category: "General Retail", subcategory: "Specialist" },
    { name: "Needles", category: "General Retail", subcategory: "Specialist" },
    { name: "Harpers", category: "General Retail", subcategory: "Specialist" },

    // --- Kids & Toys ---
    { name: "The Entertainer", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "Toy Planet", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "Toys \"R\" Us", category: "Kids & Toys", subcategory: "Toy Store" },

    // --- Food & Grocery ---
    { name: "Hotel Chocolat", category: "Food & Grocery", subcategory: "Chocolate Shop" },
    { name: "Iceland", category: "Food & Grocery", subcategory: "Supermarket" },
    { name: "Sainsbury's", category: "Food & Grocery", subcategory: "Supermarket" },
    { name: "Birds", category: "Food & Grocery", subcategory: "Bakery" },

    // --- Cafes & Restaurants ---
    { name: "200 Degrees Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "40 Degrees Cha", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Auntie Anne's Pretzels", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Bakers + Baristas", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "BEAR", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Bloom Juice", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Burger Sauce", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Carluccio's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Charlie Browns", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Chopstix Noodle Bar", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Costa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Derby Theatre Cafe", category: "Cafes & Restaurants", subcategory: "Cafe" },
    { name: "Five Guys", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "German Doner Kebab", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Greggs", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Joos Power", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "KFC", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Millie's Cookies", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Miss Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Moana", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Muffin Break", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Nando's", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "PizzaExpress", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Popeyes", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Shakin' It", category: "Cafes & Restaurants", subcategory: "Milkshake Bar" },
    { name: "Starbucks", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Subway", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "The Nines", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Tortilla", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Villa Express", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Wagamama", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Wingstop", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Yangtze Express", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Zenerjii", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Zizzi", category: "Cafes & Restaurants", subcategory: "Restaurant" },

    // --- Leisure & Entertainment ---
    { name: "Derby Theatre", category: "Leisure & Entertainment", subcategory: "Cinema" },
    { name: "Hollywood Bowl", category: "Leisure & Entertainment", subcategory: "Bowling" },
    { name: "Paradise Island Adventure Golf", category: "Leisure & Entertainment", subcategory: "Mini Golf" },
    { name: "PureGym", category: "Leisure & Entertainment", subcategory: "Gym" },
    { name: "Social Sports Society", category: "Leisure & Entertainment", subcategory: "Social Gaming" },

    // --- Services ---
    { name: "Co-op Travel", category: "Services", subcategory: "Travel Agency" },
    { name: "Customer Service Desk", category: "Services", subcategory: "Community" },
    { name: "Max Spielmann", category: "Services", subcategory: "Photo Printing" },
    { name: "Poyntons", category: "Services", subcategory: "Newsagent" },
    { name: "Shopmobility", category: "Services", subcategory: "Community" },
    { name: "T.G. Jones", category: "Services", subcategory: "Newsagent" },
    { name: "The Car Wash Company", category: "Services", subcategory: "Car Wash" },
    { name: "The Merry Cobbler", category: "Services", subcategory: "Shoe Repair" },
    { name: "Timpson", category: "Services", subcategory: "Shoe Repair" },
    { name: "TUI", category: "Services", subcategory: "Travel Agency" },

    // --- Financial Services ---
    { name: "ChangeGroup", category: "Financial Services", subcategory: "Currency Exchange" },
    { name: "eurochange", category: "Financial Services", subcategory: "Currency Exchange" },

    // --- Charity & Second Hand ---
    { name: "British Heart Foundation", category: "Charity & Second Hand", subcategory: "Charity Shop" },
];

// ============================================================
// Location metadata
// ============================================================

async function enrichLocation() {
    console.log("🔄 Enriching Derbion metadata...");
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            heroImage:
                "https://kamino.fra1.cdn.digitaloceanspaces.com/derby/app/uploads/2021/10/Untitled-1383-x-400-px.png",
            website: "https://www.derbion.com",
            phone: "01332 291 000",
            openingHours: { "Mon-Fri": "09:00-20:00", Sat: "09:00-19:00", Sun: "10:30-16:30" },
            parkingSpaces: 2728,
            retailSpace: 1300000,
            numberOfStores: tenants.length,
            retailers: tenants.length,
            numberOfFloors: 3,
            anchorTenants: 8,
            publicTransit:
                "Derby railway station 10-min walk. Derbion bus station adjacent. Multiple Trent Barton and Arriva routes.",
            owner: "Cale Street Investments",
            management: "Cale Street Investments",
            openedYear: 1975,
            footfall: 21000000,
            evCharging: true,
            evChargingSpaces: 30,
            carParkPrice: 3.5,
            instagram: "https://www.instagram.com/derbion",
            facebook: "https://www.facebook.com/bepartofderbion",
            twitter: "https://twitter.com/derbion",
            googleRating: 4.3,
            googleReviews: 22000,
            totalFloorArea: 1300000,
        },
    });
    console.log("  ✅ Location metadata updated");
}

// ============================================================
// Tenant upsert — clean + re-insert
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
    console.log("  Derbion — Full Enrichment");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocation();
    await insertTenants();
    await updateLargestCategory();
    await verify();

    console.log("\n✅ Derbion enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
