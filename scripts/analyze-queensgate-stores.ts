import * as cheerio from 'cheerio';

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

async function main() {
  console.log('🏪 ANALYZING QUEENSGATE STORE DIRECTORY\n');
  
  const storeUrl = 'https://queensgate-shopping.co.uk/store/';
  const html = await fetchHTML(storeUrl);
  
  if (!html) {
    console.log('❌ Could not fetch store directory');
    return;
  }
  
  const $ = cheerio.load(html);
  
  console.log('📋 PAGE INFO:\n');
  console.log(`Title: ${$('title').text()}`);
  console.log(`H1: ${$('h1').first().text()}\n`);
  
  // Extract store listings
  const stores: any[] = [];
  
  // Method 1: Look for store cards/items
  $('.store, .shop, [class*="store"], [class*="retail"]').each((_, el) => {
    const name = $(el).find('h2, h3, h4, .title, .name').first().text().trim();
    const category = $(el).find('.category, [class*="category"]').first().text().trim();
    const link = $(el).find('a').first().attr('href');
    
    if (name && name.length > 0 && name.length < 100) {
      stores.push({ name, category, link, method: 'card' });
    }
  });
  
  // Method 2: Look for store links
  if (stores.length === 0) {
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      
      if (href.includes('/store/') && href !== storeUrl && text.length > 2 && text.length < 100) {
        // Skip navigation/common links
        if (!text.toLowerCase().includes('shop') && 
            !text.toLowerCase().includes('back') && 
            !text.toLowerCase().includes('view all')) {
          stores.push({ name: text, link: href, method: 'link' });
        }
      }
    });
  }
  
  console.log(`\n🎯 Found ${stores.length} stores\n`);
  
  if (stores.length > 0) {
    console.log('Sample stores (first 30):\n');
    stores.slice(0, 30).forEach((store, i) => {
      console.log(`${i+1}. ${store.name}`);
      if (store.category) console.log(`   Category: ${store.category}`);
      if (store.link) console.log(`   URL: ${store.link}`);
    });
    
    // Try to fetch a single store page to see structure
    if (stores[0] && stores[0].link) {
      console.log('\n\n📄 ANALYZING INDIVIDUAL STORE PAGE:\n');
      const fullLink = stores[0].link.startsWith('http') ? stores[0].link : `https://queensgate-shopping.co.uk${stores[0].link}`;
      const storePageHtml = await fetchHTML(fullLink);
      
      if (storePageHtml) {
        const $store = cheerio.load(storePageHtml);
        console.log(`Store: ${stores[0].name}`);
        console.log(`URL: ${fullLink}\n`);
        
        // Extract detailed info
        const category = $store('.category, [class*="category"]').first().text().trim();
        const description = $store('.description, [class*="description"], p').first().text().trim().substring(0, 200);
        const floor = $store('[class*="floor"], [class*="level"]').text().trim();
        
        console.log(`Category tags found: ${category || 'None'}`);
        console.log(`Floor info: ${floor || 'None'}`);
        console.log(`Description: ${description || 'None'}\n`);
        
        // Show HTML structure sample
        console.log('HTML structure sample:');
        console.log($store('body').html()?.substring(0, 500));
      }
    }
  } else {
    console.log('❌ No stores found with current patterns\n');
    console.log('Showing page structure for debugging:\n');
    console.log($('body').html()?.substring(0, 1000));
  }
}

main().catch(console.error);

