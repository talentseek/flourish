import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Finding Pentagon Shopping Centre...\n');

  const locations = await prisma.location.findMany({
    where: {
      name: {
        contains: 'Pentagon',
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
      city: true,
      type: true,
      address: true,
      postcode: true,
      latitude: true,
      longitude: true,
    },
  });

  if (locations.length === 0) {
    console.log('❌ Pentagon Shopping Centre not found in database\n');
  } else {
    console.log(`Found ${locations.length} location(s):\n`);
    locations.forEach((loc, idx) => {
      console.log(`${idx + 1}. ${loc.name}`);
      console.log(`   ID: ${loc.id}`);
      console.log(`   City: ${loc.city}`);
      console.log(`   Type: ${loc.type}`);
      console.log(`   Address: ${loc.address}`);
      console.log(`   Postcode: ${loc.postcode}`);
      console.log(`   Coordinates: ${loc.latitude}, ${loc.longitude}`);
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

