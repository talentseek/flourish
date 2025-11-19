// Enrich locations with Google Places API (contact, atmosphere, opening hours)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GOOGLE_API_KEY = 'AIzaSyBCNihO0BievjL3qGCfcO1CwEI13SGTrGo';

interface PlaceDetails {
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: {
    periods?: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
    weekday_text?: string[];
  };
  current_opening_hours?: {
    weekday_text?: string[];
  };
}

interface PlaceSearchResult {
  place_id: string;
  name: string;
}

// Search for place by name and location
async function searchPlace(locationName: string, city: string, postcode?: string): Promise<string | null> {
  try {
    const query = postcode 
      ? `${locationName} ${postcode} UK`
      : `${locationName} ${city} UK shopping centre`;
    
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].place_id;
    }
    
    return null;
  } catch (error) {
    console.error(`Error searching for ${locationName}:`, error);
    return null;
  }
}

// Get detailed place information with all fields
async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  try {
    // Request all relevant fields in one call
    const fields = [
      // Contact ($0.003)
      'formatted_phone_number',
      'website',
      // Atmosphere ($0.005)
      'rating',
      'user_ratings_total',
      'price_level',
      // Opening hours ($0.003)
      'opening_hours',
      'current_opening_hours'
    ].join(',');
    
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.result) {
      return data.result;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting place details for ${placeId}:`, error);
    return null;
  }
}

// Format opening hours as JSON
function formatOpeningHours(details: PlaceDetails): any {
  if (!details.opening_hours && !details.current_opening_hours) return null;
  
  const weekdayText = details.current_opening_hours?.weekday_text || details.opening_hours?.weekday_text;
  const periods = details.opening_hours?.periods;
  
  if (!weekdayText && !periods) return null;
  
  return {
    weekday_text: weekdayText || [],
    periods: periods || []
  };
}

async function main() {
  console.log('🌐 Google Places API Enrichment\n');
  console.log('📦 Fields: Contact + Atmosphere + Opening Hours');
  console.log('💰 Cost per location: $0.011\n');
  
  // Get all locations with websites (we need this to validate/enrich)
  const locations = await prisma.location.findMany({
    where: {
      website: { not: null },
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] }
    },
    select: {
      id: true,
      name: true,
      city: true,
      postcode: true,
      website: true,
      phone: true,
      googleRating: true,
      googleReviews: true,
      openingHours: true
    },
    orderBy: { name: 'asc' }
  });
  
  console.log(`📊 Found ${locations.length} locations to process\n`);
  
  const estimatedCost = (locations.length * 0.011).toFixed(2);
  const estimatedTime = Math.ceil(locations.length * 2 / 60);
  
  console.log(`💰 Estimated cost: $${estimatedCost}`);
  console.log(`⏱️  Estimated time: ~${estimatedTime} minutes\n`);
  
  let successCount = 0;
  let partialCount = 0;
  let failCount = 0;
  let apiCalls = 0;
  
  const enrichmentResults: Record<string, number> = {
    phone: 0,
    rating: 0,
    reviews: 0,
    openingHours: 0
  };
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name} (${loc.city})`);
    
    // Step 1: Find place_id
    const placeId = await searchPlace(loc.name, loc.city, loc.postcode);
    apiCalls++;
    
    if (!placeId) {
      console.log(`   ❌ Not found in Google Places`);
      failCount++;
      await new Promise(resolve => setTimeout(resolve, 2000));
      continue;
    }
    
    console.log(`   🔍 Found place_id: ${placeId.substring(0, 20)}...`);
    
    // Step 2: Get detailed information
    const details = await getPlaceDetails(placeId);
    apiCalls++;
    
    if (!details) {
      console.log(`   ❌ Failed to get details`);
      failCount++;
      await new Promise(resolve => setTimeout(resolve, 2000));
      continue;
    }
    
    // Step 3: Prepare update data
    const updateData: any = {};
    const found: string[] = [];
    
    if (details.formatted_phone_number && !loc.phone) {
      updateData.phone = details.formatted_phone_number;
      found.push('Phone');
      enrichmentResults.phone++;
    }
    
    if (details.rating && !loc.googleRating) {
      updateData.googleRating = details.rating;
      found.push('Rating');
      enrichmentResults.rating++;
    }
    
    if (details.user_ratings_total && !loc.googleReviews) {
      updateData.googleReviews = details.user_ratings_total;
      updateData.googleVotes = details.user_ratings_total; // Save as votes too
      found.push('Reviews');
      enrichmentResults.reviews++;
    }
    
    const openingHours = formatOpeningHours(details);
    if (openingHours && !loc.openingHours) {
      updateData.openingHours = openingHours;
      found.push('Hours');
      enrichmentResults.openingHours++;
    }
    
    // Step 4: Update database
    if (Object.keys(updateData).length > 0) {
      await prisma.location.update({
        where: { id: loc.id },
        data: updateData
      });
      
      console.log(`   ✅ Enriched: ${found.join(', ')}`);
      if (found.length === 4) {
        successCount++;
      } else {
        partialCount++;
      }
    } else {
      console.log(`   ℹ️  No new data (already complete)`);
      partialCount++;
    }
    
    // Rate limiting: 2 seconds between requests
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Progress update every 25 locations
    if ((i + 1) % 25 === 0) {
      console.log(`\n📈 Progress: ${successCount} fully enriched, ${partialCount} partial, ${failCount} failed\n`);
    }
  }
  
  console.log('\n✅ Google Places enrichment complete!');
  console.log(`\n📊 Results:`);
  console.log(`   Full enrichment: ${successCount}/${locations.length}`);
  console.log(`   Partial enrichment: ${partialCount}/${locations.length}`);
  console.log(`   Failed: ${failCount}/${locations.length}`);
  
  console.log(`\n📝 Fields enriched:`);
  console.log(`   Phone numbers: ${enrichmentResults.phone}`);
  console.log(`   Google ratings: ${enrichmentResults.rating}`);
  console.log(`   Google reviews: ${enrichmentResults.reviews}`);
  console.log(`   Opening hours: ${enrichmentResults.openingHours}`);
  
  const actualCost = (apiCalls * 0.011).toFixed(2);
  console.log(`\n💰 Actual API cost: $${actualCost} (${apiCalls} calls @ $0.011)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

