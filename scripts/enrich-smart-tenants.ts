#!/usr/bin/env tsx
/**
 * 🧠 SMART TENANT ENRICHMENT
 * 
 * Key improvements:
 * 1. Tests URL patterns FIRST (checks HTTP status)
 * 2. Only scrapes URLs that actually exist (200 response)
 * 3. Falls back to homepage if no store directory found
 * 4. Resume capability
 * 5. Better error handling
 */

import { spawn } from 'child_process';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();
const PYTHON_PATH = '/Users/mbeckett/miniconda3/bin/python3';
const PROGRESS_FILE = '/tmp/smart-tenants-progress.json';

// Store directory URL patterns to try
const URL_PATTERNS = [
  '/stores',
  '/shops',
  '/store-directory',
  '/shop-directory',
  '/brands',
  '/retailers',
  '/directory',
  '/store-guide',
  '/our-stores',
  '/find-stores',
  '/shopping',
  '/what-s-here',
  '/whats-here',
];

interface TenantData {
  name: string;
  category?: string;
  url?: string;
  isAnchorTenant?: boolean;
}

interface Progress {
  processedIds: string[];
  successCount: number;
  failedCount: number;
  totalStoresAdded: number;
  lastUpdated: string;
}

async function checkUrlExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
    
    // Accept 200 or redirects (301/302) as valid
    return response.ok || (response.status >= 300 && response.status < 400);
  } catch {
    return false;
  }
}

async function findBestStoreUrl(baseWebsite: string): Promise<string> {
  // Remove trailing slash
  const base = baseWebsite.replace(/\/$/, '');
  
  // Try each pattern
  for (const pattern of URL_PATTERNS) {
    const testUrl = base + pattern;
    const exists = await checkUrlExists(testUrl);
    
    if (exists) {
      console.log(`   ✅ Found valid URL: ${pattern}`);
      return testUrl;
    }
  }
  
  // Fallback to homepage
  console.log(`   ℹ️  No store directory found, using homepage`);
  return base;
}

async function scrapeStores(url: string): Promise<TenantData[]> {
  return new Promise((resolve) => {
    const child = spawn(PYTHON_PATH, [
      'scripts/playwright_openai_scraper.py',
      url,
    ]);

    let output = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', () => {
      // Ignore stderr
    });

    child.on('close', (code) => {
      if (code === 0 && output.trim()) {
        try {
          const stores = JSON.parse(output.trim());
          if (Array.isArray(stores)) {
            resolve(stores);
            return;
          }
        } catch {
          // Parse failed
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

function loadProgress(): Progress {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    }
  } catch {}
  
  return {
    processedIds: [],
    successCount: 0,
    failedCount: 0,
    totalStoresAdded: 0,
    lastUpdated: new Date().toISOString(),
  };
}

function saveProgress(progress: Progress) {
  progress.lastUpdated = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function main() {
  console.log('\n🧠 SMART TENANT ENRICHMENT');
  console.log('='.repeat(80));
  console.log('Intelligently finds and scrapes store directories\n');

  // Load progress
  const progress = loadProgress();
  console.log(`📊 Progress loaded: ${progress.processedIds.length} already processed\n`);

  // Get command line argument for tier
  const args = process.argv.slice(2);
  const mode = args[0] || 'all';

  let whereClause: any = {
    website: { not: null },
    tenants: { none: {} },
    id: { notIn: progress.processedIds },
  };

  let title = '';

  switch (mode) {
    case 'tier1':
      title = 'TIER 1 (30+ stores)';
      whereClause.numberOfStores = { gte: 30 };
      break;
    case 'tier2':
      title = 'TIER 2 (15-29 stores)';
      whereClause.numberOfStores = { gte: 15, lt: 30 };
      break;
    case 'tier3':
      title = 'TIER 3 (10-14 stores)';
      whereClause.numberOfStores = { gte: 10, lt: 15 };
      break;
    case 'all':
      title = 'ALL TIERS (10+ stores)';
      whereClause.numberOfStores = { gte: 10 };
      break;
    default:
      console.error('Invalid mode. Use: tier1, tier2, tier3, or all');
      process.exit(1);
  }

  const locations = await prisma.location.findMany({
    where: whereClause,
    select: { id: true, name: true, website: true, numberOfStores: true },
    orderBy: { numberOfStores: 'desc' },
  });

  console.log(`🎯 ${title}: ${locations.length} locations\n`);

  const startTime = Date.now();

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];

    console.log(`\n[${i + 1}/${locations.length}] ${loc.name} (${loc.numberOfStores} stores expected)`);

    if (!loc.website) {
      console.log(`   ⚠️  No website`);
      progress.processedIds.push(loc.id);
      progress.failedCount++;
      continue;
    }

    // Step 1: Find best URL
    console.log(`   🔍 Finding store directory...`);
    const bestUrl = await findBestStoreUrl(loc.website);

    // Step 2: Scrape it
    console.log(`   🤖 Scraping ${bestUrl}...`);
    const stores = await scrapeStores(bestUrl);

    if (stores.length >= 5) {  // Only save if we found at least 5 stores
      // Save to database
      let saved = 0;
      const categories = new Set<string>();
      let anchors = 0;

      for (const store of stores) {
        try {
          await prisma.tenant.upsert({
            where: {
              locationId_name: {
                locationId: loc.id,
                name: store.name,
              },
            },
            create: {
              locationId: loc.id,
              name: store.name,
              category: store.category || 'Other',
              isAnchorTenant: store.isAnchorTenant || false,
            },
            update: {
              category: store.category || 'Other',
              isAnchorTenant: store.isAnchorTenant || false,
            },
          });
          saved++;
          categories.add(store.category || 'Other');
          if (store.isAnchorTenant) anchors++;
        } catch (error) {
          // Skip duplicates
        }
      }

      console.log(`   ✅ Saved ${saved} stores!`);
      console.log(`   🏬 Categories: ${Array.from(categories).join(', ')}`);
      console.log(`   ⭐ Anchor tenants: ${anchors}`);
      console.log(`   📊 Coverage: ${saved}/${loc.numberOfStores} (${Math.round((saved / (loc.numberOfStores || 1)) * 100)}%)`);

      progress.successCount++;
      progress.totalStoresAdded += saved;
    } else if (stores.length > 0) {
      console.log(`   ⚠️  Only found ${stores.length} stores (too few, skipping)`);
      progress.failedCount++;
    } else {
      console.log(`   ❌ No stores found`);
      progress.failedCount++;
    }

    progress.processedIds.push(loc.id);

    // Save progress every 5 locations
    if ((i + 1) % 5 === 0) {
      saveProgress(progress);
    }

    // Checkpoint every 20 locations
    if ((i + 1) % 20 === 0) {
      const elapsed = Math.round((Date.now() - startTime) / 1000 / 60);
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📊 CHECKPOINT [${elapsed} min elapsed]`);
      console.log(`   ✅ Success: ${progress.successCount} (${Math.round((progress.successCount / (i + 1)) * 100)}%)`);
      console.log(`   ❌ Failed: ${progress.failedCount}`);
      console.log(`   🏪 Total stores added: ${progress.totalStoresAdded}`);
      console.log(`   💾 Progress saved\n`);
    }
  }

  // Final save
  saveProgress(progress);

  const duration = Math.round((Date.now() - startTime) / 1000 / 60);

  console.log('\n' + '='.repeat(80));
  console.log('🎉 SMART TENANT ENRICHMENT COMPLETE!');
  console.log('='.repeat(80));
  console.log(`Duration: ${duration} minutes (${(duration / 60).toFixed(1)} hours)`);
  console.log(`Processed: ${locations.length} locations`);
  console.log(`✅ Success: ${progress.successCount} (${Math.round((progress.successCount / locations.length) * 100)}%)`);
  console.log(`❌ Failed: ${progress.failedCount}`);
  console.log(`🏪 Total stores added: ${progress.totalStoresAdded}\n`);

  // Get final stats
  const stats = await prisma.$transaction([
    prisma.location.count({ where: { tenants: { some: {} } } }),
    prisma.tenant.count(),
  ]);

  console.log('📊 UPDATED DATABASE:');
  console.log(`   Locations with tenants: ${stats[0]}`);
  console.log(`   Total tenants in database: ${stats[1]}\n`);

  console.log('🎯 NEXT STEPS:');
  console.log('   1. Review enriched data in dashboard');
  console.log('   2. Run gap analysis reports');
  console.log('   3. Delete progress file: rm /tmp/smart-tenants-progress.json\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

