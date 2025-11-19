import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';
import * as path from 'path';

const prisma = new PrismaClient();

const PRIORITY_NAMES = [
  'Broadway Shopping Centre',
  'The Martlets',
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
  'Marlands Shopping Centre',
];

async function runScript(scriptName: string, description: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🚀 Running: ${description}`);
  console.log(`${'='.repeat(80)}\n`);

  return new Promise<void>((resolve, reject) => {
    const childProcess = spawn('pnpm', ['tsx', scriptName], {
      cwd: path.join(process.cwd()),
      stdio: 'inherit',
      shell: true,
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${description} completed successfully\n`);
        resolve();
      } else {
        console.log(`\n⚠️  ${description} exited with code ${code}\n`);
        resolve(); // Continue even if script fails
      }
    });

    childProcess.on('error', (err) => {
      console.error(`\n❌ Error running ${description}:`, err);
      resolve(); // Continue even on error
    });
  });
}

async function main() {
  console.log('🎯 PRIORITY LOCATIONS RAPID ENRICHMENT SPRINT');
  console.log('='.repeat(80));
  
  // Get all priority location IDs
  const locations = await prisma.location.findMany({
    where: {
      OR: PRIORITY_NAMES.map(name => ({
        name: {
          contains: name.replace(' Shopping Centre', '').replace(' Center', ''),
          mode: 'insensitive' as const,
        },
      })),
      type: {
        in: ['SHOPPING_CENTRE', 'RETAIL_PARK'],
      },
    },
    select: {
      id: true,
      name: true,
      city: true,
      website: true,
    },
  });

  console.log(`\n📍 Found ${locations.length} priority locations in database:`);
  locations.forEach((loc, i) => {
    console.log(`   ${i + 1}. ${loc.name} (${loc.city}) ${loc.website ? '✅' : '❌ NO WEBSITE'}`);
  });

  const withWebsites = locations.filter(l => l.website);
  console.log(`\n🌐 ${withWebsites.length} locations have websites and can be enriched`);

  // Create a temp file with priority location IDs
  const priorityIds = locations.map(l => l.id);
  await prisma.$executeRaw`
    CREATE TEMP TABLE IF NOT EXISTS priority_locations (id TEXT PRIMARY KEY)
  `;
  
  for (const id of priorityIds) {
    await prisma.$executeRaw`
      INSERT INTO priority_locations (id) VALUES (${id}) ON CONFLICT DO NOTHING
    `;
  }

  console.log('\n\n🎬 STARTING ENRICHMENT PIPELINE...\n');

  // 1. MOST CRITICAL: Store directories (tenant data)
  console.log('\n🏬 STEP 1/6: TENANT DATA (Store Directories) - MOST CRITICAL!');
  console.log('   This will use AI to extract store lists from each website');
  await runScript(
    'scripts/enrich-stores-crawl4ai.ts',
    'Tenant Data Extraction (AI-Powered)'
  );

  // 2. Google Places: Phone, rating, reviews, hours
  console.log('\n📞 STEP 2/6: Google Places API (Phone, Rating, Reviews, Hours)');
  await runScript(
    'scripts/enrich-google-places.ts',
    'Google Places Enrichment'
  );

  // 3. Social media links
  console.log('\n📱 STEP 3/6: Social Media Links');
  await runScript(
    'scripts/enrich-social-media-v3.ts',
    'Social Media Extraction'
  );

  // 4. Operational details (parking price, EV charging, floors, transit, year)
  console.log('\n🚗 STEP 4/6: Operational Details (Parking, EV, Floors, Transit, Year)');
  await runScript(
    'scripts/enrich-operational-details.ts',
    'Operational Details Scraping'
  );

  // 5. Parking spaces
  console.log('\n🅿️  STEP 5/6: Parking Spaces');
  await runScript(
    'scripts/enrich-parking-v3.ts',
    'Parking Spaces Extraction'
  );

  // 6. SEO metadata
  console.log('\n🔍 STEP 6/6: SEO Metadata (Keywords, Top Pages)');
  await runScript(
    'scripts/enrich-seo-metadata.ts',
    'SEO Metadata Extraction'
  );

  console.log('\n\n' + '='.repeat(80));
  console.log('🎉 PRIORITY ENRICHMENT COMPLETE!');
  console.log('='.repeat(80));

  // Show final summary
  const enrichedLocations = await prisma.location.findMany({
    where: {
      id: { in: priorityIds },
    },
    select: {
      name: true,
      city: true,
      website: true,
      phone: true,
      instagram: true,
      facebook: true,
      parkingSpaces: true,
      carParkPrice: true,
      evCharging: true,
      numberOfFloors: true,
      _count: {
        select: { tenants: true },
      },
    },
  });

  console.log('\n\n📊 FINAL SUMMARY:\n');
  enrichedLocations.forEach((loc) => {
    const fields = [
      loc.website ? '✅' : '❌',
      loc.phone ? '✅' : '❌',
      loc.instagram || loc.facebook ? '✅' : '❌',
      loc.parkingSpaces ? '✅' : '❌',
      loc.carParkPrice ? '✅' : '❌',
      loc.evCharging !== null ? '✅' : '❌',
      loc.numberOfFloors ? '✅' : '❌',
      loc._count.tenants > 5 ? `✅ (${loc._count.tenants})` : `❌ (${loc._count.tenants})`,
    ];
    console.log(`${loc.name.padEnd(40)} | ${fields.join(' ')}`);
  });

  console.log('\n\n✅ Ready for your meetings!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

