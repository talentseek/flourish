#!/usr/bin/env tsx
/**
 * ⭐ ANCHOR TENANT EXTRACTOR
 * Extracts anchor tenant count from existing tenant data and enhances with website scraping
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

function findAboutPages(urls: string[]): string[] {
  const aboutKeywords = [
    'about', 'stores', 'shops', 'retailers', 'tenants',
    'directory', 'whats-here', 'our-stores', 'shop-directory'
  ];
  
  return urls.filter(url => {
    const urlLower = url.toLowerCase();
    return aboutKeywords.some(kw => urlLower.includes(kw));
  }).slice(0, 3);
}

function extractAnchorTenantsFromHTML(html: string): number | null {
  const $ = cheerio.load(html);
  $('script, style').remove();
  const text = $('body').text().toLowerCase();
  
  // Common anchor tenant brand names (UK shopping centers)
  const anchorBrands = [
    'john lewis', 'marks & spencer', 'm&s', 'debenhams', 'house of fraser',
    'primark', 'next', 'h&m', 'zara', 'topshop', 'topman', 'boots',
    'waitrose', 'sainsbury', 'tesco', 'asda', 'morrisons', 'm&s food',
    'selfridges', 'harrods', 'debenhams', 'fenwick', 'bhs', 'bhs home',
    'argos', 'currys', 'pc world', 'john lewis & partners', 'm&s foodhall'
  ];
  
  // Strategy 1: Look for explicit anchor tenant mentions
  const anchorPatterns = [
    /(\d+)\s*anchor\s*(?:tenant|store)/gi,
    /anchor\s*(?:tenant|store)s?.*?(\d+)/gi,
    /(\d+)\s*(?:major|key|flagship)\s*(?:retailer|store|tenant)/gi
  ];
  
  for (const pattern of anchorPatterns) {
    const match = text.match(pattern);
    if (match) {
      const numMatch = match[0].match(/\d+/);
      if (numMatch) {
        const num = parseInt(numMatch[0], 10);
        if (num > 0 && num < 50) {
          return num;
        }
      }
    }
  }
  
  // Strategy 2: Look for anchor tenant sections and count brand mentions
  const anchorSections = [
    'anchor tenants', 'anchor stores', 'key retailers',
    'major stores', 'flagship stores', 'main retailers'
  ];
  
  for (const section of anchorSections) {
    const sectionIndex = text.indexOf(section);
    if (sectionIndex !== -1) {
      // Look in a window around the section
      const start = Math.max(0, sectionIndex - 200);
      const end = Math.min(text.length, sectionIndex + 1000);
      const sectionText = text.substring(start, end);
      
      // Count unique anchor brand mentions
      const foundBrands = new Set<string>();
      for (const brand of anchorBrands) {
        if (sectionText.includes(brand)) {
          foundBrands.add(brand);
        }
      }
      
      if (foundBrands.size > 0) {
        return foundBrands.size;
      }
    }
  }
  
  // Strategy 3: Look for structured lists of major retailers
  const listPatterns = [
    /(?:anchor|major|key|flagship).*?retailers?.*?[:;]\s*([^.]{50,500})/gi,
    /our\s+(?:anchor|major|key)\s+retailers?.*?[:;]\s*([^.]{50,500})/gi
  ];
  
  for (const pattern of listPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      const listText = match[1].toLowerCase();
      const foundBrands = new Set<string>();
      for (const brand of anchorBrands) {
        if (listText.includes(brand)) {
          foundBrands.add(brand);
        }
      }
      if (foundBrands.size > 0) {
        return foundBrands.size;
      }
    }
  }
  
  return null;
}

async function scrapeAnchorTenantsFromWebsite(website: string): Promise<number | null> {
  // Step 1: Try homepage
  const homepageHTML = await fetchHTML(website);
  if (homepageHTML) {
    const count = extractAnchorTenantsFromHTML(homepageHTML);
    if (count) return count;
  }
  
  // Step 2: Try sitemap for relevant pages
  const sitemapUrls = await fetchSitemap(website);
  if (sitemapUrls.length > 0) {
    const aboutPages = findAboutPages(sitemapUrls);
    for (const pageUrl of aboutPages) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const pageHTML = await fetchHTML(pageUrl);
      if (pageHTML) {
        const count = extractAnchorTenantsFromHTML(pageHTML);
        if (count) return count;
      }
    }
  }
  
  // Step 3: Try common about/store directory URLs
  const commonPaths = [
    '/about', '/stores', '/shops', '/retailers', '/tenants',
    '/directory', '/whats-here', '/our-stores', '/shop-directory'
  ];
  
  for (const path of commonPaths) {
    try {
      const testUrl = new URL(path, website).href;
      await new Promise(resolve => setTimeout(resolve, 500));
      const pageHTML = await fetchHTML(testUrl);
      if (pageHTML) {
        const count = extractAnchorTenantsFromHTML(pageHTML);
        if (count) return count;
      }
    } catch {
      continue;
    }
  }
  
  return null;
}

async function main() {
  console.log('⭐ ANCHOR TENANT EXTRACTOR\n');
  console.log('Extracting anchor tenant counts from tenant data and websites...\n');
  
  // Get all locations that need anchor tenant data
  const locations = await prisma.location.findMany({
    where: {
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      anchorTenants: null
    },
    select: {
      id: true,
      name: true,
      city: true,
      website: true,
      anchorTenants: true,
      tenants: {
        where: { isAnchorTenant: true },
        select: { id: true }
      }
    },
    orderBy: { numberOfStores: 'desc' }
  });
  
  console.log(`📊 Found ${locations.length} locations needing anchor tenant data\n`);
  
  let fromTenantData = 0;
  let fromWebsite = 0;
  let failed = 0;
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name} (${loc.city})`);
    
    // Strategy 1: Count from existing tenant data
    const anchorCountFromTenants = loc.tenants.length;
    
    if (anchorCountFromTenants > 0) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { anchorTenants: anchorCountFromTenants }
      });
      
      console.log(`   ✅ Found ${anchorCountFromTenants} anchor tenants from database`);
      fromTenantData++;
      continue;
    }
    
    // Strategy 2: Scrape from website if available
    if (loc.website) {
      console.log(`   🔍 Scraping website for anchor tenants...`);
      const scrapedCount = await scrapeAnchorTenantsFromWebsite(loc.website);
      
      if (scrapedCount && scrapedCount > 0) {
        await prisma.location.update({
          where: { id: loc.id },
          data: { anchorTenants: scrapedCount }
        });
        
        console.log(`   ✅ Found ${scrapedCount} anchor tenants from website`);
        fromWebsite++;
      } else {
        console.log(`   ❌ No anchor tenant data found`);
        failed++;
      }
    } else {
      console.log(`   ⚠️  No website available`);
      failed++;
    }
    
    // Rate limiting
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // Progress update every 25
    if ((i + 1) % 25 === 0) {
      console.log(`\n📈 Progress: ${fromTenantData} from DB, ${fromWebsite} from website, ${failed} failed\n`);
    }
  }
  
  console.log('\n✅ Anchor tenant extraction complete!');
  console.log(`\n📊 Results:`);
  console.log(`   From tenant data: ${fromTenantData}/${locations.length}`);
  console.log(`   From website scraping: ${fromWebsite}/${locations.length}`);
  console.log(`   Failed: ${failed}/${locations.length}`);
  
  // Show overall coverage
  const totalWithAnchors = await prisma.location.count({
    where: { anchorTenants: { not: null } }
  });
  const totalLocations = await prisma.location.count({
    where: { type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] } }
  });
  
  console.log(`\n📊 Overall Anchor Tenant Coverage: ${totalWithAnchors}/${totalLocations} (${(totalWithAnchors/totalLocations*100).toFixed(1)}%)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

