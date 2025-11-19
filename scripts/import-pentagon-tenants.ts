import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

const PENTAGON_ID = 'cmf3t0w3r01ybk2psq0u20lxp';

// Category mapping for tenants
function getCategory(storeName: string): { category: string; subcategory?: string } {
  const name = storeName.toLowerCase();
  
  // Food & Beverage
  if (name.includes('coffee') || name.includes('muffin') || name.includes('cafe') || name.includes('café')) {
    return { category: 'Food & Beverage', subcategory: 'Coffee & Bakery' };
  }
  if (name.includes('subway') || name.includes('burger') || name.includes('noodle') || name.includes('chopstix')) {
    return { category: 'Food & Beverage', subcategory: 'Fast Food' };
  }
  if (name.includes('sainsbury') || name.includes('supermarket') || name.includes('grocery')) {
    return { category: 'Food & Beverage', subcategory: 'Supermarket' };
  }
  
  // Health & Beauty
  if (name.includes('boots') || name.includes('superdrug') || name.includes('pharmacy')) {
    return { category: 'Health & Beauty', subcategory: 'Pharmacy' };
  }
  if (name.includes('tanning') || name.includes('sunshine') || name.includes('barber') || name.includes('hairdressing')) {
    return { category: 'Health & Beauty', subcategory: 'Personal Care' };
  }
  
  // Fashion
  if (name.includes('new look') || name.includes('deichmann') || name.includes('foot locker') || name.includes('jd') || name.includes('select')) {
    return { category: 'Fashion', subcategory: 'Clothing & Footwear' };
  }
  if (name.includes('pandora') || name.includes('warren james') || name.includes('jewellery') || name.includes('jewelry')) {
    return { category: 'Fashion', subcategory: 'Jewellery' };
  }
  
  // Electronics & Technology
  if (name.includes('ee') || name.includes('o2') || name.includes('three') || name.includes('vodafone') || name.includes('fone world')) {
    return { category: 'Electronics & Technology', subcategory: 'Mobile Phones' };
  }
  if (name.includes('game') || name.includes('cex') || name.includes('warhammer')) {
    return { category: 'Electronics & Technology', subcategory: 'Gaming & Entertainment' };
  }
  
  // Leisure & Entertainment
  if (name.includes('bowl') || name.includes('bowling')) {
    return { category: 'Leisure & Entertainment', subcategory: 'Bowling' };
  }
  if (name.includes('warhammer') || name.includes('toys') || name.includes('entertainer')) {
    return { category: 'Leisure & Entertainment', subcategory: 'Hobbies & Toys' };
  }
  
  // Services
  if (name.includes('adecco') || name.includes('recruitment')) {
    return { category: 'Services', subcategory: 'Recruitment' };
  }
  if (name.includes('robinson') || name.includes('jackson') || name.includes('estate')) {
    return { category: 'Services', subcategory: 'Estate Agents' };
  }
  if (name.includes('timpson') || name.includes('key cutting') || name.includes('shoe repair')) {
    return { category: 'Services', subcategory: 'Key Cutting & Shoe Repair' };
  }
  if (name.includes('ramsdens') || name.includes('pawn') || name.includes('jewellery')) {
    return { category: 'Services', subcategory: 'Pawnbrokers' };
  }
  if (name.includes('coral') || name.includes('betting')) {
    return { category: 'Services', subcategory: 'Betting' };
  }
  
  // General Retail
  if (name.includes('poundland') || name.includes('pep&co') || name.includes('pepco')) {
    return { category: 'General Retail', subcategory: 'Discount Store' };
  }
  if (name.includes('card factory') || name.includes('works') || name.includes('fragrance')) {
    return { category: 'General Retail', subcategory: 'Gifts & Cards' };
  }
  if (name.includes('british heart foundation') || name.includes('charity')) {
    return { category: 'General Retail', subcategory: 'Charity Shop' };
  }
  
  // Co-working
  if (name.includes('ascend') || name.includes('co-working') || name.includes('coworking')) {
    return { category: 'Services', subcategory: 'Co-working' };
  }
  
  // Default
  return { category: 'General Retail', subcategory: 'Other' };
}

// Anchor tenants
const ANCHOR_TENANTS = ['sainsbury', 'boots', 'new look', 'superdrug'];

function isAnchorTenant(storeName: string): boolean {
  const nameLower = storeName.toLowerCase();
  return ANCHOR_TENANTS.some(anchor => 
    nameLower.includes(anchor)
  );
}

async function main() {
  console.log('📦 Importing Pentagon Shopping Centre tenants...\n');

  // Read CSV file
  const csvPath = join(process.cwd(), 'public', 'pentagonshoppingcentre.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');
  
  // Parse CSV (skip header)
  const lines = csvContent.split('\n').slice(1).filter(line => line.trim());
  
  console.log(`Found ${lines.length} stores in CSV\n`);

  // Delete existing tenants for Pentagon
  const deletedCount = await prisma.tenant.deleteMany({
    where: { locationId: PENTAGON_ID },
  });
  console.log(`🗑️  Deleted ${deletedCount.count} existing tenants\n`);

  // Parse and create tenants
  const tenants = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Parse CSV line - handle quoted values properly
    // Pattern: "url","Store Name" or "url","Store Name with quotes"
    // Use a more flexible regex that handles escaped quotes
    const csvRegex = /^"([^"]*(?:""[^"]*)*)","([^"]*(?:""[^"]*)*)"$/;
    const match = line.match(csvRegex);
    
    if (!match) {
      // Try simpler split approach as fallback
      const parts = line.split('","');
      if (parts.length >= 2) {
        const storeName = parts[1].replace(/^"|"$/g, '').replace(/""/g, '"').trim();
        if (storeName) {
          const { category, subcategory } = getCategory(storeName);
          const anchor = isAnchorTenant(storeName);
          tenants.push({
            locationId: PENTAGON_ID,
            name: storeName,
            category,
            subcategory,
            isAnchorTenant: anchor,
          });
        }
      } else {
        console.log(`⚠️  Skipping malformed line: ${line.substring(0, 50)}...`);
      }
      continue;
    }
    
    const [, href, storeName] = match;
    // Remove escaped quotes and trim
    const cleanName = storeName.replace(/""/g, '"').trim();
    
    if (!cleanName) {
      continue;
    }

    const { category, subcategory } = getCategory(cleanName);
    const anchor = isAnchorTenant(cleanName);

    tenants.push({
      locationId: PENTAGON_ID,
      name: cleanName,
      category,
      subcategory,
      isAnchorTenant: anchor,
    });
  }
  
  console.log(`Parsed ${tenants.length} tenants from CSV\n`);

  console.log(`📝 Creating ${tenants.length} tenants...\n`);

  // Create tenants in batches
  for (const tenant of tenants) {
    try {
      await prisma.tenant.create({
        data: tenant,
      });
      console.log(`  ✅ ${tenant.name}${tenant.isAnchorTenant ? ' (Anchor)' : ''} - ${tenant.category}`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`  ⚠️  ${tenant.name} - Already exists (skipping)`);
      } else {
        console.error(`  ❌ ${tenant.name} - Error: ${error.message}`);
      }
    }
  }

  // Count by category
  const categoryCounts: Record<string, number> = {};
  tenants.forEach(t => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  console.log('\n📊 Summary by Category:');
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });

  const anchorCount = tenants.filter(t => t.isAnchorTenant).length;
  console.log(`\n   Anchor Tenants: ${anchorCount}`);

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });

