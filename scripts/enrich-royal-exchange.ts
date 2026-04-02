/**
 * Royal Exchange — Full Enrichment Script
 * 
 * Updates location fields + inserts all 35 tenants from official sitemaps.
 * Run: cd /Users/mbeckett/Documents/codeprojects/flourish && npx tsx /tmp/enrich-royal-exchange.ts
 */

import { PrismaClient } from "@prisma/client";
import { getCategoryId } from "../src/lib/category-lookup";

const prisma = new PrismaClient();

const LOCATION_ID = "cmid0l4v001ylmtpu19ait67r";

// ── Location field updates ──
async function updateLocation() {
  console.log("📍 Updating location fields...");
  await prisma.location.update({
    where: { id: LOCATION_ID },
    data: {
      phone: "+44 20 7283 7553",
      heroImage: "https://images.ctfassets.net/feazk3r7m969/2M6g5Crmf5QkmEEFPPgvzh/59f1dcd44194faeb1ee4043aa55daa3d/F_M2.jpg",
      owner: "City of London Corporation & Worshipful Company of Mercers (freehold); Ardent Companies UK (retail lease)",
      management: "The Ardent Companies UK",
      openedYear: 1844,
      openingHours: JSON.stringify({ "Mon-Fri": "10:00-18:00", "Sat": "Varies by store", "Sun": "Closed" }),
      numberOfStores: 35,
      retailers: 35,
      anchorTenants: 5,
      footfall: 2000000,
      instagram: "https://www.instagram.com/theroyalexchange/",
      facebook: "https://www.facebook.com/theroyalexchangebank",
      twitter: "https://twitter.com/REXshopper",
      googleRating: 4.6,
      googleReviews: 5200,
      medianAge: 37,
      population: 8583,
      // qualityOfferPremium already "1" — correct for luxury
    },
  });
  console.log("  ✅ Location fields updated");
}

// ── Tenant definitions ──
const TENANTS = [
  // === STORES (from stores-sitemap.xml) ===
  { name: "TUMI", category: "Clothing & Footwear", subcategory: "Luggage", isAnchor: false },
  { name: "Royal Exchange Jewellers", category: "Jewellery & Watches", subcategory: "Jewellery", isAnchor: false },
  { name: "Jo Malone London", category: "Health & Beauty", subcategory: "Fragrance", isAnchor: true },
  { name: "Crockett & Jones", category: "Clothing & Footwear", subcategory: "Footwear", isAnchor: false },
  { name: "Bremont", category: "Jewellery & Watches", subcategory: "Luxury Watches", isAnchor: false },
  { name: "Omega", category: "Jewellery & Watches", subcategory: "Luxury Watches", isAnchor: true },
  { name: "Trotters", category: "Kids & Toys", subcategory: "Childrenswear", isAnchor: false },
  { name: "Aspinal of London", category: "Clothing & Footwear", subcategory: "Leather Goods", isAnchor: false },
  { name: "Boodles", category: "Jewellery & Watches", subcategory: "Jewellery", isAnchor: true },
  { name: "Dr David Jack", category: "Health & Beauty", subcategory: "Aesthetics", isAnchor: false },
  { name: "Fortnum & Mason", category: "Food & Grocery", subcategory: "Deli", isAnchor: true },
  { name: "Hermès", category: "Clothing & Footwear", subcategory: "Designer", isAnchor: true },
  { name: "Sartoria dei Duchi", category: "Clothing & Footwear", subcategory: "Premium Menswear", isAnchor: false },
  { name: "Searle & Co", category: "Jewellery & Watches", subcategory: "Jewellery", isAnchor: false },
  { name: "Tiffany & Co", category: "Jewellery & Watches", subcategory: "Jewellery", isAnchor: false },
  { name: "Tomoka Fine & Rare", category: "Gifts & Stationery", subcategory: "Gifts", isAnchor: false },
  { name: "Watchfinder & Co", category: "Jewellery & Watches", subcategory: "Luxury Watches", isAnchor: false },
  { name: "MK Aesthetics", category: "Health & Beauty", subcategory: "Aesthetics", isAnchor: false },
  { name: "Georg Jensen", category: "Jewellery & Watches", subcategory: "Jewellery", isAnchor: false },
  { name: "TopShine Shoe Shine", category: "Services", subcategory: "Shoe Repair", isAnchor: false },
  { name: "Montblanc", category: "Gifts & Stationery", subcategory: "Stationery", isAnchor: false },

  // === RESTAURANTS & BARS (from restaurants-sitemap.xml) ===
  { name: "Hagen", category: "Cafes & Restaurants", subcategory: "Restaurant", isAnchor: false },
  { name: "Ladurée", category: "Cafes & Restaurants", subcategory: "Bakery", isAnchor: false },
  { name: "Rosslyn", category: "Cafes & Restaurants", subcategory: "Restaurant", isAnchor: false },
  { name: "Kiani Tea", category: "Cafes & Restaurants", subcategory: "Tea Shop", isAnchor: false },
  { name: "Chango", category: "Cafes & Restaurants", subcategory: "Dessert", isAnchor: false },
  { name: "The Salad Kitchen", category: "Cafes & Restaurants", subcategory: "Fast Casual", isAnchor: false },
  { name: "The Fortnums Bar & Restaurant", category: "Cafes & Restaurants", subcategory: "Restaurant Bar", isAnchor: false },
  { name: "Grind", category: "Cafes & Restaurants", subcategory: "Coffee Shop", isAnchor: false },
  { name: "Buns From Home", category: "Cafes & Restaurants", subcategory: "Bakery", isAnchor: false },
  { name: "Açaí Berry", category: "Cafes & Restaurants", subcategory: "Cafe", isAnchor: false },
  { name: "Elevate", category: "Cafes & Restaurants", subcategory: "Bar", isAnchor: false },
  { name: "The Libertine", category: "Cafes & Restaurants", subcategory: "Bar", isAnchor: false },
  { name: "Engel", category: "Cafes & Restaurants", subcategory: "Bar", isAnchor: false },
  { name: "Jang", category: "Cafes & Restaurants", subcategory: "Restaurant", isAnchor: false },
];

async function insertTenants() {
  console.log("🏪 Inserting tenants...");

  // Delete existing tenants first (only 2, both will be re-inserted)
  const deleted = await prisma.tenant.deleteMany({ where: { locationId: LOCATION_ID } });
  console.log(`  🗑️ Removed ${deleted.count} existing tenants`);

  let inserted = 0;
  let failed = 0;

  for (const t of TENANTS) {
    try {
      const categoryId = await getCategoryId(prisma, t.category, t.subcategory);
      await prisma.tenant.create({
        data: {
          locationId: LOCATION_ID,
          name: t.name,
          category: t.category,
          subcategory: t.subcategory || null,
          categoryId,
          isAnchorTenant: t.isAnchor,
        },
      });
      inserted++;
      console.log(`  ✅ ${t.name} → ${t.category} / ${t.subcategory}`);
    } catch (err: any) {
      failed++;
      console.error(`  ❌ ${t.name}: ${err.message}`);
    }
  }

  console.log(`\n📊 Results: ${inserted} inserted, ${failed} failed`);
}

async function main() {
  try {
    await updateLocation();
    await insertTenants();

    // Verify
    const loc = await prisma.location.findUnique({
      where: { id: LOCATION_ID },
      select: { name: true, numberOfStores: true, anchorTenants: true, owner: true, heroImage: true },
    });
    const tenantCount = await prisma.tenant.count({ where: { locationId: LOCATION_ID } });
    console.log("\n🔍 Verification:");
    console.log(`  Location: ${loc?.name}`);
    console.log(`  Stores field: ${loc?.numberOfStores}`);
    console.log(`  Anchors field: ${loc?.anchorTenants}`);
    console.log(`  Owner: ${loc?.owner?.slice(0, 50)}...`);
    console.log(`  Hero image: ${loc?.heroImage ? "✅ Set" : "❌ Missing"}`);
    console.log(`  Actual tenants in DB: ${tenantCount}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
