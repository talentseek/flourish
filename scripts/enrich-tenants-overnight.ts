#!/usr/bin/env tsx
/**
 * 🌙 OVERNIGHT TENANT ENRICHMENT
 * 
 * Robust script to extract store directories for all Tier 1+2 locations.
 * Uses the working Playwright + OpenAI scraper with proper timeout handling.
 * 
 * Features:
 * - Resume capability (saves progress)
 * - Comprehensive logging
 * - Smart URL pattern detection
 * - Error handling with retries
 * - Progress tracking
 * 
 * Can safely run for 8-12 hours unattended.
 */

import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PYTHON_PATH = '/Users/mbeckett/miniconda3/bin/python3';
const SCRAPER_PATH = path.join(process.cwd(), 'scripts', 'playwright_openai_scraper.py');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PROGRESS_FILE = '/tmp/tenant-enrichment-progress.json';

interface Progress {
  completed: string[];
  successCount: number;
  failCount: number;
  totalStoresAdded: number;
  lastSaved: string;
  startTime: string;
}

interface Store {
  name: string;
  category?: string;
  url?: string;
}

// Load or initialize progress
function loadProgress(): Progress {
  if (existsSync(PROGRESS_FILE)) {
    try {
      const data = readFileSync(PROGRESS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.log('⚠️  Could not load progress file, starting fresh');
    }
  }

  return {
    completed: [],
    successCount: 0,
    failCount: 0,
    totalStoresAdded: 0,
    lastSaved: new Date().toISOString(),
    startTime: new Date().toISOString(),
  };
}

// Save progress
function saveProgress(progress: Progress) {
  progress.lastSaved = new Date().toISOString();
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Run Python scraper with proper timeout handling
async function runScraper(url: string, timeout: number = 60000): Promise<Store[]> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(PYTHON_PATH, [SCRAPER_PATH, url], {
      env: { ...process.env, OPENAI_API_KEY },
    });

    let stdout = '';
    let stderr = '';

    childProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    childProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Set timeout
    const timer = setTimeout(() => {
      childProcess.kill();
      reject(new Error('Timeout'));
    }, timeout);

    childProcess.on('close', (code) => {
      clearTimeout(timer);

      if (code === 0) {
        try {
          const data = JSON.parse(stdout);
          if (Array.isArray(data)) {
            resolve(data);
          } else {
            reject(new Error('Invalid JSON response'));
          }
        } catch (e) {
          reject(new Error('Failed to parse JSON'));
        }
      } else {
        reject(new Error(`Process exited with code ${code}: ${stderr}`));
      }
    });

    childProcess.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

// Try multiple URL patterns to find store directory
async function findStoreDirectory(baseUrl: string): Promise<{ stores: Store[]; url: string } | null> {
  const cleanBase = baseUrl.replace(/\/$/, '');
  
  const urlPatterns = [
    `${cleanBase}/stores`,
    `${cleanBase}/store-directory`,
    `${cleanBase}/shops`,
    `${cleanBase}/brands`,
    `${cleanBase}/retailers`,
    `${cleanBase}/directory`,
    `${cleanBase}/store-finder`,
    cleanBase, // Homepage as fallback
  ];

  for (const url of urlPatterns) {
    const pattern = url.replace(cleanBase, '...');
    console.log(`   📍 Trying: ${pattern}`);

    try {
      const stores = await runScraper(url, 60000); // 60s timeout per attempt
      
      if (stores && stores.length >= 5) {
        console.log(`   ✅ Found ${stores.length} stores!`);
        return { stores, url };
      } else if (stores && stores.length > 0) {
        console.log(`   ⚠️  Only ${stores.length} stores (may not be directory page)`);
        // Continue trying other patterns
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Timeout') {
        console.log(`   ⏱️  Timeout (60s)`);
      } else {
        console.log(`   ⚠️  ${error instanceof Error ? error.message : 'Error'}`);
      }
    }

    // Small delay between attempts
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return null;
}

// Save tenants to database
async function saveTenants(stores: Store[], locationId: string) {
  const categoryMap: Record<string, string> = {
    fashion: 'Fashion & Apparel',
    electronics: 'Electronics',
    food: 'Food & Beverage',
    'health & beauty': 'Health & Beauty',
    home: 'Home & Garden',
    entertainment: 'Entertainment',
    services: 'Services',
    sports: 'Sports & Outdoors',
    jewellery: 'Jewelry & Accessories',
    jewelry: 'Jewelry & Accessories',
    kids: 'Kids & Toys',
    specialist: 'Specialist Retail',
  };

  let anchorCount = 0;
  const categories = new Set<string>();

  for (const store of stores) {
    const rawCategory = store.category?.toLowerCase() || 'other';
    const isAnchor = store.name.length > 15 || ['department', 'anchor'].some(k => rawCategory.includes(k));
    
    if (isAnchor) anchorCount++;

    const category = categoryMap[rawCategory] || categoryMap[rawCategory.split(' ')[0]] || 'Other';
    categories.add(category);

    await prisma.tenant.upsert({
      where: {
        locationId_name: {
          locationId,
          name: store.name,
        },
      },
      create: {
        locationId,
        name: store.name,
        category,
        isAnchorTenant: isAnchor,
      },
      update: {
        category,
        isAnchorTenant: isAnchor,
      },
    });
  }

  console.log(`   ✅ Saved ${stores.length} stores to database`);
  console.log(`   🏬 Categories: ${Array.from(categories).join(', ')}`);
  if (anchorCount > 0) {
    console.log(`   ⭐ Anchor tenants: ${anchorCount}`);
  }
}

async function main() {
  console.log('\n🌙 OVERNIGHT TENANT ENRICHMENT');
  console.log('='.repeat(80));
  console.log('Extracting store directories for Tier 1+2 locations');
  console.log('Using AI-powered Playwright + OpenAI scraper\n');

  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable not set');
  }

  // Load progress
  const progress = loadProgress();
  const isResuming = progress.completed.length > 0;

  if (isResuming) {
    console.log('🔄 RESUMING from previous run');
    console.log(`   Started: ${progress.startTime}`);
    console.log(`   Last saved: ${progress.lastSaved}`);
    console.log(`   Completed: ${progress.completed.length}`);
    console.log(`   Success: ${progress.successCount} | Failed: ${progress.failCount}`);
    console.log(`   Stores added: ${progress.totalStoresAdded}\n`);
  }

  // Get command line argument for tier
  const args = process.argv.slice(2);
  const mode = args[0] || 'tier1'; // tier1, tier2, tier12, test

  let whereClause: any = {
    website: { not: null },
    type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
  };

  let title = '';
  switch (mode) {
    case 'test':
      title = 'TEST MODE - 10 locations';
      whereClause.numberOfStores = { gte: 50 };
      break;
    case 'tier1':
      title = 'TIER 1 - Major Locations (30+ stores)';
      whereClause.numberOfStores = { gte: 30 };
      break;
    case 'tier2':
      title = 'TIER 2 - Medium Locations (15-29 stores)';
      whereClause.numberOfStores = { gte: 15, lt: 30 };
      break;
    case 'tier12':
      title = 'TIER 1+2 - All Major & Medium (15+ stores)';
      whereClause.numberOfStores = { gte: 15 };
      break;
    default:
      console.error('❌ Invalid mode. Use: test, tier1, tier2, or tier12');
      process.exit(1);
  }

  console.log(`🎯 MODE: ${title}\n`);

  // Get all locations matching criteria
  const allLocations = await prisma.location.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      city: true,
      county: true,
      website: true,
      numberOfStores: true,
      _count: { select: { tenants: true } },
    },
    orderBy: { numberOfStores: 'desc' },
    take: mode === 'test' ? 10 : undefined,
  });

  // Filter out already completed or already enriched
  const locations = allLocations.filter((loc) => {
    if (progress.completed.includes(loc.id)) return false;
    
    // Skip if already has good coverage (80%+)
    if (loc.numberOfStores && loc._count.tenants >= loc.numberOfStores * 0.8) {
      console.log(`⏭️  Skipping ${loc.name} - already has ${loc._count.tenants}/${loc.numberOfStores} stores (${Math.round(loc._count.tenants / loc.numberOfStores * 100)}%)`);
      return false;
    }
    
    return true;
  });

  const totalToProcess = locations.length;
  const alreadyCompleted = progress.completed.length;

  console.log('📊 SCOPE:');
  console.log(`   Total matching tier: ${allLocations.length}`);
  console.log(`   Already completed: ${alreadyCompleted}`);
  console.log(`   Already well-enriched: ${allLocations.length - totalToProcess - alreadyCompleted}`);
  console.log(`   Remaining to process: ${totalToProcess}`);
  console.log('');

  if (totalToProcess === 0) {
    console.log('✅ All locations already processed or well-enriched!');
    return;
  }

  // Time estimates
  const estimatedMinutes = Math.ceil((totalToProcess * 5) / 60); // ~5 min per location
  const estimatedHours = (estimatedMinutes / 60).toFixed(1);

  console.log('⏱️  ESTIMATES:');
  console.log(`   Time: ~${estimatedHours} hours (${estimatedMinutes} minutes)`);
  console.log(`   Rate: ~5 minutes per location (8 URL patterns × 60s timeout)`);
  console.log('');

  console.log('📈 PROGRESS TRACKING:');
  console.log(`   Saves every location to: ${PROGRESS_FILE}`);
  console.log(`   Can resume if stopped (Ctrl+C safe)`);
  console.log('');

  console.log('='.repeat(80));
  console.log('Starting in 3 seconds...\n');
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const startTime = Date.now();
  let successCount = progress.successCount;
  let failCount = progress.failCount;
  let totalStoresAdded = progress.totalStoresAdded;

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const overallProgress = alreadyCompleted + i + 1;
    const totalLocations = allLocations.length;
    const progressPercent = ((overallProgress / totalLocations) * 100).toFixed(1);

    console.log('\n' + '='.repeat(80));
    console.log(`[${overallProgress}/${totalLocations}] ${progressPercent}% | ${loc.name} (${loc.city || loc.county})`);
    console.log('='.repeat(80));
    console.log(`   Expected: ${loc.numberOfStores || '?'} | Current in DB: ${loc._count.tenants}`);
    console.log(`   🌐 ${loc.website}`);

    try {
      const result = await findStoreDirectory(loc.website!);

      if (result && result.stores.length > 0) {
        await saveTenants(result.stores, loc.id);
        successCount++;
        totalStoresAdded += result.stores.length;
        
        const coverage = loc.numberOfStores ? Math.round(result.stores.length / loc.numberOfStores * 100) : 0;
        console.log(`   📊 Coverage: ${result.stores.length}/${loc.numberOfStores || '?'} (${coverage}%)`);
      } else {
        console.log(`   ❌ No stores found`);
        failCount++;
      }

      // Mark as completed
      progress.completed.push(loc.id);
      progress.successCount = successCount;
      progress.failCount = failCount;
      progress.totalStoresAdded = totalStoresAdded;
      saveProgress(progress);

      // Progress summary every 10 locations
      if ((i + 1) % 10 === 0 || i === locations.length - 1) {
        const elapsed = Math.round((Date.now() - startTime) / 1000 / 60);
        const rate = ((successCount / (i + 1)) * 100).toFixed(1);

        console.log('');
        console.log(`📊 CHECKPOINT [${elapsed} min elapsed]`);
        console.log(`   ✅ Success: ${successCount} (${rate}%)`);
        console.log(`   ❌ Failed: ${failCount}`);
        console.log(`   🏪 Total stores added: ${totalStoresAdded}`);
        console.log(`   💾 Progress saved`);
        console.log('');
      }

      // Small delay between locations
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      failCount++;
      progress.completed.push(loc.id);
      progress.failCount = failCount;
      saveProgress(progress);
    }
  }

  // Final summary
  const totalElapsed = Math.round((Date.now() - startTime) / 1000 / 60);
  const successRate = ((successCount / totalToProcess) * 100).toFixed(1);

  console.log('\n' + '='.repeat(80));
  console.log('🎉 TENANT ENRICHMENT COMPLETE!');
  console.log('='.repeat(80));
  console.log(`Duration: ${totalElapsed} minutes (${(totalElapsed / 60).toFixed(1)} hours)`);
  console.log(`Processed: ${totalToProcess} locations`);
  console.log(`✅ Success: ${successCount} (${successRate}%)`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`🏪 Total stores added: ${totalStoresAdded}`);
  console.log('');

  // Updated database stats
  const withTenants = await prisma.location.count({
    where: { tenants: { some: {} } },
  });
  const totalTenants = await prisma.tenant.count();

  console.log('📊 UPDATED DATABASE:');
  console.log(`   Locations with tenants: ${withTenants}`);
  console.log(`   Total tenants in database: ${totalTenants}`);
  console.log('');
  console.log('🎯 NEXT STEPS:');
  console.log('   1. Review enriched data in dashboard');
  console.log('   2. Run gap analysis reports');
  console.log('   3. Delete progress file: rm /tmp/tenant-enrichment-progress.json');
}

main()
  .catch((error) => {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

