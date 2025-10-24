// Find and save website URLs with STRICT validation
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GOOGLE_API_KEY = 'AIzaSyBCNihO0BievjL3qGCfcO1CwEI13SGTrGo';
const GOOGLE_CX = '912bb0d0e10cf4d71';

interface SearchResult {
  items?: Array<{
    link: string;
    title: string;
    snippet: string;
    displayLink: string;
  }>;
}

// Blacklist of domains to NEVER accept
const BLACKLIST_DOMAINS = [
  // Retailers & Store Locators
  'petsathome.com', 'bmstores.co.uk', 'timhortons.co.uk', 'costa.co.uk', 
  'poundstretcher.co.uk', 'boots.com', 'aldi.co.uk', 'tesco.com', 'sainsburys.co.uk',
  'asda.com', 'morrisons.com', 'lidl.co.uk', 'waitrose.com', 'marks-and-spencer.com',
  'primark.com', 'next.co.uk', 'hm.com', 'zara.com', 'tkmaxx.com',
  // Hotels & Travel
  'premierinn.com', 'travelodge.co.uk', 'expedia.com', 'booking.com', 'tripadvisor',
  'hotels.com', 'airbnb.com',
  // News & Media
  'bbc.com', 'bbc.co.uk', 'theguardian.com', 'dailymail.co.uk', 'telegraph.co.uk',
  'independent.co.uk', 'mirror.co.uk', 'express.co.uk', 'lancs.live', 'walesonline.co.uk',
  'manchestereveningnews.co.uk', 'liverpoolecho.co.uk', 'nottinghampost.com',
  'retail-systems.com', 'retailtimes.co.uk',
  // Social Media & Forums
  'facebook.com', 'instagram.com', 'twitter.com', 'reddit.com', 'youtube.com',
  'tiktok.com', 'linkedin.com',
  // Reference & Wikis
  'wikipedia.org', 'wikimedia.org', 'wikidata.org',
  // Maps & Directories
  'google.com', 'maps.google.com', 'apple.com', 'yell.com', '192.com', 'yelp.com',
  'foursquare.com', 'google.com/maps',
  // Real Estate & Property (Developers, Portfolio Sites, etc)
  'rightmove.co.uk', 'zoopla.co.uk', 'onthemarket.com', 'savills.com', 'cbre.com',
  'jll.co.uk', 'allsop.co.uk', 'cushmanwakefield.com', 'millngate.com', 'clowes.co.uk',
  'legallais.co.uk', 'fhp.co.uk', 'parkplaceretail.co.uk', 'redcatchquarter.com',
  // Low-Quality Directory Sites
  'wheree.com', 'completelyretail.co.uk',
  // Healthcare & Other Services
  'nhs.uk', 'parkhousemedicalcentre.co.uk', 'icatcare.org',
  // Other
  'amazon.co.uk', 'ebay.co.uk', 'gumtree.com', 'gov.uk',
  'mapcarta.com', 'alamy.com', 'pinterest.com', 'skyscrapercity.com',
  // File hosting
  'amazonaws.com', 'cloudinary.com', 'dropbox.com',
  // Generic store/tenant locators
  'stores.', 'find-a-store', 'store-locator', 'find-us', 'branches.',
  'retailers.', 'stockists', 'locations/', '/stores/', '/find-',
];

// Keywords that suggest it's an official site
const POSITIVE_KEYWORDS = [
  'shopping', 'retail', 'centre', 'center', 'mall', 'park', 'square',
  'plaza', 'arcade', 'walk', 'place', 'quarter', 'yard', 'gate',
  'court', 'village', 'outlet', 'complex'
];

function isBlacklisted(url: string): boolean {
  const urlLower = url.toLowerCase();
  return BLACKLIST_DOMAINS.some(domain => urlLower.includes(domain));
}

function scoreDomain(url: string, locationName: string): number {
  let score = 0;
  const urlLower = url.toLowerCase();
  const domainMatch = url.match(/^https?:\/\/(?:www\.)?([^\/]+)/);
  if (!domainMatch) return 0;
  
  const domain = domainMatch[1].toLowerCase();
  
  // Remove common words for better matching
  const cleanLocationName = locationName
    .toLowerCase()
    .replace(/shopping centre|retail park|shopping center|the |shopping |centre |center /g, '')
    .replace(/[^a-z0-9]/g, '');
  
  // High score: Domain contains location name
  if (cleanLocationName.length > 3 && domain.includes(cleanLocationName)) {
    score += 50;
  }
  
  // High score: Domain has positive keywords
  const positiveCount = POSITIVE_KEYWORDS.filter(kw => domain.includes(kw)).length;
  score += positiveCount * 10;
  
  // Medium score: Clean, dedicated domain (not a path or subdomain)
  if (!domain.includes('.') || domain.split('.').length === 2) {
    score += 5;
  }
  
  // Negative: Has paths that suggest it's not the main site
  if (urlLower.includes('/stores/') || urlLower.includes('/locations/') || 
      urlLower.includes('/find-') || urlLower.includes('store-locator')) {
    score -= 30;
  }
  
  // Negative: PDF or document
  if (urlLower.endsWith('.pdf') || urlLower.includes('/documents/')) {
    score -= 40;
  }
  
  // Negative: News article
  if (urlLower.includes('/news/') || urlLower.includes('/article/')) {
    score -= 40;
  }
  
  return score;
}

async function searchWebsite(locationName: string, city: string): Promise<string | null> {
  const query = `"${locationName}" ${city} official website`;
  const url = new URL('https://www.googleapis.com/customsearch/v1');
  url.searchParams.set('key', GOOGLE_API_KEY);
  url.searchParams.set('cx', GOOGLE_CX);
  url.searchParams.set('q', query);
  url.searchParams.set('num', '10'); // Get more results to choose from

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      if (response.status === 429) {
        console.log('      ⚠️  Rate limit hit, waiting 60s...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        return searchWebsite(locationName, city); // Retry
      }
      console.error(`      ❌ API Error: ${response.status}`);
      return null;
    }

    const data: SearchResult = await response.json();
    
    if (data.items && data.items.length > 0) {
      // Score and filter all results
      const candidates = data.items
        .filter(item => !isBlacklisted(item.link))
        .map(item => ({
          url: item.link,
          score: scoreDomain(item.link, locationName),
          title: item.title
        }))
        .filter(c => c.score > 0) // Only positive scores
        .sort((a, b) => b.score - a.score); // Best first
      
      if (candidates.length > 0) {
        const best = candidates[0];
        console.log(`      📊 Best match (score: ${best.score}): ${best.url}`);
        
        // Only accept if score is high enough
        if (best.score >= 15) {
          return best.url;
        } else {
          console.log(`      ⚠️  Score too low (${best.score} < 15), rejecting`);
          return null;
        }
      }
    }
    return null;
  } catch (error) {
    console.error(`      ❌ Error: ${error}`);
    return null;
  }
}

async function main() {
  console.log('🌐 Enriching location websites (v2 - strict validation)\n');

  // Get locations needing websites
  const locations = await prisma.location.findMany({
    where: {
      website: null,
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      NOT: { name: { contains: '(Other)' } }
    },
    select: { id: true, name: true, city: true },
    orderBy: { name: 'asc' }
  });

  console.log(`📊 Processing ${locations.length} locations\n`);
  console.log('🔍 Using strict validation:\n');
  console.log('  ✅ Official shopping centre/retail park domains');
  console.log('  ❌ Store locators, news, social, travel, real estate');
  console.log('  📊 Minimum score: 15 points\n');
  console.log('⏱️  Estimated time: ~50 minutes\n');
  console.log('💰 Estimated cost: ~$10\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name}, ${loc.city}`);

    const website = await searchWebsite(loc.name, loc.city);

    if (website) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { website }
      });
      console.log(`      ✅ Accepted: ${website}`);
      successCount++;
    } else {
      console.log(`      ❌ No valid website found`);
      failCount++;
    }

    // Rate limiting
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Progress update every 50 locations
    if ((i + 1) % 50 === 0) {
      console.log(`\n📈 Progress: ${successCount} found, ${failCount} not found (${i + 1}/${locations.length})\n`);
    }
  }

  console.log('\n✅ Website enrichment complete!');
  console.log(`   Success: ${successCount}/${locations.length} (${(successCount/locations.length*100).toFixed(1)}%)`);
  console.log(`   Failed: ${failCount}/${locations.length}`);
  console.log('\n🎉 Quality official websites found for enrichment!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

