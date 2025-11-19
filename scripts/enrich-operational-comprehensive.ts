#!/usr/bin/env tsx
/**
 * 🔧 COMPREHENSIVE OPERATIONAL SCRAPER
 * Enhanced multi-page crawling with sitemap support for all operational fields
 */

import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface OperationalData {
  evCharging?: boolean;
  evChargingSpaces?: number;
  carParkPrice?: number;
  publicTransit?: string;
  numberOfFloors?: number;
  openedYear?: number;
  parkingSpaces?: number;
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
    
    $('url > loc').each((_, elem) => {
      const url = $(elem).text();
      if (url) urls.push(url);
    });
    
    return urls;
  } catch {
    return [];
  }
}

function findOperationalPages(urls: string[]): string[] {
  const operationalKeywords = [
    'parking', 'getting-here', 'visit', 'directions', 'travel',
    'about', 'information', 'facilities', 'amenities', 'accessibility'
  ];
  
  return urls.filter(url => {
    const urlLower = url.toLowerCase();
    return operationalKeywords.some(kw => urlLower.includes(kw));
  }).slice(0, 10);
}

function extractOperationalData(html: string): OperationalData {
  const $ = cheerio.load(html);
  $('script, style').remove();
  const text = $('body').text().toLowerCase();
  
  const data: OperationalData = {};
  
  // 1. EV Charging Detection (enhanced)
  const evKeywords = [
    'ev charging', 'electric vehicle charging', 'charging points', 
    'ev charge', 'electric car charging', 'charge points',
    'tesla charging', 'ev stations', 'electric vehicle', 'ev bay'
  ];
  
  if (evKeywords.some(kw => text.includes(kw))) {
    data.evCharging = true;
    
    const evSpacesPatterns = [
      /(\d+)\s*(?:ev|electric vehicle|electric car)?\s*charg(?:ing)?\s*(?:points?|spaces?|bays?)/gi,
      /charg(?:ing)?\s*(?:points?|spaces?|bays?).*?(\d+)/gi,
      /(\d+)\s*(?:ev|electric)\s*(?:charg(?:ing)?\s*)?(?:points?|spaces?|bays?)/gi
    ];
    
    for (const pattern of evSpacesPatterns) {
      const match = text.match(pattern);
      if (match) {
        const numMatch = match[0].match(/\d+/);
        if (numMatch) {
          const num = parseInt(numMatch[0], 10);
          if (num > 0 && num < 500) {
            data.evChargingSpaces = num;
            break;
          }
        }
      }
    }
  }
  
  // 2. Car Park Pricing (enhanced)
  const pricingPatterns = [
    /£(\d+(?:\.\d{2})?)\s*(?:per|an|\/)\s*(?:hour|hr)/gi,
    /parking.*?£(\d+(?:\.\d{2})?)/gi,
    /(\d+(?:\.\d{2})?)\s*(?:pound|£).*?hour/gi,
    /parking\s+charges?[:\s]+£(\d+(?:\.\d{2})?)/gi,
    /(\d+(?:\.\d{2})?)\s*p\.?p\.?\s*h\.?/gi // p.p.h. (per person per hour)
  ];
  
  for (const pattern of pricingPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      const priceStr = matches[0][1];
      const price = parseFloat(priceStr);
      if (price > 0 && price < 20) {
        data.carParkPrice = price;
        break;
      }
    }
  }
  
  // Check for free parking
  if (!data.carParkPrice && (text.includes('free parking') || text.includes('free car park'))) {
    data.carParkPrice = 0;
  }
  
  // 3. Public Transit Information (enhanced)
  const transitKeywords = [
    { type: 'train', keywords: ['train station', 'railway station', 'rail station', 'national rail'] },
    { type: 'metro', keywords: ['metro station', 'underground station', 'tube station', 'metro'] },
    { type: 'bus', keywords: ['bus stop', 'bus station', 'bus route', 'bus service', 'bus network'] },
    { type: 'tram', keywords: ['tram stop', 'tram station', 'light rail', 'tram'] }
  ];
  
  const foundTransit: string[] = [];
  for (const { type, keywords } of transitKeywords) {
    if (keywords.some(kw => text.includes(kw))) {
      foundTransit.push(type);
    }
  }
  
  if (foundTransit.length > 0) {
    data.publicTransit = foundTransit.join(', ');
  }
  
  // 4. Number of Floors/Levels (enhanced)
  const floorPatterns = [
    /(\d+)\s*(?:floors?|levels?|storeys?)/gi,
    /(?:over|across)\s*(\d+)\s*(?:floors?|levels?)/gi,
    /(?:floors?|levels?).*?(\d+)/gi,
    /(\d+)[-–]\s*storey/gi,
    /(\d+)[-–]\s*level/gi
  ];
  
  for (const pattern of floorPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      const numMatch = matches[0][1];
      const num = parseInt(numMatch, 10);
      if (num >= 1 && num <= 10) {
        data.numberOfFloors = num;
        break;
      }
    }
  }
  
  // 5. Opened/Established Year (enhanced)
  const yearPatterns = [
    /opened?\s*(?:in)?\s*(19\d{2}|20\d{2})/gi,
    /established?\s*(?:in)?\s*(19\d{2}|20\d{2})/gi,
    /since\s*(19\d{2}|20\d{2})/gi,
    /built?\s*(?:in)?\s*(19\d{2}|20\d{2})/gi,
    /(?:first\s+)?opened?\s+(?:in\s+)?(19\d{2}|20\d{2})/gi
  ];
  
  for (const pattern of yearPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      const yearStr = matches[0][1];
      const year = parseInt(yearStr, 10);
      if (year >= 1950 && year <= new Date().getFullYear()) {
        data.openedYear = year;
        break;
      }
    }
  }
  
  // 6. Parking Spaces (if not already set)
  const parkingPatterns = [
    /(\d{1,3}(?:,\d{3})+|\d{2,5})\s*(?:free\s+)?(?:car\s+)?parking\s+spaces?/gi,
    /parking[:\s]+(\d{1,3}(?:,\d{3})+|\d{2,5})\s+spaces?/gi,
    /car\s+park\s+(?:features|with|has|offers?)\s+(\d{1,3}(?:,\d{3})+|\d{2,5})\s+spaces?/gi,
    /(\d{1,3}(?:,\d{3})+|\d{2,5})-space\s+(?:car\s+)?park/gi
  ];
  
  for (const pattern of parkingPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      const numStr = match[1].replace(/,/g, '');
      const spaces = parseInt(numStr, 10);
      if (spaces >= 20 && spaces <= 50000) {
        // Filter phone numbers
        const contextStart = Math.max(0, match.index! - 50);
        const context = text.substring(contextStart, match.index! + 50);
        if (!/\b0\d{4}/.test(numStr) && !/(?:phone|tel|call|contact)[:\s]+/i.test(context)) {
          data.parkingSpaces = spaces;
          break;
        }
      }
    }
    if (data.parkingSpaces) break;
  }
  
  return data;
}

async function scrapeOperationalFromWebsite(website: string): Promise<OperationalData> {
  const data: OperationalData = {};
  
  // Step 1: Try homepage
  const homepageHTML = await fetchHTML(website);
  if (homepageHTML) {
    const extracted = extractOperationalData(homepageHTML);
    Object.assign(data, extracted);
  }
  
  // Step 2: Try sitemap for relevant pages
  const sitemapUrls = await fetchSitemap(website);
  if (sitemapUrls.length > 0) {
    const operationalPages = findOperationalPages(sitemapUrls);
    for (const pageUrl of operationalPages) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const pageHTML = await fetchHTML(pageUrl);
      if (pageHTML) {
        const extracted = extractOperationalData(pageHTML);
        // Merge, but don't overwrite existing data
        if (extracted.evCharging && !data.evCharging) data.evCharging = extracted.evCharging;
        if (extracted.evChargingSpaces && !data.evChargingSpaces) data.evChargingSpaces = extracted.evChargingSpaces;
        if (extracted.carParkPrice !== undefined && data.carParkPrice === undefined) data.carParkPrice = extracted.carParkPrice;
        if (extracted.publicTransit && !data.publicTransit) data.publicTransit = extracted.publicTransit;
        if (extracted.numberOfFloors && !data.numberOfFloors) data.numberOfFloors = extracted.numberOfFloors;
        if (extracted.openedYear && !data.openedYear) data.openedYear = extracted.openedYear;
        if (extracted.parkingSpaces && !data.parkingSpaces) data.parkingSpaces = extracted.parkingSpaces;
      }
    }
  }
  
  // Step 3: Try common operational URLs
  const commonPaths = [
    '/parking', '/getting-here', '/visit', '/directions', '/travel',
    '/about', '/information', '/facilities', '/amenities'
  ];
  
  for (const path of commonPaths) {
    try {
      const testUrl = new URL(path, website).href;
      await new Promise(resolve => setTimeout(resolve, 500));
      const pageHTML = await fetchHTML(testUrl);
      if (pageHTML) {
        const extracted = extractOperationalData(pageHTML);
        // Merge, but don't overwrite existing data
        if (extracted.evCharging && !data.evCharging) data.evCharging = extracted.evCharging;
        if (extracted.evChargingSpaces && !data.evChargingSpaces) data.evChargingSpaces = extracted.evChargingSpaces;
        if (extracted.carParkPrice !== undefined && data.carParkPrice === undefined) data.carParkPrice = extracted.carParkPrice;
        if (extracted.publicTransit && !data.publicTransit) data.publicTransit = extracted.publicTransit;
        if (extracted.numberOfFloors && !data.numberOfFloors) data.numberOfFloors = extracted.numberOfFloors;
        if (extracted.openedYear && !data.openedYear) data.openedYear = extracted.openedYear;
        if (extracted.parkingSpaces && !data.parkingSpaces) data.parkingSpaces = extracted.parkingSpaces;
      }
    } catch {
      continue;
    }
  }
  
  return data;
}

async function main() {
  console.log('🔧 COMPREHENSIVE OPERATIONAL SCRAPER\n');
  console.log('Enhanced multi-page crawling for all operational fields...\n');
  
  const locations = await prisma.location.findMany({
    where: {
      website: { not: null },
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] }
    },
    select: {
      id: true,
      name: true,
      city: true,
      website: true,
      evCharging: true,
      evChargingSpaces: true,
      carParkPrice: true,
      publicTransit: true,
      numberOfFloors: true,
      openedYear: true,
      parkingSpaces: true
    },
    orderBy: { numberOfStores: 'desc' }
  });
  
  console.log(`📊 Found ${locations.length} locations to process\n`);
  
  let successCount = 0;
  let partialCount = 0;
  let failCount = 0;
  
  const enrichmentResults: Record<string, number> = {
    evCharging: 0,
    evChargingSpaces: 0,
    carParkPrice: 0,
    publicTransit: 0,
    numberOfFloors: 0,
    openedYear: 0,
    parkingSpaces: 0
  };
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name} (${loc.city})`);
    
    const operationalData = await scrapeOperationalFromWebsite(loc.website!);
    
    // Prepare update data (only update if field is currently null/undefined)
    const updateData: any = {};
    const found: string[] = [];
    
    if (operationalData.evCharging !== undefined && loc.evCharging === null) {
      updateData.evCharging = operationalData.evCharging;
      found.push('EV Charging');
      enrichmentResults.evCharging++;
    }
    
    if (operationalData.evChargingSpaces && !loc.evChargingSpaces) {
      updateData.evChargingSpaces = operationalData.evChargingSpaces;
      found.push(`${operationalData.evChargingSpaces} EV spaces`);
      enrichmentResults.evChargingSpaces++;
    }
    
    if (operationalData.carParkPrice !== undefined && loc.carParkPrice === null) {
      updateData.carParkPrice = operationalData.carParkPrice;
      found.push(`Parking: £${operationalData.carParkPrice}/hr`);
      enrichmentResults.carParkPrice++;
    }
    
    if (operationalData.publicTransit && !loc.publicTransit) {
      updateData.publicTransit = operationalData.publicTransit;
      found.push(`Transit: ${operationalData.publicTransit}`);
      enrichmentResults.publicTransit++;
    }
    
    if (operationalData.numberOfFloors && !loc.numberOfFloors) {
      updateData.numberOfFloors = operationalData.numberOfFloors;
      found.push(`${operationalData.numberOfFloors} floors`);
      enrichmentResults.numberOfFloors++;
    }
    
    if (operationalData.openedYear && !loc.openedYear) {
      updateData.openedYear = operationalData.openedYear;
      found.push(`Opened: ${operationalData.openedYear}`);
      enrichmentResults.openedYear++;
    }
    
    if (operationalData.parkingSpaces && !loc.parkingSpaces) {
      updateData.parkingSpaces = operationalData.parkingSpaces;
      found.push(`${operationalData.parkingSpaces} parking spaces`);
      enrichmentResults.parkingSpaces++;
    }
    
    if (Object.keys(updateData).length > 0) {
      await prisma.location.update({
        where: { id: loc.id },
        data: updateData
      });
      
      console.log(`   ✅ Found: ${found.join(', ')}`);
      if (found.length >= 3) {
        successCount++;
      } else {
        partialCount++;
      }
    } else {
      console.log(`   ℹ️  No new operational data found`);
      failCount++;
    }
    
    // Rate limiting: 2 seconds between requests
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Progress update every 25 locations
    if ((i + 1) % 25 === 0) {
      console.log(`\n📈 Progress: ${successCount} good finds, ${partialCount} partial, ${failCount} none\n`);
    }
  }
  
  console.log('\n✅ Comprehensive operational scraping complete!');
  console.log(`\n📊 Results:`);
  console.log(`   Good finds (3+ fields): ${successCount}/${locations.length}`);
  console.log(`   Partial finds (1-2 fields): ${partialCount}/${locations.length}`);
  console.log(`   No data: ${failCount}/${locations.length}`);
  
  console.log(`\n📝 Fields enriched:`);
  console.log(`   EV Charging: ${enrichmentResults.evCharging}`);
  console.log(`   EV Charging Spaces: ${enrichmentResults.evChargingSpaces}`);
  console.log(`   Car Park Pricing: ${enrichmentResults.carParkPrice}`);
  console.log(`   Public Transit: ${enrichmentResults.publicTransit}`);
  console.log(`   Number of Floors: ${enrichmentResults.numberOfFloors}`);
  console.log(`   Opened Year: ${enrichmentResults.openedYear}`);
  console.log(`   Parking Spaces: ${enrichmentResults.parkingSpaces}`);
  
  console.log(`\n💰 Cost: FREE (web scraping)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

