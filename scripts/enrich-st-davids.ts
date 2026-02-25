/**
 * St David's Dewi Sant — Full Re-Enrichment (LDC Taxonomy)
 *
 * Wales's largest shopping centre in Cardiff city centre.
 * 160+ stores, opened 2009 (new building), owned by Landsec.
 *
 * This re-enrichment:
 *   1. Re-categorises all tenants from old CACI taxonomy → canonical LDC 3-Tier taxonomy
 *   2. Sets hero image
 *   3. Computes largestCategory / largestCategoryPercent
 *
 * Sources:
 *   - stdavidscardiff.com/sitemap.xml (tenant list, unchanged from Feb 2026 extraction)
 *   - Wikipedia, Landsec, press releases (metadata)
 *
 * Run: npx tsx scripts/enrich-st-davids.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCATION_ID = "cmks95l980005fajkx22y1ctx";

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

// ============================================================
// Tenants — LDC 3-Tier Taxonomy (re-categorised from CACI)
// ============================================================

const tenants: TenantInput[] = [
    // === SHOPS ===

    // --- Anchors ---
    { name: "John Lewis", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "Primark", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "H&M", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Zara", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Next", category: "Clothing & Footwear", subcategory: "Mid-Range", isAnchorTenant: true },
    { name: "Apple", category: "Electrical & Technology", subcategory: "Consumer Electronics", isAnchorTenant: true },

    // --- Clothing & Footwear ---
    { name: "Accessorize", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "AllSaints", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "Apricot", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "ATRIUM Menswear", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Bershka", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Bon Marché", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "BOSS", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Boux Avenue", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Bravissimo", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Charles Tyrwhitt", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Claire's", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "Clarks", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Crew Clothing", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Damaged Society", category: "Clothing & Footwear", subcategory: "Streetwear" },
    { name: "Fat Face", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Foot Locker", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Footasylum", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Hawes & Curtis", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Hobbs", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Hollister", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Hotter", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Jack & Jones", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "JD Sports", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "Kenji", category: "Clothing & Footwear", subcategory: "Streetwear" },
    { name: "Kurt Geiger", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Levi's", category: "Clothing & Footwear", subcategory: "Denim" },
    { name: "Lounge", category: "Clothing & Footwear", subcategory: "Loungewear" },
    { name: "Luke", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "M&S", category: "Department Stores", subcategory: "Department Store" },
    { name: "Mango", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "Mint Velvet", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Moss", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Office", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Peacocks", category: "Clothing & Footwear", subcategory: "Value" },
    { name: "Phase Eight", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Pull & Bear", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Quiz", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Reiss", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "River Island", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Schuh", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Size?", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Skechers", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Slaters", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Sosandar", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Stradivarius", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Superdry", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "The Clothing Culture", category: "Clothing & Footwear", subcategory: "Streetwear" },
    { name: "The North Face", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Timberland", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Trespass", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Vans", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Vivienne Westwood", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Yours", category: "Clothing & Footwear", subcategory: "Plus Size" },

    // --- Jewellery & Watches ---
    { name: "Breitling", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Clogau", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Crouch SD2 Fraser Hart", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Diamond Heaven", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Ernest Jones", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Goldsmiths", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "H. Samuel", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "In Time", category: "Jewellery & Watches", subcategory: "Watch Repair" },
    { name: "Laings", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Lovisa", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Omega", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Pandora", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Pravins", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Sunglass Hut", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Swarovski", category: "Jewellery & Watches", subcategory: "Crystal Jewellery" },
    { name: "Swatch", category: "Jewellery & Watches", subcategory: "Watches" },
    { name: "TAG Heuer", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "The Watch Lab", category: "Jewellery & Watches", subcategory: "Watch Repair" },
    { name: "Thomas Sabo", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Warren James", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Watches of Switzerland", category: "Jewellery & Watches", subcategory: "Luxury Watches" },

    // --- Health & Beauty ---
    { name: "A.G. Meek", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Beauty Studio by Superdrug", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Boots (Second Store)", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Glamour Forever Store", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Jo Malone", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "L'Occitane", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "Laser Clinics UK", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "MAC", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Penhaligon's", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Pop Specs", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "PURESEOUL", category: "Health & Beauty", subcategory: "K-Beauty" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Body Care" },
    { name: "Sephora", category: "Health & Beauty", subcategory: "Premium Cosmetics" },
    { name: "Space NK", category: "Health & Beauty", subcategory: "Premium Cosmetics" },
    { name: "Sunnamusk London", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "The Body Shop", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "The Fragrance Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Fragrance Shop (Grand Arcade)", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop (2)", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Vision Express", category: "Health & Beauty", subcategory: "Optician" },

    // --- Electrical & Technology ---
    { name: "3 Store", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "CeX", category: "Electrical & Technology", subcategory: "Second Hand Electronics" },
    { name: "EE", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "iSmash", category: "Electrical & Technology", subcategory: "Mobile Repair" },
    { name: "Mobile Bitz", category: "Electrical & Technology", subcategory: "Mobile Repair" },
    { name: "O2", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Samsung", category: "Electrical & Technology", subcategory: "Consumer Electronics" },
    { name: "Sky", category: "Electrical & Technology", subcategory: "Telecoms" },
    { name: "Vodafone", category: "Electrical & Technology", subcategory: "Mobile Network" },

    // --- Home & Garden ---
    { name: "Bo Concept", category: "Home & Garden", subcategory: "Furniture" },
    { name: "Oliver Bonas", category: "Home & Garden", subcategory: "Home & Lifestyle" },
    { name: "Søstrene Grene", category: "Home & Garden", subcategory: "Homeware" },
    { name: "The White Company", category: "Home & Garden", subcategory: "Home & Lifestyle" },

    // --- Gifts & Stationery ---
    { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Castle Fine Art", category: "Gifts & Stationery", subcategory: "Art Gallery" },
    { name: "Smiggle", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "Television & Movie Store", category: "Gifts & Stationery", subcategory: "Gifts" },

    // --- General Retail ---
    { name: "Flying Tiger", category: "General Retail", subcategory: "Variety Store" },
    { name: "Menkind", category: "General Retail", subcategory: "Specialist" },
    { name: "Miniso", category: "General Retail", subcategory: "Variety Store" },
    { name: "One Beyond", category: "General Retail", subcategory: "Variety Store" },

    // --- Kids & Toys ---
    { name: "Build A Bear Workshop", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "LEGO Store", category: "Kids & Toys", subcategory: "Toy Store" },

    // --- Food & Grocery ---
    { name: "Hotel Chocolat", category: "Food & Grocery", subcategory: "Chocolate Shop" },
    { name: "Mr Simms Sweet Shop", category: "Food & Grocery", subcategory: "Sweet Shop" },
    { name: "Tesco Express", category: "Food & Grocery", subcategory: "Convenience Store" },

    // --- Services ---
    { name: "Ethical Boutique by The Safe Foundation", category: "Charity & Second Hand", subcategory: "Charity Shop" },
    { name: "The Carwash Company", category: "Services", subcategory: "Car Wash" },

    // --- Financial Services ---
    { name: "Barclays", category: "Financial Services", subcategory: "Bank" },
    { name: "Eurochange", category: "Financial Services", subcategory: "Currency Exchange" },
    { name: "Eurochange (Second Store)", category: "Financial Services", subcategory: "Currency Exchange" },
    { name: "Principality Building Society", category: "Financial Services", subcategory: "Building Society" },

    // === EAT ===

    // --- Cafes & Restaurants ---
    { name: "Auntie Anne's Pretzels", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Banana Tree", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Barburrito", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Bubble CiTea", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Caffè Nero", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Carl's Jr", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Chopstix", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Ciliegino", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Costa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Cosy Club", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Cupp Bubble Tea", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Frankie & Benny's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Fuel", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Gaucho", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Giggling Squid", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Greggs", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Kin & Ilk", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Knoops", category: "Cafes & Restaurants", subcategory: "Cafe" },
    { name: "Krispy Kreme", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Muffin Break", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "My Cookie Dough", category: "Cafes & Restaurants", subcategory: "Dessert Shop" },
    { name: "Nando's", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Pizza Express", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pret A Manger", category: "Cafes & Restaurants", subcategory: "Sandwich Shop" },
    { name: "Prezzo", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Shake Shack", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Slim Chickens", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Starbucks", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Starbucks (Second Location)", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "TGI Fridays", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "The Bagel Place", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "The Ivy Asia", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "The Ivy Cardiff", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Wagamama", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Wahaca", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Which Wich", category: "Cafes & Restaurants", subcategory: "Sandwich Shop" },
    { name: "YO! Sushi", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Zizzi", category: "Cafes & Restaurants", subcategory: "Restaurant" },

    // === LEISURE ===
    { name: "Cineworld", category: "Leisure & Entertainment", subcategory: "Cinema", isAnchorTenant: true },
    { name: "Treetop Adventure Golf", category: "Leisure & Entertainment", subcategory: "Mini Golf" },
];

// ============================================================
// Location metadata — update hero image + confirm existing
// ============================================================

async function enrichLocation() {
    console.log("🔄 Enriching St David's Dewi Sant metadata...");
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            heroImage:
                "https://www.visitcardiff.com/app/uploads/2022/12/st-davids-gallery-2.jpg",
            // Confirm existing metadata (originally set in enrich-landsec-trio.ts)
            website: "https://www.stdavidscardiff.com",
            phone: "029 2036 7600",
            openingHours: { "Mon-Fri": "09:30-20:00", Sat: "09:30-19:00", Sun: "11:00-16:00" },
            parkingSpaces: 2000,
            retailSpace: 1000000,
            numberOfStores: tenants.length,
            retailers: tenants.length,
            numberOfFloors: 3,
            anchorTenants: 7,
            publicTransit:
                "Cardiff Central and Cardiff Queen Street stations within 5-min walk. Cardiff Bus routes and Bay Car shuttle.",
            owner: "Landsec",
            management: "Landsec",
            openedYear: 2009,
            footfall: 36000000,
            evCharging: true,
            evChargingSpaces: 8,
            carParkPrice: 3.0,
            instagram: "https://www.instagram.com/stdavidscardiff",
            facebook: "https://www.facebook.com/StDavidsCardiff",
            twitter: "https://twitter.com/StDavidsCardiff",
            googleRating: 4.1,
            googleReviews: 25000,
            totalFloorArea: 1400000,
        },
    });
    console.log("  ✅ Location metadata updated");
}

// ============================================================
// Tenant upsert — clean + re-insert with LDC taxonomy
// ============================================================

async function insertTenants() {
    const deleted = await prisma.tenant.deleteMany({ where: { locationId: LOCATION_ID } });
    console.log(`\n🗑️  Deleted ${deleted.count} old tenants`);
    console.log(`📦 Inserting ${tenants.length} tenants (LDC taxonomy)...`);

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
    console.log("  St David's Dewi Sant — LDC Re-Enrichment");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocation();
    await insertTenants();
    await updateLargestCategory();
    await verify();

    console.log("\n✅ St David's Dewi Sant enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
