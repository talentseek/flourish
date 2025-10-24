// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Flourish-RetailApp/1.0' }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('🔄 Reverse Geocoding Check\n');
  console.log('Verifying coordinates by reverse geocoding back to addresses...\n');
  
  // Check our recently geocoded locations
  const toCheck = await prisma.$queryRaw<Array<{ 
    id: string;
    name: string;
    address: string;
    city: string;
    latitude: any;
    longitude: any;
  }>>`
    SELECT id, name, address, city, latitude, longitude 
    FROM locations 
    WHERE name IN (
      'Lakeside Shopping Centre (Lakeside)',
      'Liverpool Central',
      'Pyramid Shopping Centre (Peterborough)',
      'Discovery Business Park (retail cluster)',
      '5rise Shopping Centre'
    )
    ORDER BY name
  `;
  
  console.log(`Checking ${toCheck.length} locations...\n`);
  
  for (const loc of toCheck) {
    const lat = Number(loc.latitude);
    const lon = Number(loc.longitude);
    
    console.log(`📍 ${loc.name}`);
    console.log(`   Stated: ${loc.city}`);
    console.log(`   Coords: ${lat.toFixed(6)}, ${lon.toFixed(6)}`);
    
    const reversed = await reverseGeocode(lat, lon);
    
    if (reversed) {
      // Check if the city name appears in the reversed address
      const cityLower = loc.city.toLowerCase();
      const reversedLower = reversed.toLowerCase();
      
      if (reversedLower.includes(cityLower) || 
          cityLower.includes(reversedLower.split(',')[0].toLowerCase())) {
        console.log(`   ✓ Matches: ${reversed.substring(0, 100)}...`);
      } else {
        console.log(`   ⚠️  Reverse: ${reversed.substring(0, 100)}...`);
      }
    } else {
      console.log(`   ? Could not reverse geocode`);
    }
    
    console.log('');
    
    // Rate limiting
    await sleep(1500);
  }
  
  console.log('═══════════════════════════════════════════');
  console.log('✅ Reverse geocoding check complete!');
  console.log('\nAll locations should match their stated city/region.');
  console.log('Any warnings (⚠️) should be manually reviewed.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

