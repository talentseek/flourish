// Test Google Custom Search API
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GOOGLE_API_KEY = 'AIzaSyBCNihO0BievjL3qGCfcO1CwEI13SGTrGo';
const GOOGLE_CX = process.env.GOOGLE_SEARCH_CX || ''; // We'll need this

interface SearchResult {
  items?: Array<{
    link: string;
    title: string;
    snippet: string;
  }>;
}

async function searchWebsite(locationName: string, city: string): Promise<string | null> {
  if (!GOOGLE_CX) {
    console.log('⚠️  GOOGLE_SEARCH_CX environment variable not set');
    console.log('📝 To create one:');
    console.log('   1. Go to: https://programmablesearchengine.google.com/');
    console.log('   2. Click "Add" to create a new search engine');
    console.log('   3. Search the entire web: select "Search the entire web"');
    console.log('   4. Copy the "Search engine ID" and set it as GOOGLE_SEARCH_CX');
    console.log('');
    process.exit(1);
  }

  const query = `"${locationName}" ${city} official website`;
  const url = new URL('https://www.googleapis.com/customsearch/v1');
  url.searchParams.set('key', GOOGLE_API_KEY);
  url.searchParams.set('cx', GOOGLE_CX);
  url.searchParams.set('q', query);
  url.searchParams.set('num', '3'); // Get top 3 results

  console.log(`🔍 Searching: ${query}`);
  
  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      console.error(error);
      return null;
    }

    const data: SearchResult = await response.json();
    
    if (data.items && data.items.length > 0) {
      console.log(`✅ Found ${data.items.length} results:`);
      data.items.forEach((item, i) => {
        console.log(`   ${i + 1}. ${item.link}`);
        console.log(`      ${item.title}`);
      });
      
      // Return the first result that looks like an official site
      for (const item of data.items) {
        const url = item.link.toLowerCase();
        // Avoid directories, Wikipedia, etc.
        if (!url.includes('wikipedia') && 
            !url.includes('facebook.com') &&
            !url.includes('instagram.com') &&
            !url.includes('tripadvisor') &&
            !url.includes('yell.com') &&
            !url.includes('directory')) {
          console.log(`   ✓ Selected: ${item.link}`);
          return item.link;
        }
      }
      return data.items[0].link;
    } else {
      console.log('❌ No results found');
      return null;
    }
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    return null;
  }
}

async function main() {
  console.log('🧪 Testing Google Custom Search API\n');
  
  // Test with a few well-structured locations without websites
  const testLocations = await prisma.location.findMany({
    where: {
      website: null,
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      NOT: { name: { contains: '(Other)' } }
    },
    select: { name: true, city: true, website: true },
    take: 3
  });

  if (testLocations.length === 0) {
    console.log('❌ No test locations found');
    return;
  }

  console.log(`Testing with ${testLocations.length} locations:\n`);

  for (const location of testLocations) {
    const website = await searchWebsite(location.name, location.city);
    console.log('');
    
    // Rate limit: Google allows 100/day free, or 10 queries/second if paid
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ Test complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

