// Find website URLs using DuckDuckGo (no API key required)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function searchDuckDuckGo(locationName: string, city: string): Promise<string | null> {
  try {
    // DuckDuckGo Instant Answer API (free, no key required)
    const query = encodeURIComponent(`${locationName} ${city} shopping centre`);
    const url = `https://api.duckduckgo.com/?q=${query}&format=json&no_html=1`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data: any = await response.json();
    
    // Check AbstractURL (often the official site)
    if (data.AbstractURL && data.AbstractURL.length > 10) {
      const url = data.AbstractURL.toLowerCase();
      if (!url.includes('wikipedia') && !url.includes('facebook')) {
        return data.AbstractURL;
      }
    }
    
    // Check RelatedTopics for official links
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      for (const topic of data.RelatedTopics) {
        if (topic.FirstURL) {
          const url = topic.FirstURL.toLowerCase();
          if (!url.includes('wikipedia') && 
              !url.includes('facebook') &&
              !url.includes('duckduckgo')) {
            return topic.FirstURL;
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

async function searchSerpAPI(locationName: string, city: string): Promise<string | null> {
  try {
    // Try a simple web search approach
    const query = encodeURIComponent(`${locationName} ${city}`);
    const searchUrl = `https://www.google.com/search?q=${query}`;
    
    // This is just to construct what the user could manually check
    // We'll return null and log the URL for manual review
    console.log(`      🔍 Manual search: ${searchUrl}`);
    return null;
  } catch {
    return null;
  }
}

async function main() {
  console.log('🌐 Enriching location websites (FREE method)\n');

  // Get locations needing websites
  const locations = await prisma.location.findMany({
    where: {
      website: null,
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      NOT: { name: { contains: '(Other)' } }
    },
    select: { id: true, name: true, city: true },
    orderBy: { name: 'asc' },
    take: 50 // Start with first 50
  });

  console.log(`📊 Processing first ${locations.length} locations\n`);

  let successCount = 0;
  let needsManual: Array<{ name: string; city: string; searchUrl: string }> = [];

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name}, ${loc.city}`);

    const website = await searchDuckDuckGo(loc.name, loc.city);

    if (website) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { website }
      });
      console.log(`      ✅ ${website}`);
      successCount++;
    } else {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${loc.name} ${loc.city} official website`)}`;
      console.log(`      ❌ Not found - needs manual check`);
      needsManual.push({ name: loc.name, city: loc.city, searchUrl });
    }

    // Be nice to DuckDuckGo
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✅ Website enrichment complete!');
  console.log(`   Success: ${successCount}/${locations.length} (${(successCount/locations.length*100).toFixed(1)}%)`);
  console.log(`   Needs manual: ${needsManual.length}/${locations.length}`);
  
  if (needsManual.length > 0 && needsManual.length <= 20) {
    console.log('\n📋 Locations needing manual lookup:');
    needsManual.forEach(loc => {
      console.log(`\n   ${loc.name}, ${loc.city}`);
      console.log(`   ${loc.searchUrl}`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

