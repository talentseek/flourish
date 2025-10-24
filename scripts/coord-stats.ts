// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Get total count
  const totalResult = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::int as count FROM locations
  `;
  const total = Number(totalResult[0].count);
  
  // Count locations with non-null coordinates
  const withCoordsResult = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::int as count FROM locations 
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
  `;
  const withCoords = Number(withCoordsResult[0].count);
  
  // Count locations with non-zero coordinates
  const nonZeroResult = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::int as count FROM locations 
    WHERE latitude != 0 AND longitude != 0 
    AND latitude IS NOT NULL AND longitude IS NOT NULL
  `;
  const nonZero = Number(nonZeroResult[0].count);
  
  console.log('📊 Coordinate Statistics:');
  console.log(`Total locations: ${total}`);
  console.log(`With coordinates (not null): ${withCoords}`);
  console.log(`With valid coordinates (non-zero): ${nonZero}`);
  console.log(`Missing/zero coords: ${total - nonZero} (${((total - nonZero) / total * 100).toFixed(1)}%)`);
  
  // Get sample of locations with zero or null coordinates
  const sampleZero = await prisma.$queryRaw<Array<{ id: string; name: string; postcode: string }>>`
    SELECT id, name, postcode FROM locations 
    WHERE (latitude = 0 OR longitude = 0 OR latitude IS NULL OR longitude IS NULL)
    LIMIT 5
  `;
  console.log('\n📍 Sample locations needing geocoding:');
  sampleZero.forEach((loc, i) => {
    console.log(`  ${i + 1}. ${loc.name} (${loc.postcode || 'no postcode'})`);
  });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });


