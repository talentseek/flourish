/**
 * Manchester Arndale — Full Enrichment
 *
 * UK's largest city-centre shopping centre in Manchester.
 * 230+ stores, opened 1976, majority-owned by M&G Real Estate.
 *
 * Sources:
 *   - manchesterarndale.com/store-sitemap.xml (tenant list)
 *   - Wikipedia, press releases, Google Maps (metadata)
 *
 * Run: npx tsx scripts/enrich-manchester-arndale.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCATION_ID = "cmid0kw8b01plmtpu7p4c3x6o";

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

// ============================================================
// Tenants extracted from manchesterarndale.com/store-sitemap.xml
// Categories use canonical LDC 3-Tier Taxonomy
// ============================================================

const tenants: TenantInput[] = [
    // --- Department Stores / Anchors ---
    { name: "Harvey Nichols", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "Next", category: "Clothing & Footwear", subcategory: "Mid-Range", isAnchorTenant: true },
    { name: "Zara", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "TK Maxx", category: "Clothing & Footwear", subcategory: "Value", isAnchorTenant: true },
    { name: "JD Sports", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "Sports Direct", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "Nike", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "Apple", category: "Electrical & Technology", subcategory: "Consumer Electronics", isAnchorTenant: true },
    { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy", isAnchorTenant: true },

    // --- Clothing & Footwear ---
    { name: "Uniqlo", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "River Island", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Gap", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Hollister", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Superdry", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Urban Outfitters", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "AllSaints", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "Hugo Boss", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Ralph Lauren", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Paul Smith", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Canada Goose", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Represent", category: "Clothing & Footwear", subcategory: "Streetwear" },
    { name: "Levi's", category: "Clothing & Footwear", subcategory: "Denim" },
    { name: "Dr. Martens", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Clarks", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Schuh", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Office", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Dune", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Carvela", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Deichmann", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Shoe Zone", category: "Clothing & Footwear", subcategory: "Value" },
    { name: "Foot Locker", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Footasylum", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Footasylum Women", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Size?", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Castore", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "The North Face", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Timberland", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Arc'teryx", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Go Outdoors", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Trailberg", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Victoria's Secret", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Ann Summers", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Boux Avenue", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Quiz", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Lipsy", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Yours", category: "Clothing & Footwear", subcategory: "Plus Size" },
    { name: "Jack & Jones", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Moss", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Kurt Geiger", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "WED2B", category: "Clothing & Footwear", subcategory: "Occasion Wear" },
    { name: "Accessorize", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "SockShop", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "Santoro Milan", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Over The Rainbow", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Damaged Society", category: "Clothing & Footwear", subcategory: "Streetwear" },
    { name: "Mood London", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Kenji", category: "Clothing & Footwear", subcategory: "Streetwear" },
    { name: "PD FC", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "Manne London", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Amory London", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Blue Banana", category: "Clothing & Footwear", subcategory: "Casual" },

    // --- Health & Beauty ---
    { name: "Sephora", category: "Health & Beauty", subcategory: "Premium Cosmetics" },
    { name: "Space NK", category: "Health & Beauty", subcategory: "Premium Cosmetics" },
    { name: "Kiko Milano", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Love Cosmetics", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "BPerfect", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Bath & Body Works", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "The Body Shop", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Lush", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Body Care" },
    { name: "The Fragrance Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop (Near Kiko)", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Sunnamusk", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Specsavers", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Vision Express", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Sunglass Hut", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Pop Specs", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Laser Clinics", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Better Brows", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Star Nails and Beauty", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "Sergeant Caesar Barbers", category: "Health & Beauty", subcategory: "Barber" },
    { name: "Decent Cut", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "Holland & Barrett (in Next)", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "Herbal Inn", category: "Health & Beauty", subcategory: "Wellness" },
    { name: "PureSeoul", category: "Health & Beauty", subcategory: "K-Beauty" },
    { name: "Emma Sleep", category: "Health & Beauty", subcategory: "Wellness" },

    // --- Food & Grocery ---
    { name: "Aldi", category: "Food & Grocery", subcategory: "Supermarket" },
    { name: "Hotel Chocolat", category: "Food & Grocery", subcategory: "Chocolate Shop" },
    { name: "Lindt", category: "Food & Grocery", subcategory: "Chocolatier" },
    { name: "Yankee Candle", category: "Home & Garden", subcategory: "Home Fragrance" },

    // --- Jewellery & Watches ---
    { name: "H. Samuel", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Ernest Jones", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Beaverbrooks", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Chisholm Hunter", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Warren James", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Pandora 2", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Lovisa", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Swarovski", category: "Jewellery & Watches", subcategory: "Crystal Jewellery" },
    { name: "Thomas Sabo", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Mococo", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "The Watch Lab", category: "Jewellery & Watches", subcategory: "Watch Repair" },
    { name: "Gold Star", category: "Jewellery & Watches", subcategory: "Jewellery" },

    // --- Electrical & Technology ---
    { name: "Currys PC World", category: "Electrical & Technology", subcategory: "Consumer Electronics" },
    { name: "Vodafone", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Three", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "O2", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "EE", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Sky Store", category: "Electrical & Technology", subcategory: "Telecoms" },
    { name: "Sky Kiosk", category: "Electrical & Technology", subcategory: "Telecoms" },
    { name: "HMV", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "GAME (5th Floor Sports Direct)", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "iSmash", category: "Electrical & Technology", subcategory: "Mobile Repair" },
    { name: "Mobile Technician", category: "Electrical & Technology", subcategory: "Mobile Repair" },
    { name: "iFixTech", category: "Electrical & Technology", subcategory: "Mobile Repair" },
    { name: "CeX", category: "Electrical & Technology", subcategory: "Second Hand Electronics" },
    { name: "Kim Creative Com", category: "Electrical & Technology", subcategory: "Mobile Accessories" },
    { name: "Imzi Communications (Mall Kiosk)", category: "Electrical & Technology", subcategory: "Mobile Accessories" },

    // --- Home & Garden ---
    { name: "B&M", category: "Home & Garden", subcategory: "Homeware" },
    { name: "ProCook", category: "Home & Garden", subcategory: "Kitchenware" },

    // --- Gifts & Stationery ---
    { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Card Factory (Near Tessuti)", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Waterstones", category: "Gifts & Stationery", subcategory: "Books" },
    { name: "Ryman", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "Smiggle", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
    { name: "Claire's", category: "Gifts & Stationery", subcategory: "Gifts" },
    { name: "Flying Tiger", category: "General Retail", subcategory: "Variety Store" },
    { name: "Miniso", category: "General Retail", subcategory: "Variety Store" },
    { name: "Menkind", category: "General Retail", subcategory: "Specialist" },
    { name: "Manchester Souvenirs", category: "Gifts & Stationery", subcategory: "Souvenirs" },
    { name: "Warhammer", category: "Gifts & Stationery", subcategory: "Gifts" },

    // --- General Retail ---
    { name: "Poundland", category: "General Retail", subcategory: "Discount Store" },
    { name: "Argos", category: "General Retail", subcategory: "Variety Store" },
    { name: "City Store", category: "General Retail", subcategory: "Specialist" },
    { name: "Hidden Corner", category: "General Retail", subcategory: "Specialist" },
    { name: "White Rose", category: "General Retail", subcategory: "Specialist" },
    { name: "Oseyo", category: "General Retail", subcategory: "Specialist" },

    // --- Kids & Toys ---
    { name: "Build-A-Bear Workshop", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "The Entertainer", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "Lego", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "Mamas & Papas", category: "Kids & Toys", subcategory: "Kidswear" },

    // --- Cafes & Restaurants ---
    { name: "McDonald's", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "KFC", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Subway", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Subway (Foodcourt)", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Taco Bell", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Popeyes", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Greggs (Upper Mall)", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Greggs (Lower Mall)", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Five Guys", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Nando's", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Slim Chickens", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Tortilla", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Barburrito", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Chopstix Noodle Bar", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Kokoro", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Sides", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Batch'd", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Rolled", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Hop", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Wongs", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Yangtze", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "PizzaLuxe", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pizza Hut", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pizza Hut Express", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Pizza Slice", category: "Cafes & Restaurants", subcategory: "Takeaway" },
    { name: "Hasty Tasty Pizza", category: "Cafes & Restaurants", subcategory: "Takeaway" },
    { name: "Costa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Costa Coffee (Wintergarden)", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Costa Coffee (Market Street)", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Starbucks", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Caffè Nero", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Caffè Nero (Upper Mall)", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Pret A Manger", category: "Cafes & Restaurants", subcategory: "Sandwich Shop" },
    { name: "Joe & The Juice", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Tim Hortons", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Black Sheep Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Jamaica Blue", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Coffee Break", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Michael's Coffee House", category: "Cafes & Restaurants", subcategory: "Cafe" },
    { name: "Rowntrees Cafe", category: "Cafes & Restaurants", subcategory: "Cafe" },
    { name: "Piccolo", category: "Cafes & Restaurants", subcategory: "Cafe" },
    { name: "Krispy Kreme", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Krispy Kreme Kiosk", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Bagel Factory", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Millie's Cookies (Upper Mall)", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Millie's Cookies (Lower Mall)", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Auntie Anne's", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "World of Waffle", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Lazy Sundae", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Waffle Island", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Creams", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Churros Mexicanos", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Cake Box", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Cake Box 2", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Snowflake", category: "Cafes & Restaurants", subcategory: "Dessert Shop" },
    { name: "Archie's", category: "Cafes & Restaurants", subcategory: "Milkshake Bar" },
    { name: "Boost Juice Bar", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Boost Juice Bar (Upper Mall)", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Fruteiro do Brasil", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Sipcha", category: "Food & Grocery", subcategory: "Bubble Tea" },
    { name: "Moida", category: "Cafes & Restaurants", subcategory: "Fast Casual" },

    // --- Leisure & Entertainment ---
    { name: "Roxy Ball Room", category: "Leisure & Entertainment", subcategory: "Social Gaming" },
    { name: "Electric Playbox", category: "Leisure & Entertainment", subcategory: "Virtual Reality" },
    { name: "King Pins", category: "Leisure & Entertainment", subcategory: "Bowling" },
    { name: "Urban Playground", category: "Leisure & Entertainment", subcategory: "Adventure" },
    { name: "Belong (5th Floor Sports Direct)", category: "Leisure & Entertainment", subcategory: "Arcade" },
    { name: "Rollers", category: "Leisure & Entertainment", subcategory: "Amusements" },
    { name: "XF Gym", category: "Leisure & Entertainment", subcategory: "Gym" },

    // --- Services ---
    { name: "Timpsons", category: "Services", subcategory: "Shoe Repair" },
    { name: "TUI", category: "Services", subcategory: "Travel Agency" },
    { name: "Virgin Holidays", category: "Services", subcategory: "Travel Agency" },
    { name: "Arndale News", category: "Services", subcategory: "Newsagent" },
    { name: "Aleef News", category: "Services", subcategory: "Newsagent" },
    { name: "Newspoint", category: "Services", subcategory: "Newsagent" },
    { name: "Betfred", category: "Services", subcategory: "Betting" },
    { name: "In Time", category: "Services", subcategory: "Shoe Repair" },
    { name: "Shopmobility", category: "Services", subcategory: "Community" },
    { name: "Information Desk", category: "Services", subcategory: "Community" },
    { name: "Arndale House", category: "Services", subcategory: "Community" },
    { name: "Arndale Market", category: "Services", subcategory: "Community" },
    { name: "Saboteur at Thomas Sabo", category: "General Retail", subcategory: "Specialist" },

    // --- Financial Services ---
    { name: "Metro Bank", category: "Financial Services", subcategory: "Bank" },
    { name: "NatWest", category: "Financial Services", subcategory: "Bank" },
    { name: "TSB", category: "Financial Services", subcategory: "Bank" },
    { name: "Eurochange", category: "Financial Services", subcategory: "Currency Exchange" },
    { name: "Eurochange (Near Arndale Market)", category: "Financial Services", subcategory: "Currency Exchange" },
    { name: "Eurochange (Mall Kiosk)", category: "Financial Services", subcategory: "Currency Exchange" },
];

// ============================================================
// Location metadata
// ============================================================

async function enrichLocation() {
    console.log("🔄 Enriching Manchester Arndale metadata...");
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            website: "https://manchesterarndale.com",
            phone: "0161 833 9851",
            openingHours: { "Mon-Sat": "10:00-20:00", Sun: "11:30-17:30" },
            parkingSpaces: 1450,
            retailSpace: 1400000,
            numberOfStores: tenants.length,
            retailers: tenants.length,
            numberOfFloors: 4,
            anchorTenants: 9,
            publicTransit:
                "Manchester Victoria and Piccadilly stations within 10-min walk. Market Street Metrolink stop adjacent. Multiple bus routes via Shudehill Interchange.",
            owner: "M&G Real Estate",
            management: "CBRE",
            openedYear: 1976,
            footfall: 46000000,
            heroImage:
                "https://assets.manchesterarndale.com/app/uploads/2020/07/Screenshot-2020-07-08-at-16.06.16-1024x578.png",
            evCharging: true,
            evChargingSpaces: 20,
            carParkPrice: 4.5,
            instagram: "https://www.instagram.com/manchesterarndale",
            facebook: "https://www.facebook.com/manchesterarndale",
            twitter: "https://twitter.com/manchesterarndale",
            googleRating: 4.3,
            googleReviews: 48000,
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
    console.log("  Manchester Arndale — Full Enrichment");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocation();
    await insertTenants();
    await updateLargestCategory();
    await verify();

    console.log("\n✅ Manchester Arndale enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
