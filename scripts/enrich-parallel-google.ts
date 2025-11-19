#!/usr/bin/env tsx
/**
 * 📍 PARALLEL GOOGLE PLACES ENRICHMENT
 * Safe to run alongside other enrichment scripts
 * Enriches phone, ratings, reviews, opening hours
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const GOOGLE_API_KEY = 'AIzaSyBCNihO0BievjL3qGCfcO1CwEI13SGTrGo';

interface PlaceDetails {
  formatted_phone_number?: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    weekday_text?: string[];
    periods?: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
  };
  current_opening_hours?: {
    weekday_text?: string[];
  };
}

async function searchPlace(locationName: string, city: string, postcode?: string): Promise<string | null> {
  try {
    const query = postcode
      ? `${locationName} ${postcode} UK`
      : `${locationName} ${city} UK shopping centre`;

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].place_id;
    }

    return null;
  } catch (error) {
    return null;
  }
}

async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  try {
    const fields = [
      'formatted_phone_number',
      'rating',
      'user_ratings_total',
      'opening_hours',
      'current_opening_hours',
    ].join(',');

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      return data.result;
    }

    return null;
  } catch (error) {
    return null;
  }
}

function formatOpeningHours(details: PlaceDetails): any {
  if (!details.opening_hours && !details.current_opening_hours) return null;

  const weekdayText =
    details.current_opening_hours?.weekday_text || details.opening_hours?.weekday_text;
  const periods = details.opening_hours?.periods;

  if (!weekdayText && !periods) return null;

  return {
    weekday_text: weekdayText || [],
    periods: periods || [],
  };
}

async function main() {
  console.log('\n📍 PARALLEL GOOGLE PLACES ENRICHMENT');
  console.log('='.repeat(80));
  console.log('Enriching phone, ratings, hours (safe to run alongside other scripts)\n');

  // Get locations with websites but missing Google Places data
  // Note: Can't query Json fields in where clause, so we fetch and filter client-side
  const allLocations = await prisma.location.findMany({
    where: {
      website: { not: null },
    },
    select: {
      id: true,
      name: true,
      city: true,
      county: true,
      postcode: true,
      phone: true,
      googleRating: true,
      googleReviews: true,
      openingHours: true,
    },
    orderBy: { numberOfStores: 'desc' },
  });

  // Filter for locations missing at least one Google Places field
  const locations = allLocations.filter(
    (loc) => !loc.phone || !loc.googleRating || !loc.openingHours
  );

  console.log(`📊 Found ${locations.length} locations to enrich`);
  
  // Calculate cost
  const estimatedCost = (locations.length * 0.011).toFixed(2);
  console.log(`💰 Estimated API cost: $${estimatedCost}`);
  console.log(`⏱️  Estimated time: ~${Math.ceil((locations.length * 3) / 60)} minutes\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    console.log(`[${i + 1}/${locations.length}] ${loc.name} (${loc.city || loc.county})`);

    try {
      // Search for place
      const placeId = await searchPlace(loc.name, loc.city || loc.county, loc.postcode);

      if (!placeId) {
        console.log(`   ⚠️  Place not found in Google`);
        failed++;
        continue;
      }

      // Get details
      const details = await getPlaceDetails(placeId);

      if (!details) {
        console.log(`   ⚠️  Could not get place details`);
        failed++;
        continue;
      }

      // Prepare update
      const updateData: any = {};

      if (details.formatted_phone_number && !loc.phone) {
        updateData.phone = details.formatted_phone_number;
      }

      if (details.rating && !loc.googleRating) {
        updateData.googleRating = details.rating;
      }

      if (details.user_ratings_total) {
        if (!loc.googleReviews) {
          updateData.googleReviews = details.user_ratings_total;
        }
        if (!loc.googleRating) {
          updateData.googleVotes = details.user_ratings_total;
        }
      }

      const openingHours = formatOpeningHours(details);
      if (openingHours && !loc.openingHours) {
        updateData.openingHours = openingHours;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.location.update({
          where: { id: loc.id },
          data: updateData,
        });

        const found = Object.keys(updateData)
          .map((k) => {
            if (k === 'phone') return 'phone';
            if (k === 'googleRating') return `rating (${updateData[k]})`;
            if (k === 'googleReviews') return `reviews (${updateData[k]})`;
            if (k === 'openingHours') return 'hours';
            return k;
          })
          .join(', ');

        console.log(`   ✅ Found: ${found}`);
        success++;
      } else {
        console.log(`   ⚠️  No new data`);
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
      console.log(`\n📈 Progress: ${success} enriched, ${failed} failed\n`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ GOOGLE PLACES ENRICHMENT COMPLETE!');
  console.log('='.repeat(80));
  console.log(`Success: ${success}/${locations.length} (${Math.round((success / locations.length) * 100)}%)`);
  console.log(`Failed: ${failed}/${locations.length}`);
  console.log(`\n💰 Actual API cost: $${(locations.length * 0.011).toFixed(2)}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

