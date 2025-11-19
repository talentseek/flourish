#!/usr/bin/env tsx
/**
 * 👥 FOOTFALL SCRAPER
 * Extracts annual footfall numbers from websites, press releases, and news articles
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

function findNewsPages(urls: string[]): string[] {
  const newsKeywords = [
    'news', 'press', 'media', 'announcement', 'update',
    'report', 'annual', 'results', 'visitor', 'footfall'
  ];
  
  return urls.filter(url => {
    const urlLower = url.toLowerCase();
    return newsKeywords.some(kw => urlLower.includes(kw));
  }).slice(0, 10);
}

function extractFootfallFromHTML(html: string): number | null {
  const $ = cheerio.load(html);
  $('script, style').remove();
  const text = $('body').text();
  const textLower = text.toLowerCase();
  
  // Footfall patterns (annual visitors)
  const footfallPatterns = [
    // "X million visitors annually"
    /(\d+(?:\.\d+)?)\s*million\s+visitors?\s+(?:annually|per\s+year|each\s+year|a\s+year)/gi,
    // "welcomes X million visitors"
    /welcomes?\s+(\d+(?:\.\d+)?)\s*million\s+visitors?/gi,
    // "footfall of X million"
    /footfall\s+of\s+(\d+(?:\.\d+)?)\s*million/gi,
    // "X million annual footfall"
    /(\d+(?:\.\d+)?)\s*million\s+annual\s+footfall/gi,
    // "X million people visit"
    /(\d+(?:\.\d+)?)\s*million\s+people\s+visit/gi,
    // "over X million visitors"
    /(?:over|more\s+than|in\s+excess\s+of)\s+(\d+(?:\.\d+)?)\s*million\s+visitors?/gi,
    // "X million shoppers"
    /(\d+(?:\.\d+)?)\s*million\s+shoppers?/gi,
    // "annual footfall X million"
    /annual\s+footfall[:\s]+(\d+(?:\.\d+)?)\s*million/gi,
    // "X million customers"
    /(\d+(?:\.\d+)?)\s*million\s+customers?\s+(?:annually|per\s+year|each\s+year)/gi,
  ];
  
  // Also check for numbers in thousands (convert to millions)
  const footfallPatternsThousands = [
    /(\d{1,3}(?:,\d{3})+|\d{4,})\s*(?:thousand|k)\s+visitors?\s+(?:annually|per\s+year|each\s+year|a\s+year)/gi,
    /welcomes?\s+(\d{1,3}(?:,\d{3})+|\d{4,})\s*(?:thousand|k)\s+visitors?/gi,
    /footfall\s+of\s+(\d{1,3}(?:,\d{3})+|\d{4,})\s*(?:thousand|k)/gi,
  ];
  
  // Try million patterns first
  for (const pattern of footfallPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      const numStr = match[1];
      const num = parseFloat(numStr);
      
      // Validate reasonable range (0.5M to 100M for UK shopping centers)
      if (num >= 0.5 && num <= 100) {
        // Convert to actual number (millions)
        const footfall = Math.round(num * 1000000);
        return footfall;
      }
    }
  }
  
  // Try thousand patterns (convert to actual number)
  for (const pattern of footfallPatternsThousands) {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      
      // Validate reasonable range (500k to 50M)
      if (num >= 500 && num <= 50000) {
        return Math.round(num * 1000);
      }
    }
  }
  
  // Check for explicit "footfall" mentions with numbers nearby
  const footfallIndex = textLower.indexOf('footfall');
  if (footfallIndex !== -1) {
    const context = text.substring(Math.max(0, footfallIndex - 100), Math.min(text.length, footfallIndex + 200));
    
    // Look for numbers in context
    const numberPatterns = [
      /(\d+(?:\.\d+)?)\s*million/gi,
      /(\d{1,3}(?:,\d{3})+|\d{4,})\s*(?:thousand|k)/gi
    ];
    
    for (const pattern of numberPatterns) {
      const matches = Array.from(context.matchAll(pattern));
      for (const match of matches) {
        let numStr = match[1].replace(/,/g, '');
        let num = parseFloat(numStr);
        
        // Check if it's in millions or thousands
        if (match[0].toLowerCase().includes('million')) {
          if (num >= 0.5 && num <= 100) {
            return Math.round(num * 1000000);
          }
        } else {
          // Assume thousands
          if (num >= 500 && num <= 50000) {
            return Math.round(num * 1000);
          }
        }
      }
    }
  }
  
  return null;
}

async function scrapeFootfallFromWebsite(website: string): Promise<number | null> {
  // Step 1: Try homepage
  const homepageHTML = await fetchHTML(website);
  if (homepageHTML) {
    const footfall = extractFootfallFromHTML(homepageHTML);
    if (footfall) return footfall;
  }
  
  // Step 2: Try sitemap for news/press pages
  const sitemapUrls = await fetchSitemap(website);
  if (sitemapUrls.length > 0) {
    const newsPages = findNewsPages(sitemapUrls);
    for (const pageUrl of newsPages) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const pageHTML = await fetchHTML(pageUrl);
      if (pageHTML) {
        const footfall = extractFootfallFromHTML(pageHTML);
        if (footfall) return footfall;
      }
    }
  }
  
  // Step 3: Try common news/press URLs
  const commonPaths = [
    '/news', '/press', '/media', '/news-and-media',
    '/about', '/about-us', '/visitor-information', '/facts'
  ];
  
  for (const path of commonPaths) {
    try {
      const testUrl = new URL(path, website).href;
      await new Promise(resolve => setTimeout(resolve, 500));
      const pageHTML = await fetchHTML(testUrl);
      if (pageHTML) {
        const footfall = extractFootfallFromHTML(pageHTML);
        if (footfall) return footfall;
      }
    } catch {
      continue;
    }
  }
  
  return null;
}

async function main() {
  console.log('👥 FOOTFALL SCRAPER\n');
  console.log('Extracting annual footfall numbers from websites and press releases...\n');
  
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
      footfall: true,
      numberOfStores: true
    },
    orderBy: { numberOfStores: 'desc' }
  });
  
  console.log(`📊 Found ${locations.length} locations to process\n`);
  
  let successCount = 0;
  let failCount = 0;
  const footfallRanges: Record<string, number> = {
    '0-5M': 0,
    '5-10M': 0,
    '10-20M': 0,
    '20M+': 0
  };
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name} (${loc.city})`);
    
    const footfall = await scrapeFootfallFromWebsite(loc.website!);
    
    if (footfall && footfall > 0) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { footfall }
      });
      
      const millions = footfall / 1000000;
      console.log(`   ✅ Found: ${millions.toFixed(1)}M annual visitors`);
      
      // Categorize
      if (millions < 5) footfallRanges['0-5M']++;
      else if (millions < 10) footfallRanges['5-10M']++;
      else if (millions < 20) footfallRanges['10-20M']++;
      else footfallRanges['20M+']++;
      
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
  
  console.log('\n✅ Footfall enrichment complete!');
  console.log(`\n📊 Results:`);
  console.log(`   Success: ${successCount}/${locations.length} (${(successCount/locations.length*100).toFixed(1)}%)`);
  console.log(`   Failed: ${failCount}/${locations.length}`);
  
  console.log(`\n📈 Footfall Distribution:`);
  Object.entries(footfallRanges).forEach(([range, count]) => {
    if (count > 0) {
      console.log(`   ${range}: ${count} locations`);
    }
  });
  
  // Show overall coverage
  const totalWithFootfall = await prisma.location.count({
    where: { footfall: { not: null } }
  });
  const totalLocations = await prisma.location.count({
    where: { type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] } }
  });
  
  console.log(`\n📊 Overall Footfall Coverage: ${totalWithFootfall}/${totalLocations} (${(totalWithFootfall/totalLocations*100).toFixed(1)}%)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

