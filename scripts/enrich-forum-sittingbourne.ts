/**
 * The Forum Shopping Centre, Sittingbourne — Full Enrichment Script
 *
 * Creates the location + inserts all 33 tenants from the official website.
 * Uses canonical LDC taxonomy categories via getCategoryId().
 *
 * Run: cd /Users/mbeckett/Documents/codeprojects/flourish && npx tsx scripts/enrich-forum-sittingbourne.ts
 */

import { PrismaClient } from "@prisma/client";
import { getCategoryId } from "../src/lib/category-lookup";

const prisma = new PrismaClient();

// ── Step 1: Create location ──
async function createLocation(): Promise<string> {
  console.log("📍 Creating The Forum Shopping Centre, Sittingbourne...");

  // Check if it already exists
  const existing = await prisma.location.findFirst({
    where: {
      OR: [
        { name: { contains: "Forum", mode: "insensitive" } },
        { postcode: "ME10 3DL" },
      ],
    },
  });

  if (existing) {
    console.log(`  ⚠️ Already exists: ${existing.name} (${existing.id})`);
    console.log("  → Updating existing location fields...");
    await prisma.location.update({
      where: { id: existing.id },
      data: getLocationData(),
    });
    console.log("  ✅ Location updated");
    return existing.id;
  }

  const location = await prisma.location.create({
    data: {
      name: "The Forum Shopping Centre",
      type: "SHOPPING_CENTRE",
      address: "High Street",
      street: "High Street",
      town: "Sittingbourne",
      city: "Sittingbourne",
      county: "Kent",
      district: "Swale",
      region: "South East",
      country: "England",
      postcode: "ME10 3DL",
      latitude: 51.3407,
      longitude: 0.7342,
      isManaged: true,
      ...getLocationData(),
    },
  });

  console.log(`  ✅ Created: ${location.name} (${location.id})`);
  return location.id;
}

function getLocationData() {
  return {
    website: "https://theforumsc.co.uk/",
    openedYear: 1986,
    owner: "Sittingbourne Forum Ltd",
    management: "Praxis Retail",
    numberOfStores: 33,
    retailers: 33,
    anchorTenants: 3,
    parkingSpaces: 308,
    numberOfFloors: 1,
    openingHours: JSON.stringify({
      "Mon-Sat": "08:00-18:00",
      "Sun": "10:00-16:00",
    }),
    // Digital
    facebook: "https://www.facebook.com/theforumsittingbourne/",
    // Reviews
    googleRating: 3.8,
    googleReviews: 1200,
    // Demographics (Swale LTLA, ONS Census 2021)
    population: 151700,
    medianAge: 41,
    avgHouseholdIncome: 35000,
    familiesPercent: 44,
    incomeVsNational: 1.0,
  };
}

// ── Step 2: Tenant definitions (LDC Canonical Taxonomy) ──
const TENANTS: Array<{
  name: string;
  category: string;
  subcategory: string;
  isAnchor: boolean;
}> = [
  // ── Retail: Clothing & Footwear ──
  { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchor: true },
  { name: "Peacocks", category: "Clothing & Footwear", subcategory: "Value", isAnchor: true },
  { name: "Styluxecloset", category: "Clothing & Footwear", subcategory: "Womenswear", isAnchor: false },
  { name: "Weigh to Wear", category: "Clothing & Footwear", subcategory: "Value", isAnchor: false },

  // ── Retail: Bags & Accessories ──
  { name: "Edge Bags", category: "Clothing & Footwear", subcategory: "Bags & Accessories", isAnchor: false },

  // ── Retail: Jewellery & Watches ──
  { name: "F. Hinds", category: "Jewellery & Watches", subcategory: "Jewellery", isAnchor: false },
  { name: "Warren James", category: "Jewellery & Watches", subcategory: "Fashion Jewellery", isAnchor: false },

  // ── Retail: Health & Beauty ──
  { name: "Specsavers", category: "Health & Beauty", subcategory: "Optician", isAnchor: true },
  { name: "Savers", category: "Health & Beauty", subcategory: "Bath & Body", isAnchor: false },
  { name: "Safia's Beauty Bar", category: "Health & Beauty", subcategory: "Beauty Salon", isAnchor: false },
  { name: "Sir Male Barbers", category: "Health & Beauty", subcategory: "Barber", isAnchor: false },
  { name: "Lux Tanz", category: "Health & Beauty", subcategory: "Wellness", isAnchor: false },
  { name: "Ability Plus", category: "Health & Beauty", subcategory: "Wellness", isAnchor: false },

  // ── Retail: Electrical & Technology ──
  { name: "CEX", category: "Electrical & Technology", subcategory: "Second Hand Electronics", isAnchor: false },
  { name: "I.T. Star Electronic", category: "Electrical & Technology", subcategory: "Mobile Repair", isAnchor: false },
  { name: "JK Consultants", category: "Electrical & Technology", subcategory: "Consumer Electronics", isAnchor: false },
  { name: "Fone Fix", category: "Electrical & Technology", subcategory: "Phone Repairs", isAnchor: false },

  // ── Retail: Gifts & Stationery ──
  { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery", isAnchor: false },
  { name: "Season Time", category: "Gifts & Stationery", subcategory: "Cards & Gifts", isAnchor: false },
  { name: "Forever Flowers", category: "Gifts & Stationery", subcategory: "Gifts", isAnchor: false },

  // ── Retail: Kids & Toys ──
  { name: "Tokyo Toys", category: "Kids & Toys", subcategory: "Toys", isAnchor: false },
  { name: "Cloud Nine Boutique", category: "Kids & Toys", subcategory: "Toys", isAnchor: false },

  // ── Retail: General Retail ──
  { name: "VPZ", category: "General Retail", subcategory: "Vape Shop", isAnchor: false },

  // ── Retail: Food & Grocery ──
  { name: "Premier Convenience Store", category: "Food & Grocery", subcategory: "Convenience Store", isAnchor: false },

  // ── Food & Beverage ──
  { name: "Costa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop", isAnchor: false },
  { name: "Black Pepper", category: "Cafes & Restaurants", subcategory: "Restaurant", isAnchor: false },
  { name: "Brew & Bagel", category: "Cafes & Restaurants", subcategory: "Cafe", isAnchor: false },
  { name: "Harry's Pie & Mash", category: "Cafes & Restaurants", subcategory: "Takeaway", isAnchor: false },

  // ── Leisure & Entertainment ──
  { name: "Krazy Kidz World", category: "Leisure & Entertainment", subcategory: "Adventure", isAnchor: false },

  // ── Services ──
  { name: "Hays Travel", category: "Services", subcategory: "Travel Agency", isAnchor: false },
  { name: "Timpson", category: "Services", subcategory: "Shoe Repair", isAnchor: false },

  // ── Charity & Second Hand ──
  { name: "Cancer Research", category: "Charity & Second Hand", subcategory: "Charity Shop", isAnchor: false },
];

async function insertTenants(locationId: string) {
  console.log("\n🏪 Inserting tenants...");

  // Delete existing tenants first
  const deleted = await prisma.tenant.deleteMany({ where: { locationId } });
  if (deleted.count > 0) {
    console.log(`  🗑️ Removed ${deleted.count} existing tenants`);
  }

  let inserted = 0;
  let failed = 0;

  for (const t of TENANTS) {
    try {
      const categoryId = await getCategoryId(prisma, t.category, t.subcategory);
      await prisma.tenant.create({
        data: {
          locationId,
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
    const locationId = await createLocation();
    await insertTenants(locationId);

    // Verify
    const loc = await prisma.location.findFirst({
      where: { id: locationId },
      select: {
        name: true,
        city: true,
        postcode: true,
        numberOfStores: true,
        anchorTenants: true,
        owner: true,
        website: true,
        parkingSpaces: true,
        googleRating: true,
      },
    });
    const tenantCount = await prisma.tenant.count({ where: { locationId } });

    console.log("\n🔍 Verification:");
    console.log(`  Location: ${loc?.name}`);
    console.log(`  City: ${loc?.city}`);
    console.log(`  Postcode: ${loc?.postcode}`);
    console.log(`  Website: ${loc?.website}`);
    console.log(`  Owner: ${loc?.owner}`);
    console.log(`  Stores field: ${loc?.numberOfStores}`);
    console.log(`  Anchors field: ${loc?.anchorTenants}`);
    console.log(`  Parking: ${loc?.parkingSpaces}`);
    console.log(`  Google Rating: ${loc?.googleRating}`);
    console.log(`  Actual tenants in DB: ${tenantCount}`);

    console.log("\n✅ The Forum Shopping Centre enrichment complete!");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
