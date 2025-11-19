import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

const HEMPSTEAD_VALLEY_ID = 'cmf3t0bdh01o9k2psjfrf9kxg';

// Anchor tenants
const ANCHOR_TENANTS = ['sainsbury', 'marks & spencer', 'tk maxx', 'home bargain'];

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
  if (name.includes('burger') || name.includes('king') || name.includes('mcdonald') || name.includes('kfc') || name.includes('nando') || name.includes('subway') || name.includes('greggs') || name.includes('bella') || name.includes('frankie') || name.includes('bennys') || name.includes('gdk') || name.includes('doner') || name.includes('boba')) {
    return { category: 'Food & Beverage', subcategory: 'Fast Food & Casual Dining' };
  }
  if (name.includes('sainsbury') || name.includes('supermarket') || name.includes('grocery')) {
    return { category: 'Food & Beverage', subcategory: 'Supermarket' };
  }
  
  // Fashion
  if (name.includes('new look') || name.includes('apricot') || name.includes('roman') || name.includes('yours') || name.includes('tk maxx')) {
    return { category: 'Fashion', subcategory: 'Clothing' };
  }
  
  // Health & Beauty
  if (name.includes('boots') || name.includes('superdrug') || name.includes('perfume') || name.includes('fragrance') || name.includes('body shop') || name.includes('holland') || name.includes('barrett') || name.includes('nail') || name.includes('beauty') || name.includes('spa') || name.includes('hearing')) {
    return { category: 'Health & Beauty', subcategory: name.includes('hearing') ? 'Hearing Care' : 'Pharmacy & Cosmetics' };
  }
  
  // Electronics & Technology
  if (name.includes('ee') || name.includes('o2') || name.includes('three') || name.includes('vodafone') || name.includes('sky') || name.includes('phone')) {
    return { category: 'Electronics', subcategory: 'Mobile & Telecoms' };
  }
  
  // Home & Lifestyle
  if (name.includes('home bargain') || name.includes('poundland') || name.includes('works') || name.includes('card factory') || name.includes('clintons')) {
    return { category: 'Home & Lifestyle', subcategory: 'Variety & Gifts' };
  }
  
  // Jewellery
  if (name.includes('pandora') || name.includes('ernest') || name.includes('samuel') || name.includes('claybrook') || name.includes('warren james')) {
    return { category: 'Jewellery', subcategory: 'Jewellery & Watches' };
  }
  
  // Services
  if (name.includes('travel') || name.includes('tui') || name.includes('hays') || name.includes('timpson') || name.includes('kent reliance') || name.includes('amazon locker') || name.includes('supercut')) {
    return { category: 'Services', subcategory: 'General Services' };
  }
  
  // Health Services
  if (name.includes('optician') || name.includes('vision') || name.includes('leighton') || name.includes('specsavers') || name.includes('therapy')) {
    return { category: 'Health & Beauty', subcategory: 'Health Services' };
  }
  
  // Charity
  if (name.includes('heart foundation') || name.includes('demelza') || name.includes('charity')) {
    return { category: 'Charity', subcategory: 'Charity Shop' };
  }
  
  // Books & Stationery
  if (name.includes('smith') || name.includes('whsmith') || name.includes('book')) {
    return { category: 'Books & Stationery', subcategory: 'Books & Magazines' };
  }
  
  // Default
  return { category: 'Other', subcategory: 'General Retail' };
}

async function main() {
  console.log('📦 Importing Hempstead Valley Shopping Centre tenants...\n');

  // Delete existing tenants
  const deletedCount = await prisma.tenant.deleteMany({
    where: { locationId: HEMPSTEAD_VALLEY_ID },
  });
  console.log(`Deleted ${deletedCount.count} existing tenants\n`);

  // Read retail CSV
  const retailCsvPath = join(process.cwd(), 'public', 'hempsteadvalley.csv');
  const retailCsvContent = readFileSync(retailCsvPath, 'utf-8');
  const retailLines = retailCsvContent.split('\n').slice(1); // Skip header

  // Read F&B CSV
  const fbCsvPath = join(process.cwd(), 'public', 'hempsteadvalley f&b.csv');
  const fbCsvContent = readFileSync(fbCsvPath, 'utf-8');
  const fbLines = fbCsvContent.split('\n').slice(1); // Skip header

  // Parse retail tenants
  const tenants = new Map<string, any>(); // Use Map to avoid duplicates

  console.log('Parsing retail tenants...');
  for (const line of retailLines) {
    if (!line.trim()) continue;
    
    // Parse CSV line - format: "href","image","storeName"
    // The store name is extracted from the URL path
    const match = line.match(/^"([^"]+)","([^"]+)","([^"]*)"$/);
    if (!match) {
      // Try alternative format - extract from URL
      const parts = line.split('","');
      if (parts.length >= 1) {
        const href = parts[0].replace(/^"/, '');
        // Extract store name from URL: https://www.hempsteadvalley.com/store-name
        const urlMatch = href.match(/hempsteadvalley\.com\/([^\/]+)/);
        if (urlMatch) {
          const urlSlug = urlMatch[1];
          // Convert URL slug to readable name (e.g., "amazon-lockers" -> "Amazon Lockers")
          const storeName = urlSlug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          // Skip if it's just "Tel:" or phone number
          if (storeName && !storeName.match(/^Tel:/i) && !storeName.match(/^\d/)) {
            const { category, subcategory } = getCategory(storeName);
            const anchor = isAnchorTenant(storeName);
            tenants.set(storeName, {
              locationId: HEMPSTEAD_VALLEY_ID,
              name: storeName,
              category,
              subcategory,
              isAnchorTenant: anchor,
            });
          }
        }
      }
      continue;
    }
    
    const [, href, image, storeName] = match;
    
    // Extract from URL if storeName is empty or looks like phone number
    let cleanName = storeName.trim();
    if (!cleanName || cleanName.match(/^Tel:/i) || cleanName.match(/^\d/)) {
      const urlMatch = href.match(/hempsteadvalley\.com\/([^\/]+)/);
      if (urlMatch) {
        const urlSlug = urlMatch[1];
        cleanName = urlSlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
    
    if (!cleanName || cleanName.match(/^Tel:/i) || cleanName.match(/^\d/)) continue;

    const { category, subcategory } = getCategory(cleanName);
    const anchor = isAnchorTenant(cleanName);

    tenants.set(cleanName, {
      locationId: HEMPSTEAD_VALLEY_ID,
      name: cleanName,
      category,
      subcategory,
      isAnchorTenant: anchor,
    });
  }

  console.log('Parsing F&B tenants...');
  for (const line of fbLines) {
    if (!line.trim()) continue;
    
    // Parse CSV line - format: "href","image"
    // Extract store name from URL
    const match = line.match(/^"([^"]+)","([^"]+)"$/);
    if (!match) {
      const parts = line.split('","');
      if (parts.length >= 1) {
        const href = parts[0].replace(/^"/, '');
        const urlMatch = href.match(/hempsteadvalley\.com\/([^\/]+)/);
        if (urlMatch) {
          const urlSlug = urlMatch[1];
          const storeName = urlSlug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          if (storeName && !storeName.match(/^Tel:/i) && !storeName.match(/^\d/)) {
            const { category, subcategory } = getCategory(storeName);
            const anchor = isAnchorTenant(storeName);
            tenants.set(storeName, {
              locationId: HEMPSTEAD_VALLEY_ID,
              name: storeName,
              category,
              subcategory,
              isAnchorTenant: anchor,
            });
          }
        }
      }
      continue;
    }
    
    const [, href, image] = match;
    
    // Extract store name from URL
    const urlMatch = href.match(/hempsteadvalley\.com\/([^\/]+)/);
    if (!urlMatch) continue;
    
    const urlSlug = urlMatch[1];
    const cleanName = urlSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    if (!cleanName || cleanName.match(/^Tel:/i) || cleanName.match(/^\d/)) continue;

    const { category, subcategory } = getCategory(cleanName);
    const anchor = isAnchorTenant(cleanName);

    tenants.set(cleanName, {
      locationId: HEMPSTEAD_VALLEY_ID,
      name: cleanName,
      category,
      subcategory,
      isAnchorTenant: anchor,
    });
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
    where: { id: HEMPSTEAD_VALLEY_ID },
    data: {
      numberOfStores: tenants.size,
    },
  });

  console.log(`\n📊 Import Summary:`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total: ${tenants.size}`);
  console.log(`\n✅ Hempstead Valley tenant import completed!\n`);

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });

