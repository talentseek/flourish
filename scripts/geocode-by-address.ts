// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Using OpenStreetMap's Nominatim API with full addresses
async function geocodeByAddress(address: string, city: string, postcode: string): Promise<{ lat: number; lon: number } | null> {
  try {
    // Build comprehensive search query
    const parts = [];
    if (address && address.trim()) parts.push(address);
    if (city && city.trim() && city !== '-') parts.push(city);
    if (postcode && postcode.trim() && postcode !== '-' && postcode !== 'EMPTY') parts.push(postcode);
    parts.push('UK');
    
    const searchQuery = parts.join(', ');
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=gb`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Flourish-RetailApp/1.0 (contact@flourish-app.com)'
      }
    });
    
    if (!response.ok) {
      console.error(`API error: ${response.status}`);
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
    console.error(`Geocoding error:`, error.message);
    return null;
  }
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
  
  console.log(`📍 Found ${toGeocode.length} locations to geocode by address\n`);
  
  if (toGeocode.length === 0) {
    console.log('No locations found with addresses!');
    return;
  }
  
  let updated = 0;
  let failed = 0;
  const failedLocations: string[] = [];
  
  for (let i = 0; i < toGeocode.length; i++) {
    const loc = toGeocode[i];
    const progress = `[${i + 1}/${toGeocode.length}]`;
    
    console.log(`${progress} ${loc.name}`);
    console.log(`  Address: ${loc.address}`);
    
    const coords = await geocodeByAddress(loc.address || '', loc.city || '', loc.postcode || '');
    
    if (coords) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { 
          latitude: coords.lat, 
          longitude: coords.lon 
        }
      });
      console.log(`  ✓ Geocoded: ${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)}\n`);
      updated++;
    } else {
      console.log(`  ✗ Failed to geocode\n`);
      failed++;
      failedLocations.push(loc.name);
    }
    
    // Rate limiting: Wait 1.1 seconds between requests (Nominatim requirement)
    if (i < toGeocode.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1100));
    }
  }
  
  console.log('═══════════════════════════════════════════');
  console.log('📊 Geocoding Results:');
  console.log(`✓ Successfully geocoded: ${updated}`);
  console.log(`✗ Failed to geocode: ${failed}`);
  console.log(`📈 Success rate: ${((updated / toGeocode.length) * 100).toFixed(1)}%`);
  
  if (failedLocations.length > 0) {
    console.log(`\n⚠️  Failed locations (may need manual review):`);
    failedLocations.forEach((name, i) => console.log(`  ${i + 1}. ${name}`));
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

