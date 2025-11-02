import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { resolveLocationName } from "@/lib/vapi-location-resolver";
import { formatNearbyCompetitors } from "@/lib/vapi-formatters";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

/**
 * Calculate distance between two points using Haversine formula
 */
function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * POST /api/vapi/nearby-competitors
 * 
 * Find nearby competitor shopping centres within a radius
 * Used by Vapi voice agent to discover competitors in the local area
 */
export async function POST(req: NextRequest) {
  try {
    // Validate Clerk authentication
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { locationName, radiusKm = 10, minStores } = body;

    if (!locationName || typeof locationName !== "string") {
      return NextResponse.json(
        { success: false, error: "locationName is required and must be a string" },
        { status: 400 }
      );
    }

    // Resolve location name to ID
    const match = await resolveLocationName(locationName);

    // Get location coordinates
    const location = await prisma.location.findUnique({
      where: { id: match.locationId },
      select: { latitude: true, longitude: true },
    });

    if (!location || !location.latitude || !location.longitude) {
      return NextResponse.json(
        { success: false, error: "Location coordinates not available" },
        { status: 400 }
      );
    }

    const lat = Number(location.latitude);
    const lon = Number(location.longitude);

    // Find all potential competitors
    const allLocations = await prisma.location.findMany({
      where: {
        id: { not: match.locationId },
        type: { in: ["SHOPPING_CENTRE", "RETAIL_PARK"] },
        latitude: { not: null },
        longitude: { not: null },
        ...(minStores && { numberOfStores: { gte: minStores } }),
      },
      select: {
        id: true,
        name: true,
        city: true,
        county: true,
        latitude: true,
        longitude: true,
        numberOfStores: true,
      },
    });

    // Calculate distances and filter by radius
    const competitors = allLocations
      .map((loc) => {
        const locLat = Number(loc.latitude);
        const locLon = Number(loc.longitude);
        const distance = haversineKm(lat, lon, locLat, locLon);
        return {
          id: loc.id,
          name: loc.name,
          city: loc.city,
          county: loc.county,
          numberOfStores: loc.numberOfStores,
          distanceKm: distance,
        };
      })
      .filter((loc) => loc.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 20); // Limit to top 20

    // Format response
    const formatted = formatNearbyCompetitors(
      competitors,
      match.name,
      "high" // Can be made configurable if needed
    );

    return NextResponse.json({
      success: true,
      data: competitors,
      summary: formatted.summary,
      details: formatted.details,
      insights: formatted.insights,
    });
  } catch (error) {
    console.error("nearby-competitors error", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}

