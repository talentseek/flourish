import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface Store {
  name: string;
  category?: string;
  subcategory?: string;
  floor?: string;
  unitNumber?: string;
  isAnchor?: boolean;
  url?: string;
}

async function fetchHTML(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    });
    if (!response.ok) return null;
    return await response.text();
  } catch (error) {
    return null;
  }
}

// Find store directory URL from main website
async function findStoreDirectoryUrl(baseUrl: string): Promise<string | null> {
  const html = await fetchHTML(baseUrl);
  if (!html) return null;

  const $ = cheerio.load(html);
  
  // Look for store/shop directory links
  let bestMatch: string | null = null;
  
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().toLowerCase().trim();
    
    // Priority matches
    if (text.includes('shop') && !text.includes('shopping') && !text.includes('online')) {
      bestMatch = href;
      return false; // break
    }
    if (text.includes('store') && !text.includes('app store')) {
      bestMatch = href;
    }
    if (!bestMatch && (text.includes('brand') || text.includes('retailer'))) {
      bestMatch = href;
    }
  });
  
  if (bestMatch) {
    if (bestMatch.startsWith('http')) return bestMatch;
    if (bestMatch.startsWith('/')) return `${new URL(baseUrl).origin}${bestMatch}`;
  }
  
  // Try common paths
  const commonPaths = ['/stores', '/store', '/shops', '/shop', '/brands', '/retailers', '/directory'];
  for (const path of commonPaths) {
    const testUrl = `${new URL(baseUrl).origin}${path}`;
    const response = await fetch(testUrl, { method: 'HEAD' }).catch(() => null);
    if (response && response.ok) return testUrl;
  }
  
  return null;
}

// Extract stores from directory page
async function extractStoresFromPage(url: string): Promise<Store[]> {
  const html = await fetchHTML(url);
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const stores: Store[] = [];
  
  // Pattern 1: Queensgate-style grid
  $('.grid--stores a.card, .store-grid a, .shop-grid a').each((_, el) => {
    const name = $(el).find('.card__title, .store-name, .shop-name, h2, h3, h4').first().text().trim() ||
                 $(el).find('img').first().attr('alt')?.trim() ||
                 $(el).text().trim();
    const link = $(el).attr('href');
    
    if (name && name.length > 2 && name.length < 100) {
      stores.push({ name, url: link });
    }
  });
  
  // Pattern 2: List items
  if (stores.length === 0) {
    $('[class*="store"], [class*="shop"], [class*="brand"], [class*="retail"]').each((_, el) => {
      const $el = $(el);
      const name = $el.find('h2, h3, h4, .title, .name, a').first().text().trim();
      const category = $el.find('[class*="category"]').first().text().trim();
      const link = $el.find('a').first().attr('href');
      
      if (name && name.length > 2 && name.length < 100) {
        stores.push({ name, category: category || undefined, url: link });
      }
    });
  }
  
  // Pattern 3: Simple links with /store/ or /shop/ in URL
  if (stores.length === 0) {
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      
      if ((href.includes('/store/') || href.includes('/shop/') || href.includes('/brand/')) && 
          text.length > 2 && text.length < 100 &&
          !text.toLowerCase().includes('view all') &&
          !text.toLowerCase().includes('back')) {
        stores.push({ name: text, url: href });
      }
    });
  }
  
  return stores;
}

// Auto-categorize store based on name
function autoCategorize(storeName: string): { category: string; subcategory?: string; isAnchor?: boolean } {
  const name = storeName.toLowerCase();
  
  // Anchor tenants (major chains)
  const anchors = ['apple', 'john lewis', 'debenhams', 'house of fraser', 'selfridges', 
                   'marks & spencer', 'm&s', 'next', 'primark', 'h&m', 'zara', 'boots', 'superdrug',
                   'waterstones', 'hmv', 'argos', 'sainsbury', 'tesco', 'asda', 'waitrose'];
  const isAnchor = anchors.some(a => name.includes(a));
  
  // Fashion & Apparel
  if (name.match(/fashion|clothes?|apparel|dress|shoes?|footwear|jeans|suit|boutique/)) {
    return { category: 'Fashion & Apparel', subcategory: 'Clothing', isAnchor };
  }
  if (name.match(/sports?|athletic|fitness|gym|nike|adidas|jd|foot|shoe/)) {
    return { category: 'Sports & Leisure', subcategory: 'Sports Clothing', isAnchor };
  }
  
  // Food & Beverage
  if (name.match(/café|cafe|coffee|costa|starbucks|nero|pret|caffe/)) {
    return { category: 'Food & Beverage', subcategory: 'Coffee Shop', isAnchor };
  }
  if (name.match(/restaurant|dining|grill|kitchen|pizza|burger|noodle|nando|wagamama|five guys/)) {
    return { category: 'Food & Beverage', subcategory: 'Restaurant', isAnchor };
  }
  if (name.match(/food|deli|bakery|greggs|sandwich|subway/)) {
    return { category: 'Food & Beverage', subcategory: 'Fast Food', isAnchor };
  }
  
  // Beauty & Personal Care
  if (name.match(/beauty|cosmetic|makeup|nail|salon|hair|barber|spa|lush|body shop|superdrug|boots/)) {
    return { category: 'Beauty & Personal Care', subcategory: 'Beauty', isAnchor };
  }
  
  // Health & Pharmacy
  if (name.match(/pharmacy|chemist|optician|optical|health|boots|superdrug/)) {
    return { category: 'Health & Pharmacy', subcategory: 'Pharmacy', isAnchor };
  }
  
  // Electronics & Technology
  if (name.match(/phone|mobile|apple|samsung|ee|vodafone|three|o2|carphone|tech|electronic|currys|pc world/)) {
    return { category: 'Electronics & Technology', subcategory: 'Mobile Phones', isAnchor };
  }
  
  // Home & Garden
  if (name.match(/home|furniture|garden|homewares|kitchen|bed|bath|dunelm|ikea|next home/)) {
    return { category: 'Home & Garden', subcategory: 'Homeware', isAnchor };
  }
  
  // Jewelry & Accessories
  if (name.match(/jewel|watch|gold|silver|diamond|ring|accessory|pandora|swarovski/)) {
    return { category: 'Jewelry & Accessories', subcategory: 'Jewelry', isAnchor };
  }
  
  // Books & Entertainment
  if (name.match(/book|waterstones|whsmith|card|gift|hmv|game|music/)) {
    return { category: 'Books & Entertainment', subcategory: 'Books', isAnchor };
  }
  
  // Toys & Children
  if (name.match(/toy|child|kid|baby|disney|smyths|mothercare/)) {
    return { category: 'Toys & Children', subcategory: 'Toys', isAnchor };
  }
  
  // Department Stores
  if (name.match(/department|john lewis|debenhams|house of fraser|selfridges|marks|spencer/)) {
    return { category: 'Department Stores', isAnchor: true };
  }
  
  // Grocery
  if (name.match(/supermarket|grocery|tesco|sainsbury|asda|waitrose|morrisons|aldi|lidl/)) {
    return { category: 'Grocery & Convenience', subcategory: 'Supermarket', isAnchor: true };
  }
  
  // Default
  return { category: 'Other', isAnchor };
}

// Check for pagination and get all pages
async function getAllStorePages(directoryUrl: string): Promise<Store[]> {
  const allStores: Store[] = [];
  let currentPage = 1;
  let hasMore = true;
  
  while (hasMore && currentPage <= 10) { // Max 10 pages to avoid infinite loops
    const pageUrl = currentPage === 1 ? directoryUrl : `${directoryUrl}page/${currentPage}/`;
    console.log(`   Fetching page ${currentPage}...`);
    
    const stores = await extractStoresFromPage(pageUrl);
    if (stores.length === 0) {
      hasMore = false;
    } else {
      allStores.push(...stores);
      currentPage++;
      
      // Check if there's a next page link
      const html = await fetchHTML(pageUrl);
      if (html) {
        const $ = cheerio.load(html);
        hasMore = $('a.next, a[rel="next"], .pagination a').length > 0;
      }
    }
  }
  
  return allStores;
}

async function main() {
  console.log('🏪 STORE DIRECTORY ENRICHMENT\n');
  console.log('This is the CORE enrichment for gap analysis!\n');
  
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
    orderBy: { numberOfStores: 'desc' } // Process largest first
  });
  
  console.log(`📊 Found ${locations.length} shopping centres/retail parks with websites\n`);
  
  // Filter to locations with few or no tenants
  const locationsToEnrich = locations.filter(loc => loc.tenants.length < 10);
  console.log(`🎯 ${locationsToEnrich.length} locations need tenant data\n`);
  
  let successCount = 0;
  let failCount = 0;
  let totalStoresAdded = 0;
  
  for (let i = 0; i < Math.min(locationsToEnrich.length, 50); i++) { // Start with 50 locations as a test
    const loc = locationsToEnrich[i];
    const progress = `[${i + 1}/50]`;
    
    console.log(`\n${progress} ${loc.name} (${loc.city})`);
    console.log(`   Expected stores: ${loc.numberOfStores || '?'}`);
    console.log(`   Current tenants in DB: ${loc.tenants.length}`);
    
    // Find store directory
    const directoryUrl = await findStoreDirectoryUrl(loc.website!);
    if (!directoryUrl) {
      console.log(`   ❌ Could not find store directory`);
      failCount++;
      continue;
    }
    
    console.log(`   📍 Directory: ${directoryUrl}`);
    
    // Extract all stores (with pagination)
    const stores = await getAllStorePages(directoryUrl);
    console.log(`   Found ${stores.length} stores`);
    
    if (stores.length === 0) {
      console.log(`   ❌ No stores extracted`);
      failCount++;
      continue;
    }
    
    // Categorize and save to database
    const categorizedStores = stores.map(store => {
      const { category, subcategory, isAnchor } = autoCategorize(store.name);
      return {
        ...store,
        category: store.category || category,
        subcategory: store.subcategory || subcategory,
        isAnchorTenant: store.isAnchor !== undefined ? store.isAnchor : (isAnchor || false)
      };
    });
    
    // Delete existing tenants and insert new ones
    await prisma.tenant.deleteMany({
      where: { locationId: loc.id }
    });
    
    await prisma.tenant.createMany({
      data: categorizedStores.map(store => ({
        locationId: loc.id,
        name: store.name,
        category: store.category,
        subcategory: store.subcategory || null,
        isAnchorTenant: store.isAnchorTenant,
        floor: null,
        unitNumber: null
      }))
    });
    
    console.log(`   ✅ Added ${stores.length} stores to database`);
    successCount++;
    totalStoresAdded += stores.length;
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('✅ STORE DIRECTORY ENRICHMENT COMPLETE!\n');
  console.log(`   Success: ${successCount}/50`);
  console.log(`   Failed: ${failCount}/50`);
  console.log(`   Total stores added: ${totalStoresAdded}`);
  console.log(`   Avg stores per location: ${(totalStoresAdded/successCount).toFixed(1)}`);
  
  const totalWithTenants = await prisma.location.count({
    where: { tenants: { some: {} } }
  });
  console.log(`\n📊 Locations with tenant data: ${totalWithTenants}/2626 (${(totalWithTenants/2626*100).toFixed(1)}%)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

