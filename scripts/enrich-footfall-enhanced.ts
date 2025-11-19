#!/usr/bin/env tsx
/**
 * 👥 FOOTFALL ENHANCED
 * Enhanced press release and news scraping for annual footfall numbers
 */

import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

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
    
    $('url > loc').each((_, elem) => {
      const url = $(elem).text();
      if (url) urls.push(url);
    });
    
    return urls;
  } catch {
    return [];
  }
}

function findRelevantPages(urls: string[]): string[] {
  const keywords = [
    'footfall', 'visitor', 'visitors', 'annual', 'report', 'news',
    'press', 'release', 'statistics', 'facts', 'about', 'performance'
  ];
  
  return urls.filter(url => {
    const urlLower = url.toLowerCase();
    return keywords.some(kw => urlLower.includes(kw));
  }).slice(0, 10);
}

function extractFootfall(html: string, locationName: string): number | null {
  const $ = cheerio.load(html);
  $('script, style').remove();
  const text = $('body').text();
  const textLower = text.toLowerCase();
  
  // Enhanced footfall patterns
  const footfallPatterns = [
    // Annual footfall patterns
    /(?:annual|yearly|per\s+year)\s+footfall[:\s]+(?:over\s+)?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:million|m|visitors?)?/gi,
    /footfall[:\s]+(?:of\s+)?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:million|m|visitors?)?\s*(?:per\s+year|annually|each\s+year)/gi,
    /(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:million|m)\s+(?:visitors?|footfall)\s+(?:per\s+year|annually|each\s+year)/gi,
    /welcomes?\s+(?:over\s+)?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:million|m)\s+visitors?\s+(?:per\s+year|annually|each\s+year)/gi,
    
    // Visitor patterns
    /(?:over\s+)?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:million|m)\s+visitors?\s+(?:per\s+year|annually|each\s+year)/gi,
    /(?:annual|yearly)\s+visitor\s+(?:numbers?|count|figure)[:\s]+(?:over\s+)?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:million|m)?/gi,
    
    // Thousands patterns (convert to millions)
    /(?:over\s+)?(\d{1,3}(?:,\d{3})*)\s*(?:thousand|k)\s+visitors?\s+(?:per\s+year|annually)/gi,
    
    // Direct number patterns with context
    /footfall\s+(?:figures?|numbers?|statistics?)[:\s]+(?:over\s+)?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:million|m)?/gi,
  ];
  
  for (const pattern of footfallPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      let numStr = match[1].replace(/,/g, '');
      let num = parseFloat(numStr);
      
      // Check if it's in thousands (k) and convert to millions
      const context = match[0].toLowerCase();
      if (context.includes('thousand') || context.includes(' k')) {
        num = num / 1000;
      }
      
      // Validate reasonable footfall numbers (0.1M to 50M per year)
      if (num >= 0.1 && num <= 50) {
        // Check context to ensure it's about footfall/visitors
        const matchIndex = match.index || 0;
        const contextStart = Math.max(0, matchIndex - 100);
        const contextEnd = Math.min(text.length, matchIndex + 100);
        const contextText = text.substring(contextStart, contextEnd).toLowerCase();
        
        const validContext = [
          'footfall', 'visitor', 'shoppers', 'customers', 'people',
          'annual', 'yearly', 'per year', 'each year'
        ];
        
        if (validContext.some(ctx => contextText.includes(ctx))) {
          return Math.round(num * 1000000); // Convert to actual number
        }
      }
    }
  }
  
  return null;
}

async function searchForFootfall(website: string, locationName: string): Promise<number | null> {
  // Step 1: Try homepage
  const homepageHTML = await fetchHTML(website);
  if (homepageHTML) {
    const footfall = extractFootfall(homepageHTML, locationName);
    if (footfall) return footfall;
  }
  
  // Step 2: Try sitemap for relevant pages
  const sitemapUrls = await fetchSitemap(website);
  if (sitemapUrls.length > 0) {
    const relevantPages = findRelevantPages(sitemapUrls);
    for (const pageUrl of relevantPages) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const pageHTML = await fetchHTML(pageUrl);
      if (pageHTML) {
        const footfall = extractFootfall(pageHTML, locationName);
        if (footfall) return footfall;
      }
    }
  }
  
  // Step 3: Try common URLs
  const commonPaths = [
    '/about', '/about-us', '/facts', '/statistics', '/news',
    '/press', '/press-releases', '/annual-report', '/performance'
  ];
  
  for (const path of commonPaths) {
    try {
      const testUrl = new URL(path, website).href;
      await new Promise(resolve => setTimeout(resolve, 500));
      const pageHTML = await fetchHTML(testUrl);
      if (pageHTML) {
        const footfall = extractFootfall(pageHTML, locationName);
        if (footfall) return footfall;
      }
    } catch {
      continue;
    }
  }
  
  return null;
}

async function main() {
  console.log('👥 FOOTFALL ENHANCED\n');
  console.log('Enhanced press release and news scraping for annual footfall...\n');
  
  const locations = await prisma.location.findMany({
    where: {
      website: { not: null },
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      footfall: null
    },
    select: {
      id: true,
      name: true,
      city: true,
      website: true,
      numberOfStores: true
    },
    orderBy: { numberOfStores: 'desc' }
  });
  
  console.log(`📊 Found ${locations.length} locations to process\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name} (${loc.city})`);
    
    const footfall = await searchForFootfall(loc.website!, loc.name);
    
    if (footfall) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { footfall }
      });
      
      const footfallM = (footfall / 1000000).toFixed(1);
      console.log(`   ✅ Found: ${footfallM}M annual visitors`);
      successCount++;
    } else {
      console.log(`   ❌ No footfall data found`);
      failCount++;
    }
    
    // Rate limiting
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Progress update every 25
    if ((i + 1) % 25 === 0) {
      console.log(`\n📈 Progress: ${successCount} found, ${failCount} not found\n`);
    }
  }
  
  console.log('\n✅ Footfall enhanced enrichment complete!');
  console.log(`   Found: ${successCount}/${locations.length} (${(successCount/locations.length*100).toFixed(1)}%)`);
  console.log(`   Not found: ${failCount}/${locations.length}`);
  
  const totalWithFootfall = await prisma.location.count({
    where: { footfall: { not: null } }
  });
  const totalLocations = await prisma.location.count({
    where: { type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] } }
  });
  
  console.log(`\n📊 Overall Coverage: ${totalWithFootfall}/${totalLocations} (${(totalWithFootfall/totalLocations*100).toFixed(1)}%)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

