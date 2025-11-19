import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PENTAGON_ID = 'cmf3t0w3r01ybk2psq0u20lxp';

async function main() {
  console.log('📝 Enriching Pentagon Shopping Centre data...\n');

  // Verify location exists
  const location = await prisma.location.findUnique({
    where: { id: PENTAGON_ID },
  });

  if (!location) {
    console.error(`❌ Location with ID ${PENTAGON_ID} not found`);
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log(`Found: ${location.name}\n`);

  // Update location with research data
  const updated = await prisma.location.update({
    where: { id: PENTAGON_ID },
    data: {
      // Basic Information
      name: 'The Pentagon Shopping Centre',
      address: 'High Street, Chatham, Kent ME4 4HY',
      city: 'Chatham',
      county: 'Kent',
      postcode: 'ME4 4HY',
      latitude: 51.38361,
      longitude: 0.52556,

      // Contact Information
      phone: '01634 405388',
      website: 'https://www.pentagonshoppingcentre.co.uk/',

      // Opening Hours (JSON format)
      openingHours: {
        monday: { open: '08:00', close: '18:30' },
        tuesday: { open: '08:00', close: '18:30' },
        wednesday: { open: '08:00', close: '18:30' },
        thursday: { open: '08:00', close: '19:00' },
        friday: { open: '08:00', close: '19:00' },
        saturday: { open: '08:00', close: '18:00' },
        sunday: { open: '10:00', close: '16:00' },
      },

      // Operational Details
      openedYear: 1975,
      numberOfStores: 47, // From CSV scrape - will reconcile with research claim of 77 later
      numberOfFloors: 2, // Main retail floors (3 total including car park)
      totalFloorArea: 382364, // sq ft (gross)
      retailSpace: 330000, // sq ft (approximate)
      parkingSpaces: 467, // Brook car park (research mentions ~1,105 total but this is more specific)
      carParkPrice: 1.70, // Up to 2 hours (0-2 hours range)
      evCharging: true, // Planning docs mention 9 EV points
      evChargingSpaces: 9,
      publicTransit: 'Adjacent to Chatham Waterfront Bus Station; 5-minute walk from Chatham railway station (services to London Victoria/St Pancras)',

      // Ownership & Management
      owner: 'Medway Council',
      management: 'NewRiver / Ellandi (asset managers); on-site centre management team led by Charlene Malone',

      // Performance Metrics
      footfall: 8500000, // Annual footfall (8.5 million)
      retailers: 47, // From CSV scrape

      // Social Media
      facebook: 'https://www.facebook.com/pentagonshoppingcentre/',

      // Online Reviews
      googleRating: 3.75, // Average of 3.7-3.8 range
      googleReviews: 6355, // Average of ~6,000-6,710 range
      googleVotes: 6355,
    },
  });

  console.log('✅ Successfully updated Pentagon Shopping Centre:\n');
  console.log(`   Name: ${updated.name}`);
  console.log(`   Address: ${updated.address}`);
  console.log(`   Postcode: ${updated.postcode}`);
  console.log(`   Coordinates: ${updated.latitude}, ${updated.longitude}`);
  console.log(`   Phone: ${updated.phone}`);
  console.log(`   Website: ${updated.website}`);
  console.log(`   Stores: ${updated.numberOfStores}`);
  console.log(`   Parking Spaces: ${updated.parkingSpaces}`);
  console.log(`   EV Charging: ${updated.evCharging ? 'Yes' : 'No'} (${updated.evChargingSpaces} spaces)`);
  console.log(`   Footfall: ${updated.footfall?.toLocaleString()} annually`);
  console.log(`   Owner: ${updated.owner}`);
  console.log(`   Management: ${updated.management}`);
  console.log(`   Google Rating: ${updated.googleRating}/5.0 (${updated.googleReviews} reviews)`);

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });

