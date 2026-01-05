import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function report() {
    // Get all locations with tenant counts
    const locations = await prisma.location.findMany({
        include: { _count: { select: { tenants: true } } }
    });

    // Focus on locations with meaningful tenant data (> 5 tenants)
    const managed = locations.filter(l => l._count.tenants > 5);

    console.log('=== MANAGED LOCATIONS REPORT ===');
    console.log('Locations with >5 tenants:', managed.length);

    // Separate by demographics status
    const withDemo = managed.filter(l => l.population || l.carOwnership);
    const withoutDemo = managed.filter(l => !l.population && !l.carOwnership);

    console.log('With demographics:', withDemo.length);
    console.log('Without demographics:', withoutDemo.length);

    if (withoutDemo.length > 0) {
        console.log('\n--- Still missing demographics ---');
        for (const loc of withoutDemo) {
            console.log(`  ${loc.name} | ${loc.city || '-'} | ${loc.county || '-'} | Tenants: ${loc._count.tenants}`);
        }
    }

    // Top locations by tenant count
    console.log('\n--- Top 15 locations by tenant count ---');
    const topLocations = [...locations].sort((a, b) => b._count.tenants - a._count.tenants).slice(0, 15);
    for (const loc of topLocations) {
        const demoStatus = (loc.population || loc.carOwnership) ? '✅' : '❌';
        console.log(`  ${loc.name} | Tenants: ${loc._count.tenants} | Demo: ${demoStatus}`);
    }

    // Overall stats
    const totalTenants = await prisma.tenant.count();
    const anchorTenants = await prisma.tenant.count({ where: { isAnchorTenant: true } });
    const locationsWithTenants = locations.filter(l => l._count.tenants > 0).length;
    const locationsWithDemo = locations.filter(l => l.population || l.carOwnership).length;

    console.log('\n=== OVERALL STATS ===');
    console.log('Total tenants:', totalTenants);
    console.log('Anchor tenants:', anchorTenants);
    console.log('Locations with tenants:', locationsWithTenants);
    console.log('Locations with demographics:', locationsWithDemo);

    await prisma.$disconnect();
}

report();
