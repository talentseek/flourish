import { CategoryDistribution } from "@/lib/analytics";
import { GapAnalysis, TenantComparisonResult } from "@/lib/tenant-comparison";

export interface FormattedResponse {
  summary: string; // High-level natural language summary for voice
  details?: string; // Detailed information for deeper queries
  insights: string[]; // Key insights and recommendations
}

/**
 * Format category distribution data for voice delivery
 */
export function formatCategoryDistribution(
  distribution: CategoryDistribution[],
  locationName: string,
  radiusKm: number,
  detailLevel: "high" | "detailed" = "high"
): FormattedResponse {
  if (distribution.length === 0) {
    return {
      summary: `I couldn't find tenant category data for the area around ${locationName} within ${radiusKm} kilometers.`,
      insights: [],
    };
  }

  const topCategories = distribution.slice(0, 5);
  const topCategory = topCategories[0];

  // High-level summary
  const summary = `Within ${radiusKm} kilometers of ${locationName}, the most common tenant category is ${topCategory.categoryName}, representing ${topCategory.percentage.toFixed(1)}% of all stores.`;

  // Detailed breakdown
  let details: string | undefined;
  if (detailLevel === "detailed") {
    const categoryList = topCategories
      .map((cat) => `${cat.categoryName} (${cat.percentage.toFixed(1)}%)`)
      .join(", ");
    details = `The top 5 categories in the area are: ${categoryList}.`;
  }

  // Insights
  const insights: string[] = [];
  
  if (topCategory.percentage > 30) {
    insights.push(
      `${topCategory.categoryName} dominates the local market at ${topCategory.percentage.toFixed(1)}%. Consider this when planning your tenant mix.`
    );
  }

  // Check for food & beverage (important category)
  const foodBeverage = distribution.find(
    (cat) =>
      cat.categoryName.toLowerCase().includes("food") ||
      cat.categoryName.toLowerCase().includes("beverage") ||
      cat.categoryName.toLowerCase().includes("drink")
  );
  
  if (foodBeverage && foodBeverage.percentage < 15) {
    insights.push(
      `Food and beverage is underrepresented at ${foodBeverage.percentage.toFixed(1)}%. This category typically drives footfall, so consider adding more dining options.`
    );
  }

  return {
    summary,
    details,
    insights,
  };
}

/**
 * Format gap analysis results for voice delivery
 */
export function formatGapAnalysis(
  analysis: GapAnalysis,
  detailLevel: "high" | "detailed" = "high"
): FormattedResponse {
  const { comparison, priorities, missingBrands, insights } = analysis;

  // High-level summary
  let summary = `I've analyzed ${comparison.target.locationName} compared to ${comparison.competitors.totalLocations} competitor locations. `;

  if (priorities.length === 0) {
    summary += "Your tenant mix is well-balanced compared to competitors.";
  } else {
    const topPriority = priorities[0];
    summary += `The highest priority gap is ${topPriority.category}, which is ${topPriority.gapType === "missing" ? "completely missing" : `under-represented by approximately ${topPriority.gapSize} stores`}.`;
  }

  // Detailed breakdown
  let details: string | undefined;
  if (detailLevel === "detailed") {
    const detailsParts: string[] = [];

    // Missing categories
    if (comparison.gaps.missingCategories.length > 0) {
      const missingList = comparison.gaps.missingCategories
        .slice(0, 5)
        .map((gap) => gap.category)
        .join(", ");
      detailsParts.push(
        `Missing categories present in competitors: ${missingList}.`
      );
    }

    // Under-represented categories
    if (comparison.gaps.underRepresented.length > 0) {
      const underRepList = comparison.gaps.underRepresented
        .slice(0, 5)
        .map(
          (gap) =>
            `${gap.category} (${gap.targetPercentage.toFixed(1)}% vs ${gap.competitorAverage.toFixed(1)}% average)`
        )
        .join(", ");
      detailsParts.push(`Under-represented categories: ${underRepList}.`);
    }

    // Missing brands
    if (missingBrands.length > 0) {
      const topBrands = missingBrands
        .slice(0, 5)
        .map((brand) => brand.name)
        .join(", ");
      detailsParts.push(
        `Popular brands in competitors but not in your location: ${topBrands}.`
      );
    }

    details = detailsParts.join(" ");
  }

  // Format insights for voice
  const formattedInsights = insights.map((insight) => {
    // Make insights more conversational
    return insight.replace(
      `${comparison.target.locationName}`,
      "your location"
    );
  });

  // Add priority recommendations
  const highPriorityGaps = priorities.filter((p) => p.priority === "high");
  if (highPriorityGaps.length > 0) {
    formattedInsights.push(
      `I recommend focusing on ${highPriorityGaps.length} high-priority category gap${highPriorityGaps.length > 1 ? "s" : ""} to improve your tenant mix.`
    );
  }

  return {
    summary,
    details,
    insights: formattedInsights,
  };
}

/**
 * Format local recommendations combining category distribution and gap analysis
 */
export function formatLocalRecommendations(
  categoryDistribution: CategoryDistribution[],
  gapAnalysis: GapAnalysis | null,
  locationName: string,
  radiusKm: number,
  detailLevel: "high" | "detailed" = "high"
): FormattedResponse {
  const categorySummary = formatCategoryDistribution(
    categoryDistribution,
    locationName,
    radiusKm,
    detailLevel
  );

  if (!gapAnalysis) {
    return {
      summary: categorySummary.summary,
      details: categorySummary.details,
      insights: categorySummary.insights,
    };
  }

  const gapSummary = formatGapAnalysis(gapAnalysis, detailLevel);

  // Combine summaries
  const combinedSummary = `${categorySummary.summary} ${gapSummary.summary}`;

  // Combine details
  const combinedDetails = detailLevel === "detailed"
    ? `${categorySummary.details || ""} ${gapSummary.details || ""}`.trim()
    : undefined;

  // Combine and deduplicate insights
  const combinedInsights = [
    ...categorySummary.insights,
    ...gapSummary.insights,
  ].filter((insight, index, self) => self.indexOf(insight) === index);

  return {
    summary: combinedSummary,
    details: combinedDetails,
    insights: combinedInsights,
  };
}

/**
 * Format location details for voice delivery
 */
export function formatLocationDetails(
  location: {
    name: string;
    city: string;
    numberOfStores?: number | null;
    totalFloorArea?: number | null;
    parkingSpaces?: number | null;
    googleRating?: number | null;
    vacancy?: number | null;
    footfall?: number | null;
  },
  detailLevel: "high" | "detailed" = "high"
): FormattedResponse {
  const parts: string[] = [];

  // Basic info
  parts.push(`${location.name} is located in ${location.city}.`);

  if (location.numberOfStores) {
    parts.push(`It has ${location.numberOfStores} stores.`);
  }

  if (location.totalFloorArea) {
    const areaInSqft = Number(location.totalFloorArea);
    const areaInSqm = Math.round(areaInSqft / 10.764);
    parts.push(
      `The total floor area is approximately ${areaInSqm.toLocaleString()} square meters.`
    );
  }

  if (location.parkingSpaces) {
    parts.push(`There are ${location.parkingSpaces} parking spaces available.`);
  }

  const summary = parts.join(" ");

  // Detailed information
  let details: string | undefined;
  const detailsParts: string[] = [];

  if (detailLevel === "detailed") {
    if (location.googleRating) {
      detailsParts.push(
        `Google rating: ${location.googleRating.toFixed(1)} out of 5 stars.`
      );
    }

    if (location.vacancy !== null && location.vacancy !== undefined) {
      const vacancyPercent = Number(location.vacancy) * 100;
      detailsParts.push(`Vacancy rate: ${vacancyPercent.toFixed(1)}%.`);
    }

    if (location.footfall) {
      const footfallFormatted = Number(location.footfall).toLocaleString();
      detailsParts.push(`Annual footfall: approximately ${footfallFormatted} visitors.`);
    }

    details = detailsParts.join(" ");
  }

  // Insights
  const insights: string[] = [];

  if (location.vacancy !== null && location.vacancy !== undefined) {
    const vacancyPercent = Number(location.vacancy) * 100;
    if (vacancyPercent > 15) {
      insights.push(
        `The vacancy rate of ${vacancyPercent.toFixed(1)}% is above the healthy threshold. Consider strategies to attract new tenants.`
      );
    } else if (vacancyPercent < 5) {
      insights.push(
        `Your vacancy rate of ${vacancyPercent.toFixed(1)}% is excellent, indicating strong demand.`
      );
    }
  }

  if (location.googleRating && location.googleRating < 3.5) {
    insights.push(
      `Your Google rating of ${location.googleRating.toFixed(1)} could be improved. Consider focusing on customer experience initiatives.`
    );
  }

  return {
    summary,
    details,
    insights,
  };
}

/**
 * Format nearby competitors list for voice delivery
 */
export function formatNearbyCompetitors(
  competitors: Array<{
    id: string;
    name: string;
    city: string;
    numberOfStores?: number | null;
    distanceKm?: number;
  }>,
  locationName: string,
  detailLevel: "high" | "detailed" = "high"
): FormattedResponse {
  if (competitors.length === 0) {
    return {
      summary: `I couldn't find any nearby competitors to ${locationName}.`,
      insights: [],
    };
  }

  const summary = `I found ${competitors.length} nearby competitor${competitors.length > 1 ? "s" : ""} to ${locationName}: ${competitors
    .slice(0, 3)
    .map((c) => c.name)
    .join(", ")}${competitors.length > 3 ? `, and ${competitors.length - 3} more` : ""}.`;

  let details: string | undefined;
  if (detailLevel === "detailed") {
    const competitorDetails = competitors
      .slice(0, 5)
      .map((c) => {
        const parts = [c.name];
        if (c.numberOfStores) {
          parts.push(`${c.numberOfStores} stores`);
        }
        if (c.distanceKm !== undefined) {
          parts.push(`${c.distanceKm.toFixed(1)} km away`);
        }
        return parts.join(", ");
      })
      .join("; ");
    details = `Competitor details: ${competitorDetails}.`;
  }

  const insights: string[] = [];
  
  if (competitors.length > 0) {
    const avgStores =
      competitors
        .filter((c) => c.numberOfStores)
        .reduce((sum, c) => sum + (c.numberOfStores || 0), 0) /
      competitors.filter((c) => c.numberOfStores).length;

    if (avgStores > 0) {
      insights.push(
        `The average competitor has ${Math.round(avgStores)} stores. Use this as a benchmark for your tenant mix.`
      );
    }
  }

  return {
    summary,
    details,
    insights,
  };
}

/**
 * Determine detail level from query complexity
 */
export function determineDetailLevel(query: string): "high" | "detailed" {
  const detailedKeywords = [
    "detailed",
    "more information",
    "tell me more",
    "explain",
    "specific",
    "breakdown",
    "list",
    "what brands",
    "which brands",
  ];

  const queryLower = query.toLowerCase();
  return detailedKeywords.some((keyword) => queryLower.includes(keyword))
    ? "detailed"
    : "high";
}

