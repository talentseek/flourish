// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking Remaining Locations\n');
  
  // Check if we still have missing commercial data
  const stillMissing = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::int as count
    FROM locations 
    WHERE "healthIndex" IS NULL 
       OR vacancy IS NULL 
       OR "largestCategory" IS NULL 
       OR "largestCategoryPercent" IS NULL
  `;
  
  console.log(`Locations still missing commercial data: ${Number(stillMissing[0].count)}\n`);
  
  if (Number(stillMissing[0].count) > 0) {
    const missing = await prisma.location.findMany({
      where: {
        OR: [
          { healthIndex: null },
          { vacancy: null },
          { largestCategory: null },
          { largestCategoryPercent: null }
        ]
      },
      select: {
        name: true,
        type: true,
        city: true,
        healthIndex: true,
        vacancy: true,
        largestCategory: true,
        largestCategoryPercent: true
      }
    });
    
    console.log('Locations still missing data:\n');
    missing.forEach((loc, i) => {
      console.log(`${i + 1}. ${loc.name} (${loc.type})`);
      console.log(`   City: ${loc.city}`);
      console.log(`   Missing: ${!loc.healthIndex ? 'healthIndex ' : ''}${!loc.vacancy ? 'vacancy ' : ''}${!loc.largestCategory ? 'largestCategory ' : ''}${!loc.largestCategoryPercent ? 'largestCategoryPercent' : ''}`);
      console.log('');
    });
  }
  
  // Calculate new commercial tier percentage
  const total = await prisma.location.count();
  const complete = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::int as count
    FROM locations 
    WHERE "healthIndex" IS NOT NULL 
      AND vacancy IS NOT NULL 
      AND "largestCategory" IS NOT NULL 
      AND "largestCategoryPercent" IS NOT NULL
  `;
  
  const percentage = (Number(complete[0].count) / total * 100).toFixed(1);
  
  console.log('═══════════════════════════════════════════');
  console.log('📊 Commercial Tier Status:');
  console.log(`Total locations: ${total}`);
  console.log(`Complete: ${Number(complete[0].count)}`);
  console.log(`Missing: ${Number(stillMissing[0].count)}`);
  console.log(`Percentage: ${percentage}%`);
  console.log('');
  console.log(`Previous: 86% (2,271/2,626)`);
  console.log(`Current:  ${percentage}% (${Number(complete[0].count)}/2,626)`);
  console.log(`Improvement: +${(parseFloat(percentage) - 86).toFixed(1)} percentage points`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

