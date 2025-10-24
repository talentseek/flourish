// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeByAddress(
  address: string, 
  city: string, 
  postcode: string,
  retries = 3
): Promise<{ lat: number; lon: number } | null> {
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Build comprehensive search query
      const parts = [];
      if (address && address.trim()) parts.push(address);
      if (city && city.trim() && city !== '-') parts.push(city);
      if (postcode && postcode.trim() && postcode !== '-') parts.push(postcode);
      parts.push('UK');
      
      const searchQuery = parts.join(', ');
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=gb`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Flourish-RetailApp/1.0'
        }
      });
      
      if (response.status === 429) {
        console.log(`  ⏳ Rate limited (attempt ${attempt}/${retries}), waiting 5 seconds...`);
        await sleep(5000);
        continue;
      }
      
      if (!response.ok) {
        console.log(`  ⚠️  API error ${response.status} (attempt ${attempt}/${retries})`);
        if (attempt < retries) {
          await sleep(2000);
          continue;
        }
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
      console.log(`  ⚠️  Error (attempt ${attempt}/${retries}): ${error.message}`);
      if (attempt < retries) {
        await sleep(2000);
        continue;
      }
      return null;
    }
  }
  
  return null;
}

async function main() {
  // Get locations with missing/zero coords that have addresses
  const toGeocode = await prisma.$queryRaw<Array<{ 
    id: string; 
    name: string; 
    address: string | null;
    city: string | null;
    postcode: string | null;
  }>>`
    SELECT id, name, address, city, postcode FROM locations 
    WHERE (latitude = 0 OR longitude = 0 OR latitude IS NULL OR longitude IS NULL)
    AND (address IS NOT NULL AND address != '')
    ORDER BY name
  `;
  
  console.log(`📍 Found ${toGeocode.length} locations to geocode\n`);
  console.log(`⏱️  Estimated time: ~${Math.ceil(toGeocode.length * 2 / 60)} minutes (with rate limiting)\n`);
  
  if (toGeocode.length === 0) {
    console.log('No locations found!');
    return;
  }
  
  let updated = 0;
  let failed = 0;
  const failedLocations: Array<{name: string; address: string}> = [];
  
  for (let i = 0; i < toGeocode.length; i++) {
    const loc = toGeocode[i];
    const progress = `[${i + 1}/${toGeocode.length}]`;
    
    console.log(`${progress} ${loc.name}`);
    
    const coords = await geocodeByAddress(
      loc.address || '', 
      loc.city || '', 
      loc.postcode || ''
    );
    
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
      failedLocations.push({ name: loc.name, address: loc.address || '' });
    }
    
    // Rate limiting: 2 seconds between requests to be safe
    if (i < toGeocode.length - 1) {
      await sleep(2000);
    }
  }
  
  console.log('═══════════════════════════════════════════');
  console.log('📊 Final Results:');
  console.log(`✓ Successfully geocoded: ${updated}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`📈 Success rate: ${((updated / toGeocode.length) * 100).toFixed(1)}%`);
  
  if (failedLocations.length > 0 && failedLocations.length <= 10) {
    console.log(`\n⚠️  Failed locations:`);
    failedLocations.forEach(({name, address}) => {
      console.log(`  • ${name}`);
      console.log(`    ${address}`);
    });
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

