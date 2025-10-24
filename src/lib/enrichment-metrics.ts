import { prisma } from "@/lib/db";
import { Location, EnrichmentSnapshot } from "@prisma/client";

export const runtime = 'nodejs';

// Tier definitions mapping to Prisma Location fields
export const ENRICHMENT_TIERS = {
  core: ['name', 'type', 'address', 'city', 'county', 'postcode'],
  geo: ['latitude', 'longitude'], // Special handling: latitude !== 0
  // Operational: Core metrics (parkingSpaces & anchorTenants are optional bonus data)
  operational: ['numberOfStores', 'totalFloorArea'],
  // Commercial: healthIndex is optional as it's not available for all properties
  commercial: ['vacancy', 'largestCategory', 'largestCategoryPercent'],
  // Digital: At least ONE social media platform (instagram, facebook, tiktok, youtube, twitter)
  digital: ['instagram', 'facebook'], // Not enforced - any social media counts
  // Demographic: avgHouseholdIncome not available in Census 2021 (optional)
  demographic: ['population', 'medianAge', 'homeownership']
} as const;

export type TierName = keyof typeof ENRICHMENT_TIERS;

export interface EnrichmentStats {
  totalLocations: number;
  coreComplete: number;
  geoComplete: number;
  operationalComplete: number;
  commercialComplete: number;
  digitalComplete: number;
  demographicComplete: number;
  fieldStats: Record<string, { filled: number; empty: number }>;
}

// Check if location meets tier requirements
export function checkTierComplete(location: Partial<Location>, tier: TierName): boolean {
  const fields = ENRICHMENT_TIERS[tier];
  
  // Special handling for geo tier - latitude/longitude must be non-zero
  if (tier === 'geo') {
    const lat = Number(location.latitude);
    const lng = Number(location.longitude);
    return lat !== 0 && lng !== 0 && location.latitude !== null && location.longitude !== null;
  }
  
  // Special handling for digital tier - at least ONE social media platform
  if (tier === 'digital') {
    const socialFields = ['instagram', 'facebook', 'tiktok', 'youtube', 'twitter'] as const;
    return socialFields.some(field => {
      const value = location[field];
      return value !== null && value !== undefined && value !== '';
    });
  }
  
  // For all other tiers, check that all required fields are non-null
  return fields.every(field => {
    const value = location[field as keyof Location];
    return value !== null && value !== undefined;
  });
}

// Compute tier completeness percentages
export function calculateTierPercentages(stats: EnrichmentStats) {
  const total = stats.totalLocations || 1; // Avoid division by zero
  
  return {
    core: Math.round((stats.coreComplete / total) * 100),
    geo: Math.round((stats.geoComplete / total) * 100),
    operational: Math.round((stats.operationalComplete / total) * 100),
    commercial: Math.round((stats.commercialComplete / total) * 100),
    digital: Math.round((stats.digitalComplete / total) * 100),
    demographic: Math.round((stats.demographicComplete / total) * 100),
  };
}

// Calculate overall enrichment score (average of all tiers)
export function calculateOverallEnrichment(stats: EnrichmentStats): number {
  const percentages = calculateTierPercentages(stats);
  const sum = percentages.core + percentages.geo + percentages.operational + 
              percentages.commercial + percentages.digital + percentages.demographic;
  return Math.round(sum / 6);
}

// Compute enrichment stats for all locations
export async function computeEnrichmentStats(): Promise<EnrichmentSnapshot> {
  // Fetch all locations
  const locations = await prisma.location.findMany();
  
  // Initialize tier counts
  const tierCounts = {
    core: 0,
    geo: 0,
    operational: 0,
    commercial: 0,
    digital: 0,
    demographic: 0,
  };
  
  // Initialize field stats
  const fieldStats: Record<string, { filled: number; empty: number }> = {};
  
  // Process each location
  locations.forEach(location => {
    // Check each tier
    if (checkTierComplete(location, 'core')) tierCounts.core++;
    if (checkTierComplete(location, 'geo')) tierCounts.geo++;
    if (checkTierComplete(location, 'operational')) tierCounts.operational++;
    if (checkTierComplete(location, 'commercial')) tierCounts.commercial++;
    if (checkTierComplete(location, 'digital')) tierCounts.digital++;
    if (checkTierComplete(location, 'demographic')) tierCounts.demographic++;
    
    // Track field-level stats for all fields
    Object.keys(location).forEach(field => {
      // Skip internal fields
      if (field === 'createdAt' || field === 'updatedAt' || field === 'id') {
        return;
      }
      
      if (!fieldStats[field]) {
        fieldStats[field] = { filled: 0, empty: 0 };
      }
      
      const value = location[field as keyof Location];
      
      // Special handling for geo fields
      if (field === 'latitude' || field === 'longitude') {
        const numValue = Number(value);
        if (value !== null && value !== undefined && numValue !== 0) {
          fieldStats[field].filled++;
        } else {
          fieldStats[field].empty++;
        }
      } else {
        // Standard null check
        if (value !== null && value !== undefined) {
          fieldStats[field].filled++;
        } else {
          fieldStats[field].empty++;
        }
      }
    });
  });
  
  // Save snapshot to database
  const snapshot = await prisma.enrichmentSnapshot.create({
    data: {
      totalLocations: locations.length,
      coreComplete: tierCounts.core,
      geoComplete: tierCounts.geo,
      operationalComplete: tierCounts.operational,
      commercialComplete: tierCounts.commercial,
      digitalComplete: tierCounts.digital,
      demographicComplete: tierCounts.demographic,
      fieldStats: fieldStats,
    },
  });
  
  return snapshot;
}

// Get latest cached snapshot
export async function getLatestEnrichmentSnapshot(): Promise<EnrichmentSnapshot | null> {
  const snapshot = await prisma.enrichmentSnapshot.findFirst({
    orderBy: { createdAt: 'desc' },
  });
  
  return snapshot;
}

// Get locations with their enrichment status
export async function getLocationsWithEnrichmentStatus() {
  const locations = await prisma.location.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      address: true,
      city: true,
      county: true,
      postcode: true,
      latitude: true,
      longitude: true,
      numberOfStores: true,
      parkingSpaces: true,
      totalFloorArea: true,
      anchorTenants: true,
      healthIndex: true,
      vacancy: true,
      largestCategory: true,
      largestCategoryPercent: true,
      instagram: true,
      facebook: true,
      tiktok: true,
      youtube: true,
      twitter: true,
      website: true,
      phone: true,
      openingHours: true,
      googleRating: true,
      googleReviews: true,
      facebookRating: true,
      facebookReviews: true,
      googleVotes: true,
      facebookVotes: true,
      seoKeywords: true,
      topPages: true,
      population: true,
      medianAge: true,
      avgHouseholdIncome: true,
      homeownership: true,
    },
  });
  
  return locations;
}

