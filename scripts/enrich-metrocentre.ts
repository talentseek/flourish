/**
 * Metrocentre (Gateshead) — Full Enrichment
 *
 * Source: themetrocentre.co.uk sitemap (businessDirectory), web research
 * Opened: 1986 | Owner: Metrocentre Partnership (Sovereign Centros / CBRE)
 * ~2,076,000 sqft | 270+ stores | 10,000 free parking spaces | ~16M annual footfall
 *
 * Run: npx tsx scripts/enrich-metrocentre.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const METROCENTRE_ID = "cmid0kwvf01qamtpu9f3v73my";

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

const tenants: TenantInput[] = [
    // ── Clothing & Footwear (Anchor) ──────────────────────────
    { name: "Primark", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Zara", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Next", category: "Clothing & Footwear", subcategory: "Mid-Range", isAnchorTenant: true },
    { name: "Flannels", category: "Clothing & Footwear", subcategory: "Designer", isAnchorTenant: true },
    { name: "Sports Direct", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "TK Maxx & Homesense", category: "Clothing & Footwear", subcategory: "Value", isAnchorTenant: true },

    // ── Clothing & Footwear ──────────────────────────────────
    { name: "Hollister", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Urban Outfitters", category: "Clothing & Footwear", subcategory: "Concept Store" },
    { name: "Stradivarius", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Mango", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "River Island", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Levi's", category: "Clothing & Footwear", subcategory: "Denim" },
    { name: "Reiss", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Victoria's Secret", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Hobbs London", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Phase Eight", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Quiz", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Yours Clothing", category: "Clothing & Footwear", subcategory: "Plus Size" },
    { name: "Apricot", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Sosandar", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Edinburgh Woollen Mill", category: "Clothing & Footwear", subcategory: "Country" },
    { name: "Demanded Streetwear", category: "Clothing & Footwear", subcategory: "Streetwear" },
    { name: "Badge Clothing", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Paris Dress House", category: "Clothing & Footwear", subcategory: "Occasion Wear" },
    { name: "Pret a Vie", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Skopes", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "SD by Suit Direct", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Carvela", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Skechers", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Schuh", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Schuh Kids", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Office Shoes", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Shoe Zone", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Pavers", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Everau", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Go Outdoors", category: "Clothing & Footwear", subcategory: "Outdoor" },

    // ── Health & Beauty ──────────────────────────────────────
    { name: "H Beauty", category: "Health & Beauty", subcategory: "Premium Cosmetics", isAnchorTenant: true },
    { name: "Sephora", category: "Health & Beauty", subcategory: "Premium Cosmetics" },
    { name: "KIKO Milano", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Jo Malone London", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "The Body Shop", category: "Health & Beauty", subcategory: "Body Care" },
    { name: "Bath & Body", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Savers", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "The Fragrance Shop (Red Mall)", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Fragrance Shop (Metrocentre)", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop (Red Mall)", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop (Upper Green Mall)", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "DXB Perfumes", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Vision Express", category: "Health & Beauty", subcategory: "Optician" },
    { name: "The Glasses Factory Opticians", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Glasses Factory Kiosk", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Pop Specs", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Sunglass Hut", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "M&S Opticians", category: "Health & Beauty", subcategory: "Optician" },
    { name: "VIP Nails & Beauty", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "VIP Nails & Beauty (Metrocentre)", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "Brows & Nails", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "Therapie Clinic", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Regis Salon", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Supercuts", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Champagne Bar (within H Beauty)", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Drybar (within H Beauty)", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Bupa Mindplace", category: "Health & Beauty", subcategory: "Wellness" },
    { name: "CHEC", category: "Health & Beauty", subcategory: "Optician" },

    // ── Jewellery & Watches ──────────────────────────────────
    { name: "Pandora (Red Mall)", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Pandora (Blue Mall)", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Swarovski", category: "Jewellery & Watches", subcategory: "Crystal Jewellery" },
    { name: "Warren James", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Diamond Factory", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Lovisa", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Rolex Boutique", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "TAG Heuer Boutique", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Tudor Boutique at Goldsmiths", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Omega Boutique", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Swatch", category: "Jewellery & Watches", subcategory: "Watches" },
    { name: "The Watch Lab", category: "Jewellery & Watches", subcategory: "Watch Repair" },
    { name: "Watch Repair Centre", category: "Jewellery & Watches", subcategory: "Watch Repair" },
    { name: "TG Jones", category: "Jewellery & Watches", subcategory: "Jewellery" },

    // ── Food & Grocery ───────────────────────────────────────
    { name: "Grape Tree", category: "Food & Grocery", subcategory: "Health Food Store" },
    { name: "The Chuckling Cheese", category: "Food & Grocery", subcategory: "Deli" },
    { name: "The Whisky Shop", category: "Food & Grocery", subcategory: "Specialist" },
    { name: "Taste the Best", category: "Food & Grocery", subcategory: "Deli" },

    // ── Cafes & Restaurants ──────────────────────────────────
    { name: "Wagamama", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Zizzi", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pizza Express", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pizza Hut", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Pizza Hut (Qube)", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Nando's (Upper Yellow)", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Nando's (Lower Blue Mall)", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Thaikhun", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Tomahawk Steakhouse", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Fridays", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Toby Carvery", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Acropolis", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Maki Ramen", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Yo! Sushi", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Yo Yo Noodle", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "German Doner Kebab", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Burger King (Metroasis)", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Wingstop", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Popeyes", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Slim Chickens", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Subway (Upper Qube)", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Subway (Lower Blue Mall)", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Subway (Lower Qube)", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Greggs (Green Mall)", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Starbucks (Upper Red Mall)", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Starbucks (Metroasis)", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Starbucks (Lower Red Mall)", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Esquires Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Boni Italian Coffee & Bakery", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Bubble CiTea (Yellow Mall)", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "Bubble CiTea (Red Mall)", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "Dr Drinks", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "The Knot Churros", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Snowflake Gelato", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Shakeaholic", category: "Cafes & Restaurants", subcategory: "Milkshake Bar" },
    { name: "Batch'd", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Grounded Kitchen", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Street Taste Co", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Petit Delice", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Sweets Galore (Yellow Mall)", category: "Cafes & Restaurants", subcategory: "Confectionery" },
    { name: "Sweets Galore (Blue Mall)", category: "Cafes & Restaurants", subcategory: "Confectionery" },
    { name: "Wetherspoon", category: "Cafes & Restaurants", subcategory: "Pub" },
    { name: "Clyde's Bar", category: "Cafes & Restaurants", subcategory: "Bar" },
    { name: "Yowza", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Vanilla", category: "Cafes & Restaurants", subcategory: "Cafe" },

    // ── Home & Garden ────────────────────────────────────────
    { name: "Next Home", category: "Home & Garden", subcategory: "Homeware" },
    { name: "H&M Home", category: "Home & Garden", subcategory: "Homeware" },
    { name: "ProCook", category: "Home & Garden", subcategory: "Kitchenware" },
    { name: "Yankee Candle", category: "Home & Garden", subcategory: "Home Fragrance" },
    { name: "Søstrene Grene", category: "Home & Garden", subcategory: "Home & Lifestyle" },
    { name: "Rowen Homes", category: "Home & Garden", subcategory: "Furniture" },
    { name: "Oak Furnitureland", category: "Home & Garden", subcategory: "Furniture" },
    { name: "NCF Living", category: "Home & Garden", subcategory: "Furniture" },
    { name: "Sofology", category: "Home & Garden", subcategory: "Furniture" },
    { name: "Sofa Club", category: "Home & Garden", subcategory: "Furniture" },
    { name: "Designer Sofas", category: "Home & Garden", subcategory: "Furniture" },
    { name: "SCS", category: "Home & Garden", subcategory: "Furniture" },
    { name: "Dreams", category: "Home & Garden", subcategory: "Bedding" },
    { name: "Miniso", category: "Home & Garden", subcategory: "Lifestyle" },

    // ── Gifts & Stationery ───────────────────────────────────
    { name: "Waterstones", category: "Gifts & Stationery", subcategory: "Books" },
    { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
    { name: "Typo", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "Smiggle", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "Top Gift (Green Mall)", category: "Gifts & Stationery", subcategory: "Gifts" },
    { name: "Collectables (Blue Mall)", category: "Gifts & Stationery", subcategory: "Souvenirs" },
    { name: "Flying Tiger Copenhagen", category: "Gifts & Stationery", subcategory: "Gifts & Homeware" },
    { name: "Kenji", category: "Gifts & Stationery", subcategory: "Gadgets & Gifts" },

    // ── Electrical & Technology ───────────────────────────────
    { name: "EE Experience Store", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Vodafone", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "O2", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Sky Store", category: "Electrical & Technology", subcategory: "Consumer Electronics" },
    { name: "Tesla", category: "Electrical & Technology", subcategory: "Consumer Electronics" },
    { name: "iSmash", category: "Electrical & Technology", subcategory: "Phone Repairs" },

    // ── Kids & Toys ──────────────────────────────────────────
    { name: "Smyths Toys", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "The Entertainer", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "Peppa Pig Market", category: "Kids & Toys", subcategory: "Toys" },
    { name: "Peppa Pig Surprise Party", category: "Kids & Toys", subcategory: "Toys" },

    // ── General Retail ───────────────────────────────────────
    { name: "Poundland", category: "General Retail", subcategory: "Discount Store" },
    { name: "VPZ", category: "General Retail", subcategory: "Vape Shop" },

    // ── Department Stores ────────────────────────────────────
    // (M&S, Debenhams-era space now subdivided - no standalone dept store anchor currently)

    // ── Leisure & Entertainment ──────────────────────────────
    { name: "Treetop Golf", category: "Leisure & Entertainment", subcategory: "Mini Golf" },
    { name: "Namco Funscape", category: "Leisure & Entertainment", subcategory: "Arcade" },
    { name: "Activate", category: "Leisure & Entertainment", subcategory: "Adventure" },
    { name: "Upside Down House & Spinning House", category: "Leisure & Entertainment", subcategory: "Adventure" },
    { name: "Escapologist", category: "Leisure & Entertainment", subcategory: "Escape Room" },
    { name: "Everlast Gyms", category: "Leisure & Entertainment", subcategory: "Gym" },
    { name: "Warhammer", category: "Leisure & Entertainment", subcategory: "Collectibles" },
    { name: "The Back Page", category: "Leisure & Entertainment", subcategory: "Sport Merchandise" },
    { name: "NUFC Store", category: "Leisure & Entertainment", subcategory: "Sport Merchandise" },
    { name: "Life's a Witch", category: "Leisure & Entertainment", subcategory: "Collectibles" },

    // ── Services ─────────────────────────────────────────────
    { name: "Timpson", category: "Services", subcategory: "Shoe Repair" },
    { name: "WeBuyAnyCar", category: "Services", subcategory: "Specialist" },
    { name: "TUI", category: "Services", subcategory: "Travel Agency" },
    { name: "Virgin Holidays", category: "Services", subcategory: "Travel Agency" },
    { name: "Star Stitch", category: "Services", subcategory: "Alterations" },
    { name: "New Gold Stitch", category: "Services", subcategory: "Alterations" },
    { name: "Regus Offices", category: "Services", subcategory: "Employment Services" },
    { name: "NHS Community Diagnostic Centre", category: "Services", subcategory: "Community" },
    { name: "Metrocentre Community Hub", category: "Services", subcategory: "Community Hub" },

    // ── Health & Beauty (Barbers) ─────────────────────────────
    { name: "Turkish Barber (Green Mall)", category: "Health & Beauty", subcategory: "Barber" },
    { name: "Turkish Barber (Blue Mall)", category: "Health & Beauty", subcategory: "Barber" },
    { name: "The Traditional Barber Shop", category: "Health & Beauty", subcategory: "Barber" },
    { name: "The Men's Room", category: "Health & Beauty", subcategory: "Barber" },

    // ── Financial Services ───────────────────────────────────
    { name: "NatWest", category: "Financial Services", subcategory: "Bank" },

    // ── Charity ──────────────────────────────────────────────
    { name: "Newcastle United Foundation", category: "Charity & Second Hand", subcategory: "Charity" },
];

// ============================================================
// Main
// ============================================================

async function main() {
    console.log("═══════════════════════════════════════════════");
    console.log("  Metrocentre (Gateshead) — Full Enrichment");
    console.log("═══════════════════════════════════════════════\n");

    // 1. Update location metadata
    console.log("🔄 Updating location metadata...");
    await prisma.location.update({
        where: { id: METROCENTRE_ID },
        data: {
            name: "Metrocentre",
            city: "Gateshead",
            postcode: "NE11 9YG",
            type: "SHOPPING_CENTRE",
            website: "https://themetrocentre.co.uk",
            phone: "0191 493 0200",

            heroImage: "https://dssr.co.uk/wp-content/uploads/2023/04/metrocover-1200x640-1.webp",

            owner: "Metrocentre Partnership",
            management: "Sovereign Centros (CBRE)",
            openedYear: 1986,

            totalFloorArea: 2076000,
            numberOfStores: tenants.length,
            retailers: tenants.length,
            parkingSpaces: 10000,
            numberOfFloors: 2,
            anchorTenants: 6,
            footfall: 16000000,
            retailSpace: 2076000,

            openingHours: {
                "Mon-Fri": "10:00-21:00",
                "Sat": "09:00-20:00",
                "Sun": "11:00-17:00",
            },
            publicTransit: "Metrocentre station (Northern Trains) directly adjacent. Bus interchange on-site. A1(M) junction 77.",
            evCharging: true,
            evChargingSpaces: 40,
            carParkPrice: "0",

            // Social
            instagram: "https://www.instagram.com/metrocentre",
            facebook: "https://www.facebook.com/Metrocentre",
            twitter: "https://twitter.com/Aborfield_Metro",

            // Reviews
            googleRating: 4.3,
            googleReviews: 22600,

            // Demographics (Gateshead LTLA — ONS Census 2021)
            population: 196000,
            medianAge: 41,
            avgHouseholdIncome: 25500,
            homeownership: 58,
            carOwnership: 68,
            familiesPercent: 28,
            seniorsPercent: 20,
        },
    });
    console.log("  ✅ Metadata updated");

    // 2. Delete existing tenants and insert new
    const deleted = await prisma.tenant.deleteMany({ where: { locationId: METROCENTRE_ID } });
    console.log(`\n🗑️  Deleted ${deleted.count} old tenants`);
    console.log(`📦 Inserting ${tenants.length} tenants...`);

    let created = 0;
    let skipped = 0;

    for (const t of tenants) {
        try {
            await prisma.tenant.create({
                data: {
                    locationId: METROCENTRE_ID,
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

    // 3. Update largest category
    const cats = await prisma.tenant.groupBy({
        by: ["category"],
        where: { locationId: METROCENTRE_ID },
        _count: true,
        orderBy: { _count: { category: "desc" } },
    });
    const total = cats.reduce((sum, c) => sum + c._count, 0);
    if (cats.length > 0 && total > 0) {
        await prisma.location.update({
            where: { id: METROCENTRE_ID },
            data: {
                largestCategory: cats[0].category,
                largestCategoryPercent: Number((cats[0]._count / total).toFixed(3)),
            },
        });
    }

    // 4. Verify
    console.log("\n═══════════════════════════════════════════════");
    console.log("  Verification");
    console.log("═══════════════════════════════════════════════\n");

    const loc = await prisma.location.findUnique({
        where: { id: METROCENTRE_ID },
        select: {
            name: true,
            numberOfStores: true,
            owner: true,
            footfall: true,
            largestCategory: true,
            largestCategoryPercent: true,
            heroImage: true,
            _count: { select: { tenants: true } },
        },
    });

    if (loc) {
        console.log(`📍 ${loc.name}`);
        console.log(`   Owner: ${loc.owner}`);
        console.log(`   Footfall: ${loc.footfall}`);
        console.log(`   Hero: ${loc.heroImage}`);
        console.log(`   Stores: ${loc.numberOfStores} | DB Tenants: ${loc._count.tenants}`);
        console.log(`   Largest: ${loc.largestCategory} (${((Number(loc.largestCategoryPercent) || 0) * 100).toFixed(1)}%)`);

        console.log(`\n   Category breakdown:`);
        for (const c of cats) {
            console.log(`     ${c.category}: ${c._count} (${((c._count / total) * 100).toFixed(1)}%)`);
        }
    }

    console.log("\n✅ Metrocentre enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
