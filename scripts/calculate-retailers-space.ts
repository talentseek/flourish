import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧮 CALCULATE RETAILERS & RETAIL SPACE\n');
  console.log('Calculating from existing tenant data...\n');

  const locations = await prisma.location.findMany({
    where: {
      OR: [
        { retailers: null },
        { retailSpace: null }
      ]
    },
    include: {
      tenants: true
    },
    orderBy: { name: 'asc' }
  });

  console.log(`📊 Found ${locations.length} locations to calculate\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;

    // Skip if no tenants
    if (loc.tenants.length === 0) {
      console.log(`${progress} ${loc.name} - ⏭️  No tenant data`);
      skippedCount++;
      continue;
    }

    const updateData: any = {};
    const calculated: string[] = [];

    // Calculate retailers (number of unique tenants)
    if (!loc.retailers && loc.tenants.length > 0) {
      updateData.retailers = loc.tenants.length;
      calculated.push(`Retailers: ${loc.tenants.length}`);
    }

    // Calculate retail space (estimated from total floor area / number of stores)
    // This is an approximation - if we have totalFloorArea and numberOfStores
    if (!loc.retailSpace && loc.totalFloorArea && loc.numberOfStores && loc.numberOfStores > 0) {
      // Estimate: assume 70% of total floor area is retail space
      // (30% for common areas, parking, services, etc.)
      const estimatedRetailSpace = Math.floor(loc.totalFloorArea * 0.7);
      updateData.retailSpace = estimatedRetailSpace;
      calculated.push(`Retail Space: ${estimatedRetailSpace.toLocaleString()} sqft`);
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.location.update({
        where: { id: loc.id },
        data: updateData
      });
      console.log(`${progress} ${loc.name} - ✅ ${calculated.join(', ')}`);
      updatedCount++;
    } else {
      console.log(`${progress} ${loc.name} - ℹ️  Already calculated or missing source data`);
    }
  }

  console.log('\n✅ Calculation complete!');
  console.log(`   Updated: ${updatedCount}/${locations.length}`);
  console.log(`   Skipped (no data): ${skippedCount}/${locations.length}`);

  // Show summary stats
  const totalWithRetailers = await prisma.location.count({
    where: { retailers: { not: null } }
  });
  const totalWithRetailSpace = await prisma.location.count({
    where: { retailSpace: { not: null } }
  });
  const totalLocations = await prisma.location.count();

  console.log('\n📊 Coverage:');
  console.log(`   Retailers: ${totalWithRetailers}/${totalLocations} (${(totalWithRetailers/totalLocations*100).toFixed(1)}%)`);
  console.log(`   Retail Space: ${totalWithRetailSpace}/${totalLocations} (${(totalWithRetailSpace/totalLocations*100).toFixed(1)}%)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

