#!/usr/bin/env tsx
/**
 * 🏢 OWNER/MANAGEMENT ENHANCED
 * Enhanced extraction with better patterns and validation
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
    'about', 'contact', 'property', 'our-story', 'history',
    'management', 'owner', 'developer', 'company', 'investor'
  ];
  
  return urls.filter(url => {
    const urlLower = url.toLowerCase();
    return aboutKeywords.some(kw => urlLower.includes(kw));
  }).slice(0, 5);
}

interface OwnershipData {
  owner?: string;
  management?: string;
}

function extractOwnershipEnhanced(html: string): OwnershipData {
  const $ = cheerio.load(html);
  $('script, style').remove();
  const text = $('body').text();
  const textLower = text.toLowerCase();
  
  const data: OwnershipData = {};
  
  // Common UK property management companies
  const managementCompanies = [
    'hammerson', 'intu', 'westfield', 'british land', 'land securities',
    'unibail-rodamco-westfield', 'capital & regional', 'newriver',
    'real estate investment trust', 'reit', 'property management',
    'savills', 'cbre', 'jll', 'cushman & wakefield', 'knight frank',
    'colliers', 'b&m retail', 'retail property', 'shopping centre management',
    'grosvenor', 'heron', 'm&g', 'standard life', 'aberdeen', 'hermes'
  ];
  
  // Enhanced owner patterns
  const ownerPatterns = [
    /owned\s+by\s+([A-Z][A-Za-z\s&'-]+(?:Limited|Ltd|PLC|plc|Group|Holdings|Properties|Property|REIT|Reit|plc|LLC)?)\b/gi,
    /property\s+of\s+([A-Z][A-Za-z\s&'-]+(?:Limited|Ltd|PLC|plc|Group|Holdings|Properties|Property|REIT|Reit|plc|LLC)?)\b/gi,
    /developed\s+by\s+([A-Z][A-Za-z\s&'-]+(?:Limited|Ltd|PLC|plc|Group|Holdings|Properties|Property|REIT|Reit|plc|LLC)?)\b/gi,
    /owner[:\s]+([A-Z][A-Za-z\s&'-]+(?:Limited|Ltd|PLC|plc|Group|Holdings|Properties|Property|REIT|Reit|plc|LLC)?)\b/gi,
    /developer[:\s]+([A-Z][A-Za-z\s&'-]+(?:Limited|Ltd|PLC|plc|Group|Holdings|Properties|Property|REIT|Reit|plc|LLC)?)\b/gi,
  ];
  
  // Enhanced management patterns
  const managementPatterns = [
    /managed\s+by\s+([A-Z][A-Za-z\s&'-]+(?:Limited|Ltd|PLC|plc|Group|Holdings|Management|Properties|Property|REIT|Reit|plc|LLC)?)\b/gi,
    /management[:\s]+([A-Z][A-Za-z\s&'-]+(?:Limited|Ltd|PLC|plc|Group|Holdings|Management|Properties|Property|REIT|Reit|plc|LLC)?)\b/gi,
    /property\s+management[:\s]+([A-Z][A-Za-z\s&'-]+(?:Limited|Ltd|PLC|plc|Group|Holdings|Management|Properties|Property|REIT|Reit|plc|LLC)?)\b/gi,
  ];
  
  // Extract owner with enhanced validation
  for (const pattern of ownerPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      let company = match[1].trim();
      
      company = company
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*.*$/, '')
        .replace(/\s*\.\s*$/, '')
        .replace(/\s*\(.*?\)\s*/g, '')
        .trim();
      
      const companyLower = company.toLowerCase();
      const invalidWords = [
        'click', 'login', 'subscribe', 'cookie', 'find', 'store', 'details',
        'centre', 'center', 'shopping', 'retail', 'park', 'mall', 'directory',
        'finder', 'management', 'store finder', 'centre management', 'store details',
        'opening hours', 'pay less', 'made by', 'view more', 'about digita',
        'hassle', 'system in place', 'offices', 'suite', 'solution'
      ];
      
      const hasInvalidWord = invalidWords.some(word => companyLower.includes(word));
      
      if (company.length > 3 && company.length < 80 && 
          !company.includes('http') && 
          !company.includes('www') &&
          !hasInvalidWord &&
          !company.match(/^\d+$/) &&
          company.split(' ').length <= 6 &&
          !company.match(/^[a-z\s]+$/i)) {
        data.owner = company;
        break;
      }
    }
    if (data.owner) break;
  }
  
  // Extract management with enhanced validation
  for (const pattern of managementPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      let company = match[1].trim();
      
      company = company
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*.*$/, '')
        .replace(/\s*\.\s*$/, '')
        .replace(/\s*\(.*?\)\s*/g, '')
        .trim();
      
      const companyLower = company.toLowerCase();
      const invalidWords = [
        'click', 'login', 'subscribe', 'cookie', 'find', 'store', 'details',
        'centre', 'center', 'shopping', 'retail', 'park', 'mall', 'directory',
        'finder', 'store finder', 'centre management', 'store details',
        'opening hours', 'pay less', 'made by', 'view more', 'about digita',
        'hassle', 'system in place', 'offices', 'suite', 'solution'
      ];
      
      const hasInvalidWord = invalidWords.some(word => companyLower.includes(word));
      
      if (company.length > 3 && company.length < 80 && 
          !company.includes('http') && 
          !company.includes('www') &&
          !hasInvalidWord &&
          !company.match(/^\d+$/) &&
          company.split(' ').length <= 6 &&
          !company.match(/^[a-z\s]+$/i)) {
        data.management = company;
        break;
      }
    }
    if (data.management) break;
  }
  
  // Check for known management companies
  if (!data.management) {
    for (const company of managementCompanies) {
      if (textLower.includes(company.toLowerCase())) {
        const companyIndex = textLower.indexOf(company.toLowerCase());
        const context = text.substring(Math.max(0, companyIndex - 100), Math.min(text.length, companyIndex + 150));
        
        const patterns = [
          new RegExp(`([A-Z][A-Za-z\\s&'-]+${company.replace(/\s+/g, '\\s+')}[A-Za-z\\s&'-]*(?:Limited|Ltd|PLC|plc|Group|Holdings|Management|Properties|Property|REIT|Reit|plc|LLC)?)`, 'i'),
          new RegExp(`(${company.replace(/\s+/g, '\\s+')}[A-Za-z\\s&'-]*(?:Limited|Ltd|PLC|plc|Group|Holdings|Management|Properties|Property|REIT|Reit|plc|LLC)?)`, 'i')
        ];
        
        for (const pattern of patterns) {
          const companyMatch = context.match(pattern);
          if (companyMatch) {
            let extracted = companyMatch[1].trim()
              .replace(/\s+/g, ' ')
              .replace(/\s*,\s*.*$/, '')
              .replace(/\s*\.\s*$/, '')
              .trim();
            
            if (extracted.length > 3 && extracted.length < 80 && 
                !extracted.includes('http') && 
                extracted.split(' ').length <= 6) {
              data.management = extracted;
              break;
            }
          }
        }
        if (data.management) break;
      }
    }
  }
  
  // Check JSON-LD structured data
  $('script[type="application/ld+json"]').each((_, elem) => {
    try {
      const jsonText = $(elem).html();
      if (!jsonText) return;
      
      const json = JSON.parse(jsonText);
      
      if (json['@type'] === 'ShoppingCenter' || json['@type'] === 'Place') {
        if (json.owner && !data.owner) {
          const owner = typeof json.owner === 'string' ? json.owner : json.owner.name;
          if (owner) data.owner = owner;
        }
        if (json.management && !data.management) {
          const mgmt = typeof json.management === 'string' ? json.management : json.management.name;
          if (mgmt) data.management = mgmt;
        }
      }
      
      if (json['@graph']) {
        for (const item of json['@graph']) {
          if (item['@type'] === 'Organization') {
            if (item.name && textLower.includes('owner')) {
              if (!data.owner) data.owner = item.name;
            }
            if (item.name && textLower.includes('management')) {
              if (!data.management) data.management = item.name;
            }
          }
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
  });
  
  return data;
}

async function scrapeOwnershipEnhanced(website: string): Promise<OwnershipData> {
  const data: OwnershipData = {};
  
  // Step 1: Try homepage
  const homepageHTML = await fetchHTML(website);
  if (homepageHTML) {
    const extracted = extractOwnershipEnhanced(homepageHTML);
    if (extracted.owner) data.owner = extracted.owner;
    if (extracted.management) data.management = extracted.management;
  }
  
  // Step 2: Try sitemap for relevant pages
  const sitemapUrls = await fetchSitemap(website);
  if (sitemapUrls.length > 0) {
    const aboutPages = findAboutPages(sitemapUrls);
    for (const pageUrl of aboutPages) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const pageHTML = await fetchHTML(pageUrl);
      if (pageHTML) {
        const extracted = extractOwnershipEnhanced(pageHTML);
        if (extracted.owner && !data.owner) data.owner = extracted.owner;
        if (extracted.management && !data.management) data.management = extracted.management;
      }
      
      if (data.owner && data.management) {
        return data;
      }
    }
  }
  
  // Step 3: Try common about/contact URLs
  const commonPaths = [
    '/about', '/about-us', '/contact', '/property', '/our-story',
    '/history', '/management', '/company', '/who-we-are', '/investor-relations'
  ];
  
  for (const path of commonPaths) {
    try {
      const testUrl = new URL(path, website).href;
      await new Promise(resolve => setTimeout(resolve, 500));
      const pageHTML = await fetchHTML(testUrl);
      if (pageHTML) {
        const extracted = extractOwnershipEnhanced(pageHTML);
        if (extracted.owner && !data.owner) data.owner = extracted.owner;
        if (extracted.management && !data.management) data.management = extracted.management;
      }
      
      if (data.owner && data.management) {
        return data;
      }
    } catch {
      continue;
    }
  }
  
  return data;
}

async function main() {
  console.log('🏢 OWNER/MANAGEMENT ENHANCED\n');
  console.log('Enhanced extraction with better patterns and validation...\n');
  
  const locations = await prisma.location.findMany({
    where: {
      website: { not: null },
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      OR: [
        { owner: null },
        { management: null }
      ]
    },
    select: {
      id: true,
      name: true,
      city: true,
      website: true,
      owner: true,
      management: true
    },
    orderBy: { numberOfStores: 'desc' }
  });
  
  console.log(`📊 Found ${locations.length} locations to process\n`);
  
  let successCount = 0;
  let partialCount = 0;
  let failCount = 0;
  
  const enrichmentResults = {
    owner: 0,
    management: 0,
    both: 0
  };
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name} (${loc.city})`);
    
    const ownershipData = await scrapeOwnershipEnhanced(loc.website!);
    
    const updateData: any = {};
    const found: string[] = [];
    
    if (ownershipData.owner && !loc.owner) {
      updateData.owner = ownershipData.owner;
      found.push(`Owner: ${ownershipData.owner}`);
      enrichmentResults.owner++;
    }
    
    if (ownershipData.management && !loc.management) {
      updateData.management = ownershipData.management;
      found.push(`Management: ${ownershipData.management}`);
      enrichmentResults.management++;
    }
    
    if (Object.keys(updateData).length > 0) {
      await prisma.location.update({
        where: { id: loc.id },
        data: updateData
      });
      
      console.log(`   ✅ Found: ${found.join(', ')}`);
      
      if (updateData.owner && updateData.management) {
        successCount++;
        enrichmentResults.both++;
      } else {
        partialCount++;
      }
    } else {
      console.log(`   ❌ No ownership data found`);
      failCount++;
    }
    
    // Rate limiting
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Progress update every 25
    if ((i + 1) % 25 === 0) {
      console.log(`\n📈 Progress: ${successCount} both, ${partialCount} partial, ${failCount} failed\n`);
    }
  }
  
  console.log('\n✅ Ownership enhanced enrichment complete!');
  console.log(`\n📊 Results:`);
  console.log(`   Both owner and management: ${successCount}/${locations.length}`);
  console.log(`   Partial (owner or management): ${partialCount}/${locations.length}`);
  console.log(`   Failed: ${failCount}/${locations.length}`);
  
  console.log(`\n📝 Fields enriched:`);
  console.log(`   Owner: ${enrichmentResults.owner}`);
  console.log(`   Management: ${enrichmentResults.management}`);
  console.log(`   Both: ${enrichmentResults.both}`);
  
  // Show overall coverage
  const totalWithOwner = await prisma.location.count({
    where: { owner: { not: null } }
  });
  const totalWithManagement = await prisma.location.count({
    where: { management: { not: null } }
  });
  const totalLocations = await prisma.location.count({
    where: { type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] } }
  });
  
  console.log(`\n📊 Overall Coverage:`);
  console.log(`   Owner: ${totalWithOwner}/${totalLocations} (${(totalWithOwner/totalLocations*100).toFixed(1)}%)`);
  console.log(`   Management: ${totalWithManagement}/${totalLocations} (${(totalWithManagement/totalLocations*100).toFixed(1)}%)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

