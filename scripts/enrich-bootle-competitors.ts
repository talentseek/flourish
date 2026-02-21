/**
 * Bootle-Area Competitor Enrichment (7 centres, excl. Liverpool ONE)
 *
 * Locations within 5 miles of The Strand Shopping Centre, Bootle:
 * 1. Churchill SC, Liverpool (3.2mi) — Small neighbourhood parade
 * 2. Cavern Walks SC, Liverpool (3.2mi) — Boutique/tourist
 * 3. Metquarter, Liverpool (3.1mi) — Luxury/designer
 * 4. Clayton Square SC, Liverpool (3.2mi) — Mid-market city centre
 * 5. Cherry Tree SC, Wallasey (3.1mi) — Community value retail
 * 6. Central Square Maghull (4.9mi) — Community retail
 * 7. St. Johns SC, Liverpool (3.2mi) — Major value/mass market
 *
 * Sources: Official websites, web search, Wikipedia, LCP Group
 * Run: npx tsx scripts/enrich-bootle-competitors.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

// ============================================================
// 1. CHURCHILL SC — Small parade (L10 6LB, Aintree)
//    13 units, neighbourhood convenience
// ============================================================
const CHURCHILL_ID = "cmid0krx501lcmtpu5m5s21kr";
const churchillTenants: TenantInput[] = [
    { name: "Morrisons Daily", category: "Food & Grocery", subcategory: "Convenience Store", isAnchorTenant: true },
    { name: "William Hill", category: "Services", subcategory: "Betting" },
    { name: "Alliance Pharmacy", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Post Office", category: "Services", subcategory: "Post Office" },
    { name: "Premier News", category: "Services", subcategory: "Newsagent" },
    { name: "Golden Dragon", category: "Cafes & Restaurants", subcategory: "Takeaway" },
    { name: "Churchill Barbers", category: "Health & Beauty", subcategory: "Barber" },
    { name: "Churchill Launderette", category: "Services", subcategory: "Launderette" },
];

// ============================================================
// 2. CAVERN WALKS SC — Boutique/tourist centre (Mathew Street)
// ============================================================
const CAVERN_WALKS_ID = "cmid0krga01kumtpuobokngi5";
const cavernWalksTenants: TenantInput[] = [
    { name: "Cavern Menswear", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Pose & Pout", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Rojeans", category: "Clothing & Footwear", subcategory: "Denim" },
    { name: "Chris James Jewellers", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Rock Off", category: "Gifts & Stationery", subcategory: "Music Merchandise" },
    { name: "Historic Liverpool", category: "Gifts & Stationery", subcategory: "Souvenirs" },
    { name: "As Above So Below Emporium", category: "General Retail", subcategory: "Specialist" },
    { name: "MS Taurus", category: "General Retail", subcategory: "Specialist" },
    { name: "Pokemon Cards", category: "Leisure & Entertainment", subcategory: "Collectibles" },
    { name: "Lisas Reborn Baby Dolls", category: "General Retail", subcategory: "Specialist" },
    { name: "Chantilly Beatles Cafe", category: "Cafes & Restaurants", subcategory: "Cafe" },
];

// ============================================================
// 3. METQUARTER — Luxury/designer (Victoria Street)
//    Source: metquarter.com, web search
// ============================================================
const METQUARTER_ID = "cmid0kwuj01q9mtpulfwyf1tq";
const metquarterTenants: TenantInput[] = [
    { name: "Cricket Fashion", category: "Clothing & Footwear", subcategory: "Designer", isAnchorTenant: true },
    { name: "Kids Cavern", category: "Clothing & Footwear", subcategory: "Childrenswear" },
    { name: "Smudge Boutique", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Francesca Couture", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Fairytale Endings", category: "Clothing & Footwear", subcategory: "Occasion Wear" },
    { name: "All Over The Shop", category: "Clothing & Footwear", subcategory: "Concept Store" },
    { name: "Say It With Diamonds", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Urban Calm", category: "Health & Beauty", subcategory: "Spa" },
    { name: "The Art Quarter", category: "Gifts & Stationery", subcategory: "Art Gallery" },
    { name: "Everyman Cinema", category: "Leisure & Entertainment", subcategory: "Cinema", isAnchorTenant: true },
    { name: "LMA", category: "Other", subcategory: "Education" },
    { name: "Victoria Street Collective", category: "Cafes & Restaurants", subcategory: "Food Hall" },
];

// ============================================================
// 4. CLAYTON SQUARE SC — Mid-market city centre
//    Source: claytonsquare.co.uk, web search
// ============================================================
const CLAYTON_SQUARE_ID = "cmid0ks3w01ljmtpu0hidsg8s";
const claytonSquareTenants: TenantInput[] = [
    { name: "B&M", category: "General Retail", subcategory: "Discount Store", isAnchorTenant: true },
    { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy", isAnchorTenant: true },
    { name: "Bodycare", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Bon", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Clayton Nails & Spa", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "Clayton News", category: "Services", subcategory: "Newsagent" },
    { name: "Costa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "EE", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "eurochange", category: "Financial Services", subcategory: "Currency Exchange" },
    { name: "L1 Styles", category: "Clothing & Footwear", subcategory: "Streetwear" },
    { name: "Ladbrokes", category: "Services", subcategory: "Betting" },
    { name: "Lane 7", category: "Leisure & Entertainment", subcategory: "Bowling" },
    { name: "MAVI Brow Bar", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "McDonald's", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Phone Clinic 4U", category: "Electrical & Technology", subcategory: "Mobile Repair" },
    { name: "Tesco Express", category: "Food & Grocery", subcategory: "Convenience Store" },
    { name: "The Gym Group", category: "Leisure & Entertainment", subcategory: "Gym", isAnchorTenant: true },
    { name: "Top Gift Mobile Accessories", category: "Electrical & Technology", subcategory: "Mobile Accessories" },
    { name: "Vision Express", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Wildwood", category: "Cafes & Restaurants", subcategory: "Restaurant" },
];

// ============================================================
// 5. CHERRY TREE SC, WALLASEY — Community value retail
//    39 units, 250 parking, single level
//    Source: web search (site DNS unreachable)
// ============================================================
const CHERRY_TREE_ID = "cmid0krqb01l5mtpum7y64e0q";
const cherryTreeTenants: TenantInput[] = [
    { name: "Primark", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Home Bargains", category: "General Retail", subcategory: "Discount Store", isAnchorTenant: true },
    { name: "B&M", category: "General Retail", subcategory: "Discount Store", isAnchorTenant: true },
    { name: "Bonmarche", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "Specsavers", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Scrivens Opticians", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Savers", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Heron Foods", category: "Food & Grocery", subcategory: "Supermarket" },
    { name: "EE", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Max Spielmann", category: "Services", subcategory: "Photo Printing" },
    { name: "Cash Converters", category: "Financial Services", subcategory: "Pawnbroker" },
    { name: "Hays Travel", category: "Services", subcategory: "Travel Agency" },
    { name: "Barrhead Travel", category: "Services", subcategory: "Travel Agency" },
    { name: "Costa", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Coffee House", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Poundbakery", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Admiral Casino", category: "Leisure & Entertainment", subcategory: "Casino" },
    { name: "Hollywood Brow Bar", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Smart Dental", category: "Health & Beauty", subcategory: "Dental" },
    { name: "Beresfords Butchers", category: "Food & Grocery", subcategory: "Butcher" },
    { name: "E-Vapes", category: "General Retail", subcategory: "Vape Shop" },
    { name: "Supernews", category: "Services", subcategory: "Newsagent" },
    { name: "Waterfields Choice", category: "General Retail", subcategory: "Specialist" },
    { name: "Partell", category: "General Retail", subcategory: "Specialist" },
    { name: "Outlet Store", category: "Clothing & Footwear", subcategory: "Outlet" },
    { name: "Wirral Trade Hub", category: "Services", subcategory: "Trade Supplies" },
    { name: "YMCA", category: "Other", subcategory: "Charity" },
    { name: "Wallasey Lions Charity Book Shop", category: "Charity & Second Hand", subcategory: "Charity Shop" },
    { name: "Age UK", category: "Charity & Second Hand", subcategory: "Charity Shop" },
];

// ============================================================
// 6. CENTRAL SQUARE MAGHULL — Community retail
//    Anchored by Sainsbury's. LCP Group managed.
// ============================================================
const CENTRAL_SQUARE_ID = "cmicxw4br000c13hx99elsjlo";
const centralSquareTenants: TenantInput[] = [
    { name: "Sainsbury's", category: "Food & Grocery", subcategory: "Supermarket", isAnchorTenant: true },
    { name: "Home Bargains", category: "General Retail", subcategory: "Discount Store", isAnchorTenant: true },
    { name: "B&M", category: "General Retail", subcategory: "Discount Store" },
    { name: "Bonmarché", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Specsavers", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Timpson", category: "Services", subcategory: "Shoe Repair" },
    { name: "TSB", category: "Financial Services", subcategory: "Bank" },
    { name: "Ladbrokes", category: "Services", subcategory: "Betting" },
    { name: "Hays Travel", category: "Services", subcategory: "Travel Agency" },
    { name: "Anytime Fitness", category: "Leisure & Entertainment", subcategory: "Gym" },
    { name: "Costa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Domino's", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Furusato", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "McColl's", category: "Food & Grocery", subcategory: "Convenience Store" },
    { name: "Singh News", category: "Services", subcategory: "Newsagent" },
    { name: "Oscars Coffee Shop", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
];

// ============================================================
// 7. ST. JOHNS SC, LIVERPOOL — Major value/mass market
//    100+ stores + St Johns Market. Opened 1969.
//    Sources: stjohns-shopping.co.uk, stjshopping.co.uk, web search
// ============================================================
const ST_JOHNS_ID = "cmid0l0qs01ucmtpuj6aeqmxy";
const stJohnsTenants: TenantInput[] = [
    // --- Department / Anchor ---
    { name: "Primark", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "JD Sports", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "Home Bargains", category: "General Retail", subcategory: "Discount Store", isAnchorTenant: true },
    // --- Clothing & Footwear ---
    { name: "Bonmarché", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Trespass", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Ego", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Ally Fashion", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Bunnies", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "D-Fyne", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Frocks", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Hana's Boutique", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Kyra's Kloset", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Miltons", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Accessories by Storm", category: "Clothing & Footwear", subcategory: "Accessories" },
    // --- Jewellery & Watches ---
    { name: "Beaverbrooks", category: "Jewellery & Watches", subcategory: "Jewellery", isAnchorTenant: true },
    { name: "Ernest Jones", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "F.Hinds", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "H. Samuel", category: "Jewellery & Watches", subcategory: "Jewellery" },
    // --- Health & Beauty ---
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Beverly Hills Nails", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "Hollywood Nails", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "Citrus Cosmetics", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Equivalenza", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Face Brow Bar", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Liverpool Hair & Cosmetics", category: "Health & Beauty", subcategory: "Hair Salon" },
    // --- Food & Grocery ---
    { name: "Aldi", category: "Food & Grocery", subcategory: "Supermarket", isAnchorTenant: true },
    { name: "Iceland", category: "Food & Grocery", subcategory: "Supermarket" },
    // --- Cafes & Restaurants ---
    { name: "McDonald's", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "KFC", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Subway", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Greggs", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Dunkin'", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Chopstix", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Churros", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Caffe Nero", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Key Lime Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Café Central", category: "Cafes & Restaurants", subcategory: "Cafe" },
    { name: "Bakers & Baristas", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Ali Baba", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "The Fall Well (Wetherspoons)", category: "Cafes & Restaurants", subcategory: "Pub" },
    // --- Gifts & Stationery ---
    { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Cards ETC", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Clintons", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
    { name: "Waterstones", category: "Gifts & Stationery", subcategory: "Books" },
    // --- General Retail ---
    { name: "Poundland", category: "General Retail", subcategory: "Discount Store" },
    { name: "The Best in Leather", category: "General Retail", subcategory: "Specialist" },
    // --- Electrical & Technology ---
    { name: "CeX", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "HMV", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "O2", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Three", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Fone Care", category: "Electrical & Technology", subcategory: "Mobile Repair" },
    // --- Leisure & Entertainment ---
    { name: "Toytown", category: "Leisure & Entertainment", subcategory: "Toys" },
    { name: "Leisure Time", category: "Leisure & Entertainment", subcategory: "Amusements" },
    // --- Financial Services ---
    { name: "TSB", category: "Financial Services", subcategory: "Bank" },
    { name: "Virgin Money", category: "Financial Services", subcategory: "Bank" },
    { name: "eurochange", category: "Financial Services", subcategory: "Currency Exchange" },
    // --- Services ---
    { name: "Max Spielmann", category: "Services", subcategory: "Photo Printing" },
    { name: "Timpson", category: "Services", subcategory: "Shoe Repair" },
    { name: "Jays Express", category: "Services", subcategory: "Dry Cleaning" },
];

// ============================================================
// Location metadata enrichment
// ============================================================

async function enrichLocations() {
    console.log("🔄 Enriching Churchill SC...");
    await prisma.location.update({
        where: { id: CHURCHILL_ID },
        data: {
            numberOfStores: churchillTenants.length,
            retailers: churchillTenants.length,
            type: "SHOPPING_CENTRE",
        },
    });

    console.log("🔄 Enriching Cavern Walks SC...");
    await prisma.location.update({
        where: { id: CAVERN_WALKS_ID },
        data: {
            website: "https://www.cavernwalks.com",
            numberOfStores: cavernWalksTenants.length,
            retailers: cavernWalksTenants.length,
            openedYear: 1984,
        },
    });

    console.log("🔄 Enriching Metquarter...");
    await prisma.location.update({
        where: { id: METQUARTER_ID },
        data: {
            website: "https://www.metquarter.com",
            numberOfStores: metquarterTenants.length,
            retailers: metquarterTenants.length,
            openedYear: 2006,
            owner: "Queensberry Real Estate",
            management: "Queensberry Real Estate",
            instagram: "https://www.instagram.com/metquarter/",
            facebook: "https://www.facebook.com/pages/Metquarter-Liverpool/46051672229",
        },
    });

    console.log("🔄 Enriching Clayton Square SC...");
    await prisma.location.update({
        where: { id: CLAYTON_SQUARE_ID },
        data: {
            website: "https://www.claytonsquare.co.uk",
            numberOfStores: claytonSquareTenants.length,
            retailers: claytonSquareTenants.length,
            openedYear: 1988,
            openingHours: { "Mon-Sat": "08:00-18:00", Sun: "11:00-17:00" },
            publicTransit: "Adjacent to Liverpool Central station (Merseyrail). Lime Street station 5-min walk.",
        },
    });

    console.log("🔄 Enriching Cherry Tree SC...");
    await prisma.location.update({
        where: { id: CHERRY_TREE_ID },
        data: {
            website: "https://www.cherrytreeshoppingcentre.co.uk",
            numberOfStores: cherryTreeTenants.length,
            retailers: cherryTreeTenants.length,
            parkingSpaces: 250,
            numberOfFloors: 1,
        },
    });

    console.log("🔄 Enriching Central Square Maghull...");
    await prisma.location.update({
        where: { id: CENTRAL_SQUARE_ID },
        data: {
            numberOfStores: centralSquareTenants.length,
            retailers: centralSquareTenants.length,
            owner: "LCP Group",
            management: "LCP Group",
        },
    });

    console.log("🔄 Enriching St. Johns SC...");
    await prisma.location.update({
        where: { id: ST_JOHNS_ID },
        data: {
            website: "https://www.stjohns-shopping.co.uk",
            numberOfStores: stJohnsTenants.length,
            retailers: stJohnsTenants.length,
            openedYear: 1969,
            publicTransit: "Above Liverpool Central station (Merseyrail). Lime Street main line station adjacent.",
        },
    });
}

// ============================================================
// Tenant upsert — clean + re-insert
// ============================================================

async function insertTenants(locationId: string, name: string, tenants: TenantInput[]) {
    const deleted = await prisma.tenant.deleteMany({ where: { locationId } });
    console.log(`\n🗑️  Deleted ${deleted.count} old tenants for ${name}`);
    console.log(`📦 Inserting ${tenants.length} tenants for ${name}...`);

    let created = 0;
    let skipped = 0;

    for (const t of tenants) {
        try {
            await prisma.tenant.create({
                data: {
                    locationId,
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

async function updateLargestCategory(locationId: string) {
    const cats = await prisma.tenant.groupBy({
        by: ["category"],
        where: { locationId },
        _count: true,
        orderBy: { _count: { category: "desc" } },
    });
    const total = cats.reduce((sum, c) => sum + c._count, 0);
    if (cats.length > 0 && total > 0) {
        await prisma.location.update({
            where: { id: locationId },
            data: {
                largestCategory: cats[0].category,
                largestCategoryPercent: Number((cats[0]._count / total).toFixed(3)),
            },
        });
    }
}

// ============================================================
// Verification
// ============================================================

async function verify() {
    console.log("\n═══════════════════════════════════════════════");
    console.log("  Verification");
    console.log("═══════════════════════════════════════════════\n");

    const locations = [
        { id: CHURCHILL_ID, label: "Churchill SC" },
        { id: CAVERN_WALKS_ID, label: "Cavern Walks SC" },
        { id: METQUARTER_ID, label: "Metquarter" },
        { id: CLAYTON_SQUARE_ID, label: "Clayton Square SC" },
        { id: CHERRY_TREE_ID, label: "Cherry Tree SC" },
        { id: CENTRAL_SQUARE_ID, label: "Central Square Maghull" },
        { id: ST_JOHNS_ID, label: "St. Johns SC" },
    ];

    for (const { id, label } of locations) {
        const loc = await prisma.location.findUnique({
            where: { id },
            select: {
                name: true,
                numberOfStores: true,
                largestCategory: true,
                largestCategoryPercent: true,
                _count: { select: { tenants: true } },
            },
        });

        if (loc) {
            console.log(`📍 ${label}`);
            console.log(`   ${loc.name} | Stores: ${loc.numberOfStores} | DB Tenants: ${loc._count.tenants}`);
            console.log(`   Largest: ${loc.largestCategory} (${((Number(loc.largestCategoryPercent) || 0) * 100).toFixed(1)}%)`);

            const cats = await prisma.tenant.groupBy({
                by: ["category"],
                where: { locationId: id },
                _count: true,
                orderBy: { _count: { category: "desc" } },
            });
            console.log(`   Categories: ${cats.map((c) => `${c.category}(${c._count})`).join(", ")}`);
            console.log();
        }
    }
}

// ============================================================
// Main
// ============================================================

async function main() {
    console.log("═══════════════════════════════════════════════");
    console.log("  Bootle-Area Competitor Enrichment — Feb 2026");
    console.log("  7 Shopping Centres (excl. Liverpool ONE)");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocations();

    const centres = [
        { id: CHURCHILL_ID, name: "Churchill SC", tenants: churchillTenants },
        { id: CAVERN_WALKS_ID, name: "Cavern Walks SC", tenants: cavernWalksTenants },
        { id: METQUARTER_ID, name: "Metquarter", tenants: metquarterTenants },
        { id: CLAYTON_SQUARE_ID, name: "Clayton Square SC", tenants: claytonSquareTenants },
        { id: CHERRY_TREE_ID, name: "Cherry Tree SC", tenants: cherryTreeTenants },
        { id: CENTRAL_SQUARE_ID, name: "Central Square Maghull", tenants: centralSquareTenants },
        { id: ST_JOHNS_ID, name: "St. Johns SC", tenants: stJohnsTenants },
    ];

    for (const c of centres) {
        await insertTenants(c.id, c.name, c.tenants);
        await updateLargestCategory(c.id);
    }

    await verify();

    console.log("\n✅ Bootle competitor enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
