/**
 * EK, East Kilbride — Full Enrichment (LDC Taxonomy)
 *
 * Scotland's largest covered shopping centre.
 * 150+ stores, opened 1959, owned by Sapphire (in administration) / Scoop Asset Management.
 *
 * Sources:
 *   - eklife.co.uk/shops-sitemap.xml (tenant list, Feb 2026)
 *   - Wikipedia, press, Google Maps (metadata)
 *
 * Run: npx tsx scripts/enrich-ek-east-kilbride.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCATION_ID = "cmks95lbi0006fajke474s7kn";

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

// ============================================================
// Tenants — from eklife.co.uk/shops-sitemap.xml
// Categories use canonical LDC 3-Tier Taxonomy
// ============================================================

const tenants: TenantInput[] = [
    // --- Anchors ---
    { name: "Primark", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "JD Sports", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "Sports Direct", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "Matalan", category: "Clothing & Footwear", subcategory: "Value", isAnchorTenant: true },
    { name: "Odeon Luxe", category: "Leisure & Entertainment", subcategory: "Cinema", isAnchorTenant: true },
    { name: "PureGym", category: "Leisure & Entertainment", subcategory: "Gym", isAnchorTenant: true },

    // --- Clothing & Footwear ---
    { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Peacocks", category: "Clothing & Footwear", subcategory: "Value" },
    { name: "Clarks", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Trespass", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Yours Clothing", category: "Clothing & Footwear", subcategory: "Plus Size" },
    { name: "Blossoms", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Blossoms School Wear", category: "Clothing & Footwear", subcategory: "Kidswear" },
    { name: "Celtic Store", category: "Clothing & Footwear", subcategory: "Sport Merchandise" },
    { name: "Boo 20", category: "Clothing & Footwear", subcategory: "Womenswear" },

    // --- Health & Beauty ---
    { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Boots (Princes Mall)", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Boots (Princes Square)", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Savers", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Fragrance Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Specsavers", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Vision Express", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Hair Zone Barbers", category: "Health & Beauty", subcategory: "Barber" },
    { name: "Hair Place Barbers", category: "Health & Beauty", subcategory: "Barber" },
    { name: "Royal Nails", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "Nails & Beauty", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "Koko Nails & Spa", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "Restyled Salon", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Honey Bee", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Cover Beauty", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Agape Wellbeing Centre", category: "Health & Beauty", subcategory: "Wellness" },
    { name: "360 Health", category: "Health & Beauty", subcategory: "Wellness" },

    // --- Jewellery & Watches ---
    { name: "Pandora", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Warren James", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Lovisa", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "SS Argento", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Watch Repair Centre", category: "Jewellery & Watches", subcategory: "Watch Repair" },

    // --- Electrical & Technology ---
    { name: "CeX", category: "Electrical & Technology", subcategory: "Second Hand Electronics" },
    { name: "hmv", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "O2", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Three", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Vodafone", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Mobile Solutions EK", category: "Electrical & Technology", subcategory: "Mobile Repair" },

    // --- Home & Garden ---
    { name: "Home Bargains", category: "Home & Garden", subcategory: "Homeware" },
    { name: "Home Essentials", category: "Home & Garden", subcategory: "Homeware" },
    { name: "Scottish Home Stores", category: "Home & Garden", subcategory: "Homeware" },
    { name: "Kilbryde Furniture", category: "Home & Garden", subcategory: "Furniture" },
    { name: "Jupiter Furniture", category: "Home & Garden", subcategory: "Furniture" },
    { name: "Sharps", category: "Home & Garden", subcategory: "Furniture" },

    // --- Gifts & Stationery ---
    { name: "Card Factory (Plaza)", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Card Factory (Princes Mall)", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Clintons", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
    { name: "Waterstones", category: "Gifts & Stationery", subcategory: "Books" },
    { name: "Castle Comics", category: "Gifts & Stationery", subcategory: "Collectibles" },
    { name: "Occasions", category: "Gifts & Stationery", subcategory: "Gifts" },

    // --- General Retail ---
    { name: "Poundland", category: "General Retail", subcategory: "Discount Store" },
    { name: "Flying Tiger Copenhagen", category: "General Retail", subcategory: "Variety Store" },
    { name: "Menkind", category: "Gifts & Stationery", subcategory: "Gadgets & Gifts" },
    { name: "Share Alike", category: "General Retail", subcategory: "Specialist" },
    { name: "Hudsons", category: "General Retail", subcategory: "Specialist" },
    { name: "Definition Detailing", category: "General Retail", subcategory: "Specialist" },

    // --- Kids & Toys ---
    { name: "The Entertainer", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "Soft Play East Kilbride", category: "Kids & Toys", subcategory: "Toys" },

    // --- Food & Grocery ---
    { name: "Iceland", category: "Food & Grocery", subcategory: "Supermarket" },
    { name: "Farmfoods", category: "Food & Grocery", subcategory: "Supermarket" },
    { name: "One O One", category: "Food & Grocery", subcategory: "Convenience Store" },
    { name: "Baynes The Family Bakers", category: "Food & Grocery", subcategory: "Bakery" },

    // --- Cafes & Restaurants ---
    { name: "Starbucks", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Costa Coffee (Plaza)", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Caffe Romana", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Muffin Break", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Greggs (Princes Mall)", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Greggs (Plaza)", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Nando's", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Tony Macaroni", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Victor's Chip Shop", category: "Cafes & Restaurants", subcategory: "Takeaway" },
    { name: "Blue Lagoon", category: "Cafes & Restaurants", subcategory: "Takeaway" },
    { name: "Subway (Cornwall Way)", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Bakers + Baristas", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },

    // --- Leisure & Entertainment ---
    { name: "East Kilbride Ice Rink", category: "Leisure & Entertainment", subcategory: "Ice Skating" },
    { name: "Mega Amusements", category: "Leisure & Entertainment", subcategory: "Amusements" },
    { name: "Carlton Bingo Club", category: "Leisure & Entertainment", subcategory: "Bingo" },
    { name: "Mr Cashman Casino Slots", category: "Leisure & Entertainment", subcategory: "Casino" },
    { name: "Encore Stars Academy", category: "Leisure & Entertainment", subcategory: "Education" },
    { name: "Ramada Hotel", category: "Leisure & Entertainment", subcategory: "Hotel" },

    // --- Services ---
    { name: "Timpson", category: "Services", subcategory: "Shoe Repair" },
    { name: "Customer Service", category: "Services", subcategory: "Community" },
    { name: "TUI", category: "Services", subcategory: "Travel Agency" },
    { name: "Co-op Travel", category: "Services", subcategory: "Travel Agency" },
    { name: "T.G. Jones", category: "Services", subcategory: "Newsagent" },
    { name: "News Stop", category: "Services", subcategory: "Newsagent" },
    { name: "News Stop (Southgate)", category: "Services", subcategory: "Newsagent" },
    { name: "Plaza News", category: "Services", subcategory: "Newsagent" },
    { name: "The Meeting Place", category: "Services", subcategory: "Community" },
    { name: "Shopmobility", category: "Services", subcategory: "Community" },
    { name: "Connected East Kilbride", category: "Services", subcategory: "Community" },
    { name: "Hays", category: "Services", subcategory: "Employment Services" },
    { name: "Jobcentre Plus", category: "Services", subcategory: "Employment Services" },
    { name: "Routes Work South", category: "Services", subcategory: "Employment Services" },
    { name: "Mobility & Living", category: "Services", subcategory: "Specialist" },
    { name: "Rooftop ELC", category: "Services", subcategory: "Education" },
    { name: "East Kilbride Central Library", category: "Services", subcategory: "Community" },
    { name: "Supercuts", category: "Health & Beauty", subcategory: "Hair Salon" },

    // --- Financial Services ---
    { name: "Bank of Scotland", category: "Financial Services", subcategory: "Bank" },
    { name: "Nationwide", category: "Financial Services", subcategory: "Building Society" },
    { name: "Santander", category: "Financial Services", subcategory: "Bank" },
    { name: "Ramsdens", category: "Financial Services", subcategory: "Pawnbroker" },
    { name: "HT Pawnbrokers", category: "Financial Services", subcategory: "Pawnbroker" },

    // --- Charity & Second Hand ---
    { name: "British Heart Foundation", category: "Charity & Second Hand", subcategory: "Charity Shop" },
    { name: "Kilbryde Hospice", category: "Charity & Second Hand", subcategory: "Charity Shop" },

    // --- Other Services ---
    { name: "William Hill", category: "Services", subcategory: "Betting" },
    { name: "VPZ", category: "General Retail", subcategory: "Vape Shop" },
    { name: "Prime Vapour", category: "General Retail", subcategory: "Vape Shop" },
    { name: "E-Vapes", category: "General Retail", subcategory: "Vape Shop" },
    { name: "Premium Vapour", category: "General Retail", subcategory: "Vape Shop" },
    { name: "Max Spielmann", category: "Services", subcategory: "Photo Printing" },
    { name: "Social Sports Society", category: "Leisure & Entertainment", subcategory: "Social Gaming" },
];

// ============================================================
// Location metadata
// ============================================================

async function enrichLocation() {
    console.log("🔄 Enriching EK East Kilbride metadata...");
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            heroImage:
                "https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/26E7/production/_127695990_mediaitem127678377.jpg",
            website: "https://eklife.co.uk",
            phone: "01355 232 581",
            address: "EK, East Kilbride, Cornwall Way",
            street: "Cornwall Way",
            town: "East Kilbride",
            city: "East Kilbride",
            district: "South Lanarkshire",
            region: "Scotland",
            country: "United Kingdom",
            postcode: "G74 1LL",
            openingHours: { "Mon-Wed": "09:00-17:30", "Thu-Fri": "09:00-20:00", Sat: "09:00-18:00", Sun: "10:00-17:00" },
            parkingSpaces: 1574,
            retailSpace: 1000000,
            numberOfStores: tenants.length,
            retailers: tenants.length,
            numberOfFloors: 2,
            anchorTenants: 6,
            publicTransit:
                "East Kilbride railway station 5-min walk. Multiple First Bus routes to Glasgow and surrounding areas.",
            owner: "Sapphire (in administration) / Scoop Asset Management",
            management: "Scoop Asset Management",
            openedYear: 1959,
            footfall: 15000000,
            evCharging: true,
            evChargingSpaces: 12,
            carParkPrice: 0,
            instagram: "https://www.instagram.com/ek_life",
            facebook: "https://www.facebook.com/EKlife",
            googleRating: 3.6,
            googleReviews: 8500,
            totalFloorArea: 1400000,
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
            address: true,
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

// ============================================================
// Main
// ============================================================

async function main() {
    console.log("═══════════════════════════════════════════════");
    console.log("  EK, East Kilbride — Full Enrichment");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocation();
    await insertTenants();
    await updateLargestCategory();
    await verify();

    console.log("\n✅ EK East Kilbride enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
