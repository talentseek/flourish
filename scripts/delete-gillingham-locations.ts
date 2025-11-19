import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Deleting non-viable Gillingham locations...\n');

  const locationIds = [
    'cmf3sykoj00tsk2pszxhthatr', // Gillingham Retail Park
    'cmf3sykmf00trk2psbkctcf4c', // Gillingham Business Park
  ];

  for (const id of locationIds) {
    const location = await prisma.location.findUnique({
      where: { id },
      select: { name: true, numberOfStores: true },
    });

    if (location) {
      console.log(`Deleting: ${location.name} (${location.numberOfStores} stores)`);
      
      // Delete tenants first (cascade should handle this, but being explicit)
      await prisma.tenant.deleteMany({
        where: { locationId: id },
      });

      // Delete location
      await prisma.location.delete({
        where: { id },
      });

      console.log(`✅ Deleted ${location.name}\n`);
    } else {
      console.log(`⚠️  Location with ID ${id} not found\n`);
    }
  }

  console.log('✅ Finished deleting non-viable locations');

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });

