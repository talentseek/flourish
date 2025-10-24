// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Analyzing Commercial Data Completeness\n');
  
  // Get locations missing commercial data
  const missingCommercial = await prisma.$queryRaw<Array<{ 
    id: string;
    name: string;
    type: string;
    city: string;
    healthIndex: any;
    vacancy: any;
    largestCategory: string | null;
    largestCategoryPercent: any;
  }>>`
    SELECT id, name, type, city, "healthIndex", vacancy, "largestCategory", "largestCategoryPercent"
    FROM locations 
    WHERE "healthIndex" IS NULL 
       OR vacancy IS NULL 
       OR "largestCategory" IS NULL 
       OR "largestCategoryPercent" IS NULL
    ORDER BY name
    LIMIT 50
  `;
  
  console.log(`Total locations missing commercial data: ${missingCommercial.length}+\n`);
  
  console.log('Sample locations missing commercial data:\n');
  missingCommercial.slice(0, 20).forEach((loc, i) => {
    console.log(`${i + 1}. ${loc.name} (${loc.type})`);
    console.log(`   City: ${loc.city}`);
    console.log(`   Health Index: ${loc.healthIndex || 'MISSING'}`);
    console.log(`   Vacancy: ${loc.vacancy || 'MISSING'}`);
    console.log(`   Largest Category: ${loc.largestCategory || 'MISSING'}`);
    console.log('');
  });
  
  // Count total missing
  const totalMissing = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::int as count
    FROM locations 
    WHERE "healthIndex" IS NULL 
       OR vacancy IS NULL 
       OR "largestCategory" IS NULL 
       OR "largestCategoryPercent" IS NULL
  `;
  
  console.log(`\n📊 Total locations needing commercial data: ${Number(totalMissing[0].count)}`);
  
  // Analyze patterns
  const byType = await prisma.$queryRaw<Array<{ type: string; count: bigint }>>`
    SELECT type, COUNT(*)::int as count
    FROM locations 
    WHERE "healthIndex" IS NULL 
       OR vacancy IS NULL 
       OR "largestCategory" IS NULL 
       OR "largestCategoryPercent" IS NULL
    GROUP BY type
    ORDER BY count DESC
  `;
  
  console.log('\n📈 Missing commercial data by type:');
  byType.forEach(({ type, count }) => {
    console.log(`   ${type}: ${Number(count)}`);
  });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

