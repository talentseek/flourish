import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findLowTenantLocations() {
    // Find locations with websites but 0-5 tenants
    const locations = await prisma.location.findMany({
        where: {
            website: { not: null }
        },
        include: { _count: { select: { tenants: true } } },
        orderBy: { name: 'asc' }
    });

    const lowTenant = locations.filter(l => l._count.tenants <= 5 && l.website);

    console.log('=== LOCATIONS WITH WEBSITE BUT 0-5 TENANTS ===');
    console.log('Total:', lowTenant.length);
    console.log('');

    for (const loc of lowTenant) {
        console.log(`${loc.name} | Tenants: ${loc._count.tenants} | ${loc.website}`);
    }

    await prisma.$disconnect();
}

findLowTenantLocations();
