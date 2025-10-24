// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Using OpenStreetMap's Nominatim API (free, no API key needed)
// Rate limit: 1 request per second
async function geocodeByNameAndCity(name: string, city: string): Promise<{ lat: number; lon: number } | null> {
  try {
    // Clean up the name (remove " (Other)" suffix if present)
    const cleanName = name.replace(/\s*\(Other\)\s*$/i, '').trim();
    
    // Build search query
    const searchQuery = `${cleanName}, ${city}, UK`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Flourish-App/1.0' // Nominatim requires a User-Agent
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to geocode ${searchQuery}: ${response.status}`);
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
    console.error(`Error geocoding ${name}, ${city}:`, error);
    return null;
  }
}

async function main() {
  // Get locations with missing/zero coords and invalid postcodes
  const toGeocode = await prisma.$queryRaw<Array<{ 
    id: string; 
    name: string; 
    city: string;
    postcode: string | null;
  }>>`
    SELECT id, name, city, postcode FROM locations 
    WHERE (latitude = 0 OR longitude = 0 OR latitude IS NULL OR longitude IS NULL)
    AND (postcode IS NULL OR postcode = '' OR postcode = '-')
    ORDER BY name
  `;
  
  console.log(`Found ${toGeocode.length} locations to geocode by name\n`);
  
  if (toGeocode.length === 0) {
    console.log('No locations need geocoding!');
    return;
  }
  
  let updated = 0;
  let failed = 0;
  
  for (let i = 0; i < toGeocode.length; i++) {
    const loc = toGeocode[i];
    console.log(`[${i + 1}/${toGeocode.length}] Geocoding: ${loc.name}, ${loc.city}...`);
    
    const coords = await geocodeByNameAndCity(loc.name, loc.city);
    
    if (coords) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { 
          latitude: coords.lat, 
          longitude: coords.lon 
        }
      });
      console.log(`  ✓ Found: ${coords.lat}, ${coords.lon}`);
      updated++;
    } else {
      console.log(`  ✗ Not found`);
      failed++;
    }
    
    // Rate limiting: Wait 1 second between requests (Nominatim requirement)
    if (i < toGeocode.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1100));
    }
  }
  
  console.log(`\n📊 Results:`);
  console.log(`✓ Successfully geocoded: ${updated}`);
  console.log(`✗ Failed to geocode: ${failed}`);
  console.log(`Total processed: ${toGeocode.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

