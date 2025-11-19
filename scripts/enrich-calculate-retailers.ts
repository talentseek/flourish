#!/usr/bin/env tsx
/**
 * 🧮 CALCULATE RETAILERS/SPACE (WRAPPER)
 * Wrapper script to run the existing calculator
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧮 CALCULATE RETAILERS & RETAIL SPACE\n');
  console.log('Calculating from existing tenant data...\n');

  const locations = await prisma.location.findMany({
    where: {
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      OR: [
        { retailers: null },
        { retailSpace: null }
      ]
    },
    include: {
      tenants: true
    },
    orderBy: { numberOfStores: 'desc' }
  });

  console.log(`📊 Found ${locations.length} locations to calculate\n`);

  let updatedCount = 0;
  let skippedCount = 0;
  let retailersCount = 0;
  let retailSpaceCount = 0;

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
      retailersCount++;
    }

    // Calculate retail space (estimated from total floor area / number of stores)
    // This is an approximation - if we have totalFloorArea and numberOfStores
    if (!loc.retailSpace && loc.totalFloorArea && loc.numberOfStores && loc.numberOfStores > 0) {
      // Estimate: assume 70% of total floor area is retail space
      // (30% for common areas, parking, services, etc.)
      const estimatedRetailSpace = Math.floor(loc.totalFloorArea * 0.7);
      updateData.retailSpace = estimatedRetailSpace;
      calculated.push(`Retail Space: ${estimatedRetailSpace.toLocaleString()} sqft`);
      retailSpaceCount++;
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
    
    // Progress update every 50
    if ((i + 1) % 50 === 0) {
      console.log(`\n📈 Progress: ${updatedCount} updated, ${skippedCount} skipped\n`);
    }
  }

  console.log('\n✅ Calculation complete!');
  console.log(`   Updated: ${updatedCount}/${locations.length}`);
  console.log(`   Skipped (no data): ${skippedCount}/${locations.length}`);

  console.log(`\n📝 Fields calculated:`);
  console.log(`   Retailers: ${retailersCount}`);
  console.log(`   Retail Space: ${retailSpaceCount}`);

  // Show summary stats
  const totalWithRetailers = await prisma.location.count({
    where: { 
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      retailers: { not: null } 
    }
  });
  const totalWithRetailSpace = await prisma.location.count({
    where: { 
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      retailSpace: { not: null } 
    }
  });
  const totalLocations = await prisma.location.count({
    where: { type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] } }
  });

  console.log('\n📊 Coverage:');
  console.log(`   Retailers: ${totalWithRetailers}/${totalLocations} (${(totalWithRetailers/totalLocations*100).toFixed(1)}%)`);
  console.log(`   Retail Space: ${totalWithRetailSpace}/${totalLocations} (${(totalWithRetailSpace/totalLocations*100).toFixed(1)}%)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

