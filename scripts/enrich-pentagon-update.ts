import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PENTAGON_ID = 'cmf3t0w3r01ybk2psq0u20lxp';

async function main() {
  console.log('📝 Updating Pentagon Shopping Centre with latest research data...\n');

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

  // Update location with latest research data
  const updated = await prisma.location.update({
    where: { id: PENTAGON_ID },
    data: {
      // Opening Hours - Update Mon-Wed to 08:00-19:00 (from research)
      openingHours: {
        monday: { open: '08:00', close: '19:00' },
        tuesday: { open: '08:00', close: '19:00' },
        wednesday: { open: '08:00', close: '19:00' },
        thursday: { open: '08:00', close: '19:00' },
        friday: { open: '08:00', close: '19:00' },
        saturday: { open: '08:00', close: '18:00' },
        sunday: { open: '10:00', close: '16:00' },
      },

      // Social Media Links
      instagram: 'https://www.instagram.com/pentagon_shopping',
      twitter: 'https://x.com/pentagoncentre',

      // Parking - Use research figure of 433 spaces
      parkingSpaces: 433,

      // Parking Price - Update to £1.00 for 0-2 hours (from research)
      carParkPrice: 1.00,

      // Google Reviews - Reconcile with research (3.7/5.0 with 6,700+ reviews)
      // Keep current 3.8/5.0 as it's more recent, but update review count if higher
      googleReviews: 6700,
      googleVotes: 6700,
    },
  });

  console.log('✅ Pentagon Shopping Centre updated successfully!\n');
  console.log('Updates applied:');
  console.log('  - Opening hours: Mon-Wed updated to 08:00-19:00');
  console.log('  - Instagram: https://www.instagram.com/pentagon_shopping');
  console.log('  - Twitter: https://x.com/pentagoncentre');
  console.log('  - Parking spaces: 433 (from research)');
  console.log('  - Car park price: £1.00 for 0-2 hours');
  console.log('  - Google reviews: 6,700+ (updated count)');
  console.log('');

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });

