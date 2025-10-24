// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Get ALL details for locations with missing/zero coords
  const missing = await prisma.$queryRaw<Array<{ 
    id: string; 
    name: string; 
    type: string;
    postcode: string | null;
    address: string | null;
    city: string | null;
    county: string | null;
  }>>`
    SELECT id, name, type, postcode, address, city, county FROM locations 
    WHERE (latitude = 0 OR longitude = 0 OR latitude IS NULL OR longitude IS NULL)
    ORDER BY name
    LIMIT 20
  `;
  
  console.log('📊 Sample of locations with missing coordinates:\n');
  
  missing.forEach((loc, i) => {
    console.log(`${i + 1}. ${loc.name}`);
    console.log(`   Type: ${loc.type}`);
    console.log(`   Address: "${loc.address || 'EMPTY'}"`);
    console.log(`   City: "${loc.city || 'EMPTY'}"`);
    console.log(`   County: "${loc.county || 'EMPTY'}"`);
    console.log(`   Postcode: "${loc.postcode || 'EMPTY'}"`);
    console.log('');
  });
  
  // Count data quality issues
  const allMissing = await prisma.$queryRaw<Array<{ 
    postcode: string | null;
    address: string | null;
    city: string | null;
  }>>`
    SELECT postcode, address, city FROM locations 
    WHERE (latitude = 0 OR longitude = 0 OR latitude IS NULL OR longitude IS NULL)
  `;
  
  const emptyPostcode = allMissing.filter(l => !l.postcode || l.postcode === '-' || l.postcode.trim() === '').length;
  const emptyAddress = allMissing.filter(l => !l.address || l.address.trim() === '').length;
  const emptyCity = allMissing.filter(l => !l.city || l.city === '-' || l.city.trim() === '').length;
  
  console.log('📈 Data Quality Summary:');
  console.log(`Total locations missing coords: ${allMissing.length}`);
  console.log(`Missing/invalid postcode: ${emptyPostcode} (${(emptyPostcode/allMissing.length*100).toFixed(1)}%)`);
  console.log(`Missing/empty address: ${emptyAddress} (${(emptyAddress/allMissing.length*100).toFixed(1)}%)`);
  console.log(`Missing/invalid city: ${emptyCity} (${(emptyCity/allMissing.length*100).toFixed(1)}%)`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

