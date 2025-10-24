// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeByAddress(fullAddress: string): Promise<{ lat: number; lon: number } | null> {
  try {
    // The address field already contains the full address, just add UK
    const searchQuery = `${fullAddress}, UK`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=gb`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Flourish-RetailApp/1.0'
      }
    });
    
    if (response.status === 429) {
      console.log(`  ⏳ Rate limited, waiting 5 seconds...`);
      await sleep(5000);
      return null;
    }
    
    if (!response.ok) {
      console.log(`  ⚠️  API error ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon)
      };
    }
    
    return null;
    
  } catch (error) {
    console.log(`  ⚠️  Error: ${error.message}`);
    return null;
  }
}

async function main() {
  // Get locations with missing/zero coords that have addresses
  const toGeocode = await prisma.$queryRaw<Array<{ 
    id: string; 
    name: string; 
    address: string;
  }>>`
    SELECT id, name, address FROM locations 
    WHERE (latitude = 0 OR longitude = 0 OR latitude IS NULL OR longitude IS NULL)
    AND (address IS NOT NULL AND address != '')
    ORDER BY name
  `;
  
  console.log(`📍 Found ${toGeocode.length} locations to geocode\n`);
  console.log(`⏱️  Estimated time: ~${Math.ceil(toGeocode.length * 2 / 60)} minutes\n`);
  
  if (toGeocode.length === 0) {
    console.log('✅ All locations with addresses are already geocoded!');
    return;
  }
  
  let updated = 0;
  let failed = 0;
  const failedLocations: Array<{name: string; address: string}> = [];
  
  for (let i = 0; i < toGeocode.length; i++) {
    const loc = toGeocode[i];
    const progress = `[${i + 1}/${toGeocode.length}]`;
    
    console.log(`${progress} ${loc.name}`);
    
    const coords = await geocodeByAddress(loc.address);
    
    if (coords) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { 
          latitude: coords.lat, 
          longitude: coords.lon 
        }
      });
      console.log(`  ✓ ${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)}\n`);
      updated++;
    } else {
      console.log(`  ✗ Could not geocode\n`);
      failed++;
      failedLocations.push({ name: loc.name, address: loc.address });
    }
    
    // Rate limiting: 2 seconds between requests
    if (i < toGeocode.length - 1) {
      await sleep(2000);
    }
  }
  
  console.log('═══════════════════════════════════════════');
  console.log('📊 Geocoding Results:');
  console.log(`✓ Successfully geocoded: ${updated}`);
  console.log(`✗ Failed: ${failed}`);
  if (toGeocode.length > 0) {
    console.log(`📈 Success rate: ${((updated / toGeocode.length) * 100).toFixed(1)}%`);
  }
  
  if (failedLocations.length > 0 && failedLocations.length <= 15) {
    console.log(`\n⚠️  Failed locations (may need manual geocoding):`);
    failedLocations.forEach(({name, address}) => {
      console.log(`  • ${name}`);
      console.log(`    ${address}`);
    });
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

