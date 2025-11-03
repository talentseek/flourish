import { NextRequest, NextResponse } from "next/server";
import { authenticateVapiRequest } from "@/lib/auth";
import { resolveLocationName } from "@/lib/vapi-location-resolver";
import { getCategoryDistributionWithinRadius } from "@/lib/analytics";
import { formatLocalRecommendations } from "@/lib/vapi-formatters";
import { performGapAnalysis } from "@/lib/tenant-comparison";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

/**
 * POST /api/vapi/getLocalRecommendations
 * 
 * Alias route for getLocalRecommendations function name (matches Vapi function name)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateVapiRequest(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { locationName, radiusKm = 5, detailLevel = "high" } = body;

    if (!locationName || typeof locationName !== "string") {
      return NextResponse.json(
        { success: false, error: "locationName is required and must be a string" },
        { status: 400 }
      );
    }

    const match = await resolveLocationName(locationName);

    const categoryDistribution = await getCategoryDistributionWithinRadius(
      match.locationId,
      radiusKm
    );

    let gapAnalysis = null;
    try {
      const lat = await prisma.location.findUnique({
        where: { id: match.locationId },
        select: { latitude: true, longitude: true },
      });

      if (lat?.latitude && lat?.longitude) {
        const allLocations = await prisma.location.findMany({
          where: {
            id: { not: match.locationId },
            type: { in: ["SHOPPING_CENTRE", "RETAIL_PARK"] },
            numberOfStores: { gte: 10 },
          },
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            numberOfStores: true,
          },
        });

        const competitorIds = allLocations
          .filter((loc) => {
            if (!loc.latitude || !loc.longitude) return false;
            const latDiff = Math.abs(Number(lat.latitude) - Number(loc.latitude));
            const lonDiff = Math.abs(Number(lat.longitude) - Number(loc.longitude));
            const distanceKm = Math.sqrt(latDiff ** 2 + lonDiff ** 2) * 111;
            return distanceKm <= radiusKm * 2;
          })
          .slice(0, 5)
          .map((loc) => loc.id);

        if (competitorIds.length > 0) {
          gapAnalysis = await performGapAnalysis(
            match.locationId,
            competitorIds,
            detailLevel === "detailed"
          );
        }
      }
    } catch (error) {
      console.warn("Could not generate gap analysis:", error);
    }

    const formatted = formatLocalRecommendations(
      categoryDistribution,
      gapAnalysis,
      match.name,
      radiusKm,
      detailLevel as "high" | "detailed"
    );

    return NextResponse.json({
      success: true,
      data: {
        locationId: match.locationId,
        locationName: match.name,
        radiusKm,
        categoryDistribution,
        gapAnalysis: gapAnalysis
          ? {
              priorities: gapAnalysis.priorities,
              missingCategories: gapAnalysis.comparison.gaps.missingCategories,
              underRepresented: gapAnalysis.comparison.gaps.underRepresented,
            }
          : null,
      },
      summary: formatted.summary,
      details: formatted.details,
      insights: formatted.insights,
    });
  } catch (error) {
    console.error("getLocalRecommendations error", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}

