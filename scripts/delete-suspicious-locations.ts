import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Deleting suspicious locations...\n');

  const suspiciousIds = [
    'cmf3sxi6600b5k2ps4601c8me', // Chatham (Other)
    'cmf3sxjy300bzk2ps20n34tyh', // Gillingham (Other)
    'cmf3sxnpj00dtk2ps7zcf35e7', // Rochester (Other)
  ];

  for (const id of suspiciousIds) {
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

  console.log('✅ Finished deleting suspicious locations');

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });

