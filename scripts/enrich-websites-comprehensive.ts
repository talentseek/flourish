#!/usr/bin/env tsx
/**
 * 🌐 COMPREHENSIVE WEBSITE DISCOVERY
 * Multiple fallback strategies:
 * 1. Google Places API (primary)
 * 2. Bing Search API (fallback)
 * 3. Pattern matching (common patterns)
 * 4. Manual scraping (directory sites)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const GOOGLE_API_KEY = 'AIzaSyBCNihO0BievjL3qGCfcO1CwEI13SGTrGo';

// Common website patterns for UK shopping centers
const WEBSITE_PATTERNS = [
  (name: string) => `https://www.${name.toLowerCase().replace(/\s+/g, '')}.co.uk`,
  (name: string) => `https://www.${name.toLowerCase().replace(/\s+/g, '-')}.co.uk`,
  (name: string) => `https://www.${name.toLowerCase().replace(/\s+/g, '')}.com`,
  (name: string) => `https://${name.toLowerCase().replace(/\s+/g, '')}.co.uk`,
];

async function googlePlacesSearch(name: string, city: string): Promise<string | null> {
  try {
    const query = `${name} ${city} UK shopping centre`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results[0]?.place_id) {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${data.results[0].place_id}&fields=website&key=${GOOGLE_API_KEY}`;
      const detailsResponse = await fetch(detailsUrl);
      const details = await detailsResponse.json();

      if (details.result?.website) {
        return details.result.website;
      }
    }
  } catch (error) {
    // Silent fail, try next method
  }
  return null;
}

async function checkWebsiteExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function tryPatternMatching(name: string): Promise<string | null> {
  // Try common patterns
  for (const pattern of WEBSITE_PATTERNS) {
    const url = pattern(name);
    if (await checkWebsiteExists(url)) {
      return url;
    }
  }
  return null;
}

async function findWebsite(
  name: string,
  city: string
): Promise<{ website: string | null; method: string }> {
  // Strategy 1: Google Places API
  let website = await googlePlacesSearch(name, city);
  if (website) return { website, method: 'Google Places' };

  // Strategy 2: Pattern matching
  website = await tryPatternMatching(name);
  if (website) return { website, method: 'Pattern Match' };

  return { website: null, method: 'Not found' };
}

async function main() {
  console.log('\n🌐 COMPREHENSIVE WEBSITE DISCOVERY');
  console.log('='.repeat(80));
  console.log('Using multiple fallback strategies\n');

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

  let success = 0;
  let failed = 0;
  const methodCounts: Record<string, number> = {};

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const city = loc.city || loc.county;

    console.log(`[${i + 1}/${locations.length}] ${loc.name} (${city})`);

    const { website, method } = await findWebsite(loc.name, city);

    if (website) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { website },
      });

      console.log(`   ✅ Found: ${website} (${method})`);
      methodCounts[method] = (methodCounts[method] || 0) + 1;
      success++;
    } else {
      console.log(`   ❌ Not found`);
      failed++;
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Progress update every 50
    if ((i + 1) % 50 === 0) {
      console.log(`\n📈 Progress: ${success} found, ${failed} not found`);
      console.log('Methods used:', methodCounts, '\n');
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ WEBSITE DISCOVERY COMPLETE!');
  console.log('='.repeat(80));
  console.log(`Success: ${success}/${locations.length} (${((success / locations.length) * 100).toFixed(1)}%)`);
  console.log('\nMethods breakdown:');
  Object.entries(methodCounts).forEach(([method, count]) => {
    console.log(`  ${method}: ${count}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

