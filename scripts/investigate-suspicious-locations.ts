import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Investigating suspicious locations...\n');

  const suspiciousNames = [
    'Chatham (Other)',
    'Gillingham (Other)',
    'Rochester (Other)'
  ];

  for (const name of suspiciousNames) {
    const locations = await prisma.location.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        address: true,
        city: true,
        county: true,
        postcode: true,
        latitude: true,
        longitude: true,
        numberOfStores: true,
        website: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (locations.length === 0) {
      console.log(`❌ "${name}" - NOT FOUND in database\n`);
    } else {
      console.log(`\n📍 Found ${locations.length} location(s) matching "${name}":\n`);
      locations.forEach((loc, idx) => {
        console.log(`  ${idx + 1}. ${loc.name}`);
        console.log(`     ID: ${loc.id}`);
        console.log(`     Type: ${loc.type}`);
        console.log(`     Address: ${loc.address}`);
        console.log(`     City: ${loc.city}, County: ${loc.county}`);
        console.log(`     Postcode: ${loc.postcode}`);
        console.log(`     Coordinates: ${loc.latitude}, ${loc.longitude}`);
        console.log(`     Number of Stores: ${loc.numberOfStores || 'N/A'}`);
        console.log(`     Website: ${loc.website || 'N/A'}`);
        console.log(`     Created: ${loc.createdAt}`);
        console.log(`     Updated: ${loc.updatedAt}`);
        console.log('');
      });
    }
  }

  // Also check for any locations with "(Other)" in the name
  const allOtherLocations = await prisma.location.findMany({
    where: {
      name: {
        contains: '(Other)',
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
      type: true,
      city: true,
      numberOfStores: true,
    },
  });

  if (allOtherLocations.length > 0) {
    console.log(`\n📋 Found ${allOtherLocations.length} total location(s) with "(Other)" in name:\n`);
    allOtherLocations.forEach((loc) => {
      console.log(`  - ${loc.name} (${loc.type}) - ${loc.numberOfStores || 'N/A'} stores - ${loc.city}`);
    });
  }

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });

