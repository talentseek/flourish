// Smart website scraper for operational details
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface OperationalData {
  evCharging?: boolean;
  evChargingSpaces?: number;
  carParkPrice?: number;
  publicTransit?: string;
  anchorTenants?: number;
  numberOfFloors?: number;
  openedYear?: number;
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

function extractOperationalData(html: string, locationName: string): OperationalData {
  const $ = cheerio.load(html);
  const data: OperationalData = {};
  
  // Remove scripts and styles for cleaner text analysis
  $('script, style').remove();
  const text = $('body').text().toLowerCase();
  
  // 1. EV Charging Detection
  const evKeywords = [
    'ev charging', 'electric vehicle charging', 'charging points', 
    'ev charge', 'electric car charging', 'charge points',
    'tesla charging', 'ev stations'
  ];
  
  if (evKeywords.some(kw => text.includes(kw))) {
    data.evCharging = true;
    
    // Try to find number of EV charging spaces
    const evSpacesPatterns = [
      /(\d+)\s*(?:ev|electric vehicle|electric car)?\s*charg(?:ing)?\s*(?:points?|spaces?|bays?)/gi,
      /charg(?:ing)?\s*(?:points?|spaces?|bays?).*?(\d+)/gi
    ];
    
    for (const pattern of evSpacesPatterns) {
      const match = text.match(pattern);
      if (match) {
        const numMatch = match[0].match(/\d+/);
        if (numMatch) {
          const num = parseInt(numMatch[0], 10);
          if (num > 0 && num < 500) {
            data.evChargingSpaces = num;
            break;
          }
        }
      }
    }
  }
  
  // 2. Car Park Pricing
  const pricingPatterns = [
    /£(\d+(?:\.\d{2})?)\s*(?:per|an|\/)\s*hour/gi,
    /parking.*?£(\d+(?:\.\d{2})?)/gi,
    /(\d+(?:\.\d{2})?)\s*(?:pound|£).*?hour/gi
  ];
  
  for (const pattern of pricingPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      const priceStr = matches[0][1];
      const price = parseFloat(priceStr);
      if (price > 0 && price < 20) { // Reasonable hourly rate
        data.carParkPrice = price;
        break;
      }
    }
  }
  
  // Check for free parking
  if (!data.carParkPrice && (text.includes('free parking') || text.includes('free car park'))) {
    data.carParkPrice = 0;
  }
  
  // 3. Public Transit Information
  const transitKeywords = [
    { type: 'train', keywords: ['train station', 'railway station', 'rail station'] },
    { type: 'metro', keywords: ['metro station', 'underground station', 'tube station'] },
    { type: 'bus', keywords: ['bus stop', 'bus station', 'bus route', 'bus service'] },
    { type: 'tram', keywords: ['tram stop', 'tram station', 'light rail'] }
  ];
  
  const foundTransit: string[] = [];
  for (const { type, keywords } of transitKeywords) {
    if (keywords.some(kw => text.includes(kw))) {
      foundTransit.push(type);
    }
  }
  
  if (foundTransit.length > 0) {
    data.publicTransit = foundTransit.join(', ');
  }
  
  // 4. Number of Anchor Tenants
  const anchorPatterns = [
    /(\d+)\s*anchor\s*(?:tenant|store)/gi,
    /anchor\s*(?:tenant|store)s?.*?(\d+)/gi
  ];
  
  for (const pattern of anchorPatterns) {
    const match = text.match(pattern);
    if (match) {
      const numMatch = match[0].match(/\d+/);
      if (numMatch) {
        const num = parseInt(numMatch[0], 10);
        if (num > 0 && num < 50) {
          data.anchorTenants = num;
          break;
        }
      }
    }
  }
  
  // Try to find anchor tenant names (count them)
  if (!data.anchorTenants) {
    const anchorSections = [
      'anchor tenants', 'anchor stores', 'key retailers',
      'major stores', 'flagship stores'
    ];
    
    for (const section of anchorSections) {
      const sectionIndex = text.indexOf(section);
      if (sectionIndex !== -1) {
        const afterSection = text.substring(sectionIndex, sectionIndex + 500);
        const commonAnchors = [
          'john lewis', 'marks & spencer', 'debenhams', 'house of fraser',
          'primark', 'next', 'h&m', 'zara', 'topshop', 'boots',
          'waitrose', 'sainsbury', 'tesco', 'asda', 'morrisons'
        ];
        
        const foundAnchors = commonAnchors.filter(anchor => afterSection.includes(anchor));
        if (foundAnchors.length > 0) {
          data.anchorTenants = foundAnchors.length;
          break;
        }
      }
    }
  }
  
  // 5. Number of Floors/Levels
  const floorPatterns = [
    /(\d+)\s*(?:floors?|levels?|storeys?)/gi,
    /(?:over|across)\s*(\d+)\s*(?:floors?|levels?)/gi,
    /(?:floors?|levels?).*?(\d+)/gi
  ];
  
  for (const pattern of floorPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      const numMatch = matches[0][1];
      const num = parseInt(numMatch, 10);
      if (num >= 1 && num <= 10) { // Reasonable floor count
        data.numberOfFloors = num;
        break;
      }
    }
  }
  
  // 6. Opened/Established Year
  const yearPatterns = [
    /opened?\s*(?:in)?\s*(19\d{2}|20\d{2})/gi,
    /established?\s*(?:in)?\s*(19\d{2}|20\d{2})/gi,
    /since\s*(19\d{2}|20\d{2})/gi,
    /built?\s*(?:in)?\s*(19\d{2}|20\d{2})/gi
  ];
  
  for (const pattern of yearPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      const yearStr = matches[0][1];
      const year = parseInt(yearStr, 10);
      if (year >= 1950 && year <= new Date().getFullYear()) {
        data.openedYear = year;
        break;
      }
    }
  }
  
  return data;
}

async function main() {
  console.log('🔍 Smart Operational Details Scraper\n');
  console.log('📦 Fields: EV Charging, Pricing, Transit, Anchors, Floors, Year\n');
  
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
      evCharging: true,
      evChargingSpaces: true,
      carParkPrice: true,
      publicTransit: true,
      anchorTenants: true,
      numberOfFloors: true,
      openedYear: true
    },
    orderBy: { name: 'asc' }
  });
  
  console.log(`📊 Found ${locations.length} locations to process\n`);
  
  let successCount = 0;
  let partialCount = 0;
  let failCount = 0;
  
  const enrichmentResults: Record<string, number> = {
    evCharging: 0,
    evChargingSpaces: 0,
    carParkPrice: 0,
    publicTransit: 0,
    anchorTenants: 0,
    numberOfFloors: 0,
    openedYear: 0
  };
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name} (${loc.city})`);
    
    const html = await fetchHTML(loc.website!);
    
    if (!html) {
      console.log(`   ❌ Failed to fetch website`);
      failCount++;
      continue;
    }
    
    const operationalData = extractOperationalData(html, loc.name);
    
    // Prepare update data (only update if field is currently null/undefined)
    const updateData: any = {};
    const found: string[] = [];
    
    if (operationalData.evCharging !== undefined && loc.evCharging === null) {
      updateData.evCharging = operationalData.evCharging;
      found.push('EV Charging');
      enrichmentResults.evCharging++;
    }
    
    if (operationalData.evChargingSpaces && !loc.evChargingSpaces) {
      updateData.evChargingSpaces = operationalData.evChargingSpaces;
      found.push(`${operationalData.evChargingSpaces} EV spaces`);
      enrichmentResults.evChargingSpaces++;
    }
    
    if (operationalData.carParkPrice !== undefined && loc.carParkPrice === null) {
      updateData.carParkPrice = operationalData.carParkPrice;
      found.push(`Parking: £${operationalData.carParkPrice}/hr`);
      enrichmentResults.carParkPrice++;
    }
    
    if (operationalData.publicTransit && !loc.publicTransit) {
      updateData.publicTransit = operationalData.publicTransit;
      found.push(`Transit: ${operationalData.publicTransit}`);
      enrichmentResults.publicTransit++;
    }
    
    if (operationalData.anchorTenants && !loc.anchorTenants) {
      updateData.anchorTenants = operationalData.anchorTenants;
      found.push(`${operationalData.anchorTenants} anchors`);
      enrichmentResults.anchorTenants++;
    }
    
    if (operationalData.numberOfFloors && !loc.numberOfFloors) {
      updateData.numberOfFloors = operationalData.numberOfFloors;
      found.push(`${operationalData.numberOfFloors} floors`);
      enrichmentResults.numberOfFloors++;
    }
    
    if (operationalData.openedYear && !loc.openedYear) {
      updateData.openedYear = operationalData.openedYear;
      found.push(`Opened: ${operationalData.openedYear}`);
      enrichmentResults.openedYear++;
    }
    
    if (Object.keys(updateData).length > 0) {
      await prisma.location.update({
        where: { id: loc.id },
        data: updateData
      });
      
      console.log(`   ✅ Found: ${found.join(', ')}`);
      if (found.length >= 3) {
        successCount++;
      } else {
        partialCount++;
      }
    } else {
      console.log(`   ℹ️  No new operational data found`);
      failCount++;
    }
    
    // Rate limiting: 1 second between requests
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Progress update every 25 locations
    if ((i + 1) % 25 === 0) {
      console.log(`\n📈 Progress: ${successCount} good finds, ${partialCount} partial, ${failCount} none\n`);
    }
  }
  
  console.log('\n✅ Operational details scraping complete!');
  console.log(`\n📊 Results:`);
  console.log(`   Good finds (3+ fields): ${successCount}/${locations.length}`);
  console.log(`   Partial finds (1-2 fields): ${partialCount}/${locations.length}`);
  console.log(`   No data: ${failCount}/${locations.length}`);
  
  console.log(`\n📝 Fields enriched:`);
  console.log(`   EV Charging: ${enrichmentResults.evCharging}`);
  console.log(`   EV Charging Spaces: ${enrichmentResults.evChargingSpaces}`);
  console.log(`   Car Park Pricing: ${enrichmentResults.carParkPrice}`);
  console.log(`   Public Transit: ${enrichmentResults.publicTransit}`);
  console.log(`   Anchor Tenants: ${enrichmentResults.anchorTenants}`);
  console.log(`   Number of Floors: ${enrichmentResults.numberOfFloors}`);
  console.log(`   Opened Year: ${enrichmentResults.openedYear}`);
  
  console.log(`\n💰 Cost: FREE (web scraping)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

