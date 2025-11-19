#!/usr/bin/env tsx
/**
 * 🏪 COMPREHENSIVE TENANT ENRICHMENT
 * Multiple fallback strategies for store directories:
 * 1. Common store directory URLs (/stores, /shop-directory, etc.)
 * 2. Homepage scraping with AI
 * 3. Sitemap parsing
 * 4. Multiple scroll attempts for lazy-loaded content
 */

import { spawn } from 'child_process';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();
const PYTHON_PATH = '/Users/mbeckett/miniconda3/bin/python3';

// Common store directory URL patterns
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
];

interface TenantData {
  name: string;
  category?: string;
  url?: string;
  isAnchorTenant?: boolean;
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

    // Timeout after 60 seconds
    setTimeout(() => {
      child.kill();
      resolve([]);
    }, 60000);
  });
}

async function findAndScrapeStores(website: string): Promise<TenantData[]> {
  // Strategy 1: Try common store directory URLs
  for (const pattern of STORE_DIRECTORY_PATTERNS) {
    console.log(`   🔍 Trying: ${pattern}`);
    const result = await tryStoreDirectoryUrl(website, pattern);
    if (result && result.tenants.length > 5) {
      console.log(`   ✅ Found ${result.tenants.length} stores at ${pattern}`);
      return result.tenants;
    }
  }

  // Strategy 2: Try homepage as fallback
  console.log(`   🔍 Trying homepage...`);
  const homePageTenants = await scrapeWithAI(website);
  if (homePageTenants.length > 0) {
    console.log(`   ✅ Found ${homePageTenants.length} stores on homepage`);
    return homePageTenants;
  }

  return [];
}

async function main() {
  console.log('\n🏪 COMPREHENSIVE TENANT ENRICHMENT');
  console.log('='.repeat(80));
  console.log('Using multiple fallback strategies for store directories\n');

  // Get all tiers of locations without tenants
  const args = process.argv.slice(2);
  const tier = args[0] || 'all';

  let whereClause: any = {
    website: { not: null },
    tenants: { none: {} },
  };

  switch (tier) {
    case 'tier1':
      whereClause.numberOfStores = { gte: 30 };
      break;
    case 'tier2':
      whereClause.numberOfStores = { gte: 15, lt: 30 };
      break;
    case 'tier3':
      whereClause.numberOfStores = { gte: 10, lt: 15 };
      break;
    case 'all':
      whereClause.numberOfStores = { gte: 10 };
      break;
  }

  const locations = await prisma.location.findMany({
    where: whereClause,
    select: { id: true, name: true, website: true, numberOfStores: true },
    orderBy: { numberOfStores: 'desc' },
  });

  console.log(`📊 Found ${locations.length} locations to enrich (${tier})\n`);

  let success = 0;
  let failed = 0;
  let totalStores = 0;

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];

    console.log(`\n[${i + 1}/${locations.length}] ${loc.name}`);
    console.log(`   Website: ${loc.website}`);

    if (!loc.website) {
      console.log(`   ⚠️  No website, skipping`);
      failed++;
      continue;
    }

    const tenants = await findAndScrapeStores(loc.website);

    if (tenants.length > 0) {
      // Save to database
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
        } catch (error) {
          console.log(`   ⚠️  Error saving ${tenant.name}`);
        }
      }

      console.log(`   ✅ Saved ${tenants.length} tenants`);
      totalStores += tenants.length;
      success++;
    } else {
      console.log(`   ❌ No stores found`);
      failed++;
    }

    // Progress checkpoint every 20 locations
    if ((i + 1) % 20 === 0) {
      console.log(`\n📊 CHECKPOINT`);
      console.log(`   Success: ${success}/${i + 1}`);
      console.log(`   Total stores added: ${totalStores}\n`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('🎉 COMPREHENSIVE TENANT ENRICHMENT COMPLETE!');
  console.log('='.repeat(80));
  console.log(`Success: ${success}/${locations.length} (${((success / locations.length) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failed}/${locations.length}`);
  console.log(`Total stores added: ${totalStores}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

