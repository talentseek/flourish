import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DOCKSIDE_ID = 'cmf3sxrjh00fmk2pscvtqyfd8';

async function main() {
  console.log('📝 Enriching Dockside Outlet Centre...\n');

  // Verify location exists
  const location = await prisma.location.findUnique({
    where: { id: DOCKSIDE_ID },
  });

  if (!location) {
    console.error(`❌ Location with ID ${DOCKSIDE_ID} not found`);
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log(`Found: ${location.name}\n`);

  // Update location with comprehensive research data
  const updated = await prisma.location.update({
    where: { id: DOCKSIDE_ID },
    data: {
      // Basic Information
      address: "Maritime Way, Chatham Maritime, St Mary's Island, Chatham, Kent ME4 3ED",
      city: 'Chatham',
      county: 'Kent',
      postcode: 'ME4 3ED',
      latitude: 51.4010,
      longitude: 0.5346,

      // Contact Information
      phone: '01634 899387',
      website: 'https://www.chathamdockside.co.uk/',

      // Opening Hours
      openingHours: {
        monday: { open: '10:00', close: '18:00' },
        tuesday: { open: '10:00', close: '18:00' },
        wednesday: { open: '10:00', close: '18:00' },
        thursday: { open: '10:00', close: '19:00' },
        friday: { open: '10:00', close: '19:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { open: '11:00', close: '17:00' },
      },

      // Operational Details
      openedYear: 2003,
      numberOfFloors: 2,
      totalFloorArea: 163000, // sq ft (research indicates 163,000-175,000 sq ft)
      retailSpace: 163000, // sq ft
      parkingSpaces: 1450, // Surface + multi-storey
      carParkPrice: 1.25, // 1-2 hours: £1.25 (0-1 hour free)
      evCharging: true,
      evChargingSpaces: 1, // At least 1 (Twin Charge network)
      anchorTenants: 3, // The Range, M&S Outlet, Iceland

      // Ownership & Management
      owner: 'WD Ltd / WD Chatham Limited (acquired March 2015)',
      management: 'WD Ltd (asset-managed in-house) / Anthony Sutton (Centre Manager)',

      // Footfall & Performance
      footfall: 2250000, // 2.25 million annually
      retailers: 42, // Current active directory lists 42

      // Social Media
      facebook: 'https://www.facebook.com/DocksideShopping/',

      // Online Reviews
      googleRating: 4.2,
      googleReviews: 2500,
      googleVotes: 2500,

      // Public Transit
      publicTransit: 'Chatham station (1.5-2 miles), Bus routes 1/2/100 serving Chatham Maritime',
    },
  });

  console.log('✅ Dockside Outlet Centre enriched successfully!\n');
  console.log('Complete data addition:');
  console.log('  - Address: Updated to "Maritime Way, Chatham Maritime, St Mary\'s Island, Chatham, Kent ME4 3ED"');
  console.log('  - Postcode: Changed from ME4 3ER to ME4 3ED');
  console.log('  - City/County: Fixed swap (City: Chatham, County: Kent)');
  console.log('  - Coordinates: Updated to 51.4010, 0.5346');
  console.log('  - Phone: Added 01634 899387');
  console.log('  - Website: Added https://www.chathamdockside.co.uk/');
  console.log('  - Floor area: Updated from 9,810 to 163,000 sq ft');
  console.log('  - Retail space: Added 163,000 sq ft');
  console.log('  - Parking: Added 1,450 spaces');
  console.log('  - Car park price: Added £1.25 for 1-2 hours (0-1 hour free)');
  console.log('  - Footfall: Added 2.25 million annually');
  console.log('  - Opened year: Added 2003');
  console.log('  - Owner: Added WD Ltd / WD Chatham Limited');
  console.log('  - Management: Added WD Ltd / Anthony Sutton');
  console.log('  - EV charging: Enabled');
  console.log('  - Opening hours: Added complete schedule');
  console.log('  - Anchor tenants: Added 3');
  console.log('  - Social media: Added Facebook');
  console.log('  - Google rating: Added 4.2/5.0 with ~2,500 reviews');
  console.log('  - Public transit: Added details');
  console.log('');

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });

