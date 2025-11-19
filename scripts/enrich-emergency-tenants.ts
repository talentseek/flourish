#!/usr/bin/env tsx
/**
 * 🚨 EMERGENCY TENANT ENRICHMENT
 * Fast targeted enrichment for client demo
 * Uses the WORKING method from enrich-tenants-overnight.ts
 */

import { spawn } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PYTHON_PATH = '/Users/mbeckett/miniconda3/bin/python3';

interface TenantData {
  name: string;
  category?: string;
  url?: string;
  isAnchorTenant?: boolean;
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

    child.stderr.on('data', (data) => {
      // Ignore stderr
    });

    child.on('close', (code) => {
      if (code === 0 && output.trim()) {
        try {
          // Try to parse as JSON array directly
          const stores = JSON.parse(output.trim());
          if (Array.isArray(stores)) {
            resolve(stores);
            return;
          }
        } catch {
          // If direct parse fails, look for [STORES_START] markers
          try {
            const match = output.match(/\[STORES_START\](.*?)\[STORES_END\]/s);
            if (match) {
              const stores = JSON.parse(match[1]);
              resolve(stores);
              return;
            }
          } catch {
            // Parse error
          }
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

async function main() {
  console.log('\n🚨 EMERGENCY TENANT ENRICHMENT FOR CLIENT DEMO');
  console.log('='.repeat(80));
  console.log('Target: High-priority locations without tenant data\n');

  // Get locations with 15+ stores, websites, but NO tenants
  const locations = await prisma.location.findMany({
    where: {
      website: { not: null },
      tenants: { none: {} },
      numberOfStores: { gte: 15 },
    },
    select: { id: true, name: true, website: true, numberOfStores: true },
    orderBy: { numberOfStores: 'desc' },
    take: 100, // Top 100 priority locations
  });

  console.log(`📊 Found ${locations.length} high-priority locations\n`);
  console.log(`⏱️  Estimated time: ${Math.ceil(locations.length * 1.2)} minutes\n`);

  let success = 0;
  let failed = 0;
  let totalStores = 0;

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];

    console.log(`[${i + 1}/${locations.length}] ${loc.name}`);

    if (!loc.website) {
      console.log(`   ⚠️  No website`);
      failed++;
      continue;
    }

    const stores = await scrapeStores(loc.website);

    if (stores.length > 0) {
      // Save to database
      let saved = 0;
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
        } catch (error) {
          // Skip duplicates
        }
      }

      console.log(`   ✅ Found ${stores.length} stores, saved ${saved}`);
      totalStores += saved;
      success++;
    } else {
      console.log(`   ❌ No stores found`);
      failed++;
    }

    // Progress checkpoint every 10
    if ((i + 1) % 10 === 0) {
      console.log(`\n📊 CHECKPOINT [${i + 1}/${locations.length}]`);
      console.log(`   Success: ${success} | Failed: ${failed}`);
      console.log(`   Total stores added: ${totalStores}\n`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('🎉 EMERGENCY ENRICHMENT COMPLETE!');
  console.log('='.repeat(80));
  console.log(`Success: ${success}/${locations.length} (${((success / locations.length) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failed}/${locations.length}`);
  console.log(`Total stores added: ${totalStores}\n`);

  // Get updated stats
  const stats = await prisma.$transaction([
    prisma.location.count({ where: { tenants: { some: {} } } }),
    prisma.tenant.count(),
  ]);

  console.log('📊 UPDATED DATABASE:');
  console.log(`   Locations with tenants: ${stats[0]}`);
  console.log(`   Total tenants: ${stats[1]}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

