import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LOCATION_IDS = {
  pentagon: 'cmf3t0w3r01ybk2psq0u20lxp',
  hempstead: 'cmf3t0bdh01o9k2psjfrf9kxg',
  dockside: 'cmf3sxrjh00fmk2pscvtqyfd8',
};

async function main() {
  console.log('🔍 Verifying enrichment of three locations...\n');

  const locations = await prisma.location.findMany({
    where: {
      id: {
        in: Object.values(LOCATION_IDS),
      },
    },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      county: true,
      postcode: true,
      latitude: true,
      longitude: true,
      phone: true,
      website: true,
      openingHours: true,
      parkingSpaces: true,
      totalFloorArea: true,
      retailSpace: true,
      footfall: true,
      openedYear: true,
      owner: true,
      management: true,
      evCharging: true,
      evChargingSpaces: true,
      carParkPrice: true,
      anchorTenants: true,
      numberOfStores: true,
      instagram: true,
      facebook: true,
      twitter: true,
      googleRating: true,
      googleReviews: true,
      publicTransit: true,
      _count: {
        select: {
          tenants: true,
        },
      },
    },
  });

  console.log('='.repeat(80));
  console.log('VERIFICATION REPORT');
  console.log('='.repeat(80));
  console.log('');

  for (const loc of locations) {
    const locationName = loc.name;
    console.log(`📍 ${locationName}`);
    console.log('-'.repeat(80));

    // Basic Information
    console.log('\n📋 Basic Information:');
    console.log(`  Address: ${loc.address || '❌ MISSING'}`);
    console.log(`  City: ${loc.city || '❌ MISSING'}`);
    console.log(`  County: ${loc.county || '❌ MISSING'}`);
    console.log(`  Postcode: ${loc.postcode || '❌ MISSING'}`);
    console.log(`  Coordinates: ${loc.latitude || '❌ MISSING'}, ${loc.longitude || '❌ MISSING'}`);

    // Contact Information
    console.log('\n📞 Contact Information:');
    console.log(`  Phone: ${loc.phone || '❌ MISSING'}`);
    console.log(`  Website: ${loc.website || '❌ MISSING'}`);

    // Operational Details
    console.log('\n⏰ Operational Details:');
    console.log(`  Opening Hours: ${loc.openingHours ? '✅ SET' : '❌ MISSING'}`);
    console.log(`  Opened Year: ${loc.openedYear || '❌ MISSING'}`);
    console.log(`  Number of Stores: ${loc.numberOfStores || '❌ MISSING'} (tenants in DB: ${loc._count.tenants})`);
    console.log(`  Anchor Tenants: ${loc.anchorTenants || '❌ MISSING'}`);

    // Physical Details
    console.log('\n🏢 Physical Details:');
    console.log(`  Total Floor Area: ${loc.totalFloorArea ? loc.totalFloorArea.toLocaleString() + ' sq ft' : '❌ MISSING'}`);
    console.log(`  Retail Space: ${loc.retailSpace ? loc.retailSpace.toLocaleString() + ' sq ft' : '❌ MISSING'}`);
    console.log(`  Parking Spaces: ${loc.parkingSpaces || '❌ MISSING'}`);
    console.log(`  Car Park Price: ${loc.carParkPrice !== null ? '£' + loc.carParkPrice : '❌ MISSING'}`);
    console.log(`  EV Charging: ${loc.evCharging ? 'Yes' : 'No'} (${loc.evChargingSpaces || 0} spaces)`);

    // Ownership & Management
    console.log('\n👥 Ownership & Management:');
    console.log(`  Owner: ${loc.owner || '❌ MISSING'}`);
    console.log(`  Management: ${loc.management || '❌ MISSING'}`);

    // Performance
    console.log('\n📊 Performance:');
    console.log(`  Annual Footfall: ${loc.footfall ? loc.footfall.toLocaleString() : '❌ MISSING'}`);

    // Social Media
    console.log('\n📱 Social Media:');
    console.log(`  Instagram: ${loc.instagram || '❌ MISSING'}`);
    console.log(`  Facebook: ${loc.facebook || '❌ MISSING'}`);
    console.log(`  Twitter: ${loc.twitter || '❌ MISSING'}`);

    // Reviews
    console.log('\n⭐ Reviews:');
    console.log(`  Google Rating: ${loc.googleRating || '❌ MISSING'}/5.0 (${loc.googleReviews || 'N/A'} reviews)`);

    // Public Transit
    console.log('\n🚌 Public Transit:');
    console.log(`  ${loc.publicTransit || '❌ MISSING'}`);

    // Validation Checks
    console.log('\n✅ Validation Checks:');
    const checks = {
      'Has address': !!loc.address,
      'Has postcode': !!loc.postcode,
      'Has coordinates': !!(loc.latitude && loc.longitude),
      'Has phone': !!loc.phone,
      'Has website': !!loc.website,
      'Has opening hours': !!loc.openingHours,
      'Has floor area': !!loc.totalFloorArea,
      'Has parking info': !!loc.parkingSpaces,
      'Has footfall': !!loc.footfall,
      'Has owner': !!loc.owner,
      'Has social media': !!(loc.instagram || loc.facebook || loc.twitter),
      'Has reviews': !!(loc.googleRating && loc.googleReviews),
      'Has tenants': loc._count.tenants > 0,
    };

    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;

    for (const [check, passed] of Object.entries(checks)) {
      console.log(`  ${passed ? '✅' : '❌'} ${check}`);
    }

    console.log(`\n  Score: ${passed}/${total} checks passed (${Math.round((passed / total) * 100)}%)\n`);
    console.log('='.repeat(80));
    console.log('');
  }

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });

