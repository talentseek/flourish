/**
 * centre:mk — Full Enrichment (Feb 2026)
 *
 * One of the UK's largest indoor shopping centres in Milton Keynes.
 * Jointly owned by Federated Hermes (BT Pension) & Royal London Asset Management.
 * Opened 1979 by Margaret Thatcher. ~21.4M annual footfall.
 * ~1M sqft retail space with 240+ stores.
 *
 * Sources:
 *   - centremk.com/sitemap.xml (store + food-drink listings)
 *   - Wikipedia, press releases, CoStar (metadata)
 *
 * Run: npx tsx scripts/enrich-centremk.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCATION_ID = "cmid0l2ac01vvmtpuopzxzitz";

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
    { name: "Primark", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "H&M", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Next", category: "Clothing & Footwear", subcategory: "Mid-Range", isAnchorTenant: true },
    { name: "TK Maxx", category: "Clothing & Footwear", subcategory: "Off-Price", isAnchorTenant: true },
    { name: "JD Sports", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },

    // ═══════════════════════════════════
    // CLOTHING & FOOTWEAR
    // ═══════════════════════════════════
    { name: "Accessorize", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "Ann Summers", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Apricot", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Bravissimo", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Castore", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "Charles Tyrwhitt", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Clarks", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Deichmann", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Dune London", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Fat Face", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Footasylum", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "H&M Home", category: "Home & Garden", subcategory: "Homeware" },
    { name: "Hawes & Curtis", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Hobbs", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Jigsaw", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Just Gents", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Mango", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Milano Couture", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Mint Velvet", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Moss", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Office", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Phase Eight", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Reiss", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "River Island", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Skechers", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "White Stuff", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Yours", category: "Clothing & Footwear", subcategory: "Plus Size" },

    // ═══════════════════════════════════
    // HEALTH & BEAUTY
    // ═══════════════════════════════════
    { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Braids Barbers", category: "Health & Beauty", subcategory: "Barber" },
    { name: "Eyebrow", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Eye Shade", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Gregory Max", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "H Beauty", category: "Health & Beauty", subcategory: "Cosmetics", isAnchorTenant: true },
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "L'Occitane en Provence", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "Laser Clinics", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Lush", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Molton Brown", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Mood London", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Pop Specs", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Regis", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Scrivens Opticians", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Space NK", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Specsavers", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Sunglass Hut", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Sunlounger", category: "Health & Beauty", subcategory: "Tanning" },
    { name: "Sunnamusk", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "The Body Shop", category: "Health & Beauty", subcategory: "Body Care" },
    { name: "The Fragrance Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Thérapie Clinic", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Vision Express", category: "Health & Beauty", subcategory: "Optician" },

    // ═══════════════════════════════════
    // JEWELLERY & WATCHES
    // ═══════════════════════════════════
    { name: "Beaverbrooks", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Ernest Jones", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "F. Hinds", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Goldsmiths", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "H. Samuel", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Katie Loxton & Joma Jewellery", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Loupe", category: "Jewellery & Watches", subcategory: "Watches" },
    { name: "Lovisa", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Nomination Italy", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Pandora", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Phelan's Jewellers", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Pravins", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Swarovski", category: "Jewellery & Watches", subcategory: "Crystal Jewellery" },
    { name: "Thomas Sabo", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "TG Jones", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Warren James", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Watch & Clock Shop", category: "Jewellery & Watches", subcategory: "Watch Repair" },
    { name: "Watch Lab", category: "Jewellery & Watches", subcategory: "Watch Repair" },

    // ═══════════════════════════════════
    // ELECTRICAL & TECHNOLOGY
    // ═══════════════════════════════════
    { name: "CEX", category: "Electrical & Technology", subcategory: "Second Hand Electronics" },
    { name: "EE", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "HMV", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "O2", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Sky", category: "Electrical & Technology", subcategory: "Telecoms" },
    { name: "Three", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Top Tech Gadgets", category: "Electrical & Technology", subcategory: "Mobile Accessories" },
    { name: "Vodafone", category: "Electrical & Technology", subcategory: "Mobile Network" },

    // ═══════════════════════════════════
    // GIFTS & STATIONERY
    // ═══════════════════════════════════
    { name: "Build A Bear", category: "Gifts & Stationery", subcategory: "Toys" },
    { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Cards Direct", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Castle Fine Art", category: "Gifts & Stationery", subcategory: "Art Gallery" },
    { name: "Claire's", category: "Gifts & Stationery", subcategory: "Accessories" },
    { name: "Menkind", category: "Gifts & Stationery", subcategory: "Gadgets & Gifts" },
    { name: "MINISO", category: "Gifts & Stationery", subcategory: "Lifestyle" },
    { name: "Oliver Bonas", category: "Gifts & Stationery", subcategory: "Gifts & Homeware" },
    { name: "Smiggle", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "The Entertainer", category: "Gifts & Stationery", subcategory: "Toys" },
    { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
    { name: "Typo", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "Warhammer", category: "Gifts & Stationery", subcategory: "Specialist" },
    { name: "Wye by Top Gift", category: "Gifts & Stationery", subcategory: "Gifts" },

    // ═══════════════════════════════════
    // HOME & GARDEN
    // ═══════════════════════════════════
    { name: "ProCook", category: "Home & Garden", subcategory: "Kitchenware" },
    { name: "Tempur", category: "Home & Garden", subcategory: "Beds & Mattresses" },
    { name: "The White Company", category: "Home & Garden", subcategory: "Home & Lifestyle" },
    { name: "Whittard of Chelsea", category: "Home & Garden", subcategory: "Tea & Coffee" },
    { name: "Yankee Candle", category: "Home & Garden", subcategory: "Home Fragrance" },

    // ═══════════════════════════════════
    // FOOD & GROCERY
    // ═══════════════════════════════════
    { name: "Hotel Chocolat", category: "Food & Grocery", subcategory: "Chocolate Shop" },
    { name: "Londis", category: "Food & Grocery", subcategory: "Convenience Store" },
    { name: "M&S Foodhall", category: "Food & Grocery", subcategory: "Supermarket" },
    { name: "Mr Simms", category: "Food & Grocery", subcategory: "Sweet Shop" },

    // ═══════════════════════════════════
    // GENERAL RETAIL
    // ═══════════════════════════════════
    { name: "AC Framing", category: "General Retail", subcategory: "Specialist" },
    { name: "Flying Tiger Copenhagen", category: "General Retail", subcategory: "Variety Store" },
    { name: "Headway", category: "General Retail", subcategory: "Charity Shop" },
    { name: "Love Local Hub", category: "General Retail", subcategory: "Community" },
    { name: "Nimy Creation", category: "General Retail", subcategory: "Specialist" },
    { name: "Poundland", category: "General Retail", subcategory: "Discount Store" },
    { name: "Smart City Experience Centre", category: "General Retail", subcategory: "Exhibition" },

    // ═══════════════════════════════════
    // FINANCIAL SERVICES
    // ═══════════════════════════════════
    { name: "Barclays", category: "Financial Services", subcategory: "Bank" },
    { name: "Coventry Building Society", category: "Financial Services", subcategory: "Building Society" },
    { name: "eurochange", category: "Financial Services", subcategory: "Currency Exchange" },
    { name: "Halifax", category: "Financial Services", subcategory: "Bank" },
    { name: "NatWest", category: "Financial Services", subcategory: "Bank" },
    { name: "Nationwide", category: "Financial Services", subcategory: "Building Society" },
    { name: "TSB", category: "Financial Services", subcategory: "Bank" },

    // ═══════════════════════════════════
    // SERVICES
    // ═══════════════════════════════════
    { name: "Kuoni", category: "Services", subcategory: "Travel Agency" },
    { name: "Ladbrokes", category: "Services", subcategory: "Betting" },
    { name: "JenningsBet (Midsummer)", category: "Services", subcategory: "Betting" },
    { name: "JenningsBet (Silbury)", category: "Services", subcategory: "Betting" },
    { name: "My Geisha", category: "Services", subcategory: "Nail Salon" },
    { name: "Snappy Snaps", category: "Services", subcategory: "Photo Printing" },
    { name: "The Barbers Lounge", category: "Health & Beauty", subcategory: "Barber" },
    { name: "The Car Wash Company", category: "Services", subcategory: "Car Wash" },
    { name: "Timpson", category: "Services", subcategory: "Shoe Repair" },
    { name: "Trailfinders", category: "Services", subcategory: "Travel Agency" },
    { name: "TUI", category: "Services", subcategory: "Travel Agency" },
    { name: "Virgin Holidays", category: "Services", subcategory: "Travel Agency" },

    // ═══════════════════════════════════
    // CAFES & RESTAURANTS
    // ═══════════════════════════════════
    { name: "ASK Italian", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Batch'd", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Bill's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Bubble Citea", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "Burger King", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Caffè Nero", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Chaiiwala", category: "Cafes & Restaurants", subcategory: "Cafe" },
    { name: "Cornish Bakery", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Costa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Cosy Club", category: "Cafes & Restaurants", subcategory: "Restaurant Bar" },
    { name: "Giovanni's Gelato", category: "Cafes & Restaurants", subcategory: "Ice Cream" },
    { name: "Greggs", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "H Beauty Champagne Bar", category: "Cafes & Restaurants", subcategory: "Bar" },
    { name: "itsu", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "KFC", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Krispy Kreme", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "McDonald's", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Mr Pretzel", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Nando's", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Ned's Noodle Bar", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "ORI Caffè", category: "Cafes & Restaurants", subcategory: "Cafe" },
    { name: "Pho", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pizza Express", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pizza Hut", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pret a Manger", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Shakeaway", category: "Cafes & Restaurants", subcategory: "Milkshake Bar" },
    { name: "Starbucks", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "The Place to Eat", category: "Cafes & Restaurants", subcategory: "Food Court" },
    { name: "VBubble", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "Wagamama", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "YO! Sushi", category: "Cafes & Restaurants", subcategory: "Restaurant" },
];

// ============================================================
// Location metadata
// ============================================================

async function enrichLocation() {
    console.log("🔄 Updating centre:mk metadata...");
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            website: "https://www.centremk.com",
            phone: "01908 678123",
            numberOfStores: tenants.length,
            retailers: tenants.length,
            openedYear: 1979,
            totalFloorArea: 1000000,
            retailSpace: 1000000,
            numberOfFloors: 2,
            parkingSpaces: 1400,
            carParkPrice: 0,
            owner: "Federated Hermes / Royal London Asset Management",
            management: "Federated Hermes",
            anchorTenants: tenants.filter((t) => t.isAnchorTenant).length,
            openingHours: { "Mon-Fri": "10:00-21:00", Sat: "09:00-20:00", Sun: "11:00-17:00" },
            publicTransit:
                "Milton Keynes Central station (10-min walk, West Coast Main Line). Multiple Arriva bus routes to centre. Adjacent to CMK bus stops.",
            footfall: 21400000,
            heroImage:
                "https://cdn.centremk.com/media/s41pg4ey/leasing-banner.jpg",
            evCharging: true,
            evChargingSpaces: 24,
            instagram: "https://www.instagram.com/centremk/",
            facebook: "https://www.facebook.com/centremk",
            twitter: "https://twitter.com/centremk",
            googleRating: 4.3,
            googleReviews: 35000,
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
            openedYear: true,
            owner: true,
            management: true,
            parkingSpaces: true,
            numberOfFloors: true,
            footfall: true,
            retailSpace: true,
            heroImage: true,
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
        console.log(`   Footfall: ${loc.footfall} | Retail Space: ${loc.retailSpace}`);
        console.log(`   Hero Image: ${loc.heroImage ? "✅ Set" : "❌ Missing"}`);
        console.log(`   Management: ${loc.management}`);
        console.log(
            `   Largest: ${loc.largestCategory} (${((Number(loc.largestCategoryPercent) || 0) * 100).toFixed(1)}%)`
        );
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
    console.log("  centre:mk — Full Enrichment — Feb 2026");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocation();
    await insertTenants();
    await updateLargestCategory();
    await verify();

    console.log("\n✅ centre:mk enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
