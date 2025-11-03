import { prisma } from "@/lib/db";

export interface LocationMatch {
  locationId: string;
  name: string;
  city: string;
  county: string;
  confidence: number; // 0-1, where 1 is exact match
}

/**
 * Simple Levenshtein distance calculation for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(
    longer.toLowerCase(),
    shorter.toLowerCase()
  );
  
  return (longer.length - distance) / longer.length;
}

/**
 * Normalize location name for matching
 * Removes common suffixes and normalizes spacing
 */
function normalizeLocationName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\b(shopping centre|shopping center|retail park|retail centre|retail center|outlet centre|outlet center|centre|center)\b/gi, "")
    .trim();
}

/**
 * Resolve a location name to a location ID with fuzzy matching
 * 
 * @param locationName - The name of the location to search for
 * @param options - Optional parameters for search behavior
 * @returns LocationMatch object with locationId, name, and confidence score
 * @throws Error if no match found or multiple ambiguous matches
 */
export async function resolveLocationName(
  locationName: string,
  options: {
    minConfidence?: number; // Minimum confidence threshold (default: 0.6)
    city?: string; // Optional city filter
    limit?: number; // Max number of matches to return (default: 10)
  } = {}
): Promise<LocationMatch> {
  const { minConfidence = 0.6, city, limit = 10 } = options;

  if (!locationName || locationName.trim().length === 0) {
    throw new Error("Location name is required");
  }

  // Fetch all locations (or filter by city if provided)
  const locations = await prisma.location.findMany({
    where: city
      ? {
          city: {
            contains: city,
            mode: "insensitive",
          },
        }
      : undefined,
    select: {
      id: true,
      name: true,
      city: true,
      county: true,
    },
  });

  if (locations.length === 0) {
    throw new Error(`No locations found${city ? ` in ${city}` : ""}`);
  }

  const normalizedSearch = normalizeLocationName(locationName);
  const matches: Array<LocationMatch & { rawScore: number }> = [];

  // Calculate similarity for each location
  for (const location of locations) {
    const normalizedLocation = normalizeLocationName(location.name);
    
    // Check exact match first
    if (normalizedLocation === normalizedSearch) {
      return {
        locationId: location.id,
        name: location.name,
        city: location.city,
        county: location.county,
        confidence: 1.0,
      };
    }

    // Check if search string is contained in location name or vice versa
    const containsMatch =
      normalizedLocation.includes(normalizedSearch) ||
      normalizedSearch.includes(normalizedLocation);
    
    const similarity = calculateSimilarity(normalizedSearch, normalizedLocation);
    
    // Boost score if one contains the other
    const boostedScore = containsMatch
      ? Math.min(1.0, similarity + 0.2)
      : similarity;

    if (boostedScore >= minConfidence) {
      matches.push({
        locationId: location.id,
        name: location.name,
        city: location.city,
        county: location.county,
        confidence: boostedScore,
        rawScore: similarity,
      });
    }
  }

  if (matches.length === 0) {
    throw new Error(
      `No location found matching "${locationName}"${city ? ` in ${city}` : ""}`
    );
  }

  // Sort by confidence (highest first)
  matches.sort((a, b) => b.confidence - a.confidence);

  // If top match is significantly better, return it
  if (matches.length > 1 && matches[0].confidence - matches[1].confidence > 0.15) {
    const { rawScore, ...match } = matches[0];
    return match;
  }

  // If exact single match, return it
  if (matches.length === 1) {
    const { rawScore, ...match } = matches[0];
    return match;
  }

  // Multiple matches - throw error with suggestions
  const suggestions = matches.slice(0, limit).map((m) => m.name).join(", ");
  throw new Error(
    `Multiple locations found matching "${locationName}": ${suggestions}. Please be more specific.`
  );
}

/**
 * Resolve multiple location names to IDs
 * 
 * @param locationNames - Array of location names to resolve
 * @param options - Optional parameters for search behavior
 * @returns Array of LocationMatch objects
 */
export async function resolveMultipleLocationNames(
  locationNames: string[],
  options: {
    minConfidence?: number;
    city?: string;
  } = {}
): Promise<LocationMatch[]> {
  const results: LocationMatch[] = [];
  const errors: string[] = [];

  for (const name of locationNames) {
    try {
      const match = await resolveLocationName(name, options);
      results.push(match);
    } catch (error) {
      errors.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (errors.length > 0 && results.length === 0) {
    throw new Error(`Failed to resolve any locations:\n${errors.join("\n")}`);
  }

  return results;
}

/**
 * Search locations by name with fuzzy matching
 * Returns multiple potential matches sorted by confidence
 * 
 * @param searchQuery - The search query
 * @param limit - Maximum number of results (default: 5)
 * @param city - Optional city name to prioritize/filter results
 * @returns Array of LocationMatch objects sorted by confidence (city matches prioritized)
 */
export async function searchLocationsByName(
  searchQuery: string,
  limit: number = 5,
  city?: string
): Promise<LocationMatch[]> {
  if (!searchQuery || searchQuery.trim().length === 0) {
    return [];
  }

  const locations = await prisma.location.findMany({
    select: {
      id: true,
      name: true,
      city: true,
      county: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Extract city from search query if it contains "in [city]" pattern
  let searchCity = city;
  const cityMatch = searchQuery.match(/\bin\s+([A-Za-z\s]+?)(?:\s+shopping|$)/i);
  if (cityMatch && !searchCity) {
    searchCity = cityMatch[1].trim();
  }

  const normalizedSearch = normalizeLocationName(searchQuery);
  const normalizedCity = searchCity ? searchCity.toLowerCase().trim() : null;
  const matches: Array<LocationMatch & { rawScore: number; cityMatch: boolean }> = [];

  for (const location of locations) {
    const normalizedLocation = normalizeLocationName(location.name);
    const similarity = calculateSimilarity(normalizedSearch, normalizedLocation);
    
    const containsMatch =
      normalizedLocation.includes(normalizedSearch) ||
      normalizedSearch.includes(normalizedLocation);
    
    let boostedScore = containsMatch
      ? Math.min(1.0, similarity + 0.2)
      : similarity;

    // Boost score significantly if city matches
    const locationCityNormalized = location.city?.toLowerCase().trim();
    const cityMatches = normalizedCity && locationCityNormalized && 
      (locationCityNormalized.includes(normalizedCity) || 
       normalizedCity.includes(locationCityNormalized));
    
    if (cityMatches) {
      boostedScore = Math.min(1.0, boostedScore + 0.3); // Strong boost for city match
    }

    if (boostedScore > 0.3) {
      matches.push({
        locationId: location.id,
        name: location.name,
        city: location.city,
        county: location.county,
        confidence: boostedScore,
        rawScore: similarity,
        cityMatch: cityMatches || false,
      });
    }
  }

  // Sort by: city match first, then confidence
  matches.sort((a, b) => {
    if (a.cityMatch !== b.cityMatch) {
      return a.cityMatch ? -1 : 1; // City matches first
    }
    return b.confidence - a.confidence; // Then by confidence
  });
  
  return matches.slice(0, limit).map(({ rawScore, cityMatch, ...match }) => match);
}

