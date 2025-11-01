#!/usr/bin/env tsx
/**
 * 🌙 OVERNIGHT WEBSITE DISCOVERY
 * 
 * Robust script to find websites for ALL locations without them.
 * Features:
 * - Resume capability (saves progress)
 * - Comprehensive logging
 * - Error handling with retries
 * - Progress tracking
 * - Cost estimation
 * 
 * Can safely run for 8-12 hours unattended.
 */

import { PrismaClient } from '@prisma/client';
import { writeFileSync, readFileSync, existsSync } from 'fs';

const prisma = new PrismaClient();

const GOOGLE_API_KEY = 'AIzaSyBCNihO0BievjL3qGCfcO1CwEI13SGTrGo';
const PROGRESS_FILE = '/tmp/website-discovery-progress.json';

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

interface Progress {
  completed: string[];
  successCount: number;
  failCount: number;
  lastSaved: string;
  startTime: string;
}

// Load or initialize progress
function loadProgress(): Progress {
  if (existsSync(PROGRESS_FILE)) {
    try {
      const data = readFileSync(PROGRESS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.log('⚠️  Could not load progress file, starting fresh');
    }
  }
  
  return {
    completed: [],
    successCount: 0,
    failCount: 0,
    lastSaved: new Date().toISOString(),
    startTime: new Date().toISOString(),
  };
}

// Save progress
function saveProgress(progress: Progress) {
  progress.lastSaved = new Date().toISOString();
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Search for a location using Google Places API with retry logic
async function searchPlace(
  locationName: string,
  city: string,
  retries: number = 3
): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Construct search query
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

        if (place.place_id) {
          return await getPlaceDetails(place.place_id);
        }
      } else if (data.status === 'ZERO_RESULTS') {
        // Try simpler query
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
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        console.log(`   ⚠️  Rate limit hit, waiting 10s...`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        continue;
      }

      return null;
    } catch (error) {
      if (attempt < retries) {
        console.log(`   ⚠️  Attempt ${attempt} failed, retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        console.error(`   ❌ Error after ${retries} attempts:`, error);
        return null;
      }
    }
  }

  return null;
}

// Get place details with retry logic
async function getPlaceDetails(
  placeId: string,
  retries: number = 3
): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=website&key=${GOOGLE_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result?.website) {
        return data.result.website;
      }

      return null;
    } catch (error) {
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        console.error(`   ❌ Error getting place details:`, error);
        return null;
      }
    }
  }

  return null;
}

async function main() {
  console.log('\n🌙 OVERNIGHT WEBSITE DISCOVERY');
  console.log('='.repeat(80));
  console.log('Finding websites for ALL locations without them');
  console.log('Can safely run for 8-12 hours unattended\n');

  // Load progress
  const progress = loadProgress();
  const isResuming = progress.completed.length > 0;

  if (isResuming) {
    console.log('🔄 RESUMING from previous run');
    console.log(`   Started: ${progress.startTime}`);
    console.log(`   Last saved: ${progress.lastSaved}`);
    console.log(`   Completed: ${progress.completed.length}`);
    console.log(`   Success: ${progress.successCount} | Failed: ${progress.failCount}\n`);
  }

  // Get ALL locations without websites
  const allLocations = await prisma.location.findMany({
    where: {
      website: null,
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      NOT: { name: { contains: '(Other)' } },
    },
    select: { id: true, name: true, city: true, county: true, numberOfStores: true },
    orderBy: [
      { numberOfStores: 'desc' }, // Prioritize larger locations
      { name: 'asc' },
    ],
  });

  // Filter out already completed
  const locations = allLocations.filter(
    (loc) => !progress.completed.includes(loc.id)
  );

  const totalToProcess = locations.length;
  const alreadyCompleted = progress.completed.length;

  console.log('📊 SCOPE:');
  console.log(`   Total without websites: ${allLocations.length}`);
  console.log(`   Already completed: ${alreadyCompleted}`);
  console.log(`   Remaining to process: ${totalToProcess}`);
  console.log('');
  
  if (totalToProcess === 0) {
    console.log('✅ All locations already processed!');
    return;
  }

  // Cost & time estimates
  const estimatedCost = (totalToProcess * 0.017).toFixed(2);
  const estimatedMinutes = Math.ceil((totalToProcess * 2.5) / 60);
  const estimatedHours = (estimatedMinutes / 60).toFixed(1);

  console.log('💰 ESTIMATES:');
  console.log(`   API cost: $${estimatedCost}`);
  console.log(`   Time: ~${estimatedHours} hours (${estimatedMinutes} minutes)`);
  console.log(`   Rate: ~24 locations/minute (2.5s each with API calls)`);
  console.log('');

  console.log('📈 PROGRESS TRACKING:');
  console.log(`   Saves every 10 locations to: ${PROGRESS_FILE}`);
  console.log(`   Can resume if stopped (Ctrl+C safe)`);
  console.log('');

  console.log('='.repeat(80));
  console.log('Starting in 3 seconds...\n');
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const startTime = Date.now();
  let successCount = progress.successCount;
  let failCount = progress.failCount;

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const overallProgress = alreadyCompleted + i + 1;
    const totalLocations = allLocations.length;
    const progressPercent = ((overallProgress / totalLocations) * 100).toFixed(1);
    const remaining = totalLocations - overallProgress;

    console.log(
      `[${overallProgress}/${totalLocations}] ${progressPercent}% | ${loc.name} (${loc.city || loc.county})`
    );
    console.log(`   Stores: ${loc.numberOfStores || '?'} | Remaining: ${remaining}`);

    try {
      const website = await searchPlace(loc.name, loc.city || loc.county);

      if (website) {
        await prisma.location.update({
          where: { id: loc.id },
          data: { website },
        });

        console.log(`   ✅ Found: ${website}`);
        successCount++;
      } else {
        console.log(`   ❌ Not found`);
        failCount++;
      }

      // Mark as completed
      progress.completed.push(loc.id);
      progress.successCount = successCount;
      progress.failCount = failCount;

      // Save progress every 10 locations
      if ((i + 1) % 10 === 0 || i === locations.length - 1) {
        saveProgress(progress);
        
        const elapsed = Math.round((Date.now() - startTime) / 1000 / 60);
        const rate = ((successCount / (i + 1)) * 100).toFixed(1);
        
        console.log('');
        console.log(`📊 CHECKPOINT [${elapsed} min elapsed]`);
        console.log(`   ✅ Success: ${successCount} (${rate}%)`);
        console.log(`   ❌ Failed: ${failCount}`);
        console.log(`   💾 Progress saved to: ${PROGRESS_FILE}`);
        console.log('');
      }

      // Rate limiting
      if (i < locations.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      failCount++;
      progress.completed.push(loc.id);
      progress.failCount = failCount;
      saveProgress(progress);
    }
  }

  // Final summary
  const totalElapsed = Math.round((Date.now() - startTime) / 1000 / 60);
  const successRate = ((successCount / totalToProcess) * 100).toFixed(1);

  console.log('\n' + '='.repeat(80));
  console.log('🎉 WEBSITE DISCOVERY COMPLETE!');
  console.log('='.repeat(80));
  console.log(`Duration: ${totalElapsed} minutes (${(totalElapsed / 60).toFixed(1)} hours)`);
  console.log(`Processed: ${totalToProcess} locations`);
  console.log(`✅ Success: ${successCount} (${successRate}%)`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`💰 API cost: $${(totalToProcess * 0.017).toFixed(2)}`);
  console.log('');

  // Now show updated database stats
  const withWebsite = await prisma.location.count({
    where: { website: { not: null } },
  });
  const total = await prisma.location.count();
  const coverage = ((withWebsite / total) * 100).toFixed(1);

  console.log('🌐 UPDATED DATABASE COVERAGE:');
  console.log(`   Locations with websites: ${withWebsite}/${total} (${coverage}%)`);
  console.log('');
  console.log('🎯 NEXT STEPS:');
  console.log('   1. Review results in dashboard');
  console.log('   2. Run tenant enrichment on new websites');
  console.log('   3. Delete progress file: rm /tmp/website-discovery-progress.json');
}

main()
  .catch((error) => {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

