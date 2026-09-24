/**
 * Fix: Victoria Shopping Centre Harrogate — Correct metadata + refresh tenants
 *
 * The location cmid0k2q800v7mtpu160tern4 is incorrectly named "Harrogate Retail Park"
 * with type RETAIL_PARK and address "Oak Beck Road, HG1 3HT".
 * It should be "Victoria Shopping Centre" at "Station Parade, HG1 1AE".
 *
 * Tenants refreshed from official website store directory (25 stores).
 *
 * Run: cd /Users/mbeckett/Documents/codeprojects/flourish && npx tsx scripts/fix-victoria-harrogate.ts
 */

import { PrismaClient } from "@prisma/client";
import { getCategoryId } from "../src/lib/category-lookup";

const prisma = new PrismaClient();

const LOCATION_ID = "cmid0k2q800v7mtpu160tern4";

// ── Step 1: Fix location metadata ──
async function fixLocation() {
  console.log("🔧 Step 1: Fixing location metadata...\n");

  const before = await prisma.location.findUnique({
    where: { id: LOCATION_ID },
    select: { name: true, type: true, address: true, city: true, postcode: true },
  });
  console.log("❌ BEFORE (incorrect):");
  console.log(`  Name:     ${before?.name}`);
  console.log(`  Type:     ${before?.type}`);
  console.log(`  Address:  ${before?.address}`);
  console.log(`  Postcode: ${before?.postcode}`);

  await prisma.location.update({
    where: { id: LOCATION_ID },
    data: {
      name: "Victoria Shopping Centre",
      type: "SHOPPING_CENTRE",
      address: "Station Parade, Harrogate, North Yorkshire, HG1 1AE",
      street: "Station Parade",
      town: "Harrogate",
      city: "Harrogate",
      county: "North Yorkshire",
      district: "Harrogate",
      region: "Yorkshire and The Humber",
      country: "England",
      postcode: "HG1 1AE",
      latitude: 53.9926,
      longitude: -1.5372,
      website: "https://www.victoriashoppingcentre.com/",
      phone: "01423 569550",
      openedYear: 1992,
      owner: "M Core",
      management: "Sheet Anchor Evolve",
      totalFloorArea: 144000,
      numberOfFloors: 4,
      parkingSpaces: 786,
      numberOfStores: 25,
      retailers: 25,
      anchorTenants: 3,
      googleRating: 3.9,
      googleReviews: 729,
      openingHours: JSON.stringify({
        "Mon-Sat": "09:00-18:00",
        "Sun": "10:00-16:30",
      }),
    },
  });

  console.log("\n✅ Location metadata corrected");
}

// ── Step 2: Refresh tenants from official website ──
// Source: https://www.victoriashoppingcentre.com/stores/ (scraped 2026-06-18)
const TENANTS: Array<{
  name: string;
  category: string;
  subcategory: string;
  isAnchor: boolean;
}> = [
  // ── Services ──
  { name: "Althams Travel", category: "Services", subcategory: "Travel Agency", isAnchor: false },
  { name: "Post Office", category: "Services", subcategory: "Post Office", isAnchor: false },

  // ── Cafes & Restaurants ──
  { name: "Caffè Massarella", category: "Cafes & Restaurants", subcategory: "Cafe", isAnchor: false },
  { name: "Starbucks", category: "Cafes & Restaurants", subcategory: "Coffee Shop", isAnchor: false },
  { name: "The Cornish Pasty Bakery", category: "Cafes & Restaurants", subcategory: "Bakery", isAnchor: false },

  // ── Gifts & Stationery ──
  { name: "Daisy Mays", category: "Gifts & Stationery", subcategory: "Gifts", isAnchor: false },

  // ── Jewellery & Watches ──
  { name: "Emporium Gems Jewellery Exchange", category: "Jewellery & Watches", subcategory: "Jewellery", isAnchor: false },

  // ── Financial Services ──
  { name: "Eurochange", category: "Financial Services", subcategory: "Currency Exchange", isAnchor: false },

  // ── Leisure & Entertainment ──
  { name: "GAME (inside Sports Direct)", category: "Leisure & Entertainment", subcategory: "Arcade", isAnchor: false },
  { name: "Sports Direct", category: "Leisure & Entertainment", subcategory: "Sports Retailer", isAnchor: true },

  // ── Health & Beauty ──
  { name: "Grape Tree", category: "Health & Beauty", subcategory: "Health Food Store", isAnchor: false },
  { name: "The Body Shop", category: "Health & Beauty", subcategory: "Body Care", isAnchor: false },

  // ── General Retail ──
  { name: "Harrogate Pop Up Shop", category: "General Retail", subcategory: "Variety Store", isAnchor: false },
  { name: "HMV", category: "General Retail", subcategory: "Specialist", isAnchor: false },

  // ── Clothing & Footwear ──
  { name: "Hats On Top", category: "Clothing & Footwear", subcategory: "Accessories", isAnchor: false },
  { name: "TK Maxx", category: "Clothing & Footwear", subcategory: "Value", isAnchor: true },
  { name: "Next", category: "Clothing & Footwear", subcategory: "Mid-Range", isAnchor: true },

  // ── Electrical & Technology ──
  { name: "Mobilise Group", category: "Electrical & Technology", subcategory: "Mobile Accessories", isAnchor: false },
  { name: "Three", category: "Electrical & Technology", subcategory: "Mobile Network", isAnchor: false },
  { name: "Vodafone", category: "Electrical & Technology", subcategory: "Mobile Network", isAnchor: false },

  // ── General Retail (discount) ──
  { name: "Poundland", category: "General Retail", subcategory: "Discount Store", isAnchor: false },

  // ── Gifts & Stationery (newsagent / toys) ──
  { name: "TG Jones", category: "Gifts & Stationery", subcategory: "Gadgets & Gifts", isAnchor: false },

  // ── Kids & Toys ──
  { name: "Toyland Toyshop", category: "Kids & Toys", subcategory: "Toy Store", isAnchor: false },
  { name: "Toys\"R\"Us (within TG Jones)", category: "Kids & Toys", subcategory: "Toy Store", isAnchor: false },
];

async function refreshTenants() {
  console.log("\n🏪 Step 2: Refreshing tenants from official website...");

  const deleted = await prisma.tenant.deleteMany({ where: { locationId: LOCATION_ID } });
  console.log(`  🗑️ Removed ${deleted.count} old tenants`);

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
      console.log(`  ✅ ${t.name} → ${t.category} / ${t.subcategory}${t.isAnchor ? " (Anchor)" : ""}`);
    } catch (err: any) {
      failed++;
      console.error(`  ❌ ${t.name}: ${err.message}`);
    }
  }

  console.log(`\n📊 Tenant Results: ${inserted} inserted, ${failed} failed`);
}

// ── Main ──
async function main() {
  try {
    await fixLocation();
    await refreshTenants();

    // Verify
    const loc = await prisma.location.findUnique({
      where: { id: LOCATION_ID },
      select: {
        name: true, type: true, address: true, city: true, postcode: true,
        owner: true, management: true, openedYear: true, totalFloorArea: true,
        parkingSpaces: true, numberOfFloors: true, numberOfStores: true,
        googleRating: true, googleReviews: true, website: true,
      },
    });
    const tenantCount = await prisma.tenant.count({ where: { locationId: LOCATION_ID } });

    console.log("\n" + "=".repeat(60));
    console.log("🔍 VERIFICATION");
    console.log("=".repeat(60));
    console.log(`  Name:       ${loc?.name}`);
    console.log(`  Type:       ${loc?.type}`);
    console.log(`  Address:    ${loc?.address}`);
    console.log(`  City:       ${loc?.city}`);
    console.log(`  Postcode:   ${loc?.postcode}`);
    console.log(`  Website:    ${loc?.website}`);
    console.log(`  Owner:      ${loc?.owner}`);
    console.log(`  Management: ${loc?.management}`);
    console.log(`  Opened:     ${loc?.openedYear}`);
    console.log(`  Floor Area: ${loc?.totalFloorArea?.toLocaleString()} sq ft`);
    console.log(`  Floors:     ${loc?.numberOfFloors}`);
    console.log(`  Parking:    ${loc?.parkingSpaces}`);
    console.log(`  Stores:     ${loc?.numberOfStores}`);
    console.log(`  Rating:     ${loc?.googleRating} (${loc?.googleReviews} reviews)`);
    console.log(`  Tenants DB: ${tenantCount}`);

    console.log("\n✅ Victoria Shopping Centre, Harrogate — fix complete!");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
