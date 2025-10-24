// Extract parking space counts from location websites
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface ParkingResult {
  spaces?: number;
  method: 'regex' | 'context' | 'failed';
  confidence: 'high' | 'medium' | 'low';
  snippet?: string;
}

async function fetchHTML(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(10000) // 10s timeout
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.text();
  } catch (error) {
    return null;
  }
}

function extractParkingFromHTML(html: string): ParkingResult {
  const $ = cheerio.load(html);
  
  // Remove script and style tags
  $('script, style').remove();
  
  // Get text content
  const text = $('body').text().toLowerCase();
  
  // Patterns to search for (ordered by specificity)
  const patterns = [
    // "1,200 parking spaces" or "1200 parking spaces"
    /(\d{1,3}(?:,\d{3})+|\d{3,5})\s*(?:free\s+)?(?:car\s+)?parking\s+spaces/gi,
    // "parking: 1,200 spaces"
    /parking:\s*(\d{1,3}(?:,\d{3})+|\d{3,5})\s+spaces/gi,
    // "spaces for 1,200 cars"
    /spaces?\s+for\s+(\d{1,3}(?:,\d{3})+|\d{3,5})\s+(?:cars|vehicles)/gi,
    // "car park with 1,200 spaces"
    /car\s+park\s+(?:with|of|has|offers?)\s+(\d{1,3}(?:,\d{3})+|\d{3,5})\s+spaces/gi,
    // "over 1,200 parking spaces" or "approximately 1,200 parking spaces"
    /(?:over|approximately|around|more than)\s+(\d{1,3}(?:,\d{3})+|\d{3,5})\s+(?:car\s+)?parking\s+spaces/gi,
    // "1,200-space car park"
    /(\d{1,3}(?:,\d{3})+|\d{3,5})-space\s+(?:car\s+)?park/gi,
    // "parking for 1,200"
    /parking\s+for\s+(\d{1,3}(?:,\d{3})+|\d{3,5})/gi,
    // "1,200 spaces available"
    /(\d{1,3}(?:,\d{3})+|\d{3,5})\s+spaces?\s+available/gi,
    // UK specific: "car park capacity: 1,200"
    /car\s+park\s+capacity:?\s*(\d{1,3}(?:,\d{3})+|\d{3,5})/gi,
  ];
  
  for (const pattern of patterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      const match = matches[0];
      const numStr = match[1].replace(/,/g, '');
      const spaces = parseInt(numStr, 10);
      
      // Sanity check: parking should be between 20 and 50,000
      if (spaces >= 20 && spaces <= 50000) {
        return {
          spaces,
          method: 'regex',
          confidence: 'high',
          snippet: match[0]
        };
      }
    }
  }
  
  // Fallback: look for any numbers near "parking" or "car park"
  const contextPattern = /parking[^.]{0,100}(\d{1,3}(?:,\d{3})+|\d{3,5})|(\d{1,3}(?:,\d{3})+|\d{3,5})[^.]{0,100}parking/gi;
  const contextMatches = Array.from(text.matchAll(contextPattern));
  
  if (contextMatches.length > 0) {
    const match = contextMatches[0];
    const numStr = (match[1] || match[2]).replace(/,/g, '');
    const spaces = parseInt(numStr, 10);
    
    if (spaces >= 50 && spaces <= 50000) {
      return {
        spaces,
        method: 'context',
        confidence: 'medium',
        snippet: match[0]
      };
    }
  }
  
  return {
    method: 'failed',
    confidence: 'low'
  };
}

async function main() {
  console.log('🅿️  Enriching parking data from websites\n');

  // Get locations with websites but no parking data
  const locations = await prisma.location.findMany({
    where: {
      website: { not: null },
      parkingSpaces: null,
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] }
    },
    select: { id: true, name: true, city: true, website: true },
    orderBy: { name: 'asc' },
    take: 20 // TEST WITH 20 FIRST
  });

  console.log(`📊 Found ${locations.length} locations to process\n`);

  let successCount = 0;
  let failCount = 0;
  const results: Array<{ name: string; spaces?: number; confidence?: string }> = [];

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name}`);
    console.log(`      URL: ${loc.website}`);

    const html = await fetchHTML(loc.website!);
    
    if (!html) {
      console.log(`      ❌ Failed to fetch website`);
      failCount++;
      results.push({ name: loc.name });
      continue;
    }

    const result = extractParkingFromHTML(html);

    if (result.spaces) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { parkingSpaces: result.spaces }
      });
      
      console.log(`      ✅ Found: ${result.spaces} spaces (${result.confidence} confidence)`);
      if (result.snippet) {
        console.log(`      📝 "${result.snippet.substring(0, 80)}..."`);
      }
      successCount++;
      results.push({ name: loc.name, spaces: result.spaces, confidence: result.confidence });
    } else {
      console.log(`      ❌ No parking data found`);
      failCount++;
      results.push({ name: loc.name });
    }

    // Rate limiting
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Progress update every 10 locations
    if ((i + 1) % 10 === 0) {
      console.log(`\n📈 Progress: ${successCount} found, ${failCount} not found\n`);
    }
  }

  console.log('\n✅ Parking enrichment complete!');
  console.log(`   Success: ${successCount}/${locations.length} (${(successCount/locations.length*100).toFixed(1)}%)`);
  console.log(`   Failed: ${failCount}/${locations.length}`);
  
  // Show locations that need manual review
  const needsReview = results.filter(r => !r.spaces);
  if (needsReview.length > 0 && needsReview.length <= 20) {
    console.log('\n📋 Locations needing manual review:');
    needsReview.forEach(r => console.log(`   - ${r.name}`));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

