import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Finding Gillingham Retail Park and Gillingham Business Park...\n');

  const locations = await prisma.location.findMany({
    where: {
      OR: [
        { name: { contains: 'Gillingham Retail Park', mode: 'insensitive' } },
        { name: { contains: 'Gillingham Business Park', mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      type: true,
      address: true,
      city: true,
      numberOfStores: true,
    },
  });

  if (locations.length === 0) {
    console.log('❌ Locations not found\n');
  } else {
    console.log(`Found ${locations.length} location(s):\n`);
    locations.forEach((loc, idx) => {
      console.log(`${idx + 1}. ${loc.name}`);
      console.log(`   ID: ${loc.id}`);
      console.log(`   Type: ${loc.type}`);
      console.log(`   Address: ${loc.address}`);
      console.log(`   City: ${loc.city}`);
      console.log(`   Stores: ${loc.numberOfStores || 'N/A'}`);
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

