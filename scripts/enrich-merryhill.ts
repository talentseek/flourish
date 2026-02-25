/**
 * Merry Hill Shopping Centre — Full Enrichment
 *
 * One of the UK's largest shopping centres, in Brierley Hill, West Midlands.
 * ~170 stores across 2 levels. Opened 1985 (developed 1985–1990).
 * Formerly Intu Merry Hill (administration 2020).
 * Now owned by Savills Investment Management, managed by Savills,
 * with Sovereign Centros handling strategic planning.
 *
 * This script also consolidates the duplicate "Merry Hill Retail Park"
 * entry into the single Shopping Centre record.
 *
 * Sources:
 *   - mymerryhill.co.uk/shops_attractions-sitemap.xml (tenants)
 *   - Wikipedia, press releases (metadata)
 *
 * Run: npx tsx scripts/enrich-merryhill.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCATION_ID = "cmks95l1i0002fajkbhurjm5f";
const RETAIL_PARK_ID = "cmkvn6ha5000aygnl9izm1kxu";

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

const tenants: TenantInput[] = [
    // === ANCHORS ===
    { name: "M&S", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "Primark", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Next", category: "Clothing & Footwear", subcategory: "Mid-Range", isAnchorTenant: true },
    { name: "H&M", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "JD Sports", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "Flannels", category: "Clothing & Footwear", subcategory: "Designer", isAnchorTenant: true },
    { name: "Asda", category: "Food & Grocery", subcategory: "Supermarket", isAnchorTenant: true },
    { name: "Currys", category: "Electrical & Technology", subcategory: "Consumer Electronics", isAnchorTenant: true },

    // === CLOTHING & FOOTWEAR ===
    { name: "Accessorize", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "Ann Summers", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Bonmarché", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Boux Avenue", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Castore", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "Clarks", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Cotswold Outdoor", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Deichmann", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Foot Locker", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Footasylum", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Hobbs", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Jack & Jones", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Kurt Geiger", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Lonsidium", category: "Clothing & Footwear", subcategory: "Specialist" },
    { name: "Luke 1977", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Mango", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Matalan", category: "Clothing & Footwear", subcategory: "Value" },
    { name: "Moss", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Nike Unite", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "Office", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Phase Eight", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Quiz", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Regatta", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "River Island", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Roman", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Runners Need", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "Schuh", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Schuh Kids", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Shoe Zone", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Skechers", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Snow+Rock", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Soley Customs / Soley Grail", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Sports Direct", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "Suit Direct", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Superdry", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Yours Clothing", category: "Clothing & Footwear", subcategory: "Plus Size" },
    { name: "Bag Magic", category: "Clothing & Footwear", subcategory: "Luggage" },
    { name: "Esquire", category: "Clothing & Footwear", subcategory: "Menswear" },

    // === JEWELLERY & WATCHES ===
    { name: "Beaverbrooks", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Ernest Jones", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "F. Hinds", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Goldsmiths", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "H. Samuel", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Lovisa", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Pandora", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Rado", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Rolex at Goldsmiths", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Swarovski", category: "Jewellery & Watches", subcategory: "Crystal Jewellery" },
    { name: "Tag Heuer", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "T.H. Baker", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Warren James", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Watch Repair Station", category: "Jewellery & Watches", subcategory: "Watch Repair" },

    // === HEALTH & BEAUTY ===
    { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Boots Opticians", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Boots Hearingcare", category: "Health & Beauty", subcategory: "Hearing" },
    { name: "DXB Perfume", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Extreme Eyebrows", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Extreme Eyebrow Bar", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Eyecare Merry Hill", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "Love Cosmetics", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Lucy's Nails", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "Lush", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Mint Nails", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "Pop Specs", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Regis Hair Salon", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Body Care" },
    { name: "Savers", category: "Health & Beauty", subcategory: "Discount Health" },
    { name: "Senn Nails", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "Supercuts", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "The Body Shop", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "The Fragrance Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Therapie Clinic", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Vision Express", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Zenn Nails", category: "Health & Beauty", subcategory: "Nail Salon" },

    // === FOOD & GROCERY ===
    { name: "Hotel Chocolat", category: "Food & Grocery", subcategory: "Chocolate Shop" },
    { name: "Iceland", category: "Food & Grocery", subcategory: "Frozen Food" },

    // === ELECTRICAL & TECHNOLOGY ===
    { name: "CeX", category: "Electrical & Technology", subcategory: "Second Hand Electronics" },
    { name: "EE", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Fone World", category: "Electrical & Technology", subcategory: "Mobile Accessories" },
    { name: "GAME", category: "Electrical & Technology", subcategory: "Gaming" },
    { name: "Harvey Norman", category: "Electrical & Technology", subcategory: "Consumer Electronics" },
    { name: "HMV", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "Mobile Booth", category: "Electrical & Technology", subcategory: "Mobile Accessories" },
    { name: "O2", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Select Apple", category: "Electrical & Technology", subcategory: "Consumer Electronics" },
    { name: "Sky", category: "Electrical & Technology", subcategory: "Telecoms" },
    { name: "Three", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Vodafone", category: "Electrical & Technology", subcategory: "Mobile Network" },

    // === HOME & GARDEN ===
    { name: "B&Q", category: "Home & Garden", subcategory: "DIY" },
    { name: "Bensons for Beds", category: "Home & Garden", subcategory: "Beds & Mattresses" },
    { name: "DFS", category: "Home & Garden", subcategory: "Furniture" },
    { name: "Home Bargains", category: "Home & Garden", subcategory: "Discount Homeware" },
    { name: "HomeSense", category: "Home & Garden", subcategory: "Homeware" },
    { name: "IKEA Click & Collect", category: "Home & Garden", subcategory: "Homeware" },
    { name: "NCF Living", category: "Home & Garden", subcategory: "Furniture" },
    { name: "ProCook", category: "Home & Garden", subcategory: "Kitchenware" },
    { name: "The Range", category: "Home & Garden", subcategory: "Homeware" },
    { name: "Vanilla", category: "Home & Garden", subcategory: "Home Fragrance" },
    { name: "Wren Kitchens", category: "Home & Garden", subcategory: "Kitchen Design" },
    { name: "Yankee Candle", category: "Home & Garden", subcategory: "Home Fragrance" },

    // === GIFTS & STATIONERY ===
    { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "CardZone", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Claire's", category: "Gifts & Stationery", subcategory: "Gifts" },
    { name: "Clintons", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Smiggle", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
    { name: "Top Gift", category: "Gifts & Stationery", subcategory: "Gifts" },
    { name: "Waterstones", category: "Gifts & Stationery", subcategory: "Books" },
    { name: "Ryman", category: "Gifts & Stationery", subcategory: "Stationery" },

    // === GENERAL RETAIL ===
    { name: "B&M", category: "General Retail", subcategory: "Discount Store" },
    { name: "Flying Tiger Copenhagen", category: "General Retail", subcategory: "Variety Store" },
    { name: "Kenji", category: "General Retail", subcategory: "Specialist" },
    { name: "Menkind", category: "General Retail", subcategory: "Specialist" },
    { name: "One Beyond", category: "General Retail", subcategory: "Discount Store" },
    { name: "Warhammer", category: "General Retail", subcategory: "Specialist" },
    { name: "SKVP", category: "General Retail", subcategory: "Specialist" },

    // === KIDS & TOYS ===
    { name: "Build-A-Bear Workshop", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "Smyths Toys", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "The Entertainer", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "Toytown", category: "Kids & Toys", subcategory: "Toy Store" },

    // === PETS ===
    { name: "Pets at Home", category: "General Retail", subcategory: "Pet Supplies" },
    { name: "Hobbycraft", category: "General Retail", subcategory: "Craft Supplies" },
    { name: "American Golf", category: "General Retail", subcategory: "Sport Specialist" },

    // === CAFES & RESTAURANTS ===
    { name: "ASK Italian", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Batch'd", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Big Smoke", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Black Sheep Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Bon Pan Asian", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Bubbleology", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "Bubblycious", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "Burger & Sauce", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Burger King", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Burrito Kitchen", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Cake Box", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Charlie Brown's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Chopstix Noodle Bar", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Costa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Crackles", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Five Guys", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "German Doner Kebab", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Gloria Jean's", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Greggs", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Harpers British Classics", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Heavenly Desserts", category: "Cafes & Restaurants", subcategory: "Dessert Shop" },
    { name: "JD Wetherspoon", category: "Cafes & Restaurants", subcategory: "Pub" },
    { name: "KFC", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Krispy Kreme", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Little Dessert Shop", category: "Cafes & Restaurants", subcategory: "Dessert Shop" },
    { name: "M&S Café", category: "Cafes & Restaurants", subcategory: "Cafe" },
    { name: "McDonald's", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Millie's Cookies", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Mr Pretzels", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Nando's", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Napoli", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pizza Hut Express", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Shake Stop", category: "Cafes & Restaurants", subcategory: "Milkshake Bar" },
    { name: "Sides", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Sizzled", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Slim Chickens", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Soho Coffee Co", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Starbucks", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Starbucks Drive Thru", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Subway", category: "Cafes & Restaurants", subcategory: "Sandwich Shop" },
    { name: "Tasty Plaice", category: "Cafes & Restaurants", subcategory: "Fish & Chips" },
    { name: "Tim Hortons", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Toledo Lounge", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Wagamama", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Wendy's", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Wingstop", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Yangtze Express", category: "Cafes & Restaurants", subcategory: "Fast Casual" },

    // === LEISURE & ENTERTAINMENT ===
    { name: "ODEON Cinema", category: "Leisure & Entertainment", subcategory: "Cinema", isAnchorTenant: true },
    { name: "Carnival Golf & Games", category: "Leisure & Entertainment", subcategory: "Mini Golf" },
    { name: "Hollywood Bowl", category: "Leisure & Entertainment", subcategory: "Bowling" },
    { name: "XF Gym", category: "Leisure & Entertainment", subcategory: "Gym" },
    { name: "David Alexander", category: "Leisure & Entertainment", subcategory: "Photography" },

    // === SERVICES ===
    { name: "Electro Mist", category: "Services", subcategory: "Vaping" },
    { name: "Joos Power", category: "Services", subcategory: "Phone Charging" },
    { name: "Max Spielmann", category: "Services", subcategory: "Photo Printing" },
    { name: "Merry Cobbler", category: "Services", subcategory: "Shoe Repair" },
    { name: "News 2 U", category: "Services", subcategory: "Newsagent" },
    { name: "The Flower Girl", category: "Services", subcategory: "Florist" },
    { name: "Timpson", category: "Services", subcategory: "Shoe Repair" },
    { name: "Triple Twenty Taxis", category: "Services", subcategory: "Taxi Rank" },
    { name: "TUI", category: "Services", subcategory: "Travel Agency" },
    { name: "Virgin Holidays", category: "Services", subcategory: "Travel Agency" },
    { name: "Europcar", category: "Services", subcategory: "Car Rental" },

    // === FINANCIAL SERVICES ===
    { name: "Coventry Building Society", category: "Financial Services", subcategory: "Building Society" },
    { name: "eurochange", category: "Financial Services", subcategory: "Currency Exchange" },
    { name: "Halifax", category: "Financial Services", subcategory: "Bank" },
    { name: "Metro Bank", category: "Financial Services", subcategory: "Bank" },
    { name: "Nationwide", category: "Financial Services", subcategory: "Building Society" },
    { name: "NatWest", category: "Financial Services", subcategory: "Bank" },
    { name: "TSB", category: "Financial Services", subcategory: "Bank" },

    // === BETTING / GAMING ===
    { name: "Betfred", category: "Services", subcategory: "Betting" },
    { name: "Merkur Slots", category: "Leisure & Entertainment", subcategory: "Amusements" },

    // === CHARITY / COMMUNITY ===
    { name: "Black Country Hub", category: "Services", subcategory: "Community" },
    { name: "Black Country Skills Shop", category: "Services", subcategory: "Community" },
    { name: "Cranstoun Routes", category: "Services", subcategory: "Community" },
    { name: "Midlands Air Ambulance Charity", category: "Charity & Second Hand", subcategory: "Charity Shop" },
    { name: "NHS Blood Test Centre", category: "Services", subcategory: "Healthcare" },
    { name: "The Welcome Room", category: "Services", subcategory: "Community" },

    // === MISC ===
    { name: "Argos", category: "General Retail", subcategory: "Catalogue Store" },
];

// ============================================================
// Delete the duplicate retail park entry
// ============================================================

async function consolidateEntries() {
    console.log("🔄 Consolidating: deleting Merry Hill Retail Park entry...");
    try {
        await prisma.tenant.deleteMany({ where: { locationId: RETAIL_PARK_ID } });
        await prisma.location.delete({ where: { id: RETAIL_PARK_ID } });
        console.log("  ✅ Retail Park entry deleted");
    } catch (err: any) {
        console.log("  ℹ️  Retail park already removed or not found:", err.message.slice(0, 60));
    }
}

// ============================================================
// Location metadata
// ============================================================

async function enrichLocation() {
    console.log("🔄 Enriching Merry Hill metadata...");
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            website: "https://mymerryhill.co.uk",
            phone: "01384 487900",
            openingHours: { "Mon-Fri": "10:00-21:00", Sat: "09:00-20:00", Sun: "11:00-17:00" },
            parkingSpaces: 10000,
            retailSpace: 1600000,
            numberOfStores: tenants.length,
            retailers: tenants.length,
            numberOfFloors: 2,
            anchorTenants: 9,
            publicTransit:
                "Merry Hill bus station on-site. Multiple National Express West Midlands routes. Near M5 Junction 2-4.",
            owner: "Savills Investment Management",
            management: "Savills / Sovereign Centros",
            openedYear: 1985,
            footfall: 15500000,
            heroImage:
                "https://www.whatsonlive.co.uk/media/24551/merry-hill.jpg",
            evCharging: true,
            evChargingSpaces: 40,
            carParkPrice: 0,
            instagram: "https://www.instagram.com/mymerryhill/",
            facebook: "https://www.facebook.com/mymerryhill/",
            twitter: "https://twitter.com/mymerryhill",
            googleRating: 4.2,
            googleReviews: 42000,
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

    // Confirm retail park is gone
    const rpCheck = await prisma.location.findUnique({ where: { id: RETAIL_PARK_ID } });
    console.log(`\n   Retail Park entry: ${rpCheck ? "⚠️ Still exists!" : "✅ Deleted"}`);
}

async function main() {
    console.log("═══════════════════════════════════════════════");
    console.log("  Merry Hill Shopping Centre — Full Enrichment");
    console.log("═══════════════════════════════════════════════\n");

    await consolidateEntries();
    await enrichLocation();
    await insertTenants();
    await updateLargestCategory();
    await verify();

    console.log("\n✅ Merry Hill enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
