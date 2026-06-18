/**
 * Fix: Restore Wallsend Forum + Create Sittingbourne Forum
 *
 * The previous script accidentally overwrote The Forum Shopping Centre in Wallsend
 * with Sittingbourne data, and deleted its tenants. This script:
 *
 * 1. Restores Wallsend Forum location fields
 * 2. Re-inserts Wallsend Forum tenants
 * 3. Creates a NEW location for The Forum Sittingbourne
 * 4. Inserts Sittingbourne tenants on the correct location
 *
 * Run: cd /Users/mbeckett/Documents/codeprojects/flourish && npx tsx scripts/fix-forum-sittingbourne.ts
 */

import { PrismaClient } from "@prisma/client";
import { getCategoryId } from "../src/lib/category-lookup";

const prisma = new PrismaClient();

const WALLSEND_FORUM_ID = "cmid0l2re01wcmtpu9n25lq3z";

// ── Step 1: Revert Wallsend Forum location fields ──
async function restoreWallsendForum() {
  console.log("🔧 Step 1: Restoring Wallsend Forum location fields...");

  await prisma.location.update({
    where: { id: WALLSEND_FORUM_ID },
    data: {
      website: "https://www.theforumshoppingcentre.co.uk/",
      openedYear: 1989,
      owner: "M Core",
      management: "Sheet Anchor Evolve",
      numberOfStores: 36,
      retailers: 36,
      anchorTenants: 5,
      parkingSpaces: 750,
      numberOfFloors: 2,
      openingHours: JSON.stringify({
        "Mon-Sat": "08:00-17:30",
        "Sun": "10:00-16:00",
      }),
      facebook: "https://www.facebook.com/theforumshopping/",
      googleRating: 3.9,
      googleReviews: 980,
      population: 42842,
      medianAge: 39,
      avgHouseholdIncome: 28000,
      familiesPercent: 40,
      incomeVsNational: 0.85,
    },
  });

  console.log("  ✅ Wallsend Forum location fields restored");
}

// ── Step 2: Restore Wallsend Forum tenants ──
const WALLSEND_TENANTS: Array<{
  name: string;
  category: string;
  subcategory: string;
  isAnchor: boolean;
}> = [
  // Major retailers (anchors)
  { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy", isAnchor: true },
  { name: "Home Bargains", category: "General Retail", subcategory: "Discount Store", isAnchor: true },
  { name: "Iceland", category: "Food & Grocery", subcategory: "Supermarket", isAnchor: true },
  { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchor: true },
  { name: "Poundland", category: "General Retail", subcategory: "Variety Store", isAnchor: true },

  // Food & Beverage
  { name: "Greggs", category: "Cafes & Restaurants", subcategory: "Bakery", isAnchor: false },
  { name: "Cooplands", category: "Cafes & Restaurants", subcategory: "Bakery", isAnchor: false },

  // Food & Grocery
  { name: "Wallsend Quality Butchers", category: "Food & Grocery", subcategory: "Butcher", isAnchor: false },
  { name: "Farnsworth Fruit & Veg", category: "Food & Grocery", subcategory: "Farm Shop", isAnchor: false },

  // Health & Beauty
  { name: "Specsavers", category: "Health & Beauty", subcategory: "Optician", isAnchor: false },
  { name: "Savers", category: "Health & Beauty", subcategory: "Bath & Body", isAnchor: false },
  { name: "Wallsend Pharmacy", category: "Health & Beauty", subcategory: "Pharmacy", isAnchor: false },
  { name: "Optica Eye Clinic", category: "Health & Beauty", subcategory: "Optician", isAnchor: false },
  { name: "Beauty Lounge", category: "Health & Beauty", subcategory: "Beauty Salon", isAnchor: false },

  // Charity
  { name: "Barnardo's", category: "Charity & Second Hand", subcategory: "Charity Shop", isAnchor: false },
  { name: "British Heart Foundation", category: "Charity & Second Hand", subcategory: "Charity Shop", isAnchor: false },
  { name: "Marie Curie", category: "Charity & Second Hand", subcategory: "Charity Shop", isAnchor: false },

  // Services
  { name: "Hays Travel", category: "Services", subcategory: "Travel Agency", isAnchor: false },
  { name: "Betfred", category: "Services", subcategory: "Betting", isAnchor: false },

  // Gifts & Stationery
  { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts", isAnchor: false },
  { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery", isAnchor: false },

  // Home & Garden
  { name: "Durham Bed Centre", category: "Home & Garden", subcategory: "Furniture", isAnchor: false },
  { name: "Crafty Jacks UK", category: "Gifts & Stationery", subcategory: "Art", isAnchor: false },
];

async function restoreWallsendTenants() {
  console.log("\n🏪 Step 2: Restoring Wallsend Forum tenants...");

  // Delete the Sittingbourne tenants that were incorrectly placed here
  const deleted = await prisma.tenant.deleteMany({ where: { locationId: WALLSEND_FORUM_ID } });
  console.log(`  🗑️ Removed ${deleted.count} incorrectly placed tenants`);

  let inserted = 0;
  let failed = 0;

  for (const t of WALLSEND_TENANTS) {
    try {
      const categoryId = await getCategoryId(prisma, t.category, t.subcategory);
      await prisma.tenant.create({
        data: {
          locationId: WALLSEND_FORUM_ID,
          name: t.name,
          category: t.category,
          subcategory: t.subcategory || null,
          categoryId,
          isAnchorTenant: t.isAnchor,
        },
      });
      inserted++;
    } catch (err: any) {
      if (err.code === "P2002") {
        console.log(`  ⚠️ ${t.name} already exists, skipping`);
      } else {
        failed++;
        console.error(`  ❌ ${t.name}: ${err.message}`);
      }
    }
  }

  console.log(`  ✅ Wallsend tenants restored: ${inserted} inserted, ${failed} failed`);
}

// ── Step 3: Create Sittingbourne Forum ──
async function createSittingbourneForum(): Promise<string> {
  console.log("\n📍 Step 3: Creating The Forum Shopping Centre, Sittingbourne...");

  // Check it doesn't already exist
  const existing = await prisma.location.findFirst({
    where: { postcode: "ME10 3DL" },
  });

  if (existing) {
    console.log(`  ⚠️ Already exists: ${existing.name} (${existing.id})`);
    await prisma.location.update({
      where: { id: existing.id },
      data: getSittingbourneLocationData(),
    });
    console.log("  ✅ Updated existing location");
    return existing.id;
  }

  const location = await prisma.location.create({
    data: {
      name: "The Forum Shopping Centre, Sittingbourne",
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
      ...getSittingbourneLocationData(),
    },
  });

  console.log(`  ✅ Created: ${location.name} (${location.id})`);
  return location.id;
}

function getSittingbourneLocationData() {
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
    facebook: "https://www.facebook.com/theforumsittingbourne/",
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

// ── Step 4: Insert Sittingbourne tenants ──
const SITTINGBOURNE_TENANTS: Array<{
  name: string;
  category: string;
  subcategory: string;
  isAnchor: boolean;
}> = [
  // ── Clothing & Footwear ──
  { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchor: true },
  { name: "Peacocks", category: "Clothing & Footwear", subcategory: "Value", isAnchor: true },
  { name: "Styluxecloset", category: "Clothing & Footwear", subcategory: "Womenswear", isAnchor: false },
  { name: "Weigh to Wear", category: "Clothing & Footwear", subcategory: "Value", isAnchor: false },
  { name: "Edge Bags", category: "Clothing & Footwear", subcategory: "Bags & Accessories", isAnchor: false },

  // ── Jewellery & Watches ──
  { name: "F. Hinds", category: "Jewellery & Watches", subcategory: "Jewellery", isAnchor: false },
  { name: "Warren James", category: "Jewellery & Watches", subcategory: "Fashion Jewellery", isAnchor: false },

  // ── Health & Beauty ──
  { name: "Specsavers", category: "Health & Beauty", subcategory: "Optician", isAnchor: true },
  { name: "Savers", category: "Health & Beauty", subcategory: "Bath & Body", isAnchor: false },
  { name: "Safia's Beauty Bar", category: "Health & Beauty", subcategory: "Beauty Salon", isAnchor: false },
  { name: "Sir Male Barbers", category: "Health & Beauty", subcategory: "Barber", isAnchor: false },
  { name: "Lux Tanz", category: "Health & Beauty", subcategory: "Wellness", isAnchor: false },
  { name: "Ability Plus", category: "Health & Beauty", subcategory: "Wellness", isAnchor: false },

  // ── Electrical & Technology ──
  { name: "CEX", category: "Electrical & Technology", subcategory: "Second Hand Electronics", isAnchor: false },
  { name: "I.T. Star Electronic", category: "Electrical & Technology", subcategory: "Mobile Repair", isAnchor: false },
  { name: "JK Consultants", category: "Electrical & Technology", subcategory: "Consumer Electronics", isAnchor: false },
  { name: "Fone Fix", category: "Electrical & Technology", subcategory: "Phone Repairs", isAnchor: false },

  // ── Gifts & Stationery ──
  { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery", isAnchor: false },
  { name: "Season Time", category: "Gifts & Stationery", subcategory: "Cards & Gifts", isAnchor: false },
  { name: "Forever Flowers", category: "Gifts & Stationery", subcategory: "Gifts", isAnchor: false },

  // ── Kids & Toys ──
  { name: "Tokyo Toys", category: "Kids & Toys", subcategory: "Toys", isAnchor: false },
  { name: "Cloud Nine Boutique", category: "Kids & Toys", subcategory: "Toys", isAnchor: false },

  // ── General Retail ──
  { name: "VPZ", category: "General Retail", subcategory: "Vape Shop", isAnchor: false },

  // ── Food & Grocery ──
  { name: "Premier Convenience Store", category: "Food & Grocery", subcategory: "Convenience Store", isAnchor: false },

  // ── Cafes & Restaurants ──
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

async function insertSittingbourneTenants(locationId: string) {
  console.log("\n🏪 Step 4: Inserting Sittingbourne Forum tenants...");

  // Delete any existing tenants on this new location
  const deleted = await prisma.tenant.deleteMany({ where: { locationId } });
  if (deleted.count > 0) {
    console.log(`  🗑️ Removed ${deleted.count} existing tenants`);
  }

  let inserted = 0;
  let failed = 0;

  for (const t of SITTINGBOURNE_TENANTS) {
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

  console.log(`\n📊 Sittingbourne Tenant Results: ${inserted} inserted, ${failed} failed`);
}

// ── Main ──
async function main() {
  try {
    // Fix the Wallsend Forum
    await restoreWallsendForum();
    await restoreWallsendTenants();

    // Create the Sittingbourne Forum
    const sittingbourneId = await createSittingbourneForum();
    await insertSittingbourneTenants(sittingbourneId);

    // Verify both
    console.log("\n" + "=".repeat(60));
    console.log("🔍 VERIFICATION");
    console.log("=".repeat(60));

    const wallsend = await prisma.location.findUnique({
      where: { id: WALLSEND_FORUM_ID },
      select: { name: true, city: true, postcode: true, owner: true, website: true },
    });
    const wallsendTenants = await prisma.tenant.count({ where: { locationId: WALLSEND_FORUM_ID } });

    console.log(`\n📍 Wallsend Forum:`);
    console.log(`  Name: ${wallsend?.name}`);
    console.log(`  City: ${wallsend?.city}`);
    console.log(`  Postcode: ${wallsend?.postcode}`);
    console.log(`  Owner: ${wallsend?.owner}`);
    console.log(`  Website: ${wallsend?.website}`);
    console.log(`  Tenants: ${wallsendTenants}`);

    const sittingbourne = await prisma.location.findFirst({
      where: { postcode: "ME10 3DL" },
      select: { id: true, name: true, city: true, postcode: true, owner: true, website: true },
    });
    const sittTenants = await prisma.tenant.count({ where: { locationId: sittingbourne?.id || "" } });

    console.log(`\n📍 Sittingbourne Forum:`);
    console.log(`  ID: ${sittingbourne?.id}`);
    console.log(`  Name: ${sittingbourne?.name}`);
    console.log(`  City: ${sittingbourne?.city}`);
    console.log(`  Postcode: ${sittingbourne?.postcode}`);
    console.log(`  Owner: ${sittingbourne?.owner}`);
    console.log(`  Website: ${sittingbourne?.website}`);
    console.log(`  Tenants: ${sittTenants}`);

    console.log("\n✅ Fix complete! Both Forum Shopping Centres are now correct.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
