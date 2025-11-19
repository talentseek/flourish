#!/usr/bin/env tsx
/**
 * 🚗 PARALLEL OPERATIONAL ENRICHMENT
 * Safe to run alongside tenant enrichment
 * Scrapes parking, EV charging, transit info from websites
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function scrapeOperationalDetails(websiteUrl: string): Promise<any> {
  const details: any = {};

  try {
    const response = await fetch(websiteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return details;

    const html = await response.text();
    const text = html.toLowerCase();

    // Parking price detection
    const parkingPatterns = [
      /parking[:\s]+£?([\d.]+)/i,
      /£([\d.]+)[\/\s]*(?:per\s)?(?:hour|hr)/i,
      /([\d.]+)\s*(?:hour|hr)[s\s]*free/i,
    ];

    for (const pattern of parkingPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        details.carParkPrice = parseFloat(match[1]);
        break;
      }
    }

    // Free parking detection
    if (/free parking/i.test(text) && !details.carParkPrice) {
      details.carParkPrice = 0;
    }

    // Number of parking spaces
    const spacesMatch = text.match(/([\d,]+)\s*(?:parking\s)?(?:spaces|bays)/i);
    if (spacesMatch) {
      const spaces = parseInt(spacesMatch[1].replace(/,/g, ''));
      if (spaces > 10 && spaces < 10000) {
        details.parkingSpaces = spaces;
      }
    }

    // EV Charging (handled by schema default)
    const hasEV = /electric vehicle|ev charg|electric car|ev bay|charging point/i.test(text);
    if (hasEV) {
      // Look for number of EV spaces
      const evMatch = text.match(/([\d]+)\s*(?:ev|electric|charging)\s*(?:spaces|bays|points)/i);
      if (evMatch) {
        details.evChargingSpaces = parseInt(evMatch[1]);
      }
    }

    // Number of floors
    const floorsMatch = text.match(/(\d+)\s*(?:floors?|levels?|storeys?)/i);
    if (floorsMatch) {
      const floors = parseInt(floorsMatch[1]);
      if (floors >= 1 && floors <= 10) {
        details.numberOfFloors = floors;
      }
    }

    // Public transit
    if (/bus stop|train station|underground|tube|metro|tram/i.test(text)) {
      details.publicTransit = 'Yes';
    }

    // Year opened
    const yearMatches = text.match(/(?:opened?|established|built)[:\s]+(\d{4})/i);
    if (yearMatches) {
      const year = parseInt(yearMatches[1]);
      if (year >= 1950 && year <= 2024) {
        details.openedYear = year;
      }
    }

  } catch (error) {
    // Silently fail
  }

  return details;
}

async function main() {
  console.log('\n🚗 PARALLEL OPERATIONAL ENRICHMENT');
  console.log('='.repeat(80));
  console.log('Scraping parking, EV, transit info (safe to run alongside tenant enrichment)\n');

  // Get locations missing operational data
  const locations = await prisma.location.findMany({
    where: {
      website: { not: null },
      OR: [
        { carParkPrice: null },
        { parkingSpaces: null },
        { evChargingSpaces: null },
        { numberOfFloors: null },
        { publicTransit: null },
        { openedYear: null },
      ],
    },
    select: {
      id: true,
      name: true,
      website: true,
      carParkPrice: true,
      parkingSpaces: true,
      numberOfFloors: true,
    },
    orderBy: { numberOfStores: 'desc' },
  });

  console.log(`📊 Found ${locations.length} locations to enrich\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    console.log(`[${i + 1}/${locations.length}] ${loc.name}`);

    try {
      const operational = await scrapeOperationalDetails(loc.website!);

      if (Object.keys(operational).length > 0) {
        await prisma.location.update({
          where: { id: loc.id },
          data: operational,
        });

        const found = Object.keys(operational).join(', ');
        console.log(`   ✅ Found: ${found}`);
        success++;
      } else {
        console.log(`   ⚠️  No operational data found`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }

    // Rate limiting
    if (i < locations.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Progress update every 50
    if ((i + 1) % 50 === 0) {
      console.log(`\n📈 Progress: ${success} enriched, ${failed} failed\n`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ OPERATIONAL ENRICHMENT COMPLETE!');
  console.log('='.repeat(80));
  console.log(`Success: ${success}/${locations.length}`);
  console.log(`Failed: ${failed}/${locations.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

