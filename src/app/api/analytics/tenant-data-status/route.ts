import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
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
    
    // Coverage by location type
    const byType = await prisma.location.groupBy({
      by: ['type'],
      _count: { id: true }
    });
    
    const coverageByType = await Promise.all(
      byType.map(async (typeGroup) => {
        const withTenants = await prisma.location.count({
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
          withTenants,
          percentage: ((withTenants / typeGroup._count.id) * 100)
        };
      })
    );
    
    // Top categories
    const topCategories = await prisma.tenant.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: {
        _count: { category: 'desc' }
      },
      take: 20
    });
    
    return NextResponse.json({
      success: true,
      data: {
        overall: {
          totalLocations,
          locationsWithTenants,
          locationsWithTenantsPercentage: ((locationsWithTenants / totalLocations) * 100),
          totalTenants,
          totalCategories,
          tenantsWithNormalizedCategories: tenantsWithCategoryId,
          tenantsWithNormalizedCategoriesPercentage: totalTenants > 0 
            ? ((tenantsWithCategoryId / totalTenants) * 100)
            : 0
        },
        coverageByType,
        topCategories: topCategories.map(cat => ({
          category: cat.category,
          count: cat._count.category
        }))
      }
    });
  } catch (e: any) {
    console.error("tenant-data-status error", e);
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}

