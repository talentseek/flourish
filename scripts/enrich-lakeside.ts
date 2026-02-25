/**
 * Lakeside Shopping Centre — Full Enrichment
 *
 * One of the UK's largest shopping centres, in West Thurrock, Essex.
 * 250+ stores across 3 floors. Opened October 1990.
 * Formerly Intu Lakeside; now managed by Savills (post-Intu admin 2020).
 * Owned by Global Mutual consortium.
 *
 * Sources:
 *   - lakeside-shopping.com/store-sitemap.xml (tenants)
 *   - Wikipedia, press releases (metadata)
 *
 * Run: npx tsx scripts/enrich-lakeside.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCATION_ID = "cmid0kvs301p4mtpuhrvn6jgz";

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

// ============================================================
// Tenants extracted from lakeside-shopping.com sitemap
// Categories use canonical LDC 3-Tier Taxonomy
// ============================================================

const tenants: TenantInput[] = [
    // === ANCHORS / DEPARTMENT STORES ===
    { name: "M&S", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "Primark", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Next", category: "Clothing & Footwear", subcategory: "Mid-Range", isAnchorTenant: true },
    { name: "Zara", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "H&M", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Apple", category: "Electrical & Technology", subcategory: "Consumer Electronics", isAnchorTenant: true },
    { name: "JD Sports", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "Flannels", category: "Clothing & Footwear", subcategory: "Designer", isAnchorTenant: true },

    // === CLOTHING & FOOTWEAR ===
    { name: "Accessorize", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "Aldo", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "AllSaints", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "Ann Summers", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Boss", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Boux Avenue", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Calvin Klein", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Carvela", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Charles Tyrwhitt", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Clarks", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Confetti & Lace", category: "Clothing & Footwear", subcategory: "Occasion Wear" },
    { name: "Crep Collection Club", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Deichmann Shoes", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Dune London", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Foot Locker", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Foot Locker Kids", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Footasylum", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Gant", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Kurt Geiger", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Lacoste", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Levi's", category: "Clothing & Footwear", subcategory: "Denim" },
    { name: "Mango", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Moss", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "NA Menswear", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Nike", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "Office", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Pull&Bear", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Quiz", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Reiss", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "River Island", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Schuh", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Schuh Kids", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Skechers", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Sole Trader", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Stradivarius", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Suiter Italian Menswear", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "TFG London", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Timberland", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Victoria's Secret", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Victoria's Secret PINK", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Yours Clothing", category: "Clothing & Footwear", subcategory: "Plus Size" },
    { name: "Baggageworld", category: "Clothing & Footwear", subcategory: "Luggage" },
    { name: "Casa Childrenwear", category: "Clothing & Footwear", subcategory: "Childrenswear" },
    { name: "H&M Home", category: "Home & Garden", subcategory: "Homeware" },

    // === JEWELLERY & WATCHES ===
    { name: "Beaverbrooks", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Breitling", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Chisholm Hunter", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "F. Hinds", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Goldsmiths", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "H. Samuel", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Jewells", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Lovisa", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Pandora", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Rolex at Goldsmiths", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Swarovski", category: "Jewellery & Watches", subcategory: "Crystal Jewellery" },
    { name: "Tag Heuer", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Thomas Sabo", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "The Watch Lab", category: "Jewellery & Watches", subcategory: "Watch Repair" },
    { name: "Warren James", category: "Jewellery & Watches", subcategory: "Jewellery" },

    // === HEALTH & BEAUTY ===
    { name: "Adorn Beauty", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Ali Barbers", category: "Health & Beauty", subcategory: "Barber" },
    { name: "Beauty Base", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Better Brows", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "DXB Perfumes", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Eden Nails", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "Eza Vision", category: "Health & Beauty", subcategory: "Optician" },
    { name: "H Beauty", category: "Health & Beauty", subcategory: "Premium Cosmetics" },
    { name: "Herbal Inn", category: "Health & Beauty", subcategory: "Wellness" },
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "Jo Malone London", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Lush", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Optical Express", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Regis Hair Salon", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "RiRi Hair Extensions", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Body Care" },
    { name: "Rush Hair Salon", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "SKN", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Specsavers", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Sunglass Hut", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Supercuts", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Taz's Beauty", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "The Body Shop", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "The Fragrance Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop Boutique", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Tanning Shop", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Therapie Clinic", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Toni&Guy", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Vision Express", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Just Cuts", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Lakeside Dental & Medical Clinic", category: "Health & Beauty", subcategory: "Dental" },

    // === FOOD & GROCERY ===
    { name: "Hotel Chocolat", category: "Food & Grocery", subcategory: "Chocolate Shop" },
    { name: "Mr Simms Olde Sweet Shoppe", category: "Food & Grocery", subcategory: "Sweet Shop" },
    { name: "Sweets from Heaven", category: "Food & Grocery", subcategory: "Sweet Shop" },
    { name: "Candles & Oud", category: "Food & Grocery", subcategory: "Deli" },

    // === ELECTRICAL & TECHNOLOGY ===
    { name: "CeX", category: "Electrical & Technology", subcategory: "Second Hand Electronics" },
    { name: "Covered Phone Accessories", category: "Electrical & Technology", subcategory: "Mobile Accessories" },
    { name: "EE", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "HMV", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "iSmash", category: "Electrical & Technology", subcategory: "Mobile Repair" },
    { name: "Mobilebitz", category: "Electrical & Technology", subcategory: "Mobile Accessories" },
    { name: "O2", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Sky", category: "Electrical & Technology", subcategory: "Telecoms" },
    { name: "TechHouse", category: "Electrical & Technology", subcategory: "Consumer Electronics" },
    { name: "Tesla", category: "Electrical & Technology", subcategory: "Consumer Electronics" },
    { name: "Three", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Vodafone", category: "Electrical & Technology", subcategory: "Mobile Network" },

    // === HOME & GARDEN ===
    { name: "ProCook", category: "Home & Garden", subcategory: "Kitchenware" },
    { name: "Robert Dyas", category: "Home & Garden", subcategory: "Homeware" },
    { name: "Sofa Club", category: "Home & Garden", subcategory: "Furniture" },
    { name: "Vanilla", category: "Home & Garden", subcategory: "Home Fragrance" },
    { name: "Yankee Candle", category: "Home & Garden", subcategory: "Home Fragrance" },

    // === GIFTS & STATIONERY ===
    { name: "Claire's", category: "Gifts & Stationery", subcategory: "Gifts" },
    { name: "Clintons", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Smiggle", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
    { name: "Waterstones", category: "Gifts & Stationery", subcategory: "Books" },
    { name: "WHSmith", category: "Gifts & Stationery", subcategory: "Books & Stationery" },

    // === GENERAL RETAIL ===
    { name: "Flying Tiger Copenhagen", category: "General Retail", subcategory: "Variety Store" },
    { name: "InWonderland", category: "General Retail", subcategory: "Specialist" },
    { name: "Menkind", category: "General Retail", subcategory: "Specialist" },
    { name: "Miniso", category: "General Retail", subcategory: "Variety Store" },
    { name: "Poundland", category: "General Retail", subcategory: "Discount Store" },
    { name: "Mowchi", category: "General Retail", subcategory: "Specialist" },

    // === KIDS & TOYS ===
    { name: "Babyeze", category: "Kids & Toys", subcategory: "Kidswear" },
    { name: "Build-A-Bear Workshop", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "ebebek", category: "Kids & Toys", subcategory: "Kidswear" },
    { name: "Kideco", category: "Kids & Toys", subcategory: "Kidswear" },
    { name: "KideCars", category: "Kids & Toys", subcategory: "Toys" },
    { name: "The Entertainer", category: "Kids & Toys", subcategory: "Toy Store" },

    // === CAFES & RESTAURANTS ===
    { name: "Afrikana", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Amorino", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "ASK Italian", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Bella Italia", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Ben's Cookies", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Boost Juice Bar", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Brick Lane Bagel Co", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Bubble CiTea", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "Bubble Magik", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "Bubbleology", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "Burger King", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Café Giardino", category: "Cafes & Restaurants", subcategory: "Cafe" },
    { name: "Caffè Nero", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Casco Lounge", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Chipotle Mexican Grill", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Chopstix Noodle Bar", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Coco Asia", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Costa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Creams Café", category: "Cafes & Restaurants", subcategory: "Dessert Shop" },
    { name: "Five Guys", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "German Doner Kebab", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Gourmet Burger Kitchen", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Greggs", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Harrods Champagne Bar", category: "Cafes & Restaurants", subcategory: "Bar" },
    { name: "KFC", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Krispy Kreme", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Las Iguanas", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Love Churros", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Maki Ramen", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "McDonald's", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Millie's Cookies", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Mother Hubbard's", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Mr Pretzels", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Nando's", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "PizzaExpress", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pizza Hut Express", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Popeyes", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Pret A Manger", category: "Cafes & Restaurants", subcategory: "Sandwich Shop" },
    { name: "Prezzo", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Shakeaway", category: "Cafes & Restaurants", subcategory: "Milkshake Bar" },
    { name: "Sides", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Sizzled", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Smoke & Pepper", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Starbucks", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Subway", category: "Cafes & Restaurants", subcategory: "Sandwich Shop" },
    { name: "Taco Bell", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "TGI Friday's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Thai Express", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Tortilla", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Wagamama", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Wasabi", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Wendy's", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Wimpy", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Wingstop", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Yolé", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "You Me Sushi", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Zizzi", category: "Cafes & Restaurants", subcategory: "Restaurant" },

    // === LEISURE & ENTERTAINMENT ===
    { name: "Vue Cinema", category: "Leisure & Entertainment", subcategory: "Cinema", isAnchorTenant: true },
    { name: "Boom Battle Bar", category: "Leisure & Entertainment", subcategory: "Social Gaming" },
    { name: "Escape Hunt", category: "Leisure & Entertainment", subcategory: "Escape Room" },
    { name: "Flip Out", category: "Leisure & Entertainment", subcategory: "Trampoline Park" },
    { name: "Hollywood Bowl", category: "Leisure & Entertainment", subcategory: "Bowling" },
    { name: "Immersive Gamebox", category: "Leisure & Entertainment", subcategory: "Virtual Reality" },
    { name: "Laser Quest", category: "Leisure & Entertainment", subcategory: "Arcade" },
    { name: "Nickelodeon Adventure", category: "Leisure & Entertainment", subcategory: "Adventure" },
    { name: "Partyman World of Play", category: "Leisure & Entertainment", subcategory: "Adventure" },
    { name: "Puttshack", category: "Leisure & Entertainment", subcategory: "Mini Golf" },
    { name: "Rock Up", category: "Leisure & Entertainment", subcategory: "Climbing" },
    { name: "West Ham United Sportswear", category: "Leisure & Entertainment", subcategory: "Sport Merchandise" },
    { name: "Christmas Magic", category: "Leisure & Entertainment", subcategory: "Amusements" },

    // === SERVICES ===
    { name: "H2O Car Valeting", category: "Services", subcategory: "Car Wash" },
    { name: "Timpson", category: "Services", subcategory: "Shoe Repair" },
    { name: "TUI", category: "Services", subcategory: "Travel Agency" },
    { name: "Virgin Holidays", category: "Services", subcategory: "Travel Agency" },
    { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },

    // === FINANCIAL SERVICES ===
    { name: "eurochange", category: "Financial Services", subcategory: "Currency Exchange" },
    { name: "Halifax", category: "Financial Services", subcategory: "Bank" },
    { name: "HSBC", category: "Financial Services", subcategory: "Bank" },
    { name: "Santander", category: "Financial Services", subcategory: "Bank" },

    // === CHARITY ===
    { name: "South Essex Wildlife Hospital", category: "Charity & Second Hand", subcategory: "Charity Shop" },

    // === BETTING ===
    { name: "Coral", category: "Services", subcategory: "Betting" },

    // === HL (Unclear — likely a local brand) ===
    { name: "HL", category: "General Retail", subcategory: "Specialist" },
];

// ============================================================
// Location metadata
// ============================================================

async function enrichLocation() {
    console.log("🔄 Enriching Lakeside metadata...");
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            website: "https://lakeside-shopping.com",
            phone: "01708 869933",
            openingHours: { "Mon-Fri": "10:00-22:00", Sat: "10:00-22:00", Sun: "11:00-17:00" },
            parkingSpaces: 13000,
            retailSpace: 1434000,
            numberOfStores: tenants.length,
            retailers: tenants.length,
            numberOfFloors: 3,
            anchorTenants: 9,
            publicTransit:
                "Chafford Hundred station (c2c) 5-min walk. Multiple bus routes to bus station on-site. M25 Junction 30/31, A13.",
            owner: "Global Mutual",
            management: "Savills",
            openedYear: 1990,
            footfall: 20000000,
            heroImage:
                "https://www.c2c-online.co.uk/app/uploads/2018/11/Lakeside_main-banner.jpg",
            evCharging: true,
            evChargingSpaces: 80,
            carParkPrice: 0,
            instagram: "https://www.instagram.com/lakesideshopping/",
            facebook: "https://www.facebook.com/lakesideshopping/",
            twitter: "https://twitter.com/LakesideSC",
            googleRating: 4.3,
            googleReviews: 55000,
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
    console.log("  Lakeside Shopping Centre — Full Enrichment");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocation();
    await insertTenants();
    await updateLargestCategory();
    await verify();

    console.log("\n✅ Lakeside enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
