#!/usr/bin/env tsx
/**
 * ⚓ ANCHOR TENANTS ENHANCED
 * Enhanced extraction from tenant data and website scraping
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

function extractAnchorTenantsFromWebsite(html: string, locationName: string): number | null {
  const $ = cheerio.load(html);
  $('script, style').remove();
  const text = $('body').text().toLowerCase();
  
  // Enhanced anchor tenant patterns
  const anchorPatterns = [
    /(\d+)\s+anchor\s+tenants?/gi,
    /anchor\s+tenants?[:\s]+(\d+)/gi,
    /(\d+)\s+major\s+stores?/gi,
    /major\s+stores?[:\s]+(\d+)/gi,
    /(\d+)\s+key\s+retailers?/gi,
    /key\s+retailers?[:\s]+(\d+)/gi,
  ];
  
  for (const pattern of anchorPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      const num = parseInt(matches[0][1], 10);
      if (num > 0 && num <= 20) {
        return num;
      }
    }
  }
  
  // Look for anchor tenant sections
  $('h1, h2, h3, h4').each((_, elem) => {
    const heading = $(elem).text().toLowerCase();
    if (heading.includes('anchor') || heading.includes('major stores') || heading.includes('key retailers')) {
      const nextText = $(elem).next().text();
      const match = nextText.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > 0 && num <= 20) {
          return num;
        }
      }
    }
  });
  
  return null;
}

async function getAnchorTenantsFromDatabase(locationId: string): Promise<number | null> {
  const anchorCount = await prisma.tenant.count({
    where: {
      locationId,
      isAnchorTenant: true
    }
  });
  
  return anchorCount > 0 ? anchorCount : null;
}

async function searchForAnchorTenants(website: string, locationName: string, locationId: string): Promise<number | null> {
  // Strategy 1: Count from database tenant data
  const dbCount = await getAnchorTenantsFromDatabase(locationId);
  if (dbCount && dbCount > 0) {
    return dbCount;
  }
  
  // Strategy 2: Try website scraping
  const html = await fetchHTML(website);
  if (html) {
    const websiteCount = extractAnchorTenantsFromWebsite(html, locationName);
    if (websiteCount) {
      return websiteCount;
    }
  }
  
  // Strategy 3: Try store directory page
  const storeDirUrls = [
    '/stores', '/store-directory', '/shops', '/retailers', '/directory'
  ];
  
  for (const path of storeDirUrls) {
    try {
      const testUrl = new URL(path, website).href;
      const pageHTML = await fetchHTML(testUrl);
      if (pageHTML) {
        const count = extractAnchorTenantsFromWebsite(pageHTML, locationName);
        if (count) return count;
      }
    } catch {
      continue;
    }
  }
  
  return null;
}

async function main() {
  console.log('⚓ ANCHOR TENANTS ENHANCED\n');
  console.log('Enhanced extraction from tenant data and website scraping...\n');
  
  const locations = await prisma.location.findMany({
    where: {
      website: { not: null },
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      anchorTenants: null
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
  let dbCount = 0;
  let websiteCount = 0;
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name} (${loc.city})`);
    
    const anchorCount = await searchForAnchorTenants(loc.website!, loc.name, loc.id);
    
    if (anchorCount) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { anchorTenants: anchorCount }
      });
      
      console.log(`   ✅ Found: ${anchorCount} anchor tenants`);
      successCount++;
      
      // Track source
      const dbCheck = await getAnchorTenantsFromDatabase(loc.id);
      if (dbCheck && dbCheck === anchorCount) {
        dbCount++;
      } else {
        websiteCount++;
      }
    } else {
      console.log(`   ❌ No anchor tenant data found`);
      failCount++;
    }
    
    // Rate limiting
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // Progress update every 25
    if ((i + 1) % 25 === 0) {
      console.log(`\n📈 Progress: ${successCount} found, ${failCount} not found\n`);
    }
  }
  
  console.log('\n✅ Anchor tenants enhanced enrichment complete!');
  console.log(`   Found: ${successCount}/${locations.length} (${(successCount/locations.length*100).toFixed(1)}%)`);
  console.log(`   Not found: ${failCount}/${locations.length}`);
  
  console.log(`\n📝 Sources:`);
  console.log(`   From database tenant data: ${dbCount}`);
  console.log(`   From website scraping: ${websiteCount}`);
  
  const totalWithAnchor = await prisma.location.count({
    where: { anchorTenants: { not: null } }
  });
  const totalLocations = await prisma.location.count({
    where: { type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] } }
  });
  
  console.log(`\n📊 Overall Coverage: ${totalWithAnchor}/${totalLocations} (${(totalWithAnchor/totalLocations*100).toFixed(1)}%)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

