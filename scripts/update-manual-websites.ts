// Update manually found websites for Tier 1 gaps
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📝 Updating manually found websites...\n');
  
  // 1. The Galleries (Mall Bristol)
  const galleries = await prisma.location.findFirst({
    where: { name: 'The Galleries (Mall Bristol)' }
  });
  
  if (galleries) {
    await prisma.location.update({
      where: { id: galleries.id },
      data: { website: 'https://www.galleriesbristol.co.uk/' }
    });
    console.log('✅ Updated: The Galleries (Mall Bristol)');
    console.log('   → https://www.galleriesbristol.co.uk/\n');
  } else {
    console.log('❌ Not found: The Galleries (Mall Bristol)\n');
  }
  
  // 2. Washington Square Shopping Centre
  const washington = await prisma.location.findFirst({
    where: { name: 'Washington Square Shopping Centre' }
  });
  
  if (washington) {
    await prisma.location.update({
      where: { id: washington.id },
      data: { website: 'https://washingtonsquare.co.uk/' }
    });
    console.log('✅ Updated: Washington Square Shopping Centre');
    console.log('   → https://washingtonsquare.co.uk/\n');
  } else {
    console.log('❌ Not found: Washington Square Shopping Centre\n');
  }
  
  // Check remaining Tier 1 gaps
  const remaining = await prisma.location.findMany({
    where: {
      website: null,
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      NOT: { name: { contains: '(Other)' } },
      numberOfStores: { gte: 50 }
    },
    select: { name: true, city: true, numberOfStores: true },
    orderBy: { numberOfStores: 'desc' }
  });
  
  console.log(`🎯 Remaining Tier 1 gaps: ${remaining.length}\n`);
  remaining.forEach((loc, i) => {
    console.log(`${i + 1}. ${loc.name} (${loc.city}) - ${loc.numberOfStores} stores`);
  });
  
  const tier1Total = 85;
  const tier1Complete = tier1Total - remaining.length;
  const completionRate = (tier1Complete / tier1Total * 100).toFixed(1);
  
  console.log(`\n✨ Total Tier 1 completion: ${tier1Complete}/${tier1Total} (${completionRate}%)`);
  
  // Update overall website stats
  const totalWithWebsites = await prisma.location.count({
    where: { website: { not: null } }
  });
  
  const totalLocations = await prisma.location.count();
  
  console.log(`\n📊 Overall website coverage: ${totalWithWebsites}/${totalLocations} (${(totalWithWebsites / totalLocations * 100).toFixed(1)}%)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

