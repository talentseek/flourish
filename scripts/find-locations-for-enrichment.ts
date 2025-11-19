import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Finding locations for enrichment...\n');

  const searchNames = [
    'Pentagon',
    'Hempstead Valley',
    'Dockside',
  ];

  for (const searchName of searchNames) {
    const locations = await prisma.location.findMany({
      where: {
        name: {
          contains: searchName,
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
        phone: true,
        website: true,
        numberOfStores: true,
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
        googleRating: true,
        googleReviews: true,
        instagram: true,
        facebook: true,
        twitter: true,
        _count: {
          select: {
            tenants: true,
          },
        },
      },
    });

    if (locations.length === 0) {
      console.log(`❌ "${searchName}" - NOT FOUND in database\n`);
    } else {
      console.log(`\n📍 Found ${locations.length} location(s) matching "${searchName}":\n`);
      locations.forEach((loc, idx) => {
        console.log(`${idx + 1}. ${loc.name}`);
        console.log(`   ID: ${loc.id}`);
        console.log(`   Type: ${loc.type}`);
        console.log(`   Address: ${loc.address || 'N/A'}`);
        console.log(`   City: ${loc.city || 'N/A'}, County: ${loc.county || 'N/A'}`);
        console.log(`   Postcode: ${loc.postcode || 'N/A'}`);
        console.log(`   Coordinates: ${loc.latitude || 'N/A'}, ${loc.longitude || 'N/A'}`);
        console.log(`   Phone: ${loc.phone || 'N/A'}`);
        console.log(`   Website: ${loc.website || 'N/A'}`);
        console.log(`   Stores: ${loc.numberOfStores || 'N/A'} (tenants in DB: ${loc._count.tenants})`);
        console.log(`   Parking: ${loc.parkingSpaces || 'N/A'} spaces`);
        console.log(`   Floor Area: ${loc.totalFloorArea || 'N/A'} sq ft`);
        console.log(`   Retail Space: ${loc.retailSpace || 'N/A'} sq ft`);
        console.log(`   Footfall: ${loc.footfall ? loc.footfall.toLocaleString() : 'N/A'}`);
        console.log(`   Opened: ${loc.openedYear || 'N/A'}`);
        console.log(`   Owner: ${loc.owner || 'N/A'}`);
        console.log(`   Management: ${loc.management || 'N/A'}`);
        console.log(`   EV Charging: ${loc.evCharging ? 'Yes' : 'No'} (${loc.evChargingSpaces || 0} spaces)`);
        console.log(`   Car Park Price: ${loc.carParkPrice ? '£' + loc.carParkPrice : 'N/A'}`);
        console.log(`   Google Rating: ${loc.googleRating || 'N/A'}/5.0 (${loc.googleReviews || 'N/A'} reviews)`);
        console.log(`   Social: Instagram: ${loc.instagram ? 'Yes' : 'No'}, Facebook: ${loc.facebook ? 'Yes' : 'No'}, Twitter: ${loc.twitter ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
  }

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });

