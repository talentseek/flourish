// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Pyramid Shopping Centre, Peterborough
  // Located at: Queensgate, Peterborough PE1 1NH
  console.log('Updating Pyramid Shopping Centre (Peterborough)...');
  const pyramid = await prisma.location.findFirst({
    where: { name: 'Pyramid Shopping Centre (Peterborough)' }
  });
  
  if (pyramid) {
    await prisma.location.update({
      where: { id: pyramid.id },
      data: {
        latitude: 52.573929,
        longitude: -0.241697,
        address: 'Queensgate, Peterborough',
        postcode: 'PE1 1NH'
      }
    });
    console.log('  ✓ Updated: 52.573929, -0.241697');
    console.log('    Address: Queensgate, Peterborough, PE1 1NH\n');
  }
  
  // Discovery Business Park (retail cluster)
  // Located at: 72 Innovation Drive, Peterborough PE2 6FL
  console.log('Updating Discovery Business Park (retail cluster)...');
  const discovery = await prisma.location.findFirst({
    where: { name: 'Discovery Business Park (retail cluster)' }
  });
  
  if (discovery) {
    await prisma.location.update({
      where: { id: discovery.id },
      data: {
        latitude: 52.549171,
        longitude: -0.304863,
        address: '72 Innovation Drive, Peterborough',
        postcode: 'PE2 6FL'
      }
    });
    console.log('  ✓ Updated: 52.549171, -0.304863');
    console.log('    Address: 72 Innovation Drive, Peterborough, PE2 6FL\n');
  }
  
  console.log('✅ All Peterborough locations updated!');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

