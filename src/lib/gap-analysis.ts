import { prisma } from "@/lib/db";
import { Location } from "@prisma/client";

export const runtime = 'nodejs';

// Field categories for smart context
export interface FieldGap {
  field: string;
  displayName: string;
  category: 'core' | 'geo' | 'operational' | 'commercial' | 'digital' | 'demographic';
  totalMissing: number;
  relevantTotal: number; // Smart denominator
  percentage: number;
  priority: 'high' | 'medium' | 'low';
  enrichmentMethod: 'api' | 'scraping' | 'manual' | 'calculated';
  contextNote: string; // e.g., "of locations with websites"
}

export interface GapAnalysisResult {
  overview: {
    totalLocations: number;
    shoppingCentresRetailParks: number;
    locationsWithWebsites: number;
  };
  fieldGaps: FieldGap[];
  criticalGaps: {
    majorLocationsWithoutWebsites: number;
    shoppingCentresWithoutSocial: number;
    shoppingCentresWithoutParking: number;
  };
}

// Define what "relevant" means for each field
function getRelevantLocations(field: string, allLocations: Location[]): Location[] {
  const shoppingCentresRetailParks = allLocations.filter(loc => 
    loc.type === 'SHOPPING_CENTRE' || loc.type === 'RETAIL_PARK'
  );
  
  const locationsWithWebsites = allLocations.filter(loc => loc.website !== null);
  
  switch (field) {
    // Social media & digital fields: only count locations WITH websites
    case 'instagram':
    case 'facebook':
    case 'tiktok':
    case 'youtube':
    case 'twitter':
    case 'facebookRating':
    case 'facebookReviews':
    case 'googleRating':
    case 'googleReviews':
    case 'phone':
    case 'openingHours':
      return locationsWithWebsites;
    
    // Operational fields that require websites
    case 'numberOfFloors':
    case 'publicTransit':
    case 'openedYear':
    case 'carParkPrice':
    case 'evCharging':
    case 'evChargingSpaces':
      return locationsWithWebsites;
    
    // Parking: only shopping centres/retail parks
    case 'parkingSpaces':
      return shoppingCentresRetailParks;
    
    // Anchor tenants: only shopping centres/retail parks
    case 'anchorTenants':
      return shoppingCentresRetailParks;
    
    // Website: only shopping centres/retail parks
    case 'website':
      return shoppingCentresRetailParks;
    
    // Owner/Management/Footfall: only shopping centres/retail parks
    case 'owner':
    case 'management':
    case 'footfall':
      return shoppingCentresRetailParks;
    
    // Everything else: all locations
    default:
      return allLocations;
  }
}

// Get context note for smart percentages
function getContextNote(field: string): string {
  switch (field) {
    case 'instagram':
    case 'facebook':
    case 'tiktok':
    case 'youtube':
    case 'twitter':
    case 'facebookRating':
    case 'facebookReviews':
    case 'googleRating':
    case 'googleReviews':
    case 'phone':
    case 'openingHours':
    case 'numberOfFloors':
    case 'publicTransit':
    case 'openedYear':
    case 'carParkPrice':
    case 'evCharging':
    case 'evChargingSpaces':
      return 'of locations with websites';
    
    case 'parkingSpaces':
    case 'anchorTenants':
    case 'website':
    case 'owner':
    case 'management':
    case 'footfall':
      return 'of shopping centres/retail parks';
    
    default:
      return 'of all locations';
  }
}

// Determine enrichment method
function getEnrichmentMethod(field: string): FieldGap['enrichmentMethod'] {
  switch (field) {
    // API-based enrichment
    case 'latitude':
    case 'longitude':
      return 'api'; // Geocoding APIs
    
    case 'population':
    case 'medianAge':
    case 'homeownership':
    case 'avgHouseholdIncome':
      return 'api'; // Census APIs
    
    case 'website':
      return 'api'; // Google Places API
    
    case 'phone':
    case 'googleRating':
    case 'googleReviews':
    case 'openingHours':
      return 'api'; // Google Places API
    
    // Web scraping
    case 'instagram':
    case 'facebook':
    case 'tiktok':
    case 'youtube':
    case 'twitter':
    case 'parkingSpaces':
    case 'numberOfFloors':
    case 'publicTransit':
    case 'openedYear':
    case 'carParkPrice':
    case 'evCharging':
    case 'evChargingSpaces':
    case 'facebookRating':
    case 'facebookReviews':
      return 'scraping'; // Web scraping
    
    // Calculated/derived
    case 'healthIndex':
    case 'vacancy':
    case 'largestCategory':
    case 'largestCategoryPercent':
    case 'retailers':
    case 'retailSpace':
      return 'calculated'; // From existing data or CSV
    
    // Manual entry required
    case 'owner':
    case 'management':
    case 'footfall':
    case 'anchorTenants':
      return 'manual'; // Requires manual input or paid data
    
    default:
      return 'manual'; // Default to manual
  }
}

// Determine priority based on field importance and gap size
function getPriority(field: string, percentage: number): FieldGap['priority'] {
  // High priority fields
  const highPriorityFields = ['website', 'latitude', 'longitude', 'numberOfStores', 'totalFloorArea'];
  
  if (highPriorityFields.includes(field) && percentage < 90) {
    return 'high';
  }
  
  // Medium priority fields
  const mediumPriorityFields = ['instagram', 'facebook', 'vacancy', 'parkingSpaces'];
  
  if (mediumPriorityFields.includes(field) && percentage < 70) {
    return 'medium';
  }
  
  return 'low';
}

// Get display name for field
function getDisplayName(field: string): string {
  const displayNames: Record<string, string> = {
    name: 'Name',
    type: 'Type',
    address: 'Address',
    city: 'City',
    county: 'County',
    postcode: 'Postcode',
    latitude: 'Latitude',
    longitude: 'Longitude',
    phone: 'Phone Number',
    numberOfStores: 'Number of Stores',
    totalFloorArea: 'Total Floor Area',
    parkingSpaces: 'Parking Spaces',
    anchorTenants: 'Anchor Tenants',
    numberOfFloors: 'Number of Floors',
    publicTransit: 'Public Transit',
    openedYear: 'Opened Year',
    carParkPrice: 'Car Park Price',
    evCharging: 'EV Charging',
    evChargingSpaces: 'EV Charging Spaces',
    retailers: 'Retailers',
    retailSpace: 'Retail Space',
    owner: 'Owner',
    management: 'Management',
    footfall: 'Annual Footfall',
    healthIndex: 'Health Index',
    vacancy: 'Vacancy Rate',
    largestCategory: 'Largest Category',
    largestCategoryPercent: 'Largest Category %',
    website: 'Website',
    instagram: 'Instagram',
    facebook: 'Facebook',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    twitter: 'Twitter',
    googleRating: 'Google Rating',
    googleReviews: 'Google Reviews',
    facebookRating: 'Facebook Rating',
    facebookReviews: 'Facebook Reviews',
    openingHours: 'Opening Hours',
    population: 'Population',
    medianAge: 'Median Age',
    avgHouseholdIncome: 'Avg Household Income',
    homeownership: 'Homeownership Rate',
  };
  
  return displayNames[field] || field;
}

// Get category for field
function getCategory(field: string): FieldGap['category'] {
  if (['name', 'type', 'address', 'city', 'county', 'postcode'].includes(field)) {
    return 'core';
  }
  
  if (['latitude', 'longitude'].includes(field)) {
    return 'geo';
  }
  
  if (['numberOfStores', 'totalFloorArea', 'parkingSpaces', 'anchorTenants', 'numberOfFloors', 
       'publicTransit', 'openedYear', 'carParkPrice', 'evCharging', 'evChargingSpaces', 
       'retailers', 'retailSpace', 'owner', 'management', 'footfall'].includes(field)) {
    return 'operational';
  }
  
  if (['healthIndex', 'vacancy', 'largestCategory', 'largestCategoryPercent'].includes(field)) {
    return 'commercial';
  }
  
  if (['website', 'phone', 'instagram', 'facebook', 'tiktok', 'youtube', 'twitter', 
       'googleRating', 'googleReviews', 'facebookRating', 'facebookReviews', 'openingHours'].includes(field)) {
    return 'digital';
  }
  
  return 'demographic';
}

// Main gap analysis function
export async function computeGapAnalysis(): Promise<GapAnalysisResult> {
  // Fetch all locations
  const allLocations = await prisma.location.findMany();
  
  // Calculate overview stats
  const shoppingCentresRetailParks = allLocations.filter(loc => 
    loc.type === 'SHOPPING_CENTRE' || loc.type === 'RETAIL_PARK'
  );
  const locationsWithWebsites = allLocations.filter(loc => loc.website !== null);
  
  // Fields to analyze (ALL enrichable fields)
  const fieldsToAnalyze = [
    // Core (should be complete)
    'name', 'type', 'address', 'city', 'county', 'postcode',
    // Geo
    'latitude', 'longitude',
    // Operational
    'numberOfStores', 'totalFloorArea', 'parkingSpaces', 'anchorTenants', 
    'numberOfFloors', 'publicTransit', 'openedYear', 'carParkPrice', 
    'evCharging', 'evChargingSpaces', 'retailers', 'retailSpace',
    'owner', 'management', 'footfall',
    // Commercial
    'healthIndex', 'vacancy', 'largestCategory', 'largestCategoryPercent',
    // Digital
    'website', 'phone', 'instagram', 'facebook', 'tiktok', 'youtube', 'twitter', 
    'googleRating', 'googleReviews', 'facebookRating', 'facebookReviews',
    'openingHours',
    // Demographic
    'population', 'medianAge', 'avgHouseholdIncome', 'homeownership',
  ];
  
  // Calculate gaps for each field
  const fieldGaps: FieldGap[] = fieldsToAnalyze.map(field => {
    const relevantLocations = getRelevantLocations(field, allLocations);
    
    // Count missing values
    const missing = relevantLocations.filter(loc => {
      const value = loc[field as keyof Location];
      
      // Special handling for geo fields
      if (field === 'latitude' || field === 'longitude') {
        const numValue = Number(value);
        return value === null || value === undefined || numValue === 0;
      }
      
      return value === null || value === undefined || value === '';
    });
    
    const totalMissing = missing.length;
    const relevantTotal = relevantLocations.length;
    const filled = relevantTotal - totalMissing;
    const percentage = relevantTotal > 0 ? Math.round((filled / relevantTotal) * 100) : 100;
    
    return {
      field,
      displayName: getDisplayName(field),
      category: getCategory(field),
      totalMissing,
      relevantTotal,
      percentage,
      priority: getPriority(field, percentage),
      enrichmentMethod: getEnrichmentMethod(field),
      contextNote: getContextNote(field),
    };
  });
  
  // Sort by priority and gap size
  fieldGaps.sort((a, b) => {
    // Priority order: high > medium > low
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    // Within same priority, sort by percentage (lowest first)
    return a.percentage - b.percentage;
  });
  
  // Calculate critical gaps
  const majorLocations = shoppingCentresRetailParks.filter(loc => 
    (loc.numberOfStores ?? 0) >= 20 // Major = 20+ stores
  );
  
  const criticalGaps = {
    majorLocationsWithoutWebsites: majorLocations.filter(loc => !loc.website).length,
    shoppingCentresWithoutSocial: shoppingCentresRetailParks.filter(loc => 
      !loc.instagram && !loc.facebook && !loc.tiktok && !loc.youtube && !loc.twitter
    ).length,
    shoppingCentresWithoutParking: shoppingCentresRetailParks.filter(loc => 
      loc.parkingSpaces === null
    ).length,
  };
  
  return {
    overview: {
      totalLocations: allLocations.length,
      shoppingCentresRetailParks: shoppingCentresRetailParks.length,
      locationsWithWebsites: locationsWithWebsites.length,
    },
    fieldGaps,
    criticalGaps,
  };
}

// Get locations missing a specific field
export async function getLocationsMissingField(field: string, limit = 100) {
  const allLocations = await prisma.location.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      city: true,
      county: true,
      numberOfStores: true,
      website: true,
      [field]: true,
    },
  });
  
  const relevantLocations = getRelevantLocations(field, allLocations as Location[]);
  
  const missing = relevantLocations.filter(loc => {
    const value = (loc as any)[field];
    
    // Special handling for geo fields
    if (field === 'latitude' || field === 'longitude') {
      const numValue = Number(value);
      return value === null || value === undefined || numValue === 0;
    }
    
    return value === null || value === undefined || value === '';
  });
  
  // Sort by priority: larger locations first
  missing.sort((a, b) => (b.numberOfStores ?? 0) - (a.numberOfStores ?? 0));
  
  return missing.slice(0, limit);
}

