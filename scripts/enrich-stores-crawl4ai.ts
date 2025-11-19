import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';
import { writeFile, readFile, unlink } from 'fs/promises';

const prisma = new PrismaClient();

interface Store {
  name: string;
  category?: string;
  subcategory?: string;
  url?: string;
}

// Run Python Playwright + OpenAI script
async function runCrawl4AI(url: string): Promise<Store[]> {
  return new Promise((resolve, reject) => {
    const pythonPath = '/Users/mbeckett/miniconda3/bin/python3'; // Use conda Python that has playwright
    const scriptPath = './scripts/playwright_openai_scraper.py';
    
    const childProcess = spawn(pythonPath, [scriptPath, url], {
      env: { ...process.env, OPENAI_API_KEY: process.env.OPENAI_API_KEY || '' }
    });
    
    let output = '';
    let error = '';

    childProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    childProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    childProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`   ⚠️  Python error: ${error.substring(0, 200)}`);
        resolve([]);
        return;
      }

      try {
        const result = JSON.parse(output);
        if (result.error) {
          console.error(`   ⚠️  Crawl error: ${result.error}`);
          resolve([]);
          return;
        }
        resolve(result);
      } catch (e) {
        console.error(`   ⚠️  Parse error: ${e}`);
        resolve([]);
      }
    });

    // Timeout after 90 seconds
    setTimeout(() => {
      childProcess.kill();
      console.error(`   ⏱️  Timeout after 90s`);
      resolve([]);
    }, 90000);
  });
}

// Auto-categorize if not provided
function autoCategorize(storeName: string): { category: string; subcategory?: string; isAnchor?: boolean } {
  const name = storeName.toLowerCase();
  
  const anchors = ['apple', 'john lewis', 'debenhams', 'house of fraser', 'selfridges', 
                   'marks & spencer', 'm&s', 'next', 'primark', 'h&m', 'zara', 'boots'];
  const isAnchor = anchors.some(a => name.includes(a));
  
  if (name.match(/fashion|clothes?|dress|boutique/)) {
    return { category: 'Fashion & Apparel', subcategory: 'Clothing', isAnchor };
  }
  if (name.match(/café|cafe|coffee|costa|starbucks/)) {
    return { category: 'Food & Beverage', subcategory: 'Coffee Shop', isAnchor };
  }
  if (name.match(/restaurant|dining|grill/)) {
    return { category: 'Food & Beverage', subcategory: 'Restaurant', isAnchor };
  }
  if (name.match(/beauty|cosmetic|salon/)) {
    return { category: 'Beauty & Personal Care', isAnchor };
  }
  if (name.match(/phone|mobile|apple|samsung/)) {
    return { category: 'Electronics & Technology', isAnchor };
  }
  
  return { category: 'Other', isAnchor };
}

async function main() {
  console.log('🤖 CRAWL4AI STORE DIRECTORY ENRICHMENT\n');
  console.log('Using AI-powered extraction for intelligent scraping!\n');
  
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  Warning: OPENAI_API_KEY not set');
    console.log('   Crawl4AI needs an LLM API key for intelligent extraction');
    console.log('   Add to .env: OPENAI_API_KEY=your_key_here\n');
    console.log('   Alternative: Use local LLM (Ollama) - see Crawl4AI docs\n');
    return;
  }
  
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
      numberOfStores: true,
      tenants: { select: { id: true } }
    },
    orderBy: { numberOfStores: 'desc' }
  });
  
  // Run on ALL locations with websites
  const testLocations = locations
    .filter(loc => loc.tenants.length < 10); // Only locations missing tenant data
  
  console.log(`🎯 Running on ${testLocations.length} locations\n`);
  
  let successCount = 0;
  let failCount = 0;
  let totalStoresAdded = 0;
  
  for (let i = 0; i < testLocations.length; i++) {
    const loc = testLocations[i];
    const progress = `[${i + 1}/${testLocations.length}]`;
    
    console.log(`\n${progress} ${loc.name} (${loc.city})`);
    console.log(`   Expected: ${loc.numberOfStores || '?'} stores`);
    console.log(`   🤖 Running AI extraction on ${loc.website}...`);
    
    // Try to find store directory URL first
    const storeUrls = [
      `${loc.website}/stores`,
      `${loc.website}/store`,
      `${loc.website}/shops`,
      `${loc.website}/brands`,
      loc.website
    ];
    
    let stores: Store[] = [];
    for (const testUrl of storeUrls) {
      console.log(`   📍 Trying: ${testUrl}`);
      stores = await runCrawl4AI(testUrl);
      if (stores.length > 5) {
        console.log(`   ✅ Found ${stores.length} stores!`);
        break;
      }
    }
    
    if (stores.length === 0) {
      console.log(`   ❌ No stores extracted`);
      failCount++;
      continue;
    }
    
    // Categorize and save
    const categorizedStores = stores.map(store => {
      const auto = autoCategorize(store.name);
      return {
        locationId: loc.id,
        name: store.name,
        category: store.category || auto.category,
        subcategory: auto.subcategory || null,
        isAnchorTenant: auto.isAnchor || false,
        floor: null,
        unitNumber: null
      };
    });
    
    // Delete existing and insert new
    await prisma.tenant.deleteMany({ where: { locationId: loc.id } });
    await prisma.tenant.createMany({ data: categorizedStores });
    
    console.log(`   ✅ Added ${stores.length} stores to database`);
    successCount++;
    totalStoresAdded += stores.length;
    
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('✅ CRAWL4AI TEST COMPLETE!\n');
  console.log(`   Success: ${successCount}/${testLocations.length}`);
  console.log(`   Failed: ${failCount}/${testLocations.length}`);
  console.log(`   Total stores added: ${totalStoresAdded}`);
  console.log(`   Avg stores per location: ${(totalStoresAdded/Math.max(successCount,1)).toFixed(1)}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

