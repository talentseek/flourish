// Find and save website URLs for all locations using Google Custom Search
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GOOGLE_API_KEY = 'AIzaSyBCNihO0BievjL3qGCfcO1CwEI13SGTrGo';
const GOOGLE_CX = process.env.GOOGLE_SEARCH_CX || '';

interface SearchResult {
  items?: Array<{
    link: string;
    title: string;
    snippet: string;
  }>;
}

async function searchWebsite(locationName: string, city: string): Promise<string | null> {
  const query = `"${locationName}" ${city} shopping centre official website`;
  const url = new URL('https://www.googleapis.com/customsearch/v1');
  url.searchParams.set('key', GOOGLE_API_KEY);
  url.searchParams.set('cx', GOOGLE_CX);
  url.searchParams.set('q', query);
  url.searchParams.set('num', '5'); // Get top 5 results

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      if (response.status === 429) {
        console.log('      ⚠️  Rate limit hit, waiting 60s...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        return searchWebsite(locationName, city); // Retry
      }
      console.error(`      ❌ API Error: ${response.status}`);
      return null;
    }

    const data: SearchResult = await response.json();
    
    if (data.items && data.items.length > 0) {
      // Return the first result that looks like an official site
      for (const item of data.items) {
        const url = item.link.toLowerCase();
        // Avoid directories, social media, Wikipedia, etc.
        if (!url.includes('wikipedia') && 
            !url.includes('facebook.com') &&
            !url.includes('instagram.com') &&
            !url.includes('twitter.com') &&
            !url.includes('tripadvisor') &&
            !url.includes('yell.com') &&
            !url.includes('192.com') &&
            !url.includes('directory') &&
            !url.includes('yelp.com')) {
          return item.link;
        }
      }
      // If all filtered out, return first result
      return data.items[0].link;
    }
    return null;
  } catch (error) {
    console.error(`      ❌ Error: ${error}`);
    return null;
  }
}

async function main() {
  if (!GOOGLE_CX) {
    console.error('❌ GOOGLE_SEARCH_CX environment variable not set');
    console.log('📝 To create one:');
    console.log('   1. Go to: https://programmablesearchengine.google.com/');
    console.log('   2. Click "Add" to create a new search engine');
    console.log('   3. Search the entire web: select "Search the entire web"');
    console.log('   4. Copy the "Search engine ID"');
    process.exit(1);
  }

  console.log('🌐 Enriching location websites\n');

  // Get locations needing websites (well-structured ones)
  const locations = await prisma.location.findMany({
    where: {
      website: null,
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      NOT: { name: { contains: '(Other)' } }
    },
    select: { id: true, name: true, city: true },
    orderBy: { name: 'asc' }
  });

  console.log(`📊 Found ${locations.length} locations needing websites\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name}, ${loc.city}`);

    const website = await searchWebsite(loc.name, loc.city);

    if (website) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { website }
      });
      console.log(`      ✅ ${website}`);
      successCount++;
    } else {
      console.log(`      ❌ No website found`);
      failCount++;
    }

    // Rate limiting: 100 requests/day free, or 1 per second
    // Being conservative with 1.5s delay
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Progress update every 10 locations
    if ((i + 1) % 10 === 0) {
      console.log(`\n📈 Progress: ${successCount} found, ${failCount} not found\n`);
    }
  }

  console.log('\n✅ Website enrichment complete!');
  console.log(`   Success: ${successCount}/${locations.length} (${(successCount/locations.length*100).toFixed(1)}%)`);
  console.log(`   Failed: ${failCount}/${locations.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

