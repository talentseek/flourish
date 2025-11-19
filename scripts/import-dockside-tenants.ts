import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

const DOCKSIDE_ID = 'cmf3sxrjh00fmk2pscvtqyfd8';

// Anchor tenants
const ANCHOR_TENANTS = ['the range', 'm&s outlet', 'marks & spencer outlet', 'iceland'];

function isAnchorTenant(storeName: string): boolean {
  const nameLower = storeName.toLowerCase();
  return ANCHOR_TENANTS.some(anchor => nameLower.includes(anchor));
}

// Category mapping for tenants
function getCategory(storeName: string): { category: string; subcategory?: string } {
  const name = storeName.toLowerCase();
  
  // Food & Beverage
  if (name.includes('coffee') || name.includes('costa') || name.includes('cafe') || name.includes('café') || name.includes('bakers') || name.includes('barista')) {
    return { category: 'Food & Beverage', subcategory: 'Coffee & Bakery' };
  }
  if (name.includes('burger') || name.includes('king') || name.includes('mcdonald') || name.includes('kfc') || name.includes('nando') || name.includes('subway') || name.includes('pizza') || name.includes('hut') || name.includes('wagamama') || name.includes('zizzi') || name.includes('kaspa') || name.includes('pad thai') || name.includes('panini')) {
    return { category: 'Food & Beverage', subcategory: 'Fast Food & Casual Dining' };
  }
  if (name.includes('iceland') || name.includes('supermarket') || name.includes('grocery')) {
    return { category: 'Food & Beverage', subcategory: 'Supermarket' };
  }
  
  // Fashion
  if (name.includes('choice') || name.includes('roman') || name.includes('klass') || name.includes('cotton trader') || name.includes('class menswear') || name.includes('moss') || name.includes('moda') || name.includes('mountain warehouse') || name.includes('trespass')) {
    return { category: 'Fashion', subcategory: 'Clothing' };
  }
  
  // Health & Beauty
  if (name.includes('beauty') || name.includes('outlet') || name.includes('perfume') || name.includes('fragrance') || name.includes('holland') || name.includes('barrett') || name.includes('nail') || name.includes('luxe') || name.includes('smil') || name.includes('dental') || name.includes('spec') || name.includes('savvy') || name.includes('optician')) {
    return { category: 'Health & Beauty', subcategory: name.includes('dental') || name.includes('optician') ? 'Health Services' : 'Cosmetics & Beauty' };
  }
  
  // Electronics & Technology
  if (name.includes('phone') || name.includes('stand')) {
    return { category: 'Electronics', subcategory: 'Mobile & Telecoms' };
  }
  
  // Home & Lifestyle
  if (name.includes('the range') || name.includes('home plus') || name.includes('works') || name.includes('card factory') || name.includes('gift') || name.includes('bubbleo') || name.includes('tree') || name.includes('top gift')) {
    return { category: 'Home & Lifestyle', subcategory: name.includes('the range') ? 'Department Store' : 'Variety & Gifts' };
  }
  
  // Jewellery
  if (name.includes('claire') || name.includes('claires')) {
    return { category: 'Jewellery', subcategory: 'Accessories' };
  }
  
  // Footwear
  if (name.includes('clark') || name.includes('pavers') || name.includes('moda')) {
    return { category: 'Fashion', subcategory: 'Footwear' };
  }
  
  // Services
  if (name.includes('barclays') || name.includes('bank') || name.includes('timpson') || name.includes('regal') || name.includes('van hire') || name.includes('ability plus') || name.includes('mobility')) {
    return { category: 'Services', subcategory: 'General Services' };
  }
  
  // Leisure
  if (name.includes('odeon') || name.includes('cinema') || name.includes('puregym') || name.includes('gym') || name.includes('ninja') || name.includes('warrior') || name.includes('gymfinity')) {
    return { category: 'Leisure', subcategory: name.includes('gym') ? 'Fitness' : 'Entertainment' };
  }
  
  // Nursery & Education
  if (name.includes('nursery') || name.includes('dockside day')) {
    return { category: 'Services', subcategory: 'Education & Childcare' };
  }
  
  // Luggage & Travel
  if (name.includes('baggage') || name.includes('factory')) {
    return { category: 'Travel', subcategory: 'Luggage' };
  }
  
  // Home & Kitchen
  if (name.includes('pro cook') || name.includes('procook') || name.includes('julian charles') || name.includes('jonas') || name.includes('james')) {
    return { category: 'Home & Lifestyle', subcategory: 'Homewares & Kitchen' };
  }
  
  // Schoolwear
  if (name.includes('monkhouse') || name.includes('school')) {
    return { category: 'Fashion', subcategory: 'Schoolwear' };
  }
  
  // Default
  return { category: 'Other', subcategory: 'General Retail' };
}

async function main() {
  console.log('📦 Importing Dockside Outlet Centre tenants...\n');

  // Delete existing tenants
  const deletedCount = await prisma.tenant.deleteMany({
    where: { locationId: DOCKSIDE_ID },
  });
  console.log(`Deleted ${deletedCount.count} existing tenants\n`);

  // Read retail CSV
  const retailCsvPath = join(process.cwd(), 'public', 'chathamdockside.csv');
  const retailCsvContent = readFileSync(retailCsvPath, 'utf-8');
  const retailLines = retailCsvContent.split('\n').slice(1); // Skip header

  // Read F&B CSV
  const fbCsvPath = join(process.cwd(), 'public', 'chathamdockside f&b.csv');
  const fbCsvContent = readFileSync(fbCsvPath, 'utf-8');
  const fbLines = fbCsvContent.split('\n').slice(1); // Skip header

  // Parse tenants
  const tenants = new Map<string, any>(); // Use Map to avoid duplicates

  console.log('Parsing retail tenants...');
  for (const line of retailLines) {
    if (!line.trim()) continue;
    
    // Parse CSV line - format has many columns, store name is in "brand__title" column (3rd column)
    // Format: "image","image_html","brand__title","info",...
    const parts = line.split('","');
    if (parts.length >= 3) {
      // Extract store name from brand__title column
      const storeName = parts[2].replace(/^"|"$/g, '').trim();
      if (storeName && storeName !== 'brand__title') {
        const { category, subcategory } = getCategory(storeName);
        const anchor = isAnchorTenant(storeName);
        tenants.set(storeName, {
          locationId: DOCKSIDE_ID,
          name: storeName,
          category,
          subcategory,
          isAnchorTenant: anchor,
        });
      }
    }
  }

  console.log('Parsing F&B tenants...');
  for (const line of fbLines) {
    if (!line.trim()) continue;
    
    // Parse CSV line - format has many columns, store name is in "brand__title" column (3rd column)
    const parts = line.split('","');
    if (parts.length >= 3) {
      const storeName = parts[2].replace(/^"|"$/g, '').trim();
      if (storeName && storeName !== 'brand__title') {
        const { category, subcategory } = getCategory(storeName);
        const anchor = isAnchorTenant(storeName);
        tenants.set(storeName, {
          locationId: DOCKSIDE_ID,
          name: storeName,
          category,
          subcategory,
          isAnchorTenant: anchor,
        });
      }
    }
  }

  console.log(`\nFound ${tenants.size} unique tenants to import\n`);

  // Create tenants
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const tenant of tenants.values()) {
    try {
      await prisma.tenant.create({
        data: tenant,
      });
      console.log(`  ✅ ${tenant.name}${tenant.isAnchorTenant ? ' (Anchor)' : ''} - ${tenant.category}`);
      created++;
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`  ⚠️  ${tenant.name} - Already exists (skipping)`);
        skipped++;
      } else {
        console.error(`  ❌ ${tenant.name} - Error: ${error.message}`);
        errors++;
      }
    }
  }

  // Update location store count
  await prisma.location.update({
    where: { id: DOCKSIDE_ID },
    data: {
      numberOfStores: tenants.size,
    },
  });

  console.log(`\n📊 Import Summary:`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total: ${tenants.size}`);
  console.log(`\n✅ Dockside Outlet tenant import completed!\n`);

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });

