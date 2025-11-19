// Enhanced parking scraper with multi-page search
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface ParkingResult {
  spaces?: number;
  confidence: 'high' | 'medium' | 'low';
  snippet?: string;
  source?: string; // Which URL it was found on
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

function findParkingLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const parkingLinks: string[] = [];
  
  try {
    const base = new URL(baseUrl);
    
    // Look for links with parking-related keywords
    $('a').each((_, elem) => {
      const href = $(elem).attr('href');
      const text = $(elem).text().toLowerCase();
      
      if (!href) return;
      
      // Check if link text or href contains parking keywords
      const keywords = [
        'parking', 'car-park', 'car park', 
        'getting-here', 'getting here', 'get here',
        'visit', 'plan-your-visit', 'plan your visit',
        'travel', 'directions', 'how-to-find-us',
        'visitor-info', 'visitor info'
      ];
      
      const hasKeyword = keywords.some(kw => 
        href.toLowerCase().includes(kw) || text.includes(kw)
      );
      
      if (hasKeyword) {
        try {
          let fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
          
          // Only include links from same domain
          const linkUrl = new URL(fullUrl);
          if (linkUrl.hostname === base.hostname && !parkingLinks.includes(fullUrl)) {
            parkingLinks.push(fullUrl);
          }
        } catch {}
      }
    });
  } catch {}
  
  return parkingLinks.slice(0, 3); // Limit to 3 most relevant links
}

function extractParkingFromHTML(html: string): ParkingResult {
  const $ = cheerio.load(html);
  
  // Remove script and style tags
  $('script, style, noscript').remove();
  
  // Get text content
  const text = $('body').text();
  
  // Enhanced patterns with better validation
  const patterns = [
    // "730 parking spaces" or "730 car parking spaces"
    /(\d{1,3}(?:,\d{3})+|\d{2,5})\s*(?:free\s+)?(?:car\s+)?parking\s+spaces?/gi,
    // "parking: 730 spaces"
    /parking[:\s]+(\d{1,3}(?:,\d{3})+|\d{2,5})\s+spaces?/gi,
    // "car park features 730 spaces"
    /car\s+park\s+(?:features|with|has|offers?)\s+(\d{1,3}(?:,\d{3})+|\d{2,5})\s+spaces?/gi,
    // "730-space car park"
    /(\d{1,3}(?:,\d{3})+|\d{2,5})-space\s+(?:car\s+)?park/gi,
    // "over 730 parking spaces"
    /(?:over|approximately|around|more\s+than)\s+(\d{1,3}(?:,\d{3})+|\d{2,5})\s+(?:car\s+)?parking\s+spaces?/gi,
    // "parking for 730 vehicles"
    /parking\s+for\s+(\d{1,3}(?:,\d{3})+|\d{2,5})\s*(?:cars|vehicles)?/gi,
    // "total spaces: 730"
    /total\s+(?:parking\s+)?spaces?[:\s]+(\d{1,3}(?:,\d{3})+|\d{2,5})/gi,
    // "car park capacity: 730"
    /car\s+park\s+capacity[:\s]+(\d{1,3}(?:,\d{3})+|\d{2,5})/gi,
  ];
  
  let bestMatch: ParkingResult | null = null;
  
  for (const pattern of patterns) {
    const matches = Array.from(text.matchAll(pattern));
    
    for (const match of matches) {
      const numStr = match[1].replace(/,/g, '');
      const spaces = parseInt(numStr, 10);
      
      // Sanity check: parking should be between 20 and 50,000
      if (spaces < 20 || spaces > 50000) continue;
      
      // Get context around the match
      const contextStart = Math.max(0, match.index! - 100);
      const contextEnd = Math.min(text.length, match.index! + 100);
      const context = text.substring(contextStart, contextEnd);
      
      // Filter out phone numbers - check if number looks like UK phone
      if (/\b0\d{4}/.test(numStr) || // Starts with 0xxxx
          /(?:phone|tel|call|contact)[:\s]+/i.test(context.substring(0, 50))) {
        continue;
      }
      
      // Confidence scoring
      let confidence: 'high' | 'medium' | 'low' = 'medium';
      
      if (/total|capacity|features|offers/i.test(context)) {
        confidence = 'high';
      } else if (/approximately|around|over/i.test(context)) {
        confidence = 'medium';
      }
      
      // Keep best match (prefer high confidence, then larger numbers)
      if (!bestMatch ||
          confidence > bestMatch.confidence ||
          (confidence === bestMatch.confidence && spaces > bestMatch.spaces!)) {
        bestMatch = {
          spaces,
          confidence,
          snippet: match[0].trim()
        };
      }
    }
  }
  
  if (bestMatch) {
    return bestMatch;
  }
  
  return {
    confidence: 'low'
  };
}

async function searchForParking(baseUrl: string): Promise<ParkingResult> {
  console.log(`      🔍 Fetching homepage...`);
  
  // Try homepage first
  const homepageHTML = await fetchHTML(baseUrl);
  if (!homepageHTML) {
    return { confidence: 'low' };
  }
  
  let homepageResult = extractParkingFromHTML(homepageHTML);
  if (homepageResult.spaces) {
    homepageResult.source = baseUrl;
    console.log(`      ✨ Found on homepage!`);
    return homepageResult;
  }
  
  // Look for parking-related links
  console.log(`      🔗 Searching for parking pages...`);
  const parkingLinks = findParkingLinks(homepageHTML, baseUrl);
  
  if (parkingLinks.length === 0) {
    console.log(`      ℹ️  No parking links found`);
    return { confidence: 'low' };
  }
  
  console.log(`      📄 Found ${parkingLinks.length} parking-related page(s)`);
  
  // Search each parking page
  for (const link of parkingLinks) {
    const linkPath = link.replace(baseUrl, '') || '/parking';
    console.log(`      → Checking ${linkPath}`);
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between pages
    
    const pageHTML = await fetchHTML(link);
    if (!pageHTML) continue;
    
    const pageResult = extractParkingFromHTML(pageHTML);
    if (pageResult.spaces) {
      pageResult.source = link;
      return pageResult;
    }
  }
  
  return { confidence: 'low' };
}

async function main() {
  console.log('🅿️  Enhanced parking enrichment with multi-page search\n');

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
  const results: Array<{ name: string; spaces?: number; confidence?: string; source?: string }> = [];

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name} (${loc.city})`);

    const result = await searchForParking(loc.website!);

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
      results.push({ 
        name: loc.name, 
        spaces: result.spaces, 
        confidence: result.confidence,
        source: result.source
      });
    } else {
      console.log(`      ❌ No parking data found`);
      failCount++;
      results.push({ name: loc.name });
    }

    // Rate limiting between locations
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Progress update every 5 locations
    if ((i + 1) % 5 === 0) {
      console.log(`\n📈 Progress: ${successCount} found, ${failCount} not found\n`);
    }
  }

  console.log('\n✅ Parking enrichment complete!');
  console.log(`   Success: ${successCount}/${locations.length} (${(successCount/locations.length*100).toFixed(1)}%)`);
  console.log(`   Failed: ${failCount}/${locations.length}`);
  
  // Summary
  if (successCount > 0) {
    console.log('\n✨ Successfully enriched:');
    results.filter(r => r.spaces).forEach(r => {
      const sourcePath = r.source ? new URL(r.source).pathname : 'homepage';
      console.log(`   - ${r.name}: ${r.spaces} spaces (${r.confidence}) [${sourcePath}]`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

