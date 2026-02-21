import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

// Category importance weights for gap scoring (canonical LDC T2 names)
const CATEGORY_IMPORTANCE: Record<string, number> = {
  'Cafes & Restaurants': 10,
  'Clothing & Footwear': 9,
  'Health & Beauty': 8,
  'Food & Grocery': 8,
  'Leisure & Entertainment': 8,
  'Electrical & Technology': 7,
  'Jewellery & Watches': 7,
  'General Retail': 6,
  'Home & Garden': 6,
  'Department Stores': 6,
  'Gifts & Stationery': 5,
  'Kids & Toys': 5,
  'Financial Services': 4,
  'Services': 4,
  'Charity & Second Hand': 3,
  'Vacant': 1,
};

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

export interface TenantComparisonResult {
  target: {
    locationId: string;
    locationName: string;
    totalTenants: number;
    categories: CategoryBreakdown[];
  };
  competitors: {
    totalLocations: number;
    totalTenants: number;
    averageTenantsPerLocation: number;
    categories: CategoryBreakdown[];
  };
  gaps: {
    missingCategories: Array<{
      category: string;
      competitorCount: number;
      competitorPercentage: number;
      gapScore: number;
    }>;
    overRepresented: Array<{
      category: string;
      targetCount: number;
      targetPercentage: number;
      competitorAverage: number;
      variance: number;
    }>;
    underRepresented: Array<{
      category: string;
      targetCount: number;
      targetPercentage: number;
      competitorAverage: number;
      variance: number;
      gapScore: number;
    }>;
  };
}

export interface MissingBrand {
  name: string;
  category: string;
  presentInLocations: Array<{
    locationId: string;
    locationName: string;
  }>;
}

export interface GapAnalysis {
  comparison: TenantComparisonResult;
  missingBrands: MissingBrand[];
  priorities: Array<{
    category: string;
    priority: 'high' | 'medium' | 'low';
    score: number;
    gapType: 'missing' | 'under-represented';
    gapSize: number;
    competitorCoverage: number;
    recommendation: string;
  }>;
  insights: string[];
}

// Resolve tenant to its Tier 2 (Category) name for consistent aggregation.
// If categoryRef is T3, walks up to parent T2. Falls back to raw category string.
function getCategoryName(tenant: {
  category: string;
  categoryRef?: { name: string; tier: number; parentCategory?: { name: string } | null } | null;
}): string {
  if (tenant.categoryRef) {
    // T3 → walk up to T2 parent
    if (tenant.categoryRef.tier === 3 && tenant.categoryRef.parentCategory) {
      return tenant.categoryRef.parentCategory.name;
    }
    // T2 → use directly
    if (tenant.categoryRef.tier === 2) {
      return tenant.categoryRef.name;
    }
    // T1 or unknown → use name as-is
    return tenant.categoryRef.name;
  }
  return tenant.category || 'Uncategorized';
}

// Calculate category breakdown for a set of tenants
function calculateCategoryBreakdown(tenants: Array<{ category: string; categoryRef?: { name: string; tier: number; parentCategory?: { name: string } | null } | null }>): CategoryBreakdown[] {
  const categoryMap = new Map<string, number>();

  tenants.forEach(tenant => {
    const categoryName = getCategoryName(tenant);
    categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
  });

  const total = tenants.length || 1;

  return Array.from(categoryMap.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: (count / total) * 100
    }))
    .sort((a, b) => b.count - a.count);
}

// Compare tenant categories between target and competitors
export async function compareTenantCategories(
  targetLocationId: string,
  competitorLocationIds: string[]
): Promise<TenantComparisonResult> {
  // Fetch target location with tenants
  const targetLocation = await prisma.location.findUnique({
    where: { id: targetLocationId },
    include: {
      tenants: {
        include: {
          categoryRef: {
            include: { parentCategory: true }
          }
        }
      }
    }
  });

  if (!targetLocation) {
    throw new Error(`Target location ${targetLocationId} not found`);
  }

  // Fetch competitor locations with tenants
  const competitorLocations = await prisma.location.findMany({
    where: {
      id: { in: competitorLocationIds }
    },
    include: {
      tenants: {
        include: {
          categoryRef: {
            include: { parentCategory: true }
          }
        }
      }
    }
  });

  // Calculate target breakdown
  const targetCategories = calculateCategoryBreakdown(targetLocation.tenants);

  // Aggregate competitor tenants
  const allCompetitorTenants = competitorLocations.flatMap(loc => loc.tenants);
  const competitorCategories = calculateCategoryBreakdown(allCompetitorTenants);

  // Calculate competitor averages
  const competitorTotalTenants = allCompetitorTenants.length;
  const competitorAverageTenants = competitorLocations.length > 0
    ? competitorTotalTenants / competitorLocations.length
    : 0;

  // Find missing categories (present in competitors, absent in target)
  const targetCategorySet = new Set(targetCategories.map(c => c.category));
  const missingCategories = competitorCategories
    .filter(compCat => !targetCategorySet.has(compCat.category))
    .map(compCat => ({
      category: compCat.category,
      competitorCount: compCat.count,
      competitorPercentage: compCat.percentage,
      gapScore: calculateGapScore(compCat.category, compCat.percentage, compCat.count, competitorLocations.length)
    }))
    .sort((a, b) => b.gapScore - a.gapScore);

  // Find over/under-represented categories
  const overRepresented: TenantComparisonResult['gaps']['overRepresented'] = [];
  const underRepresented: TenantComparisonResult['gaps']['underRepresented'] = [];

  targetCategories.forEach(targetCat => {
    const competitorCat = competitorCategories.find(c => c.category === targetCat.category);
    const competitorAvg = competitorCat?.percentage || 0;
    const variance = targetCat.percentage - competitorAvg;

    if (variance > 5) { // More than 5% above average
      overRepresented.push({
        category: targetCat.category,
        targetCount: targetCat.count,
        targetPercentage: targetCat.percentage,
        competitorAverage: competitorAvg,
        variance
      });
    } else if (variance < -5) { // More than 5% below average
      underRepresented.push({
        category: targetCat.category,
        targetCount: targetCat.count,
        targetPercentage: targetCat.percentage,
        competitorAverage: competitorAvg,
        variance: Math.abs(variance),
        gapScore: calculateGapScore(targetCat.category, competitorAvg, competitorCat?.count || 0, competitorLocations.length)
      });
    }
  });

  // Sort by gap score
  underRepresented.sort((a, b) => b.gapScore - a.gapScore);

  return {
    target: {
      locationId: targetLocation.id,
      locationName: targetLocation.name,
      totalTenants: targetLocation.tenants.length,
      categories: targetCategories
    },
    competitors: {
      totalLocations: competitorLocations.length,
      totalTenants: competitorTotalTenants,
      averageTenantsPerLocation: competitorAverageTenants,
      categories: competitorCategories
    },
    gaps: {
      missingCategories,
      overRepresented,
      underRepresented
    }
  };
}

// Find missing brands (tenant names) in target that exist in competitors
export async function findMissingBrands(
  targetLocationId: string,
  competitorLocationIds: string[]
): Promise<MissingBrand[]> {
  // Fetch target tenants
  const targetLocation = await prisma.location.findUnique({
    where: { id: targetLocationId },
    include: {
      tenants: {
        include: {
          categoryRef: {
            include: { parentCategory: true }
          }
        }
      }
    }
  });

  if (!targetLocation) {
    throw new Error(`Target location ${targetLocationId} not found`);
  }

  // Fetch competitor tenants
  const competitorLocations = await prisma.location.findMany({
    where: {
      id: { in: competitorLocationIds }
    },
    include: {
      tenants: {
        include: {
          categoryRef: {
            include: { parentCategory: true }
          }
        }
      }
    }
  });

  // Create set of target tenant names (case-insensitive)
  const targetTenantNames = new Set(
    targetLocation.tenants.map(t => t.name.toLowerCase().trim())
  );

  // Find tenants in competitors that aren't in target
  const missingBrandsMap = new Map<string, MissingBrand>();

  competitorLocations.forEach(compLocation => {
    compLocation.tenants.forEach(tenant => {
      const tenantNameLower = tenant.name.toLowerCase().trim();

      // Skip if already in target or if it's an anchor tenant (location-specific)
      if (targetTenantNames.has(tenantNameLower) || tenant.isAnchorTenant) {
        return;
      }

      const categoryName = getCategoryName(tenant);
      const key = `${tenantNameLower}::${categoryName}`;

      if (!missingBrandsMap.has(key)) {
        missingBrandsMap.set(key, {
          name: tenant.name,
          category: categoryName,
          presentInLocations: []
        });
      }

      const brand = missingBrandsMap.get(key)!;
      brand.presentInLocations.push({
        locationId: compLocation.id,
        locationName: compLocation.name
      });
    });
  });

  return Array.from(missingBrandsMap.values())
    .sort((a, b) => b.presentInLocations.length - a.presentInLocations.length);
}

// Calculate gap priority score
function calculateGapScore(
  category: string,
  competitorPercentage: number,
  competitorCount: number,
  competitorLocationCount: number
): number {
  // Base score from category importance
  const importance = CATEGORY_IMPORTANCE[category] || 5;

  // Competitor coverage (how many competitors have this category)
  const coverageScore = competitorLocationCount > 0
    ? (competitorCount / competitorLocationCount) * 10
    : 0;

  // Percentage weight
  const percentageScore = competitorPercentage;

  // Combined score (weighted)
  return (importance * 0.4) + (coverageScore * 0.3) + (percentageScore * 0.3);
}

// Calculate gap priorities
export function calculateGapPriority(comparison: TenantComparisonResult): GapAnalysis['priorities'] {
  const priorities: GapAnalysis['priorities'] = [];

  // Add missing categories
  comparison.gaps.missingCategories.forEach(gap => {
    const score = gap.gapScore;
    const priority: 'high' | 'medium' | 'low' = score > 8 ? 'high' : score > 5 ? 'medium' : 'low';

    priorities.push({
      category: gap.category,
      priority,
      score,
      gapType: 'missing',
      gapSize: 0, // Can't quantify size for missing categories
      competitorCoverage: (gap.competitorCount / comparison.competitors.totalLocations) * 100,
      recommendation: generateRecommendation(gap.category, 'missing', 0, gap.competitorPercentage)
    });
  });

  // Add under-represented categories
  comparison.gaps.underRepresented.forEach(gap => {
    const score = gap.gapScore;
    const priority: 'high' | 'medium' | 'low' = score > 8 ? 'high' : score > 5 ? 'medium' : 'low';

    // Estimate gap size (how many stores needed to match average)
    const targetStoreCount = comparison.target.totalTenants;
    const neededPercentage = gap.competitorAverage - gap.targetPercentage;
    const estimatedGapSize = Math.ceil((targetStoreCount * neededPercentage) / 100);

    priorities.push({
      category: gap.category,
      priority,
      score,
      gapType: 'under-represented',
      gapSize: estimatedGapSize,
      competitorCoverage: (gap.competitorAverage / 100) * comparison.competitors.totalLocations,
      recommendation: generateRecommendation(gap.category, 'under-represented', estimatedGapSize, gap.competitorAverage)
    });
  });

  // Sort by priority and score
  return priorities.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.score - a.score;
  });
}

// Generate recommendation text
function generateRecommendation(
  category: string,
  gapType: 'missing' | 'under-represented',
  gapSize: number,
  competitorAverage: number
): string {
  if (gapType === 'missing') {
    return `Consider adding ${category} tenants. ${competitorAverage.toFixed(1)}% of competitor stores are in this category.`;
  } else {
    const storesText = gapSize === 1 ? 'store' : 'stores';
    return `Add approximately ${gapSize} ${storesText} in ${category} to match competitor average (${competitorAverage.toFixed(1)}%).`;
  }
}

// Generate intelligent insights
export function generateGapInsights(analysis: GapAnalysis): string[] {
  const insights: string[] = [];

  const { comparison, priorities, missingBrands } = analysis;

  // Top priority gap
  if (priorities.length > 0) {
    const topGap = priorities[0];
    insights.push(
      `Highest priority gap: ${topGap.category} is ${topGap.gapType === 'missing' ? 'completely missing' : `under-represented by ~${topGap.gapSize} stores`} compared to competitors.`
    );
  }

  // Missing categories count
  if (comparison.gaps.missingCategories.length > 0) {
    insights.push(
      `${comparison.gaps.missingCategories.length} categories are present in competitors but missing from ${comparison.target.locationName}.`
    );
  }

  // Under-represented categories
  if (comparison.gaps.underRepresented.length > 0) {
    const totalGapSize = comparison.gaps.underRepresented.reduce((sum, gap) => sum + Math.ceil((comparison.target.totalTenants * Math.abs(gap.variance)) / 100), 0);
    insights.push(
      `${comparison.gaps.underRepresented.length} categories are under-represented, representing an estimated ${totalGapSize} store opportunity.`
    );
  }

  // Missing brands
  if (missingBrands.length > 0) {
    const topBrands = missingBrands.slice(0, 5).map(b => b.name).join(', ');
    insights.push(
      `${missingBrands.length} tenant brands found in competitors are not present in ${comparison.target.locationName}. Top missing brands: ${topBrands}.`
    );
  }

  // Category balance
  const topTargetCategory = comparison.target.categories[0];
  const topCompetitorCategory = comparison.competitors.categories[0];
  if (topTargetCategory && topCompetitorCategory && topTargetCategory.category !== topCompetitorCategory.category) {
    insights.push(
      `Target location's largest category is ${topTargetCategory.category} (${topTargetCategory.percentage.toFixed(1)}%), while competitors average ${topCompetitorCategory.category} (${topCompetitorCategory.percentage.toFixed(1)}%).`
    );
  }

  return insights;
}

// Comprehensive gap analysis
export async function performGapAnalysis(
  targetLocationId: string,
  competitorLocationIds: string[],
  includeBrands: boolean = true
): Promise<GapAnalysis> {
  // Perform comparison
  const comparison = await compareTenantCategories(targetLocationId, competitorLocationIds);

  // Find missing brands (if requested)
  const missingBrands = includeBrands
    ? await findMissingBrands(targetLocationId, competitorLocationIds)
    : [];

  // Calculate priorities
  const priorities = calculateGapPriority(comparison);

  // Create analysis object
  const analysis: GapAnalysis = {
    comparison,
    missingBrands,
    priorities,
    insights: []
  };

  // Generate insights
  analysis.insights = generateGapInsights(analysis);

  return analysis;
}

