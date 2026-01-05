import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGaps() {
    // Get all locations
    const locations = await prisma.location.findMany({
        include: { _count: { select: { tenants: true } } },
        orderBy: { name: 'asc' }
    });

    console.log('=== LOCATIONS GAP ANALYSIS ===\n');
    console.log('Total locations:', locations.length);

    // Missing demographics
    const missingDemographics = locations.filter(l =>
        l.population === null && l.carOwnership === null && l.homeownership === null
    );
    console.log('\n--- MISSING DEMOGRAPHICS (' + missingDemographics.length + ') ---');
    for (const loc of missingDemographics) {
        console.log(`  - ${loc.name} | ${loc.city || 'no city'} | ${loc.county || 'no county'} | Tenants: ${loc._count.tenants}`);
    }

    // Missing tenants (0 tenants)
    const noTenants = locations.filter(l => l._count.tenants === 0);
    console.log('\n--- NO TENANTS (' + noTenants.length + ') ---');
    for (const loc of noTenants) {
        console.log(`  - ${loc.name} | ${loc.website || 'no website'}`);
    }

    // Missing website
    const noWebsite = locations.filter(l => !l.website);
    console.log('\n--- NO WEBSITE (' + noWebsite.length + ') ---');
    for (const loc of noWebsite) {
        console.log(`  - ${loc.name} | ${loc.city || 'no city'}`);
    }

    // Summary stats
    const totalTenants = await prisma.tenant.count();
    const anchorTenants = await prisma.tenant.count({ where: { isAnchorTenant: true } });
    const withDemographics = locations.filter(l => l.population !== null || l.carOwnership !== null).length;

    console.log('\n=== SUMMARY STATS ===');
    console.log('Total tenants:', totalTenants);
    console.log('Anchor tenants:', anchorTenants);
    console.log('Locations with demographics:', withDemographics + '/' + locations.length);
    console.log('Locations with tenants:', locations.filter(l => l._count.tenants > 0).length + '/' + locations.length);
    console.log('Locations with website:', locations.filter(l => l.website).length + '/' + locations.length);

    await prisma.$disconnect();
}

checkGaps();
