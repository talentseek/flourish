import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

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

interface OperationalData {
  carParkPrice?: string;
  evCharging?: boolean;
  evChargingSpaces?: number;
  numberOfFloors?: number;
  publicTransit?: string;
  openedYear?: number;
}

async function scrapeOperationalDetails(website: string): Promise<OperationalData> {
  const data: OperationalData = {};
  
  try {
    const response = await axios.get(website, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DataEnrichmentBot/1.0)',
      },
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    const text = $.text().toLowerCase();
    
    // EV Charging detection
    if (text.match(/ev charg|electric vehicle charg|electric car charg/i)) {
      data.evCharging = true;
      
      // Try to extract number of EV spaces
      const evMatch = text.match(/(\d+)\s*(?:ev|electric)\s*(?:charging\s*)?(?:point|space|bay)/i);
      if (evMatch) {
        data.evChargingSpaces = parseInt(evMatch[1]);
      }
    }
    
    // Parking price detection
    const parkingPatterns = [
      /parking[:\s]*£(\d+(?:\.\d{2})?)\s*(?:per\s*hour)?/i,
      /£(\d+(?:\.\d{2})?)\s*(?:per\s*hour|\/hour|ph)/i,
      /first\s*(\d+)\s*hours?\s*free/i,
      /free\s*parking/i,
      /(\d+)\s*hours?\s*free/i,
    ];
    
    for (const pattern of parkingPatterns) {
      const match = text.match(pattern);
      if (match) {
        if (pattern.source.includes('free')) {
          data.carParkPrice = match[1] ? `First ${match[1]} hours free` : 'Free';
        } else {
          data.carParkPrice = `£${match[1]}/hour`;
        }
        break;
      }
    }
    
    // Number of floors
    const floorPatterns = [
      /(\d+)\s*(?:floors?|levels?|storeys?)/i,
      /(?:mall|centre|center)\s*spans?\s*(\d+)\s*(?:floors?|levels?)/i,
    ];
    
    for (const pattern of floorPatterns) {
      const match = text.match(pattern);
      if (match) {
        const floors = parseInt(match[1]);
        if (floors >= 1 && floors <= 10) {
          data.numberOfFloors = floors;
          break;
        }
      }
    }
    
    // Public transit
    const transitKeywords = ['train station', 'railway station', 'bus station', 'metro', 'underground', 'tube'];
    const foundTransit: string[] = [];
    
    for (const keyword of transitKeywords) {
      if (text.includes(keyword)) {
        foundTransit.push(keyword);
      }
    }
    
    if (foundTransit.length > 0) {
      data.publicTransit = [...new Set(foundTransit)].join(', ');
    }
    
    // Opened year
    const yearPatterns = [
      /opened?\s*(?:in\s*)?(\d{4})/i,
      /built\s*(?:in\s*)?(\d{4})/i,
      /established\s*(?:in\s*)?(\d{4})/i,
      /since\s*(\d{4})/i,
    ];
    
    for (const pattern of yearPatterns) {
      const match = text.match(pattern);
      if (match) {
        const year = parseInt(match[1]);
        if (year >= 1950 && year <= 2024) {
          data.openedYear = year;
          break;
        }
      }
    }
    
  } catch (error: any) {
    console.error(`   ⚠️  Scrape error: ${error.message}`);
  }
  
  return data;
}

async function main() {
  console.log('🚗 PRIORITY LOCATIONS OPERATIONAL DETAILS ENRICHMENT\n');
  
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
      carParkPrice: true,
      evCharging: true,
      numberOfFloors: true,
      publicTransit: true,
      openedYear: true,
    },
    orderBy: { name: 'asc' }
  });
  
  console.log(`🎯 Found ${locations.length} priority locations\n`);
  
  let enriched = 0;
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`\n${progress} ${loc.name} (${loc.city})`);
    console.log(`   🌐 ${loc.website}`);
    
    // Check what's missing
    const missing: string[] = [];
    if (!loc.carParkPrice) missing.push('carParkPrice');
    if (loc.evCharging === null) missing.push('evCharging');
    if (!loc.numberOfFloors) missing.push('numberOfFloors');
    if (!loc.publicTransit) missing.push('publicTransit');
    if (!loc.openedYear) missing.push('openedYear');
    
    if (missing.length === 0) {
      console.log(`   ✅ Already complete`);
      continue;
    }
    
    console.log(`   ⚠️  Missing: ${missing.join(', ')}`);
    console.log(`   🔍 Scraping...`);
    
    const data = await scrapeOperationalDetails(loc.website!);
    
    const updateData: any = {};
    const found: string[] = [];
    
    if (data.carParkPrice && !loc.carParkPrice) {
      updateData.carParkPrice = data.carParkPrice;
      found.push(`Parking: ${data.carParkPrice}`);
    }
    
    if (data.evCharging !== undefined && loc.evCharging === null) {
      updateData.evCharging = data.evCharging;
      if (data.evChargingSpaces) {
        updateData.evChargingSpaces = data.evChargingSpaces;
        found.push(`EV: Yes (${data.evChargingSpaces} spaces)`);
      } else {
        found.push(`EV: ${data.evCharging ? 'Yes' : 'No'}`);
      }
    }
    
    if (data.numberOfFloors && !loc.numberOfFloors) {
      updateData.numberOfFloors = data.numberOfFloors;
      found.push(`Floors: ${data.numberOfFloors}`);
    }
    
    if (data.publicTransit && !loc.publicTransit) {
      updateData.publicTransit = data.publicTransit;
      found.push(`Transit: ${data.publicTransit}`);
    }
    
    if (data.openedYear && !loc.openedYear) {
      updateData.openedYear = data.openedYear;
      found.push(`Opened: ${data.openedYear}`);
    }
    
    if (found.length > 0) {
      await prisma.location.update({
        where: { id: loc.id },
        data: updateData,
      });
      
      console.log(`   ✅ ${found.join(' | ')}`);
      enriched++;
    } else {
      console.log(`   ❌ No data found`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n\n' + '='.repeat(80));
  console.log('✅ OPERATIONAL ENRICHMENT COMPLETE!');
  console.log('='.repeat(80));
  console.log(`\n   Enriched: ${enriched}/${locations.length} locations\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

