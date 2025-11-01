import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRIORITY_NAMES = [
  'Broadway Shopping Centre',
  'The Martlets Shopping Centre',
  'Lion Yard',
  'Pentagon Shopping Centre',
  'Priory Shopping Centre',
  'Orchard Centre',
  'Swan Centre',
  'Princess Mead',
  'Royal Exchange',
  "St Christopher's Place",
  'Aylesham Centre',
  'Putney Exchange',
  'Anglia Square',
  'Mercury Mall',
  'Touchwood',
  'Christopher Place',
  'Horse Fair Shopping Centre',
  'Newlands',
  'One Stop Shopping Centre',
  'Marlands Shopping Centre',
  'Islington Square',
];

async function main() {
  console.log('🔍 PRIORITY LOCATIONS WEBSITE STATUS\n');
  console.log('='.repeat(80));
  
  let foundWithWebsite = 0;
  let foundNoWebsite = 0;
  let notFound = 0;
  
  for (const name of PRIORITY_NAMES) {
    const locations = await prisma.location.findMany({
      where: {
        name: {
          contains: name.replace(' Shopping Centre', '').replace(' Center', ''),
          mode: 'insensitive',
        },
        type: {
          in: ['SHOPPING_CENTRE', 'RETAIL_PARK'],
        },
      },
      select: {
        name: true,
        city: true,
        website: true,
      },
    });

    if (locations.length === 0) {
      console.log(`❌ "${name}" - NOT IN DATABASE`);
      notFound++;
    } else {
      for (const loc of locations) {
        if (loc.website) {
          console.log(`✅ ${loc.name} (${loc.city})`);
          console.log(`   🌐 ${loc.website}\n`);
          foundWithWebsite++;
        } else {
          console.log(`⚠️  ${loc.name} (${loc.city}) - NO WEBSITE\n`);
          foundNoWebsite++;
        }
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY:');
  console.log('='.repeat(80));
  console.log(`✅ Found WITH website:    ${foundWithWebsite}`);
  console.log(`⚠️  Found WITHOUT website: ${foundNoWebsite}`);
  console.log(`❌ Not in database:       ${notFound}`);
  console.log(`📍 TOTAL to enrich:       ${foundWithWebsite}`);
  console.log('\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

