#!/usr/bin/env tsx
/**
 * 🌐 ENHANCED WEBSITE DISCOVERY
 * Multiple fallback strategies with expanded pattern matching and validation
 */

import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();
const GOOGLE_API_KEY = 'AIzaSyBCNihO0BievjL3qGCfcO1CwEI13SGTrGo';

// Expanded website patterns for UK shopping centers
const WEBSITE_PATTERNS = [
  (name: string) => `https://www.${name.toLowerCase().replace(/\s+/g, '')}.co.uk`,
  (name: string) => `https://www.${name.toLowerCase().replace(/\s+/g, '-')}.co.uk`,
  (name: string) => `https://www.${name.toLowerCase().replace(/\s+/g, '')}.com`,
  (name: string) => `https://${name.toLowerCase().replace(/\s+/g, '')}.co.uk`,
  (name: string) => `https://${name.toLowerCase().replace(/\s+/g, '-')}.co.uk`,
  (name: string) => `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.uk`,
  (name: string) => `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.co.uk`,
];

// Blacklist of low-quality domains
const BLACKLIST_DOMAINS = [
  'wheree.com',
  'parkplaceretail.co.uk',
  'millngate.com',
  'retail-systems.com',
  'wikipedia.org',
  'facebook.com',
  'twitter.com',
  'instagram.com',
  'linkedin.com',
  'youtube.com',
  'tiktok.com',
  'tripadvisor.com',
  'yelp.com',
  'foursquare.com',
];

async function googlePlacesSearch(name: string, city: string, postcode?: string): Promise<string | null> {
  try {
    const query = postcode 
      ? `${name} ${postcode} UK shopping centre`
      : `${name} ${city} UK shopping centre`;
    
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results[0]?.place_id) {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${data.results[0].place_id}&fields=website&key=${GOOGLE_API_KEY}`;
      const detailsResponse = await fetch(detailsUrl);
      const details = await detailsResponse.json();
      
      if (details.result?.website) {
        return details.result.website;
      }
    }
  } catch (error) {
    // Silent fail
  }
  return null;
}

async function googleSearch(name: string, city: string): Promise<string | null> {
  try {
    // Use Google Custom Search API if available, otherwise skip
    // This would require a Custom Search Engine ID
    // For now, we'll skip this method
    return null;
  } catch {
    return null;
  }
}

async function checkWebsiteExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function validateWebsite(url: string, locationName: string): Promise<boolean> {
  // Check if URL is blacklisted
  try {
    const urlObj = new URL(url);
    if (BLACKLIST_DOMAINS.some(domain => urlObj.hostname.includes(domain))) {
      return false;
    }
  } catch {
    return false;
  }
  
  // Fetch and check content
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) return false;
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const text = $('body').text().toLowerCase();
    const title = $('title').text().toLowerCase();
    
    // Check for shopping center indicators
    const shoppingCenterKeywords = [
      'shopping', 'retail', 'stores', 'shops', 'centre', 'center',
      'park', 'mall', 'tenants', 'retailers', 'directory'
    ];
    
    const nameWords = locationName.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const hasNameMatch = nameWords.some(word => title.includes(word) || text.includes(word));
    const hasShoppingKeywords = shoppingCenterKeywords.some(kw => text.includes(kw));
    
    // Must have either name match or shopping keywords
    return hasNameMatch || hasShoppingKeywords;
  } catch {
    return false;
  }
}

async function tryPatternMatching(name: string): Promise<string | null> {
  // Try common patterns
  for (const pattern of WEBSITE_PATTERNS) {
    const url = pattern(name);
    if (await checkWebsiteExists(url)) {
      // Validate it's actually a shopping center website
      if (await validateWebsite(url, name)) {
        return url;
      }
    }
  }
  return null;
}

async function findWebsiteFromSocialMedia(socialLinks: { instagram?: string; facebook?: string }): Promise<string | null> {
  // Sometimes social media pages link to official websites
  // This is a fallback strategy
  if (socialLinks.facebook) {
    try {
      const html = await fetchHTML(socialLinks.facebook);
      if (html) {
        const $ = cheerio.load(html);
        // Look for website link in Facebook page
        $('a[href*="http"]').each((_, elem) => {
          const href = $(elem).attr('href');
          if (href && !href.includes('facebook.com') && !href.includes('instagram.com')) {
            try {
              const url = new URL(href);
              if (url.hostname.includes('.co.uk') || url.hostname.includes('.com')) {
                return href;
              }
            } catch {}
          }
        });
      }
    } catch {}
  }
  return null;
}

async function findWebsite(
  name: string,
  city: string,
  postcode?: string,
  socialLinks?: { instagram?: string; facebook?: string }
): Promise<{ website: string | null; method: string }> {
  // Strategy 1: Google Places API
  let website = await googlePlacesSearch(name, city, postcode);
  if (website && await validateWebsite(website, name)) {
    return { website, method: 'Google Places' };
  }
  
  // Strategy 2: Pattern matching
  website = await tryPatternMatching(name);
  if (website) return { website, method: 'Pattern Match' };
  
  // Strategy 3: Social media fallback
  if (socialLinks) {
    website = await findWebsiteFromSocialMedia(socialLinks);
    if (website && await validateWebsite(website, name)) {
      return { website, method: 'Social Media' };
    }
  }
  
  return { website: null, method: 'Not found' };
}

async function fetchHTML(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

async function main() {
  console.log('\n🌐 ENHANCED WEBSITE DISCOVERY');
  console.log('='.repeat(80));
  console.log('Using multiple fallback strategies with validation\n');
  
  const locations = await prisma.location.findMany({
    where: {
      website: null,
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      NOT: { name: { contains: '(Other)' } },
    },
    select: {
      id: true,
      name: true,
      city: true,
      county: true,
      postcode: true,
      instagram: true,
      facebook: true,
      numberOfStores: true
    },
    orderBy: [{ numberOfStores: 'desc' }, { name: 'asc' }],
  });
  
  console.log(`📊 Found ${locations.length} locations without websites\n`);
  
  let success = 0;
  let failed = 0;
  const methodCounts: Record<string, number> = {};
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const city = loc.city || loc.county;
    
    console.log(`[${i + 1}/${locations.length}] ${loc.name} (${city})`);
    
    const socialLinks = {
      instagram: loc.instagram || undefined,
      facebook: loc.facebook || undefined
    };
    
    const { website, method } = await findWebsite(loc.name, city, loc.postcode || undefined, socialLinks);
    
    if (website) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { website },
      });
      
      console.log(`   ✅ Found: ${website} (${method})`);
      methodCounts[method] = (methodCounts[method] || 0) + 1;
      success++;
    } else {
      console.log(`   ❌ Not found`);
      failed++;
    }
    
    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Progress update every 50
    if ((i + 1) % 50 === 0) {
      console.log(`\n📈 Progress: ${success} found, ${failed} not found`);
      console.log('Methods used:', methodCounts, '\n');
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ ENHANCED WEBSITE DISCOVERY COMPLETE!');
  console.log('='.repeat(80));
  console.log(`Success: ${success}/${locations.length} (${((success / locations.length) * 100).toFixed(1)}%)`);
  console.log('\nMethods breakdown:');
  Object.entries(methodCounts).forEach(([method, count]) => {
    console.log(`  ${method}: ${count}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

