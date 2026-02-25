/**
 * The Trafford Centre — Full Enrichment
 *
 * One of the UK's largest shopping centres. 200+ stores, 60+ restaurants.
 * Opened 1998, owned by CPPIB (Canada Pension Plan Investment Board).
 *
 * Sources:
 *   - traffordcentre.co.uk/shop_page-sitemap.xml (tenant list)
 *   - Wikipedia, press releases, web search (metadata)
 *   - TripAdvisor (hero image, per user instruction)
 *
 * Run: npx tsx scripts/enrich-trafford-centre.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCATION_ID = "cmid0l57b01yymtpukrln8bvy";

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

// ============================================================
// Tenants extracted from traffordcentre.co.uk sitemap
// Categories use canonical LDC 3-Tier Taxonomy
// ============================================================

const tenants: TenantInput[] = [
    // --- Department Stores / Anchors ---
    { name: "Selfridges & Co", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "John Lewis & Partners", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "M&S", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "Next", category: "Clothing & Footwear", subcategory: "Mid-Range", isAnchorTenant: true },
    { name: "Zara", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "H&M", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Apple", category: "Electrical & Technology", subcategory: "Consumer Electronics", isAnchorTenant: true },
    { name: "JD Sports", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },

    // --- Clothing & Footwear ---
    { name: "All Saints", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "Ann Summers", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Abercrombie & Fitch", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Arne", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Bershka", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Boss", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Boux Avenue", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Calvin Klein", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Carvela", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Charles Tyrwhitt", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Dune London", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Fat Face", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Foot Locker", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Footasylum", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Gap", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Gymshark", category: "Clothing & Footwear", subcategory: "Activewear" },
    { name: "Hobbs", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Hollister Co.", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Jack & Jones", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Khaadi", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Kurt Geiger", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Lacoste", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Levi's", category: "Clothing & Footwear", subcategory: "Denim" },
    { name: "Lounge", category: "Clothing & Footwear", subcategory: "Loungewear" },
    { name: "Lululemon", category: "Clothing & Footwear", subcategory: "Activewear" },
    { name: "Mango", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Michael Kors", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Moss", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "New Balance", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Office", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Pull&Bear", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Quiz", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Reiss", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "River Island", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Schuh", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Schuh Kids", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Skechers", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Stradivarius", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "The North Face", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Timberland", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Tommy Hilfiger", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Trailberg", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Urban Outfitters", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Vans", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Victoria's Secret", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Accessorize", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "East Street", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Alexander Brown", category: "Clothing & Footwear", subcategory: "Menswear" },

    // --- Jewellery & Watches ---
    { name: "Pandora", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Ernest Jones", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Swarovski", category: "Jewellery & Watches", subcategory: "Crystal Jewellery" },
    { name: "Beaverbrooks", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "F. Hinds Jewellers", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "H. Samuel", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Lovisa", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Thomas Sabo", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Cartier", category: "Jewellery & Watches", subcategory: "Jewellery", isAnchorTenant: true },
    { name: "Rolex at Goldsmiths", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Omega", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Tag Heuer Boutique", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Hublot", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Breitling", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Goldsmiths (Dome)", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Goldsmiths (Regent)", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Swatch", category: "Jewellery & Watches", subcategory: "Watches" },
    { name: "The Watch Lab", category: "Jewellery & Watches", subcategory: "Watch Repair" },
    { name: "Time Piece", category: "Jewellery & Watches", subcategory: "Watches" },

    // --- Health & Beauty ---
    { name: "Sephora", category: "Health & Beauty", subcategory: "Premium Cosmetics", isAnchorTenant: true },
    { name: "Space NK", category: "Health & Beauty", subcategory: "Premium Cosmetics" },
    { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Lush", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Kiko Milano", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Body Care" },
    { name: "The Fragrance Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Molton Brown", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Bath & Body Works", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "L'Occitane en Provence", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "Maison Dior", category: "Health & Beauty", subcategory: "Premium Cosmetics" },
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "Therapie Clinic", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Brows", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Andrew Collinge", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Opatra", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "itreat Skin", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "PureSeoul", category: "Health & Beauty", subcategory: "K-Beauty" },
    { name: "Oh You Pretty Things", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Sunnamusk", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Candles & Oud", category: "Health & Beauty", subcategory: "Home Fragrance" },
    { name: "PYT", category: "Health & Beauty", subcategory: "Hair Care" },
    { name: "H2O", category: "Health & Beauty", subcategory: "Skincare" },

    // --- Health & Beauty — Eyewear ---
    { name: "Sunglass Hut", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Luxottica", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Vision Express", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Optical Express", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Pop Specs", category: "Health & Beauty", subcategory: "Eyewear" },

    // --- Cafes & Restaurants ---
    { name: "Wagamama", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Nando's", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Five Guys", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Wingstop", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Slim Chickens", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "PizzaExpress", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pizza Hut", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Franco Manca", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "GBK", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "The Real Greek", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Las Iguanas", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Zizzi", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Bill's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "TGI's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "San Carlo", category: "Cafes & Restaurants", subcategory: "Premium Casual" },
    { name: "Est. Italian", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Tampopo", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Thaikhun", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Hello Oriental", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Hop Vietnamese Street Eats", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Pesto", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Coast to Coast", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "All Bar One", category: "Cafes & Restaurants", subcategory: "Bar" },
    { name: "Wetherspoon", category: "Cafes & Restaurants", subcategory: "Pub" },
    { name: "McDonald's", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "KFC", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Burger King", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Chopstix", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Barburrito", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Chit 'N' Chaat", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Jerk Junction", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Tru Street", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Itsu", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "YO!", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Greggs", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Pret A Manger", category: "Cafes & Restaurants", subcategory: "Sandwich Shop" },
    { name: "Starbucks", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Costa", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Caffè Nero", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Joe & The Juice", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Blank Street", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Chaiiwala", category: "Cafes & Restaurants", subcategory: "Tea Shop" },
    { name: "Blanchflower", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Haute Dolci", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Krispy Kreme", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Millie's Cookies", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Ben's Cookies", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "My Cookie Dough", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "The Shake Lab", category: "Cafes & Restaurants", subcategory: "Milkshake Bar" },
    { name: "Snowflake", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Bubbleology", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "Boost", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "The Plant Blend", category: "Cafes & Restaurants", subcategory: "Cafe" },
    { name: "Batch'd", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Rolled", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Eggfree Cake Box", category: "Cafes & Restaurants", subcategory: "Bakery" },

    // --- Food & Grocery ---
    { name: "Nespresso", category: "Food & Grocery", subcategory: "Deli" },
    { name: "Whittard", category: "Food & Grocery", subcategory: "Deli" },
    { name: "Läderach", category: "Food & Grocery", subcategory: "Chocolatier" },
    { name: "Hotel Chocolat", category: "Food & Grocery", subcategory: "Chocolate Shop" },
    { name: "Haribo", category: "Food & Grocery", subcategory: "Confectionery" },
    { name: "Kingdom of Sweets", category: "Food & Grocery", subcategory: "Sweet Shop" },
    { name: "Archie's", category: "Food & Grocery", subcategory: "Confectionery" },
    { name: "JOOS", category: "Food & Grocery", subcategory: "Convenience Store" },

    // --- Electrical & Technology ---
    { name: "Samsung", category: "Electrical & Technology", subcategory: "Consumer Electronics" },
    { name: "Dyson", category: "Electrical & Technology", subcategory: "Home Appliances" },
    { name: "Sky", category: "Electrical & Technology", subcategory: "Telecoms" },
    { name: "Three", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "O2", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Vodafone", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "EE", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Mobilise", category: "Electrical & Technology", subcategory: "Mobile Accessories" },

    // --- Home & Garden ---
    { name: "Next Home", category: "Home & Garden", subcategory: "Homeware" },
    { name: "H&M Home", category: "Home & Garden", subcategory: "Homeware" },
    { name: "The White Company", category: "Home & Garden", subcategory: "Home & Lifestyle" },
    { name: "ProCook", category: "Home & Garden", subcategory: "Kitchenware" },

    // --- Gifts & Stationery ---
    { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Clintons", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Waterstones", category: "Gifts & Stationery", subcategory: "Books" },
    { name: "WHSmith", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
    { name: "Smiggle", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "Nichi", category: "Gifts & Stationery", subcategory: "Gifts" },
    { name: "Claire's", category: "Gifts & Stationery", subcategory: "Gifts" },
    { name: "The Music Store", category: "Gifts & Stationery", subcategory: "Music Merchandise" },
    { name: "Legends of Memorabilia", category: "Gifts & Stationery", subcategory: "Souvenirs" },

    // --- General Retail ---
    { name: "Miniso", category: "General Retail", subcategory: "Variety Store" },
    { name: "Flying Tiger", category: "General Retail", subcategory: "Variety Store" },
    { name: "Kenji", category: "General Retail", subcategory: "Variety Store" },
    { name: "Menkind", category: "General Retail", subcategory: "Specialist" },
    { name: "Vuse", category: "General Retail", subcategory: "Vape Shop" },
    { name: "Pop Mart", category: "General Retail", subcategory: "Specialist" },

    // --- Kids & Toys ---
    { name: "LEGO Store", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "Toys R Us", category: "Kids & Toys", subcategory: "Toy Store", isAnchorTenant: true },
    { name: "Build-A-Bear Workshop", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "Mamas & Papas", category: "Kids & Toys", subcategory: "Kidswear" },
    { name: "Manchester City", category: "Kids & Toys", subcategory: "Toys" },

    // --- Leisure & Entertainment ---
    { name: "Odeon", category: "Leisure & Entertainment", subcategory: "Cinema", isAnchorTenant: true },
    { name: "Namco Funscape", category: "Leisure & Entertainment", subcategory: "Arcade" },
    { name: "Paradise Island Adventure Golf", category: "Leisure & Entertainment", subcategory: "Mini Golf" },
    { name: "Laser Quest", category: "Leisure & Entertainment", subcategory: "Adventure" },

    // --- Services ---
    { name: "TUI", category: "Services", subcategory: "Travel Agency" },
    { name: "Virgin Holidays", category: "Services", subcategory: "Travel Agency" },
    { name: "Kuoni", category: "Services", subcategory: "Travel Agency" },
    { name: "Reeds Professional Cleaning & Alterations", category: "Services", subcategory: "Alterations" },
    { name: "News Point", category: "Services", subcategory: "Newsagent" },
    { name: "Avril's Fortunes", category: "Services", subcategory: "Specialist" },
    { name: "OSIM", category: "Services", subcategory: "Specialist" },

    // --- Financial Services ---
    { name: "eurochange", category: "Financial Services", subcategory: "Currency Exchange" },
];

// ============================================================
// Location metadata
// ============================================================

async function enrichLocation() {
    console.log("🔄 Enriching The Trafford Centre metadata...");
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            website: "https://traffordcentre.co.uk",
            phone: "0161 749 1717",
            openingHours: { "Mon-Fri": "10:00-22:00", Sat: "10:00-21:00", Sun: "12:00-18:00" },
            parkingSpaces: 11500,
            retailSpace: 1900000,
            numberOfStores: tenants.length,
            retailers: tenants.length,
            numberOfFloors: 3,
            anchorTenants: 8,
            publicTransit:
                "Trafford Centre bus station with frequent Metrolink and bus services. Direct tram link via Trafford Park Line.",
            owner: "CPPIB (Canada Pension Plan Investment Board)",
            management: "Trafford Centre Limited",
            openedYear: 1998,
            footfall: 30000000,
            heroImage:
                "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/37/58/6d/upper-regent-mall.jpg",
            evCharging: true,
            evChargingSpaces: 60,
            instagram: "https://www.instagram.com/traffabordecentre/",
            facebook: "https://www.facebook.com/TheTraffordCentre/",
            twitter: "https://twitter.com/TheTraffordCtr",
            tiktok: "https://www.tiktok.com/@traffordcentre",
            googleRating: 4.5,
            googleReviews: 54000,
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
    console.log("  The Trafford Centre — Full Enrichment");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocation();
    await insertTenants();
    await updateLargestCategory();
    await verify();

    console.log("\n✅ Trafford Centre enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
