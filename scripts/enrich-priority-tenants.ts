import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';

const prisma = new PrismaClient();

interface Store {
  name: string;
  category?: string;
  subcategory?: string;
  url?: string;
}

const PRIORITY_NAMES = [
  'Broadway Shopping Centre',
  'Martlets',
  'Lion Yard',
  'Pentagon Shopping Centre',
  'Priory Shopping Centre',
  'Orchard Centre',
  'Swan Centre',
  'Royal Exchange',
  'Aylesham Centre',
  'Putney Exchange',
  'Touchwood',
  'Christopher Place',
  'Newlands',
  'One Stop Shopping Centre',
  'Marlands',
];

// Run Python Playwright + OpenAI script
async function runCrawl4AI(url: string, locationName: string): Promise<Store[]> {
  return new Promise((resolve) => {
    const pythonPath = '/Users/mbeckett/miniconda3/bin/python3';
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

    // Timeout after 120 seconds for priority locations (they may be larger)
    setTimeout(() => {
      childProcess.kill();
      console.error(`   ⏱️  Timeout after 120s`);
      resolve([]);
    }, 120000);
  });
}

// Auto-categorize if not provided
function autoCategorize(storeName: string): { category: string; subcategory?: string; isAnchor?: boolean } {
  const name = storeName.toLowerCase();
  
  const anchors = ['apple', 'john lewis', 'debenhams', 'house of fraser', 'selfridges', 
                   'marks & spencer', 'm&s', 'next', 'primark', 'h&m', 'zara', 'boots',
                   'topshop', 'waitrose', 'sainsbury', 'tesco'];
  const isAnchor = anchors.some(a => name.includes(a));
  
  if (name.match(/fashion|clothes?|dress|boutique|apparel|wear/i)) {
    return { category: 'Fashion & Apparel', subcategory: 'Clothing', isAnchor };
  }
  if (name.match(/café|cafe|coffee|costa|starbucks|nero/i)) {
    return { category: 'Food & Beverage', subcategory: 'Coffee Shop', isAnchor };
  }
  if (name.match(/restaurant|dining|grill|eatery|kitchen/i)) {
    return { category: 'Food & Beverage', subcategory: 'Restaurant', isAnchor };
  }
  if (name.match(/beauty|cosmetic|salon|spa|nails/i)) {
    return { category: 'Beauty & Personal Care', isAnchor };
  }
  if (name.match(/phone|mobile|apple|samsung|tech|electronic/i)) {
    return { category: 'Electronics & Technology', isAnchor };
  }
  if (name.match(/jewelry|jewellery|watches/i)) {
    return { category: 'Jewelry & Accessories', isAnchor };
  }
  if (name.match(/home|furniture|homeware/i)) {
    return { category: 'Home & Garden', isAnchor };
  }
  if (name.match(/bank|atm|post office/i)) {
    return { category: 'Financial Services', isAnchor: false };
  }
  if (name.match(/book|card|stationery/i)) {
    return { category: 'Books & Stationery', isAnchor };
  }
  
  return { category: 'Other', isAnchor };
}

async function main() {
  console.log('🎯 PRIORITY LOCATIONS TENANT ENRICHMENT\n');
  console.log('Running AI-powered store directory extraction on YOUR priority locations!\n');
  
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  Warning: OPENAI_API_KEY not set');
    console.log('   Set with: export OPENAI_API_KEY=your_key_here\n');
    return;
  }
  
  const locations = await prisma.location.findMany({
    where: {
      website: { not: null },
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      OR: PRIORITY_NAMES.map(name => ({
        name: {
          contains: name.replace(' Shopping Centre', '').replace(' Center', ''),
          mode: 'insensitive' as const,
        },
      })),
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
  
  console.log(`🎯 Found ${locations.length} priority locations with websites\n`);
  
  locations.forEach((loc, i) => {
    console.log(`   ${i + 1}. ${loc.name} (${loc.city}) - ${loc.numberOfStores || '?'} stores expected, ${loc.tenants.length} in DB`);
  });
  
  console.log('\n\nStarting extraction...\n');
  
  let successCount = 0;
  let failCount = 0;
  let totalStoresAdded = 0;
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${progress} ${loc.name} (${loc.city})`);
    console.log(`${'='.repeat(80)}`);
    console.log(`   Expected: ${loc.numberOfStores || '?'} stores | Current in DB: ${loc.tenants.length}`);
    console.log(`   🤖 Running AI extraction on ${loc.website}...`);
    
    // Try multiple common store directory URL patterns
    const baseUrl = loc.website!.replace(/\/$/, '');
    const storeUrls = [
      `${baseUrl}/stores`,
      `${baseUrl}/store-directory`,
      `${baseUrl}/shops`,
      `${baseUrl}/brands`,
      `${baseUrl}/retailers`,
      `${baseUrl}/directory`,
      `${baseUrl}/store-finder`,
      baseUrl // Fallback to homepage
    ];
    
    let stores: Store[] = [];
    let successUrl = '';
    
    for (const testUrl of storeUrls) {
      console.log(`   📍 Trying: ${testUrl.replace(baseUrl, '...')}`);
      stores = await runCrawl4AI(testUrl, loc.name);
      
      if (stores.length >= 5) {
        console.log(`   ✅ SUCCESS! Found ${stores.length} stores`);
        successUrl = testUrl;
        break;
      } else if (stores.length > 0) {
        console.log(`   ⚠️  Only found ${stores.length} stores (may be insufficient)`);
      }
    }
    
    if (stores.length === 0) {
      console.log(`   ❌ FAILED: No stores extracted from any URL`);
      console.log(`   💡 Manual check needed: ${baseUrl}`);
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
    
    // Delete existing and insert new (fresh data is better)
    const deleted = await prisma.tenant.deleteMany({ where: { locationId: loc.id } });
    if (deleted.count > 0) {
      console.log(`   🗑️  Removed ${deleted.count} old entries`);
    }
    
    await prisma.tenant.createMany({ data: categorizedStores });
    
    console.log(`   ✅ Added ${stores.length} stores to database`);
    console.log(`   🏬 Categories: ${[...new Set(categorizedStores.map(s => s.category))].join(', ')}`);
    console.log(`   ⭐ Anchor tenants: ${categorizedStores.filter(s => s.isAnchorTenant).length}`);
    
    successCount++;
    totalStoresAdded += stores.length;
    
    // Rate limiting
    console.log(`   ⏱️  Waiting 3s before next location...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n\n' + '='.repeat(80));
  console.log('🎉 PRIORITY TENANT ENRICHMENT COMPLETE!');
  console.log('='.repeat(80));
  console.log(`\n   ✅ Success: ${successCount}/${locations.length} locations`);
  console.log(`   ❌ Failed: ${failCount}/${locations.length} locations`);
  console.log(`   🏬 Total stores added: ${totalStoresAdded}`);
  console.log(`   📊 Avg stores per location: ${(totalStoresAdded/Math.max(successCount,1)).toFixed(1)}`);
  
  if (failCount > 0) {
    console.log('\n   ⚠️  Failed locations need manual store directory URLs');
    console.log('   💡 Check each website for "Stores" or "Directory" pages');
  }
  
  console.log('\n✅ Your priority locations are now ready for meetings!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

