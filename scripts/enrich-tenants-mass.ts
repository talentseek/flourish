#!/usr/bin/env tsx
/**
 * 🏪 MASS TENANT ENRICHMENT
 * Targets all 1,733 locations with websites but no tenant data
 * Enhanced URL discovery with sitemap.xml support
 */

import { spawn } from 'child_process';
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();
const PYTHON_PATH = '/Users/mbeckett/miniconda3/bin/python3';

// Expanded store directory URL patterns
const STORE_DIRECTORY_PATTERNS = [
  '/stores',
  '/store-directory',
  '/shop-directory',
  '/shops',
  '/retailers',
  '/retail-directory',
  '/our-stores',
  '/find-a-store',
  '/shopping',
  '/brands',
  '/directory',
  '/store-guide',
  '/stores-services',
  '/whats-here',
  '/tenants',
  '/retailers-tenants',
  '/store-list',
  '/all-stores',
  '/store-listing',
  '/retailers-list',
];

interface TenantData {
  name: string;
  category?: string;
  url?: string;
  isAnchorTenant?: boolean;
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

function findStoreDirectoryUrls(sitemapUrls: string[]): string[] {
  const storeKeywords = [
    'store', 'shop', 'retailer', 'tenant', 'directory', 'brand',
    'shopping', 'whats-here', 'find', 'listing'
  ];
  
  return sitemapUrls.filter(url => {
    const urlLower = url.toLowerCase();
    return storeKeywords.some(kw => urlLower.includes(kw));
  }).slice(0, 5);
}

async function scrapeWithAI(url: string): Promise<TenantData[]> {
  return new Promise((resolve) => {
    const child = spawn(PYTHON_PATH, [
      'scripts/playwright_openai_scraper.py',
      url,
    ]);

    let output = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0 && output.includes('[STORES_START]')) {
        try {
          const jsonMatch = output.match(/\[STORES_START\](.*?)\[STORES_END\]/s);
          if (jsonMatch) {
            const stores = JSON.parse(jsonMatch[1]);
            resolve(stores);
            return;
          }
        } catch {
          // Parse error
        }
      }
      resolve([]);
    });

    // Timeout after 90 seconds (increased for complex pages)
    setTimeout(() => {
      child.kill();
      resolve([]);
    }, 90000);
  });
}

async function tryStoreDirectoryUrl(
  baseUrl: string,
  pattern: string
): Promise<{ url: string; tenants: TenantData[] } | null> {
  const testUrl = new URL(pattern, baseUrl).href;

  try {
    // Check if URL exists
    const checkResponse = await fetch(testUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });

    if (!checkResponse.ok) return null;

    // Try scraping with AI
    const tenants = await scrapeWithAI(testUrl);
    if (tenants.length > 0) {
      return { url: testUrl, tenants };
    }
  } catch {
    // Silent fail, try next pattern
  }

  return null;
}

async function findAndScrapeStores(website: string): Promise<TenantData[]> {
  // Strategy 1: Try sitemap.xml for store directory pages
  const sitemapUrls = await fetchSitemap(website);
  if (sitemapUrls.length > 0) {
    const storeUrls = findStoreDirectoryUrls(sitemapUrls);
    for (const storeUrl of storeUrls) {
      console.log(`   🔍 Trying sitemap URL: ${new URL(storeUrl).pathname}`);
      const tenants = await scrapeWithAI(storeUrl);
      if (tenants.length > 5) {
        console.log(`   ✅ Found ${tenants.length} stores via sitemap`);
        return tenants;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Strategy 2: Try common store directory URLs
  for (const pattern of STORE_DIRECTORY_PATTERNS) {
    console.log(`   🔍 Trying: ${pattern}`);
    const result = await tryStoreDirectoryUrl(website, pattern);
    if (result && result.tenants.length > 5) {
      console.log(`   ✅ Found ${result.tenants.length} stores at ${pattern}`);
      return result.tenants;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Strategy 3: Try homepage as fallback
  console.log(`   🔍 Trying homepage...`);
  const homePageTenants = await scrapeWithAI(website);
  if (homePageTenants.length > 0) {
    console.log(`   ✅ Found ${homePageTenants.length} stores on homepage`);
    return homePageTenants;
  }

  return [];
}

async function main() {
  console.log('\n🏪 MASS TENANT ENRICHMENT');
  console.log('='.repeat(80));
  console.log('Targeting all locations with websites but no tenant data\n');

  // Get all locations with websites but no tenants
  const locations = await prisma.location.findMany({
    where: {
      website: { not: null },
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      tenants: { none: {} }
    },
    select: {
      id: true,
      name: true,
      website: true,
      numberOfStores: true,
      city: true
    },
    orderBy: { numberOfStores: 'desc' },
  });

  console.log(`📊 Found ${locations.length} locations to enrich\n`);

  let success = 0;
  let failed = 0;
  let totalStores = 0;
  const progressFile = '/tmp/tenant-mass-progress.json';

  // Load progress if exists
  let processedIds: string[] = [];
  try {
    const fs = await import('fs');
    if (fs.existsSync(progressFile)) {
      const progress = JSON.parse(fs.readFileSync(progressFile, 'utf-8'));
      processedIds = progress.processedIds || [];
      console.log(`📂 Resuming from previous run (${processedIds.length} already processed)\n`);
    }
  } catch {
    // No progress file, start fresh
  }

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];

    // Skip if already processed
    if (processedIds.includes(loc.id)) {
      continue;
    }

    console.log(`\n[${i + 1}/${locations.length}] ${loc.name} (${loc.city})`);
    console.log(`   Website: ${loc.website}`);
    console.log(`   Expected stores: ${loc.numberOfStores || 'unknown'}`);

    if (!loc.website) {
      console.log(`   ⚠️  No website, skipping`);
      failed++;
      processedIds.push(loc.id);
      continue;
    }

    const tenants = await findAndScrapeStores(loc.website);

    if (tenants.length > 0) {
      // Save to database
      let saved = 0;
      for (const tenant of tenants) {
        try {
          await prisma.tenant.upsert({
            where: {
              locationId_name: {
                locationId: loc.id,
                name: tenant.name,
              },
            },
            create: {
              locationId: loc.id,
              name: tenant.name,
              category: tenant.category || 'Other',
              isAnchorTenant: tenant.isAnchorTenant || false,
            },
            update: {
              category: tenant.category || 'Other',
              isAnchorTenant: tenant.isAnchorTenant || false,
            },
          });
          saved++;
        } catch (error) {
          // Skip duplicates
        }
      }

      console.log(`   ✅ Saved ${saved} tenants`);
      totalStores += saved;
      success++;
    } else {
      console.log(`   ❌ No stores found`);
      failed++;
    }

    // Save progress
    processedIds.push(loc.id);
    try {
      const fs = await import('fs');
      fs.writeFileSync(progressFile, JSON.stringify({ processedIds }, null, 2));
    } catch {
      // Ignore write errors
    }

    // Progress checkpoint every 10 locations
    if ((i + 1) % 10 === 0) {
      console.log(`\n📊 CHECKPOINT`);
      console.log(`   Success: ${success}/${i + 1}`);
      console.log(`   Failed: ${failed}/${i + 1}`);
      console.log(`   Total stores added: ${totalStores}\n`);
    }

    // Rate limiting between locations
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('🎉 MASS TENANT ENRICHMENT COMPLETE!');
  console.log('='.repeat(80));
  console.log(`Success: ${success}/${locations.length} (${((success / locations.length) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failed}/${locations.length}`);
  console.log(`Total stores added: ${totalStores}`);

  // Clean up progress file
  try {
    const fs = await import('fs');
    if (fs.existsSync(progressFile)) {
      fs.unlinkSync(progressFile);
    }
  } catch {
    // Ignore cleanup errors
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

