// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Get locations with missing/zero coords
  const missing = await prisma.$queryRaw<Array<{ 
    id: string; 
    name: string; 
    postcode: string | null;
    address: string;
    city: string;
  }>>`
    SELECT id, name, postcode, address, city FROM locations 
    WHERE (latitude = 0 OR longitude = 0 OR latitude IS NULL OR longitude IS NULL)
  `;
  
  console.log(`Total locations with missing/zero coords: ${missing.length}\n`);
  
  // Count by postcode presence
  const withPostcode = missing.filter(loc => loc.postcode && loc.postcode.trim().length > 0);
  const withoutPostcode = missing.filter(loc => !loc.postcode || loc.postcode.trim().length === 0);
  
  console.log(`With postcode: ${withPostcode.length}`);
  console.log(`Without postcode: ${withoutPostcode.length}\n`);
  
  // Show sample with postcodes
  if (withPostcode.length > 0) {
    console.log('Sample locations WITH postcodes:');
    withPostcode.slice(0, 5).forEach((loc, i) => {
      console.log(`  ${i + 1}. ${loc.name} - "${loc.postcode}"`);
    });
    console.log('');
  }
  
  // Show sample without postcodes
  if (withoutPostcode.length > 0) {
    console.log('Sample locations WITHOUT postcodes:');
    withoutPostcode.slice(0, 10).forEach((loc, i) => {
      console.log(`  ${i + 1}. ${loc.name} - ${loc.city} - ${loc.address}`);
    });
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

