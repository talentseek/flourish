#!/usr/bin/env tsx
/**
 * 🌐 PARALLEL WEBSITE DISCOVERY
 * Safe to run alongside other enrichment scripts
 * Finds websites using Google Places API for locations that don't have one
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const GOOGLE_API_KEY = 'AIzaSyBCNihO0BievjL3qGCfcO1CwEI13SGTrGo';

interface PlacesResponse {
  results: Array<{
    place_id: string;
    website?: string;
  }>;
  status: string;
}

async function searchPlace(locationName: string, city: string): Promise<string | null> {
  try {
    const query = `${locationName} ${city} UK shopping centre`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data: PlacesResponse = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const place = data.results[0];

      if (place.website) {
        return place.website;
      }

      // If no website in text search, try place details
      if (place.place_id) {
        return await getPlaceDetails(place.place_id);
      }
    } else if (data.status === 'ZERO_RESULTS') {
      // Try simpler query without "shopping centre"
      const simpleQuery = `${locationName} ${city} UK`;
      const simpleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        simpleQuery
      )}&key=${GOOGLE_API_KEY}`;

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
    return null;
  }
}

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
    return null;
  }
}

async function main() {
  console.log('\n🌐 PARALLEL WEBSITE DISCOVERY');
  console.log('='.repeat(80));
  console.log('Finding websites using Google Places API (safe to run alongside other scripts)\n');

  // Get ALL locations without websites
  const locations = await prisma.location.findMany({
    where: {
      website: null,
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      NOT: { name: { contains: '(Other)' } },
    },
    select: { id: true, name: true, city: true, county: true, numberOfStores: true },
    orderBy: [{ numberOfStores: 'desc' }, { name: 'asc' }],
  });

  console.log(`📊 Found ${locations.length} locations without websites\n`);

  // Calculate cost
  const estimatedCost = (locations.length * 0.017).toFixed(2);
  const estimatedMinutes = Math.ceil((locations.length * 2.5) / 60);

  console.log(`💰 Estimated API cost: $${estimatedCost}`);
  console.log(`⏱️  Estimated time: ~${estimatedMinutes} minutes\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const city = loc.city || loc.county;
    
    console.log(`[${i + 1}/${locations.length}] ${loc.name} (${city})`);

    try {
      const website = await searchPlace(loc.name, city);

      if (website) {
        await prisma.location.update({
          where: { id: loc.id },
          data: { website },
        });

        console.log(`   ✅ Found: ${website}`);
        success++;
      } else {
        console.log(`   ❌ Not found`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }

    // Rate limiting
    if (i < locations.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Progress update every 50
    if ((i + 1) % 50 === 0) {
      const rate = ((success / (i + 1)) * 100).toFixed(1);
      console.log(`\n📈 Progress: ${success} found (${rate}%), ${failed} not found\n`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ WEBSITE DISCOVERY COMPLETE!');
  console.log('='.repeat(80));
  console.log(`Success: ${success}/${locations.length} (${((success / locations.length) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failed}/${locations.length}`);
  console.log(`\n💰 Actual API cost: $${(locations.length * 0.017).toFixed(2)}`);

  // Show updated stats
  const withWebsite = await prisma.location.count({
    where: { website: { not: null } },
  });
  const total = await prisma.location.count();
  const coverage = ((withWebsite / total) * 100).toFixed(1);

  console.log('\n🌐 UPDATED DATABASE COVERAGE:');
  console.log(`   Locations with websites: ${withWebsite}/${total} (${coverage}%)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

