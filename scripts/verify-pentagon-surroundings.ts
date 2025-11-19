import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PENTAGON_ID = 'cmf3t0w3r01ybk2psq0u20lxp';
const PENTAGON_LAT = 51.38361;
const PENTAGON_LON = 0.52556;
const RADIUS_MILES = 5;

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'SHOPPING_CENTRE':
      return 'Shopping Centre';
    case 'RETAIL_PARK':
      return 'Retail Park';
    case 'OUTLET_CENTRE':
      return 'Outlet Centre';
    case 'HIGH_STREET':
      return 'High Street';
    default:
      return type;
  }
}

async function main() {
  console.log('🔍 Verifying locations within 5 miles of Pentagon Shopping Centre...\n');

  // Get all locations
  const allLocations = await prisma.location.findMany({
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
    },
  });

  // Calculate distances and filter
  const nearbyLocations = allLocations
    .filter(loc => loc.id !== PENTAGON_ID && loc.latitude && loc.longitude)
    .map(location => ({
      ...location,
      distance: haversineMiles(
        PENTAGON_LAT,
        PENTAGON_LON,
        Number(location.latitude),
        Number(location.longitude)
      )
    }))
    .filter(loc => loc.distance <= RADIUS_MILES)
    .sort((a, b) => a.distance - b.distance);

  console.log(`Found ${nearbyLocations.length} locations within ${RADIUS_MILES} miles\n`);

  // Group by type
  const byType: Record<string, typeof nearbyLocations> = {
    SHOPPING_CENTRE: [],
    RETAIL_PARK: [],
    OUTLET_CENTRE: [],
    HIGH_STREET: [],
  };

  nearbyLocations.forEach(loc => {
    const type = loc.type as keyof typeof byType;
    if (type in byType) {
      byType[type].push(loc);
    }
  });

  // Print by type
  console.log('='.repeat(80));
  console.log('SHOPPING CENTRES');
  console.log('='.repeat(80));
  if (byType.SHOPPING_CENTRE.length === 0) {
    console.log('None found\n');
  } else {
    byType.SHOPPING_CENTRE.forEach(loc => {
      console.log(`  ${loc.name}`);
      console.log(`    Distance: ${loc.distance.toFixed(2)} miles`);
      console.log(`    Address: ${loc.address || 'N/A'}`);
      console.log(`    City: ${loc.city || 'N/A'}, County: ${loc.county || 'N/A'}`);
      console.log(`    Stores: ${loc.numberOfStores || 'N/A'}`);
      console.log(`    Website: ${loc.website || 'N/A'}`);
      console.log('');
    });
  }

  console.log('='.repeat(80));
  console.log('RETAIL PARKS');
  console.log('='.repeat(80));
  if (byType.RETAIL_PARK.length === 0) {
    console.log('None found\n');
  } else {
    byType.RETAIL_PARK.forEach(loc => {
      console.log(`  ${loc.name}`);
      console.log(`    Distance: ${loc.distance.toFixed(2)} miles`);
      console.log(`    Address: ${loc.address || 'N/A'}`);
      console.log(`    City: ${loc.city || 'N/A'}, County: ${loc.county || 'N/A'}`);
      console.log(`    Stores: ${loc.numberOfStores || 'N/A'}`);
      console.log(`    Website: ${loc.website || 'N/A'}`);
      console.log('');
    });
  }

  console.log('='.repeat(80));
  console.log('OUTLET CENTRES');
  console.log('='.repeat(80));
  if (byType.OUTLET_CENTRE.length === 0) {
    console.log('None found\n');
  } else {
    byType.OUTLET_CENTRE.forEach(loc => {
      console.log(`  ${loc.name}`);
      console.log(`    Distance: ${loc.distance.toFixed(2)} miles`);
      console.log(`    Address: ${loc.address || 'N/A'}`);
      console.log(`    City: ${loc.city || 'N/A'}, County: ${loc.county || 'N/A'}`);
      console.log(`    Stores: ${loc.numberOfStores || 'N/A'}`);
      console.log(`    Website: ${loc.website || 'N/A'}`);
      console.log('');
    });
  }

  console.log('='.repeat(80));
  console.log('HIGH STREETS');
  console.log('='.repeat(80));
  if (byType.HIGH_STREET.length === 0) {
    console.log('None found\n');
  } else {
    console.log(`Found ${byType.HIGH_STREET.length} high streets (not shown for brevity)\n`);
  }

  // Summary
  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Shopping Centres: ${byType.SHOPPING_CENTRE.length}`);
  console.log(`Retail Parks: ${byType.RETAIL_PARK.length}`);
  console.log(`Outlet Centres: ${byType.OUTLET_CENTRE.length}`);
  console.log(`High Streets: ${byType.HIGH_STREET.length}`);
  console.log(`Total: ${nearbyLocations.length}`);

  // Flag suspicious entries
  console.log('\n' + '='.repeat(80));
  console.log('SUSPICIOUS ENTRIES (need verification)');
  console.log('='.repeat(80));
  const suspicious = nearbyLocations.filter(loc => 
    !loc.address || 
    loc.address === '-' || 
    !loc.city || 
    loc.city === '-' ||
    !loc.website ||
    (loc.numberOfStores && loc.numberOfStores > 200) // Unusually high store count
  );

  if (suspicious.length === 0) {
    console.log('None found\n');
  } else {
    suspicious.forEach(loc => {
      console.log(`  ⚠️  ${loc.name} (${getTypeLabel(loc.type)})`);
      console.log(`     Distance: ${loc.distance.toFixed(2)} miles`);
      console.log(`     Issues: ${[
        !loc.address || loc.address === '-' ? 'Missing address' : '',
        !loc.city || loc.city === '-' ? 'Missing city' : '',
        !loc.website ? 'Missing website' : '',
        (loc.numberOfStores && loc.numberOfStores > 200) ? `Unusually high store count (${loc.numberOfStores})` : '',
      ].filter(Boolean).join(', ')}`);
      console.log('');
    });
  }

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });

