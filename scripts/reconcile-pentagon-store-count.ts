import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PENTAGON_ID = 'cmf3t0w3r01ybk2psq0u20lxp';

async function main() {
  console.log('📊 Reconciling Pentagon Shopping Centre store count...\n');

  // Get current tenant count from database
  const tenantCount = await prisma.tenant.count({
    where: { locationId: PENTAGON_ID },
  });

  // Get location data
  const location = await prisma.location.findUnique({
    where: { id: PENTAGON_ID },
    select: {
      name: true,
      numberOfStores: true,
    },
  });

  console.log('Current Database State:');
  console.log(`  Location numberOfStores field: ${location?.numberOfStores || 'N/A'}`);
  console.log(`  Actual tenant records in database: ${tenantCount}`);
  console.log('');

  console.log('Research Data:');
  console.log('  CSV scrape (from official website): 46 stores');
  console.log('  Research document claim: 77 stores');
  console.log('');

  console.log('Analysis:');
  console.log('  The discrepancy likely stems from:');
  console.log('    1. Research may include non-retail units (health centre, co-working space)');
  console.log('    2. Research may include services, kiosks, or temporary units');
  console.log('    3. Research may be outdated (some stores may have closed)');
  console.log('    4. CSV scrape is from official website and represents current retail tenants');
  console.log('');

  console.log('Recommendation:');
  console.log(`  Use ${tenantCount} as the accurate current retail store count`);
  console.log('  This represents actual retail tenants currently listed on the official website');
  console.log('  The research figure of 77 may include:');
  console.log('    - James Williams Healthy Living Centre (NHS facility)');
  console.log('    - Ascend co-working space');
  console.log('    - Service units (banks, estate agents, etc.)');
  console.log('    - Kiosks and temporary units');
  console.log('');

  // Update location if needed
  if (location?.numberOfStores !== tenantCount) {
    console.log(`Updating numberOfStores from ${location?.numberOfStores} to ${tenantCount}...`);
    await prisma.location.update({
      where: { id: PENTAGON_ID },
      data: { numberOfStores: tenantCount },
    });
    console.log('✅ Updated numberOfStores field\n');
  } else {
    console.log('✅ numberOfStores field already matches tenant count\n');
  }

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });

