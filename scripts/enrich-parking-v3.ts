// V3: Parking scraper with sitemap.xml support and enhanced URL patterns
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface ParkingResult {
  spaces?: number;
  confidence: 'high' | 'medium' | 'low';
  snippet?: string;
  source?: string;
}

async function fetchHTML(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

async function fetchSitemap(baseUrl: string): Promise<string[]> {
  try {
    const sitemapUrl = new URL('/sitemap.xml', baseUrl).href;
    const html = await fetchHTML(sitemapUrl);
    if (!html) return [];
    
    const $ = cheerio.load(html, { xmlMode: true });
    const urls: string[] = [];
    
    // Parse sitemap XML
    $('url > loc').each((_, elem) => {
      const url = $(elem).text();
      if (url) urls.push(url);
    });
    
    // Also check for sitemap index
    $('sitemap > loc').each((_, elem) => {
      const url = $(elem).text();
      if (url) urls.push(url);
    });
    
    return urls;
  } catch {
    return [];
  }
}

function filterParkingUrls(urls: string[]): string[] {
  const parkingKeywords = [
    'parking', 'car-park', 'car park',
    'getting-here', 'getting here', 'get-here',
    'visit', 'plan-my-visit', 'plan-your-visit',
    'directions', 'travel', 'getting-there'
  ];
  
  return urls.filter(url => {
    const urlLower = url.toLowerCase();
    return parkingKeywords.some(kw => urlLower.includes(kw));
  }).slice(0, 5); // Top 5 most relevant
}

function findParkingLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const parkingLinks: string[] = [];
  
  try {
    const base = new URL(baseUrl);
    
    const parkingKeywords = [
      'parking', 'car-park', 'car park',
      'getting-here', 'getting here', 'get-here',
      'visit', 'plan-my-visit', 'plan-your-visit', 'visitor',
      'directions', 'travel', 'directions-and-parking',
      'how-to-find', 'find-us'
    ];
    
    $('a').each((_, elem) => {
      const href = $(elem).attr('href');
      const text = $(elem).text().toLowerCase();
      
      if (!href) return;
      
      const hasKeyword = parkingKeywords.some(kw => 
        href.toLowerCase().includes(kw) || text.includes(kw)
      );
      
      if (hasKeyword) {
        try {
          let fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
          
          // Handle hash anchors (#parking)
          if (fullUrl.includes('#')) {
            fullUrl = fullUrl; // Keep the hash
          }
          
          const linkUrl = new URL(fullUrl);
          if (linkUrl.hostname === base.hostname && !parkingLinks.includes(fullUrl)) {
            parkingLinks.push(fullUrl);
          }
        } catch {}
      }
    });
  } catch {}
  
  // Score and sort by relevance
  const scored = parkingLinks.map(url => {
    let score = 0;
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('parking')) score += 10;
    if (urlLower.includes('car-park')) score += 10;
    if (urlLower.includes('getting-here')) score += 5;
    if (urlLower.includes('visit') && urlLower.includes('parking')) score += 8;
    if (urlLower.includes('#parking')) score += 7;
    
    return { url, score };
  });
  
  return scored
    .sort((a, b) => b.score - a.score)
    .map(s => s.url)
    .slice(0, 4);
}

function extractParkingFromHTML(html: string): ParkingResult {
  const $ = cheerio.load(html);
  
  $('script, style, noscript').remove();
  const text = $('body').text();
  
  const patterns = [
    /(\d{1,3}(?:,\d{3})+|\d{2,5})\s*(?:free\s+)?(?:car\s+)?parking\s+spaces?/gi,
    /parking[:\s]+(\d{1,3}(?:,\d{3})+|\d{2,5})\s+spaces?/gi,
    /car\s+park\s+(?:features|with|has|offers?)\s+(\d{1,3}(?:,\d{3})+|\d{2,5})\s+spaces?/gi,
    /(\d{1,3}(?:,\d{3})+|\d{2,5})-space\s+(?:car\s+)?park/gi,
    /(?:over|approximately|around|more\s+than)\s+(\d{1,3}(?:,\d{3})+|\d{2,5})\s+(?:car\s+)?parking\s+spaces?/gi,
    /parking\s+for\s+(\d{1,3}(?:,\d{3})+|\d{2,5})\s*(?:cars|vehicles)?/gi,
    /total\s+(?:parking\s+)?spaces?[:\s]+(\d{1,3}(?:,\d{3})+|\d{2,5})/gi,
    /car\s+park\s+capacity[:\s]+(\d{1,3}(?:,\d{3})+|\d{2,5})/gi,
  ];
  
  let bestMatch: ParkingResult | null = null;
  
  for (const pattern of patterns) {
    const matches = Array.from(text.matchAll(pattern));
    
    for (const match of matches) {
      const numStr = match[1].replace(/,/g, '');
      const spaces = parseInt(numStr, 10);
      
      if (spaces < 20 || spaces > 50000) continue;
      
      const contextStart = Math.max(0, match.index! - 100);
      const contextEnd = Math.min(text.length, match.index! + 100);
      const context = text.substring(contextStart, contextEnd);
      
      // Filter phone numbers
      if (/\b0\d{4}/.test(numStr) || 
          /(?:phone|tel|call|contact)[:\s]+/i.test(context.substring(0, 50))) {
        continue;
      }
      
      let confidence: 'high' | 'medium' | 'low' = 'medium';
      
      if (/total|capacity|features|offers/i.test(context)) {
        confidence = 'high';
      } else if (/approximately|around|over/i.test(context)) {
        confidence = 'medium';
      }
      
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
  
  return { confidence: 'low' };
}

async function searchForParking(baseUrl: string): Promise<ParkingResult> {
  console.log(`      🔍 Step 1: Checking sitemap.xml...`);
  
  // STEP 1: Try sitemap.xml first (fast!)
  const sitemapUrls = await fetchSitemap(baseUrl);
  if (sitemapUrls.length > 0) {
    console.log(`      📄 Found ${sitemapUrls.length} URLs in sitemap`);
    const parkingUrls = filterParkingUrls(sitemapUrls);
    
    if (parkingUrls.length > 0) {
      console.log(`      🅿️  Found ${parkingUrls.length} parking-related URL(s) in sitemap`);
      
      for (const url of parkingUrls) {
        const path = url.replace(baseUrl, '');
        console.log(`      → Checking ${path || '/'}`);
        
        const pageHTML = await fetchHTML(url);
        if (!pageHTML) continue;
        
        const result = extractParkingFromHTML(pageHTML);
        if (result.spaces) {
          result.source = url;
          return result;
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  
  // STEP 2: Fallback to homepage + link crawling
  console.log(`      🏠 Step 2: Checking homepage...`);
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
  
  // STEP 3: Follow parking links
  console.log(`      🔗 Step 3: Following parking links...`);
  const parkingLinks = findParkingLinks(homepageHTML, baseUrl);
  
  if (parkingLinks.length === 0) {
    console.log(`      ℹ️  No parking links found`);
    return { confidence: 'low' };
  }
  
  console.log(`      📄 Found ${parkingLinks.length} parking-related link(s)`);
  
  for (const link of parkingLinks) {
    const linkPath = link.replace(baseUrl, '') || '/';
    console.log(`      → Checking ${linkPath}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
  console.log('🅿️  V3: Enhanced parking enrichment with sitemap.xml support\n');

  const locations = await prisma.location.findMany({
    where: {
      website: { not: null },
      parkingSpaces: null,
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] }
    },
    select: { id: true, name: true, city: true, website: true },
    orderBy: { name: 'asc' }
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

    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if ((i + 1) % 5 === 0) {
      console.log(`\n📈 Progress: ${successCount} found, ${failCount} not found\n`);
    }
  }

  console.log('\n✅ Parking enrichment complete!');
  console.log(`   Success: ${successCount}/${locations.length} (${(successCount/locations.length*100).toFixed(1)}%)`);
  console.log(`   Failed: ${failCount}/${locations.length}`);
  
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

