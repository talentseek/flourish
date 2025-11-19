import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const HEMPSTEAD_VALLEY_ID = 'cmf3t0bdh01o9k2psjfrf9kxg';

async function main() {
  console.log('📝 Enriching Hempstead Valley Shopping Centre...\n');

  // Verify location exists
  const location = await prisma.location.findUnique({
    where: { id: HEMPSTEAD_VALLEY_ID },
  });

  if (!location) {
    console.error(`❌ Location with ID ${HEMPSTEAD_VALLEY_ID} not found`);
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log(`Found: ${location.name}\n`);

  // Update location with comprehensive research data
  const updated = await prisma.location.update({
    where: { id: HEMPSTEAD_VALLEY_ID },
    data: {
      // Basic Information
      address: '47 Hempstead Valley Drive, Hempstead, Gillingham, Kent ME7 3PD',
      city: 'Gillingham',
      county: 'Kent',
      postcode: 'ME7 3PD',
      latitude: 51.3414,
      longitude: 0.5733,

      // Contact Information
      phone: '01634 387076',
      website: 'https://www.hempsteadvalley.com/',

      // Opening Hours
      openingHours: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '09:00', close: '19:00' },
        sunday: { open: '10:00', close: '16:00' },
      },

      // Operational Details
      openedYear: 1978,
      numberOfFloors: 2, // Main retail levels
      totalFloorArea: 330000, // sq ft (retail space, research indicates ~330,000 sq ft)
      retailSpace: 330000, // sq ft
      parkingSpaces: 2160, // Free parking spaces
      carParkPrice: 0.00, // Free parking (up to 6 hours)
      evCharging: true,
      evChargingSpaces: 10,
      anchorTenants: 4, // Sainsbury's, M&S, TK Maxx, Home Bargains

      // Ownership & Management
      owner: 'Sterling Property Ventures (acquired June 2024 from British Airways Pension Fund)',
      management: 'MAPP (MAPP Retail) - Property Management; GCW and Savills - Leasing Agents',

      // Footfall & Performance
      footfall: 5200000, // 5.2 million annually
      retailers: 55, // "55 brands under one roof" from leasing brochure

      // Social Media
      instagram: 'https://www.instagram.com/hempsteadvalleyshoppingcentre/',
      facebook: 'https://www.facebook.com/HempsteadValley/',
      twitter: 'https://x.com/HempsteadValley',

      // Online Reviews
      googleRating: 4.2,
      googleReviews: 7500,
      googleVotes: 7500,

      // Public Transit
      publicTransit: 'Bus services frequent (Arriva 132/333); Nearest train stations: Gillingham and Rainham (10-15 min taxi)',
    },
  });

  console.log('✅ Hempstead Valley Shopping Centre enriched successfully!\n');
  console.log('Major updates applied:');
  console.log('  - Address: Fixed to "47 Hempstead Valley Drive, Hempstead, Gillingham, Kent ME7 3PD"');
  console.log('  - Postcode: Changed from ME7 3PB to ME7 3PD');
  console.log('  - City/County: Fixed swap (City: Gillingham, County: Kent)');
  console.log('  - Coordinates: Updated to 51.3414, 0.5733');
  console.log('  - Floor area: Updated from 32,410 to 330,000 sq ft');
  console.log('  - Retail space: Updated from 22,687 to 330,000 sq ft');
  console.log('  - Parking: Added 2,160 spaces (free parking)');
  console.log('  - Car park price: Changed from £6 to £0.00 (free)');
  console.log('  - Footfall: Updated from 1.5M to 5.2M annually');
  console.log('  - Opened year: Added 1978');
  console.log('  - Owner: Added Sterling Property Ventures');
  console.log('  - Management: Added MAPP Retail / GCW and Savills');
  console.log('  - EV charging: Enabled with 10 spaces');
  console.log('  - Social media: Added Instagram, Facebook, Twitter');
  console.log('  - Google rating: 4.2/5.0 with ~7,500 reviews');
  console.log('  - Anchor tenants: Updated to 4');
  console.log('');

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });

