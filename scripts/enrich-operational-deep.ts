#!/usr/bin/env tsx
/**
 * 🔧 OPERATIONAL DEEP DIVE
 * Enhanced multi-page crawling for opened year, floors, parking
 */

import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface OperationalData {
  openedYear?: number;
  numberOfFloors?: number;
  parkingSpaces?: number;
  carParkPrice?: number;
  publicTransit?: string;
  evChargingSpaces?: number;
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

function findRelevantPages(urls: string[]): { about: string[]; history: string[]; parking: string[]; accessibility: string[] } {
  const about: string[] = [];
  const history: string[] = [];
  const parking: string[] = [];
  const accessibility: string[] = [];
  
  urls.forEach(url => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('about') || urlLower.includes('history') || urlLower.includes('story')) {
      if (urlLower.includes('history')) {
        history.push(url);
      } else {
        about.push(url);
      }
    } else if (urlLower.includes('parking') || urlLower.includes('car-park')) {
      parking.push(url);
    } else if (urlLower.includes('accessibility') || urlLower.includes('access') || urlLower.includes('floor')) {
      accessibility.push(url);
    }
  });
  
  return {
    about: about.slice(0, 3),
    history: history.slice(0, 2),
    parking: parking.slice(0, 3),
    accessibility: accessibility.slice(0, 2)
  };
}

function extractOperationalData(html: string): OperationalData {
  const $ = cheerio.load(html);
  $('script, style').remove();
  const text = $('body').text().toLowerCase();
  
  const data: OperationalData = {};
  
  // Enhanced opened year extraction
  const yearPatterns = [
    /opened?\s*(?:in)?\s*(?:the\s+year\s+)?(19\d{2}|20\d{2})/gi,
    /established?\s*(?:in)?\s*(?:the\s+year\s+)?(19\d{2}|20\d{2})/gi,
    /since\s+(19\d{2}|20\d{2})/gi,
    /built?\s*(?:in)?\s*(?:the\s+year\s+)?(19\d{2}|20\d{2})/gi,
    /(?:first\s+)?opened?\s+(?:in\s+)?(19\d{2}|20\d{2})/gi,
    /(?:opening|launch)\s+(?:in\s+)?(19\d{2}|20\d{2})/gi,
    /(19\d{2}|20\d{2})\s*(?:saw|marked|was)\s+the\s+opening/gi,
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
  
  // Enhanced floor detection
  const floorPatterns = [
    /(\d+)\s*(?:floors?|levels?|storeys?)/gi,
    /(?:over|across|spread\s+across)\s+(\d+)\s*(?:floors?|levels?)/gi,
    /(?:floors?|levels?).*?(\d+)/gi,
    /(\d+)[-–]\s*storey/gi,
    /(\d+)[-–]\s*level/gi,
    /(?:ground|first|second|third|fourth|fifth)\s+floor.*?(?:and|plus)\s+(\d+)\s+more/gi,
  ];
  
  for (const pattern of floorPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      const numMatch = matches[0][1];
      const num = parseInt(numMatch, 10);
      if (num >= 1 && num <= 15) {
        data.numberOfFloors = num;
        break;
      }
    }
  }
  
  // Enhanced parking extraction
  const parkingPatterns = [
    /(\d{1,3}(?:,\d{3})+|\d{2,5})\s*(?:free\s+)?(?:car\s+)?parking\s+spaces?/gi,
    /parking[:\s]+(\d{1,3}(?:,\d{3})+|\d{2,5})\s+spaces?/gi,
    /car\s+park\s+(?:features|with|has|offers?|capacity)\s+(\d{1,3}(?:,\d{3})+|\d{2,5})\s+spaces?/gi,
    /(\d{1,3}(?:,\d{3})+|\d{2,5})-space\s+(?:car\s+)?park/gi,
    /total\s+(?:parking\s+)?spaces?[:\s]+(\d{1,3}(?:,\d{3})+|\d{2,5})/gi,
  ];
  
  for (const pattern of parkingPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      const numStr = match[1].replace(/,/g, '');
      const spaces = parseInt(numStr, 10);
      if (spaces >= 20 && spaces <= 50000) {
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
  
  // Car park price
  const pricingPatterns = [
    /£(\d+(?:\.\d{2})?)\s*(?:per|an|\/)\s*(?:hour|hr)/gi,
    /parking.*?£(\d+(?:\.\d{2})?)/gi,
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
  
  if (!data.carParkPrice && (text.includes('free parking') || text.includes('free car park'))) {
    data.carParkPrice = 0;
  }
  
  // Public transit
  const transitKeywords = [
    { type: 'train', keywords: ['train station', 'railway station', 'rail station'] },
    { type: 'metro', keywords: ['metro station', 'underground station', 'tube station'] },
    { type: 'bus', keywords: ['bus stop', 'bus station', 'bus route'] },
    { type: 'tram', keywords: ['tram stop', 'tram station', 'light rail'] }
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
  
  // EV charging spaces
  if (/ev charging|electric vehicle charging|charging points/i.test(text)) {
    const evMatch = text.match(/(\d+)\s*(?:ev|electric vehicle|electric car)?\s*charg(?:ing)?\s*(?:points?|spaces?|bays?)/gi);
    if (evMatch) {
      const numMatch = evMatch[0].match(/\d+/);
      if (numMatch) {
        const num = parseInt(numMatch[0], 10);
        if (num > 0 && num < 500) {
          data.evChargingSpaces = num;
        }
      }
    }
  }
  
  return data;
}

async function scrapeOperationalDeep(website: string): Promise<OperationalData> {
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
    const { about, history, parking, accessibility } = findRelevantPages(sitemapUrls);
    
    // Check history pages for opened year
    for (const historyUrl of history) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const pageHTML = await fetchHTML(historyUrl);
      if (pageHTML) {
        const extracted = extractOperationalData(pageHTML);
        if (extracted.openedYear && !data.openedYear) data.openedYear = extracted.openedYear;
        if (extracted.numberOfFloors && !data.numberOfFloors) data.numberOfFloors = extracted.numberOfFloors;
      }
    }
    
    // Check about pages
    for (const aboutUrl of about) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const pageHTML = await fetchHTML(aboutUrl);
      if (pageHTML) {
        const extracted = extractOperationalData(pageHTML);
        if (extracted.openedYear && !data.openedYear) data.openedYear = extracted.openedYear;
        if (extracted.numberOfFloors && !data.numberOfFloors) data.numberOfFloors = extracted.numberOfFloors;
      }
    }
    
    // Check parking pages
    for (const parkingUrl of parking) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const pageHTML = await fetchHTML(parkingUrl);
      if (pageHTML) {
        const extracted = extractOperationalData(parkingUrl);
        if (extracted.parkingSpaces && !data.parkingSpaces) data.parkingSpaces = extracted.parkingSpaces;
        if (extracted.carParkPrice !== undefined && data.carParkPrice === undefined) data.carParkPrice = extracted.carParkPrice;
        if (extracted.evChargingSpaces && !data.evChargingSpaces) data.evChargingSpaces = extracted.evChargingSpaces;
      }
    }
    
    // Check accessibility pages for floors
    for (const accessUrl of accessibility) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const pageHTML = await fetchHTML(accessUrl);
      if (pageHTML) {
        const extracted = extractOperationalData(pageHTML);
        if (extracted.numberOfFloors && !data.numberOfFloors) data.numberOfFloors = extracted.numberOfFloors;
      }
    }
  }
  
  // Step 3: Try common URLs
  const commonPaths = [
    { path: '/about', fields: ['openedYear', 'numberOfFloors'] },
    { path: '/history', fields: ['openedYear'] },
    { path: '/parking', fields: ['parkingSpaces', 'carParkPrice', 'evChargingSpaces'] },
    { path: '/accessibility', fields: ['numberOfFloors'] },
    { path: '/getting-here', fields: ['publicTransit', 'parkingSpaces'] },
  ];
  
  for (const { path, fields } of commonPaths) {
    try {
      const testUrl = new URL(path, website).href;
      await new Promise(resolve => setTimeout(resolve, 500));
      const pageHTML = await fetchHTML(testUrl);
      if (pageHTML) {
        const extracted = extractOperationalData(pageHTML);
        if (fields.includes('openedYear') && extracted.openedYear && !data.openedYear) data.openedYear = extracted.openedYear;
        if (fields.includes('numberOfFloors') && extracted.numberOfFloors && !data.numberOfFloors) data.numberOfFloors = extracted.numberOfFloors;
        if (fields.includes('parkingSpaces') && extracted.parkingSpaces && !data.parkingSpaces) data.parkingSpaces = extracted.parkingSpaces;
        if (fields.includes('carParkPrice') && extracted.carParkPrice !== undefined && data.carParkPrice === undefined) data.carParkPrice = extracted.carParkPrice;
        if (fields.includes('evChargingSpaces') && extracted.evChargingSpaces && !data.evChargingSpaces) data.evChargingSpaces = extracted.evChargingSpaces;
        if (fields.includes('publicTransit') && extracted.publicTransit && !data.publicTransit) data.publicTransit = extracted.publicTransit;
      }
    } catch {
      continue;
    }
  }
  
  return data;
}

async function main() {
  console.log('🔧 OPERATIONAL DEEP DIVE\n');
  console.log('Enhanced multi-page crawling for opened year, floors, parking...\n');
  
  const locations = await prisma.location.findMany({
    where: {
      website: { not: null },
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      OR: [
        { openedYear: null },
        { numberOfFloors: null },
        { parkingSpaces: null },
        { carParkPrice: null },
        { publicTransit: null },
        { evChargingSpaces: null }
      ]
    },
    select: {
      id: true,
      name: true,
      city: true,
      website: true,
      openedYear: true,
      numberOfFloors: true,
      parkingSpaces: true,
      carParkPrice: true,
      publicTransit: true,
      evChargingSpaces: true
    },
    orderBy: { numberOfStores: 'desc' }
  });
  
  console.log(`📊 Found ${locations.length} locations to process\n`);
  
  let successCount = 0;
  let partialCount = 0;
  let failCount = 0;
  
  const enrichmentResults: Record<string, number> = {
    openedYear: 0,
    numberOfFloors: 0,
    parkingSpaces: 0,
    carParkPrice: 0,
    publicTransit: 0,
    evChargingSpaces: 0
  };
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name} (${loc.city})`);
    
    const operationalData = await scrapeOperationalDeep(loc.website!);
    
    const updateData: any = {};
    const found: string[] = [];
    
    if (operationalData.openedYear && !loc.openedYear) {
      updateData.openedYear = operationalData.openedYear;
      found.push(`Opened: ${operationalData.openedYear}`);
      enrichmentResults.openedYear++;
    }
    
    if (operationalData.numberOfFloors && !loc.numberOfFloors) {
      updateData.numberOfFloors = operationalData.numberOfFloors;
      found.push(`${operationalData.numberOfFloors} floors`);
      enrichmentResults.numberOfFloors++;
    }
    
    if (operationalData.parkingSpaces && !loc.parkingSpaces) {
      updateData.parkingSpaces = operationalData.parkingSpaces;
      found.push(`${operationalData.parkingSpaces} parking spaces`);
      enrichmentResults.parkingSpaces++;
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
    
    if (operationalData.evChargingSpaces && !loc.evChargingSpaces) {
      updateData.evChargingSpaces = operationalData.evChargingSpaces;
      found.push(`${operationalData.evChargingSpaces} EV spaces`);
      enrichmentResults.evChargingSpaces++;
    }
    
    if (Object.keys(updateData).length > 0) {
      await prisma.location.update({
        where: { id: loc.id },
        data: updateData
      });
      
      console.log(`   ✅ Found: ${found.join(', ')}`);
      if (found.length >= 2) {
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
  
  console.log('\n✅ Operational deep dive complete!');
  console.log(`\n📊 Results:`);
  console.log(`   Good finds (2+ fields): ${successCount}/${locations.length}`);
  console.log(`   Partial finds (1 field): ${partialCount}/${locations.length}`);
  console.log(`   No data: ${failCount}/${locations.length}`);
  
  console.log(`\n📝 Fields enriched:`);
  console.log(`   Opened Year: ${enrichmentResults.openedYear}`);
  console.log(`   Number of Floors: ${enrichmentResults.numberOfFloors}`);
  console.log(`   Parking Spaces: ${enrichmentResults.parkingSpaces}`);
  console.log(`   Car Park Price: ${enrichmentResults.carParkPrice}`);
  console.log(`   Public Transit: ${enrichmentResults.publicTransit}`);
  console.log(`   EV Charging Spaces: ${enrichmentResults.evChargingSpaces}`);
  
  console.log(`\n💰 Cost: FREE (web scraping)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

