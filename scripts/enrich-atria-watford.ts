/**
 * Atria Watford — Full Enrichment
 *
 * Major shopping centre in Watford, Hertfordshire.
 * Formerly known as Harlequin Centre, then intu Watford.
 * Rebranded to Atria Watford in 2020 after intu's collapse.
 * 140+ stores across 3 floors, plus leisure and dining.
 * Opened 1992, owned by Coconut Bidco Ltd (consortium).
 *
 * Sources:
 *   - harlequinwatford.com/store-sitemap.xml (tenants)
 *   - Wikipedia, press releases (metadata)
 *
 * Run: npx tsx scripts/enrich-atria-watford.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCATION_ID = "cmid0kph201iqmtpurqm3vuty";

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

// ============================================================
// Tenants extracted from harlequinwatford.com/store-sitemap.xml
// Categories use canonical LDC 3-Tier Taxonomy
// ============================================================

const tenants: TenantInput[] = [
    // === ANCHORS / DEPARTMENT STORES ===
    { name: "Primark", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Marks & Spencer", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "Next", category: "Clothing & Footwear", subcategory: "Mid-Range", isAnchorTenant: true },
    { name: "Zara", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "H&M", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "TK Maxx", category: "Clothing & Footwear", subcategory: "Off-Price", isAnchorTenant: true },
    { name: "Apple", category: "Electrical & Technology", subcategory: "Consumer Electronics", isAnchorTenant: true },
    { name: "JD Sports", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "Flannels", category: "Clothing & Footwear", subcategory: "Designer", isAnchorTenant: true },
    { name: "Cineworld", category: "Leisure & Entertainment", subcategory: "Cinema", isAnchorTenant: true },
    { name: "B&M", category: "General Retail", subcategory: "Variety Store", isAnchorTenant: true },
    { name: "Sports Direct", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "Dunelm", category: "Home & Garden", subcategory: "Homeware", isAnchorTenant: true },

    // === CLOTHING & FOOTWEAR ===
    { name: "Accessorize", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "Ann Summers", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Bonmarché", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Boss", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Boux Avenue", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Clarks", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Deichmann", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Fat Face", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Foot Locker", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Footasylum", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Hobbs", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Hollister", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Klass", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Kurt Geiger", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Levi's", category: "Clothing & Footwear", subcategory: "Denim" },
    { name: "Mango", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Moss", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Office", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Peacocks", category: "Clothing & Footwear", subcategory: "Value Fashion" },
    { name: "Phase Eight", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Prince Menswear", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Quiz", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "River Island", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Schuh", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Skechers", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Suit Direct", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Superdry", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Uniqlo", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Victoria's Secret", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "White Stuff", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Yours Clothing", category: "Clothing & Footwear", subcategory: "Plus Size" },
    { name: "Wolf", category: "Clothing & Footwear", subcategory: "Menswear" },

    // === JEWELLERY & WATCHES ===
    { name: "Ernest Jones", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "F. Hinds", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Finecraft Jewellery", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Goldsmiths", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "H. Samuel", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Lovisa", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Pandora", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Rolex at Goldsmiths", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Swarovski", category: "Jewellery & Watches", subcategory: "Crystal Jewellery" },
    { name: "Tag Heuer", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Thomas Sabo", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Warren James", category: "Jewellery & Watches", subcategory: "Jewellery" },

    // === HEALTH & BEAUTY ===
    { name: "Adorn Beauty", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Aura Tanning & Beauty", category: "Health & Beauty", subcategory: "Tanning" },
    { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Community Eyecare", category: "Health & Beauty", subcategory: "Optician" },
    { name: "David Clulow", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Esla Barbers", category: "Health & Beauty", subcategory: "Barber" },
    { name: "Herbal Inn", category: "Health & Beauty", subcategory: "Wellness" },
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "L'Occitane", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "Lush", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "MAC", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Regis", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Body Care" },
    { name: "Rush Hair", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Sunnamusk", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "The Body Shop", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "The Fragrance Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Therapie", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Toni & Guy", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Vision Express", category: "Health & Beauty", subcategory: "Optician" },

    // === ELECTRICAL & TECHNOLOGY ===
    { name: "EE", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "GAME", category: "Electrical & Technology", subcategory: "Gaming Retail" },
    { name: "HMV", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "Mobile Bitz", category: "Electrical & Technology", subcategory: "Mobile Repair" },
    { name: "O2", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Sky", category: "Electrical & Technology", subcategory: "Telecoms" },
    { name: "Three", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Vodafone", category: "Electrical & Technology", subcategory: "Mobile Network" },

    // === HOME & GARDEN ===
    { name: "Lakeland", category: "Home & Garden", subcategory: "Kitchenware" },
    { name: "Melbe Home", category: "Home & Garden", subcategory: "Homeware" },
    { name: "Oliver Bonas", category: "Home & Garden", subcategory: "Home & Lifestyle" },
    { name: "ProCook", category: "Home & Garden", subcategory: "Kitchenware" },
    { name: "Vanilla", category: "Home & Garden", subcategory: "Home Fragrance" },

    // === GIFTS & STATIONERY ===
    { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Claire's", category: "Gifts & Stationery", subcategory: "Gifts" },
    { name: "Flying Tiger Copenhagen", category: "Gifts & Stationery", subcategory: "Variety Store" },
    { name: "Miniso", category: "Gifts & Stationery", subcategory: "Variety Store" },
    { name: "Ryman", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "Smiggle", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
    { name: "WHSmith", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
    { name: "Warhammer", category: "Gifts & Stationery", subcategory: "Specialist" },

    // === FOOD & GROCERY ===
    { name: "Hotel Chocolat", category: "Food & Grocery", subcategory: "Chocolate Shop" },
    { name: "Krispy Kreme", category: "Food & Grocery", subcategory: "Bakery" },
    { name: "M&S Café", category: "Food & Grocery", subcategory: "Café" },

    // === KIDS & TOYS ===
    { name: "The Entertainer", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "Character.com", category: "Kids & Toys", subcategory: "Character Merchandise" },
    { name: "Millie & Moo Friends", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "Explore Learning", category: "Kids & Toys", subcategory: "Education" },
    { name: "Gymboree", category: "Kids & Toys", subcategory: "Play Centre" },

    // === CAFES & RESTAURANTS ===
    { name: "Auntie Anne's", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "BB's Coffee & Muffins", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Black Sheep Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Bubble CiTea", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "Burger King", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Cassio Lounge", category: "Cafes & Restaurants", subcategory: "Bar & Restaurant" },
    { name: "Chaiiwala", category: "Cafes & Restaurants", subcategory: "Café" },
    { name: "Costa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Fuel Juice Bar", category: "Cafes & Restaurants", subcategory: "Juice Bar" },
    { name: "Haute Dolci", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Jamaica Blue", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Joe & The Juice", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "KaKa Asian Food & Drink", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Las Iguanas", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Love Churros", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Mooboo Bubble Tea", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "Muffin Break", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Ocean Bells Coffee Company", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Pizza Express", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Popeyes", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Starbucks", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "TGI Friday's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Tikka Nation", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Tortilla", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "YO! Sushi", category: "Cafes & Restaurants", subcategory: "Fast Casual" },

    // === LEISURE & ENTERTAINMENT ===
    { name: "Boom Battle Bar", category: "Leisure & Entertainment", subcategory: "Social Gaming" },
    { name: "Escape Hunt", category: "Leisure & Entertainment", subcategory: "Escape Room" },
    { name: "Flip Out", category: "Leisure & Entertainment", subcategory: "Trampoline Park" },
    { name: "Hollywood Bowl", category: "Leisure & Entertainment", subcategory: "Bowling" },
    { name: "Puttshack", category: "Leisure & Entertainment", subcategory: "Mini Golf" },
    { name: "Rock Up", category: "Leisure & Entertainment", subcategory: "Climbing" },

    // === SERVICES ===
    { name: "Eurochange", category: "Financial Services", subcategory: "Currency Exchange" },
    { name: "Lloyds Bank", category: "Financial Services", subcategory: "Bank" },
    { name: "Rolstons Estate Agents", category: "Services", subcategory: "Estate Agent" },
    { name: "Tailor & Co", category: "Services", subcategory: "Alterations" },
    { name: "The Car Wash Co", category: "Services", subcategory: "Car Wash" },
    { name: "The Florist", category: "Services", subcategory: "Florist" },
    { name: "Timpson", category: "Services", subcategory: "Shoe Repair" },
    { name: "Poundland", category: "General Retail", subcategory: "Variety Store" },
    { name: "Mamas & Papas (inside Next)", category: "Clothing & Footwear", subcategory: "Childrenswear" },
    { name: "Watford FC", category: "General Retail", subcategory: "Specialist" },

    // === MISCELLANEOUS ===
    { name: "Choice", category: "Services", subcategory: "Specialist" },
];

// ============================================================
// Location metadata
// ============================================================

async function enrichLocation() {
    console.log("🔄 Enriching Atria Watford metadata...");
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            website: "https://harlequinwatford.com",
            phone: "01923 250292",
            openingHours: { "Mon-Sat": "09:00-21:00", Sun: "11:00-17:00" },
            parkingSpaces: 2773,
            retailSpace: 700000,
            numberOfStores: tenants.length,
            retailers: tenants.length,
            numberOfFloors: 3,
            anchorTenants: 13,
            publicTransit:
                "Watford Junction station (5 min walk, Avanti West Coast & London Overground). Watford High Street station (10 min). Multiple bus routes. M1 J5 and M25 J19/20 nearby.",
            owner: "Coconut Bidco Ltd (consortium)",
            management: "Global Mutual",
            openedYear: 1992,
            footfall: 20000000,
            heroImage:
                "https://harlequinwatford.com/wp-content/uploads/2025/11/Harlequin_Watford-CGI-V2-576x384.jpg",
            evCharging: true,
            evChargingSpaces: 24,
            carParkPrice: 0,
            instagram: "https://www.instagram.com/atriawatford",
            facebook: "https://www.facebook.com/atriaWatford",
            googleRating: 4.2,
            googleReviews: 17000,
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
    console.log("  Atria Watford — Full Enrichment");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocation();
    await insertTenants();
    await updateLargestCategory();
    await verify();

    console.log("\n✅ Atria Watford enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
