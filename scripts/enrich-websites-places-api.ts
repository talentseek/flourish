// Enrich websites using Google Places API
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GOOGLE_API_KEY = 'AIzaSyBCNihO0BievjL3qGCfcO1CwEI13SGTrGo';

interface PlaceResult {
  name: string;
  formatted_address: string;
  website?: string;
  place_id: string;
  business_status?: string;
  types: string[];
  rating?: number;
  user_ratings_total?: number;
}

interface PlacesResponse {
  results: PlaceResult[];
  status: string;
  error_message?: string;
}

// Search for a location using Google Places API
async function searchPlace(locationName: string, city: string): Promise<string | null> {
  try {
    // Construct search query
    const query = `${locationName} ${city} UK shopping centre`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url);
    const data: PlacesResponse = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      // Get the first result (usually the most relevant)
      const place = data.results[0];
      
      // If it has a website, return it
      if (place.website) {
        return place.website;
      }
      
      // If no website in first result, check if we need place details
      // (sometimes website is only in Place Details API, not Text Search)
      if (place.place_id) {
        return await getPlaceDetails(place.place_id);
      }
    } else if (data.status === 'ZERO_RESULTS') {
      // Try a simpler query without "shopping centre"
      const simpleQuery = `${locationName} ${city} UK`;
      const simpleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(simpleQuery)}&key=${GOOGLE_API_KEY}`;
      
      const simpleResponse = await fetch(simpleUrl);
      const simpleData: PlacesResponse = await simpleResponse.json();
      
      if (simpleData.status === 'OK' && simpleData.results.length > 0) {
        const place = simpleData.results[0];
        
        if (place.website) {
          return place.website;
        }
        
        if (place.place_id) {
          return await getPlaceDetails(place.place_id);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error searching for ${locationName}:`, error);
    return null;
  }
}

// Get additional place details including website
async function getPlaceDetails(placeId: string): Promise<string | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=website&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.result?.website) {
      return data.result.website;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting place details for ${placeId}:`, error);
    return null;
  }
}

async function main() {
  console.log('🌐 Website Enrichment - Google Places API\n');
  
  // Get command line argument for tier or test mode
  const args = process.argv.slice(2);
  const mode = args[0] || 'test'; // test, tier1, tier2, tier12, all
  
  let locations;
  
  switch (mode) {
    case 'test':
      console.log('🧪 TEST MODE: Processing 10 sample locations\n');
      locations = await prisma.location.findMany({
        where: {
          website: null,
          type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
          NOT: { name: { contains: '(Other)' } },
          numberOfStores: { gte: 50 } // Major locations for testing
        },
        select: { id: true, name: true, city: true, numberOfStores: true },
        orderBy: { numberOfStores: 'desc' },
        take: 10
      });
      break;
    
    case 'tier1':
      console.log('🎯 TIER 1: Major locations (50+ stores)\n');
      locations = await prisma.location.findMany({
        where: {
          website: null,
          type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
          NOT: { name: { contains: '(Other)' } },
          numberOfStores: { gte: 50 }
        },
        select: { id: true, name: true, city: true, numberOfStores: true },
        orderBy: { numberOfStores: 'desc' }
      });
      break;
    
    case 'tier2':
      console.log('🎯 TIER 2: Medium locations (20-49 stores)\n');
      locations = await prisma.location.findMany({
        where: {
          website: null,
          type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
          NOT: { name: { contains: '(Other)' } },
          numberOfStores: { gte: 20, lt: 50 }
        },
        select: { id: true, name: true, city: true, numberOfStores: true },
        orderBy: { numberOfStores: 'desc' }
      });
      break;
    
    case 'tier12':
      console.log('🎯 TIER 1+2: Major + Medium locations (20+ stores)\n');
      locations = await prisma.location.findMany({
        where: {
          website: null,
          type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
          NOT: { name: { contains: '(Other)' } },
          numberOfStores: { gte: 20 }
        },
        select: { id: true, name: true, city: true, numberOfStores: true },
        orderBy: { numberOfStores: 'desc' }
      });
      break;
    
    case 'all':
      console.log('🎯 ALL: All locations without websites\n');
      locations = await prisma.location.findMany({
        where: {
          website: null,
          type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
          NOT: { name: { contains: '(Other)' } }
        },
        select: { id: true, name: true, city: true, numberOfStores: true },
        orderBy: { numberOfStores: 'desc' }
      });
      break;
    
    default:
      console.error('❌ Invalid mode. Use: test, tier1, tier2, tier12, or all');
      process.exit(1);
  }
  
  console.log(`📊 Found ${locations.length} locations to process\n`);
  
  if (mode !== 'test') {
    const estimatedCost = (locations.length * 0.017).toFixed(2);
    console.log(`💰 Estimated cost: $${estimatedCost}`);
    console.log(`⏱️  Estimated time: ~${Math.ceil(locations.length * 2 / 60)} minutes\n`);
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name} (${loc.city}) - ${loc.numberOfStores} stores`);
    
    const website = await searchPlace(loc.name, loc.city);
    
    if (website) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { website }
      });
      
      console.log(`   ✅ Found: ${website}`);
      successCount++;
    } else {
      console.log(`   ❌ Not found`);
      failCount++;
    }
    
    // Rate limiting: 2 seconds between requests
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Progress update every 20 locations
    if ((i + 1) % 20 === 0) {
      console.log(`\n📈 Progress: ${successCount} found, ${failCount} not found\n`);
    }
  }
  
  console.log('\n✅ Website enrichment complete!');
  console.log(`   Success: ${successCount}/${locations.length} (${(successCount/locations.length*100).toFixed(1)}%)`);
  console.log(`   Failed: ${failCount}/${locations.length}`);
  
  const actualCost = (locations.length * 0.017).toFixed(2);
  console.log(`\n💰 Total API cost: $${actualCost}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

