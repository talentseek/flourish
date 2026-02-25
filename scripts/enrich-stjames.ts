/**
 * St James Quarter — Full Enrichment
 *
 * Edinburgh's premier lifestyle destination. Opened June 24, 2021.
 * 850,000 sqft of retail across multiple levels including a food hall (Bonnie & Wild).
 * Owned by APG Asset Management (75%) + Unibail-Rodamco-Westfield (25%).
 * Expected to rebrand as Westfield in 2026.
 *
 * Sources:
 *   - stjamesquarter.com/shop-sitemap.xml + /dine-sitemap.xml (tenants)
 *   - Wikipedia, press releases, retail-week.com (metadata)
 *
 * Run: npx tsx scripts/enrich-stjames.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCATION_ID = "cmid0l0bc01tvmtpucxv3rzk5";

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

// ============================================================
// Tenants extracted from stjamesquarter.com sitemaps
// Categories use canonical LDC 3-Tier Taxonomy
// ============================================================

const tenants: TenantInput[] = [
    // === ANCHORS / DEPARTMENT STORES ===
    { name: "John Lewis", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "Zara", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "H&M", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Next", category: "Clothing & Footwear", subcategory: "Mid-Range", isAnchorTenant: true },
    { name: "JD Sports", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },

    // === CLOTHING & FOOTWEAR ===
    { name: "Bershka", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Boss", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Calvin Klein", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Carvela", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Coach", category: "Clothing & Footwear", subcategory: "Bags & Accessories" },
    { name: "COS", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "Dune London", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Hollister", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Kate Spade", category: "Clothing & Footwear", subcategory: "Bags & Accessories" },
    { name: "Kurt Geiger", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Levi's", category: "Clothing & Footwear", subcategory: "Denim" },
    { name: "Mango", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Moss", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "New Balance", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Nordic Outdoor", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "& Other Stories", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "Polo Ralph Lauren", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Pull&Bear", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Reiss", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Russell & Bromley", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Schuh", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Stradivarius", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Tommy Hilfiger", category: "Clothing & Footwear", subcategory: "Designer" },

    // === JEWELLERY & WATCHES ===
    { name: "Beaverbrooks", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Breitling", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Goldsmiths", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Pandora", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Swarovski", category: "Jewellery & Watches", subcategory: "Crystal Jewellery" },

    // === HEALTH & BEAUTY ===
    { name: "Aesop", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "Away Spa", category: "Health & Beauty", subcategory: "Spa" },
    { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Boots Optician", category: "Health & Beauty", subcategory: "Optician" },
    { name: "H Beauty", category: "Health & Beauty", subcategory: "Premium Cosmetics" },
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "IOLLA", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Kiehl's", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "L'Occitane", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "Molton Brown", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "NEOM", category: "Health & Beauty", subcategory: "Wellness" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Body Care" },
    { name: "Space NK", category: "Health & Beauty", subcategory: "Premium Cosmetics" },
    { name: "Sunglass Hut", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "The Body Shop", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Therapie Clinic", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Townhouse Nailcare", category: "Health & Beauty", subcategory: "Nail Salon" },

    // === FOOD & GROCERY ===
    { name: "Hotel Chocolat", category: "Food & Grocery", subcategory: "Chocolate Shop" },
    { name: "Nespresso Boutique", category: "Food & Grocery", subcategory: "Deli" },

    // === ELECTRICAL & TECHNOLOGY ===
    { name: "EE", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Miele", category: "Electrical & Technology", subcategory: "Home Appliances" },
    { name: "Mobilise", category: "Electrical & Technology", subcategory: "Mobile Repair" },
    { name: "O2", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Samsung", category: "Electrical & Technology", subcategory: "Consumer Electronics" },
    { name: "Sky", category: "Electrical & Technology", subcategory: "Telecoms" },
    { name: "Three", category: "Electrical & Technology", subcategory: "Mobile Network" },

    // === GIFTS & STATIONERY ===
    { name: "Clarendon Fine Art", category: "Gifts & Stationery", subcategory: "Art Gallery" },
    { name: "Moleskine", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "Rarity", category: "Gifts & Stationery", subcategory: "Gifts" },
    { name: "Ryman Design", category: "Gifts & Stationery", subcategory: "Stationery" },

    // === KIDS & TOYS ===
    { name: "LEGO Store", category: "Kids & Toys", subcategory: "Toy Store" },

    // === SERVICES ===
    { name: "Europcar", category: "Services", subcategory: "Travel Agency" },

    // === FINANCIAL SERVICES ===
    { name: "Bank of Scotland", category: "Financial Services", subcategory: "Bank" },

    // === CAFES & RESTAURANTS (from dine sitemap) ===
    { name: "Artisan Roast", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Black Sheep Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Bonnie & Wild", category: "Cafes & Restaurants", subcategory: "Food Hall" },
    { name: "Bowl Out", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Bubbleology", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "Cala Cala", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Chooks", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Creel Caught", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "CUPP", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "Duck & Waffle", category: "Cafes & Restaurants", subcategory: "Premium Casual" },
    { name: "East Pizzas", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "El Perro Negro", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Five Guys", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Flight Club", category: "Cafes & Restaurants", subcategory: "Bar" },
    { name: "German Doner Kebab", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Gordon Ramsay", category: "Cafes & Restaurants", subcategory: "Premium Casual" },
    { name: "Haute Dolci", category: "Cafes & Restaurants", subcategory: "Dessert Shop" },
    { name: "Itsu", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "João's Place", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Joelato", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Ka Pao", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Kochchi", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Krispy Kreme", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Lazeez Street Food", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Leith Woks", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Maki Ramen", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Mor Bakehouse", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Oakberry", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Pho", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pizza Geeks", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pret A Manger", category: "Cafes & Restaurants", subcategory: "Sandwich Shop" },
    { name: "Salerno Pizza", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Salt & Chilli Oriental", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Slumdog Indian", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Soup & Caboodle", category: "Cafes & Restaurants", subcategory: "Cafe" },
    { name: "Stack & Still", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Starbucks", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Sushi Samba", category: "Cafes & Restaurants", subcategory: "Premium Casual" },
    { name: "Thai Express Kitchen", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "The Alchemist", category: "Cafes & Restaurants", subcategory: "Restaurant Bar" },
    { name: "The Botanist", category: "Cafes & Restaurants", subcategory: "Restaurant Bar" },
    { name: "The Real Greek", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Tortilla", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "W Lounge", category: "Cafes & Restaurants", subcategory: "Bar" },
    { name: "Wingstop", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
];

// ============================================================
// Location metadata
// ============================================================

async function enrichLocation() {
    console.log("🔄 Enriching St James Quarter metadata...");
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            website: "https://stjamesquarter.com",
            phone: "0131 526 9050",
            openingHours: { "Mon-Wed": "10:00-19:00", "Thu": "10:00-20:00", "Fri-Sat": "10:00-19:00", Sun: "11:00-18:00" },
            parkingSpaces: 1600,
            retailSpace: 850000,
            numberOfStores: tenants.length,
            retailers: tenants.length,
            numberOfFloors: 4,
            anchorTenants: 5,
            publicTransit:
                "Edinburgh Waverley station 5-min walk. Edinburgh Bus Station adjacent. Multiple Lothian bus routes. Princes Street tram stop nearby.",
            owner: "APG Asset Management (75%) / URW (25%)",
            management: "Unibail-Rodamco-Westfield",
            openedYear: 2021,
            footfall: 20000000,
            heroImage:
                "https://redwoodcomms.co.uk/wp-content/uploads/2025/02/Edinburgh-Imagery.jpg",
            evCharging: true,
            evChargingSpaces: 40,
            carParkPrice: 3.50,
            instagram: "https://www.instagram.com/stjamesquarter/",
            facebook: "https://www.facebook.com/StJamesQuarter/",
            twitter: "https://twitter.com/StJamesQuarter",
            googleRating: 4.4,
            googleReviews: 12000,
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
            _count: { select: { tenants: true } },
        },
    });

    if (loc) {
        console.log(`📍 ${loc.name}`);
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
    console.log("  St James Quarter — Full Enrichment");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocation();
    await insertTenants();
    await updateLargestCategory();
    await verify();

    console.log("\n✅ St James Quarter enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
