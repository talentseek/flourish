// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking Tenant Data Completeness\n');
  console.log('═'.repeat(60));
  
  // Basic counts
  const totalLocations = await prisma.location.count();
  const totalTenants = await prisma.tenant.count();
  const totalCategories = await prisma.category.count();
  
  // Locations with tenants
  const locationsWithTenants = await prisma.location.count({
    where: {
      tenants: {
        some: {}
      }
    }
  });
  
  // Tenants with normalized categories
  const tenantsWithCategoryId = await prisma.tenant.count({
    where: {
      categoryId: { not: null }
    }
  });
  
  // Locations by type with tenant data
  const byType = await prisma.location.groupBy({
    by: ['type'],
    _count: { id: true }
  });
  
  const withTenantsByType = await Promise.all(
    byType.map(async (typeGroup) => {
      const count = await prisma.location.count({
        where: {
          type: typeGroup.type,
          tenants: {
            some: {}
          }
        }
      });
      return {
        type: typeGroup.type,
        total: typeGroup._count.id,
        withTenants: count,
        percentage: ((count / typeGroup._count.id) * 100).toFixed(1)
      };
    })
  );
  
  // Top locations by tenant count
  const allLocationsWithTenants = await prisma.location.findMany({
    where: {
      tenants: {
        some: {}
      }
    },
    include: {
      _count: {
        select: { tenants: true }
      }
    }
  });
  
  const topLocations = allLocationsWithTenants
    .sort((a, b) => b._count.tenants - a._count.tenants)
    .slice(0, 10);
  
  // Category coverage
  const categoryCoverage = await prisma.tenant.groupBy({
    by: ['category'],
    _count: { category: true },
    orderBy: {
      _count: { category: 'desc' }
    },
    take: 20
  });
  
  console.log('📊 OVERALL STATISTICS');
  console.log('═'.repeat(60));
  console.log(`Total Locations: ${totalLocations.toLocaleString()}`);
  console.log(`Locations with Tenants: ${locationsWithTenants.toLocaleString()} (${((locationsWithTenants / totalLocations) * 100).toFixed(1)}%)`);
  console.log(`Total Tenants: ${totalTenants.toLocaleString()}`);
  console.log(`Total Categories: ${totalCategories.toLocaleString()}`);
  console.log(`Tenants with Normalized Categories: ${tenantsWithCategoryId.toLocaleString()} (${((tenantsWithCategoryId / totalTenants) * 100).toFixed(1)}%)`);
  
  console.log('\n📈 COVERAGE BY LOCATION TYPE');
  console.log('═'.repeat(60));
  withTenantsByType.forEach(({ type, total, withTenants, percentage }) => {
    console.log(`${type}: ${withTenants}/${total} (${percentage}%)`);
  });
  
  console.log('\n🏆 TOP 10 LOCATIONS BY TENANT COUNT');
  console.log('═'.repeat(60));
  topLocations.forEach((loc, i) => {
    console.log(`${i + 1}. ${loc.name} (${loc.type})`);
    console.log(`   Tenants: ${loc._count.tenants} | Published Stores: ${loc.numberOfStores || 'N/A'}`);
  });
  
  console.log('\n📋 TOP 20 CATEGORIES BY TENANT COUNT');
  console.log('═'.repeat(60));
  categoryCoverage.forEach((cat, i) => {
    console.log(`${i + 1}. ${cat.category}: ${cat._count.category.toLocaleString()} tenants`);
  });
  
  // Sample locations for gap analysis testing
  console.log('\n🎯 SAMPLE LOCATIONS FOR TESTING');
  console.log('═'.repeat(60));
  const allSampleLocations = await prisma.location.findMany({
    where: {
      tenants: {
        some: {}
      }
    },
    include: {
      _count: {
        select: { tenants: true }
      }
    }
  });
  
  const sampleLocations = allSampleLocations
    .sort((a, b) => b._count.tenants - a._count.tenants)
    .slice(0, 5);
  
  sampleLocations.forEach((loc, i) => {
    console.log(`${i + 1}. ${loc.name} (ID: ${loc.id})`);
    console.log(`   Type: ${loc.type} | City: ${loc.city} | Tenants: ${loc._count.tenants}`);
  });
  
  console.log('\n✅ Data completeness check complete!\n');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

