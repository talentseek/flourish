#!/usr/bin/env tsx
/**
 * Cleanup script: nulls out bad website URLs (aggregators, chain stores, etc.)
 * and deletes any tenants wrongly extracted from them.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BAD_DOMAINS = [
  // Individual store pages
  "stores.aldi.co.uk", "stores.sainsburys.co.uk", "stores.asda.com",
  "stores.lidl.co.uk", "stores.morrisons.com",
  // Fast food / restaurant chains
  "kfc.co.uk", "dominos.co.uk", "papajohns.co.uk", "mcdonalds.com",
  "justeat.com", "deliveroo.co.uk",
  // Hotel / leisure chains
  "premierinn.com", "travelodge.co.uk", "hilton.com", "booking.com",
  "puregym.com", "placesleisure.org", "nuffieldhealth.com", "tenpin.co.uk",
  // DIY / furniture / pet stores
  "diy.com/store", "oakfurnitureland.co.uk", "wickes.co.uk",
  "petsathome.com", "petsandfriends.co.uk", "jollyes.co.uk",
  "matalan.co.uk/store", "safestore.co.uk", "dunelm.com/stores",
  // Supermarket store locators
  "tesco.com/store-locator", "sainsburys.co.uk/store",
  // Coffee / food chains
  "costa.co.uk", "vintageinn.co.uk",
  // Property agents / listing sites
  "completelyretail.co.uk", "inpost.co.uk", "savills.co.uk",
  "jll.co.uk", "cushmanwakefield", "cbre.co.uk",
  "thecrownestate.co.uk",
  // Social / aggregator
  "facebook.com", "instagram.com", "twitter.com", "linkedin.com",
  "tripadvisor", "yelp.co.uk", "trustpilot.com",
  // Gov / council
  "gov.uk",
  // Maps / shorteners
  "maps.google", "goo.gl", "bit.ly",
  // Misc wrong websites
  "royalenfield.com",
  "argos.co.uk/stores", "glasswells.co.uk", "tiso.com",
  "mcarthurglen.com",
];

async function main() {
  const locs = await prisma.location.findMany({
    where: { website: { not: null } },
    select: { id: true, name: true, website: true },
  });

  const toClean: typeof locs = [];
  for (const loc of locs) {
    const w = (loc.website || "").toLowerCase();
    if (BAD_DOMAINS.some((bad) => w.includes(bad))) {
      toClean.push(loc);
    }
  }

  console.log(`Found ${toClean.length} locations with bad websites:\n`);
  for (const l of toClean) {
    console.log(`  - ${l.name.padEnd(45)} | ${(l.website || "").substring(0, 70)}`);
  }

  // Null out bad websites
  const ids = toClean.map((l) => l.id);
  const result = await prisma.location.updateMany({
    where: { id: { in: ids } },
    data: { website: null },
  });
  console.log(`\n✅ Cleared ${result.count} bad website URLs`);

  // Delete wrongly-extracted tenants from those locations
  const deleted = await prisma.tenant.deleteMany({
    where: { locationId: { in: ids } },
  });
  if (deleted.count > 0) {
    console.log(`🗑️  Deleted ${deleted.count} tenants from bad-URL locations`);
  }
}

main()
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
