/**
 * Braehead Shopping Centre — Full Enrichment (LDC Taxonomy)
 *
 * Major shopping centre in Renfrew, near Glasgow.
 * 120+ stores, opened 1999, acquired by Frasers Group Nov 2025.
 *
 * Sources:
 *   - braehead.co.uk/store-sitemap.xml (tenant list, Feb 2026)
 *   - Wikipedia, press releases (metadata)
 *
 * Run: npx tsx scripts/enrich-braehead.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCATION_ID = "cmid0kq8y01jkmtpuda2z6obv";

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

const tenants: TenantInput[] = [
    // --- Anchors ---
    { name: "Marks & Spencer", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "Primark", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "H&M", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Next", category: "Clothing & Footwear", subcategory: "Mid-Range", isAnchorTenant: true },
    { name: "Next Home", category: "Home & Garden", subcategory: "Homeware", isAnchorTenant: true },
    { name: "JD Sports", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "Sports Direct", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "Apple", category: "Electrical & Technology", subcategory: "Consumer Electronics", isAnchorTenant: true },
    { name: "Flannels", category: "Clothing & Footwear", subcategory: "Designer", isAnchorTenant: true },
    { name: "TK Maxx", category: "Clothing & Footwear", subcategory: "Value", isAnchorTenant: true },
    { name: "Currys PC World", category: "Electrical & Technology", subcategory: "Consumer Electronics", isAnchorTenant: true },

    // --- Clothing & Footwear ---
    { name: "Ann Summers", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Castore", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "Claire's", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "Clarks", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Deichmann Shoes", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Footasylum", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "GAP", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Hollister", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Jack & Jones", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Kiddie Boutique by Claire", category: "Clothing & Footwear", subcategory: "Kidswear" },
    { name: "Mango", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Office", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Phase Eight", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Quiz Clothing", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Remus Uomo", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "River Island", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "River Island Kids", category: "Clothing & Footwear", subcategory: "Kidswear" },
    { name: "Schuh", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Schuh Kids", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "The Celtic Store", category: "Clothing & Footwear", subcategory: "Sport Merchandise" },
    { name: "Trespass", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "USC", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Yours Clothing", category: "Clothing & Footwear", subcategory: "Plus Size" },

    // --- Health & Beauty ---
    { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "BPerfect", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Brows & Beauty", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Guy Beard Barbers", category: "Health & Beauty", subcategory: "Barber" },
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "KIKO Milano", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Lush", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "M&S Optician", category: "Health & Beauty", subcategory: "Optician" },
    { name: "MAC", category: "Health & Beauty", subcategory: "Premium Cosmetics" },
    { name: "Now Brows", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Now Nails", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "Pop Specs", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Body Care" },
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "The Fragrance Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Thérapie Clinic", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Vision Express", category: "Health & Beauty", subcategory: "Optician" },

    // --- Jewellery & Watches ---
    { name: "Beaverbrooks", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Ernest Jones", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Goldsmiths", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "H. Samuel", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Lovisa", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Nomination", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Pandora", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Swarovski", category: "Jewellery & Watches", subcategory: "Crystal Jewellery" },
    { name: "Thomas Sabo", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Warren James", category: "Jewellery & Watches", subcategory: "Jewellery" },

    // --- Electrical & Technology ---
    { name: "EE", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Fone Xtras", category: "Electrical & Technology", subcategory: "Mobile Accessories" },
    { name: "Fone Xtras (Kiosk)", category: "Electrical & Technology", subcategory: "Mobile Accessories" },
    { name: "GAME", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "HMV", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "O2", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Sky Kiosk", category: "Electrical & Technology", subcategory: "Telecoms" },
    { name: "Three", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Vodafone", category: "Electrical & Technology", subcategory: "Mobile Network" },

    // --- Home & Garden ---
    { name: "Dobbies", category: "Home & Garden", subcategory: "Garden Centre" },
    { name: "Harry Corry", category: "Home & Garden", subcategory: "Homeware" },
    { name: "Noah Home and Gifts", category: "Home & Garden", subcategory: "Gifts & Homeware" },
    { name: "Pagazzi", category: "Home & Garden", subcategory: "Homeware" },
    { name: "Yankee Candle", category: "Home & Garden", subcategory: "Home Fragrance" },

    // --- Gifts & Stationery ---
    { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Heart & Scent", category: "Gifts & Stationery", subcategory: "Gifts" },
    { name: "Henney Bear", category: "Gifts & Stationery", subcategory: "Gifts" },
    { name: "Menkind", category: "Gifts & Stationery", subcategory: "Gadgets & Gifts" },
    { name: "Smiggle", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
    { name: "Waterstones", category: "Gifts & Stationery", subcategory: "Books" },

    // --- General Retail ---
    { name: "Argos", category: "General Retail", subcategory: "Variety Store" },
    { name: "Flying Tiger", category: "General Retail", subcategory: "Variety Store" },
    { name: "Halfords", category: "General Retail", subcategory: "Automotive" },
    { name: "MINISO", category: "General Retail", subcategory: "Variety Store" },
    { name: "Poundland", category: "General Retail", subcategory: "Discount Store" },
    { name: "E-Vapes", category: "General Retail", subcategory: "Vape Shop" },
    { name: "Designer Rooms", category: "General Retail", subcategory: "Specialist" },

    // --- Kids & Toys ---
    { name: "Build-A-Bear Workshop", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "The Entertainer", category: "Kids & Toys", subcategory: "Toy Store" },

    // --- Food & Grocery ---
    { name: "Hotel Chocolat", category: "Food & Grocery", subcategory: "Chocolate Shop" },
    { name: "Sainsbury's", category: "Food & Grocery", subcategory: "Supermarket" },

    // --- Cafes & Restaurants ---
    { name: "Batch'd", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Boca10", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Caffè Nero", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Chopstix", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Costa", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Filling Station", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Five Guys", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Fuel Juice Bar", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Greggs", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Jamaica Blue", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Krispy Kreme", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "McDonald's (Centre)", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "McDonald's (Retail Park)", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Millie's Cookies", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Nando's", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Pizza Hut", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Popeyes", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Prezzo", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Social Blend", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Stack & Still", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Starbucks", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Subway", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "YO! Sushi", category: "Cafes & Restaurants", subcategory: "Restaurant" },

    // --- Leisure & Entertainment ---
    { name: "Braehead Arena", category: "Leisure & Entertainment", subcategory: "Arena" },
    { name: "Glasgow Clan", category: "Leisure & Entertainment", subcategory: "Sport Merchandise" },
    { name: "Hidden Hideout", category: "Leisure & Entertainment", subcategory: "Escape Room" },
    { name: "Ice Centre", category: "Leisure & Entertainment", subcategory: "Ice Skating" },

    // --- Services ---
    { name: "Barrhead Travel", category: "Services", subcategory: "Travel Agency" },
    { name: "Hays Travel", category: "Services", subcategory: "Travel Agency" },
    { name: "Shopmobility", category: "Services", subcategory: "Community" },
    { name: "The Car Wash Company", category: "Services", subcategory: "Car Wash" },
    { name: "Timpson", category: "Services", subcategory: "Shoe Repair" },
    { name: "TUI", category: "Services", subcategory: "Travel Agency" },
    { name: "Virgin Holidays", category: "Services", subcategory: "Travel Agency" },
    { name: "We Buy Any Car", category: "Services", subcategory: "Automotive" },

    // --- Financial Services ---
    { name: "Eurochange", category: "Financial Services", subcategory: "Currency Exchange" },
    { name: "Eurochange (Kiosk)", category: "Financial Services", subcategory: "Currency Exchange" },
];

// ============================================================
// Location metadata
// ============================================================

async function enrichLocation() {
    console.log("🔄 Enriching Braehead metadata...");
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            heroImage:
                "https://www.theindustry.fashion/wp-content/uploads/2022/06/Brahead.jpg",
            website: "https://braehead.co.uk",
            phone: "0141 885 1441",
            openingHours: { "Mon-Fri": "10:00-21:00", Sat: "09:00-19:00", Sun: "10:00-18:00" },
            parkingSpaces: 6500,
            retailSpace: 1100000,
            numberOfStores: tenants.length,
            retailers: tenants.length,
            numberOfFloors: 2,
            anchorTenants: 11,
            publicTransit:
                "Braehead bus services from Glasgow city centre (20 min). McGill's bus routes. No direct rail — nearest station Cardonald/Hillington.",
            owner: "Frasers Group",
            management: "Frasers Group",
            openedYear: 1999,
            footfall: 15000000,
            evCharging: true,
            evChargingSpaces: 16,
            carParkPrice: 0,
            instagram: "https://www.instagram.com/braeheadcentre",
            facebook: "https://www.facebook.com/BraeheadCentre",
            googleRating: 4.2,
            googleReviews: 20000,
            totalFloorArea: 1100000,
        },
    });
    console.log("  ✅ Location metadata updated");
}

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

async function main() {
    console.log("═══════════════════════════════════════════════");
    console.log("  Braehead — Full Enrichment");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocation();
    await insertTenants();
    await updateLargestCategory();
    await verify();

    console.log("\n✅ Braehead enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
