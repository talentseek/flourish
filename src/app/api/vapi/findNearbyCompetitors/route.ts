import { NextRequest, NextResponse } from "next/server";
import { authenticateVapiRequest } from "@/lib/auth";
import { resolveLocationName } from "@/lib/vapi-location-resolver";
import { formatNearbyCompetitors } from "@/lib/vapi-formatters";
import { prisma } from "@/lib/db";
import { extractVapiToolCall, formatVapiResponse, formatVapiError } from "@/lib/vapi-response-formatter";

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
 * POST /api/vapi/findNearbyCompetitors
 * 
 * Alias route for findNearbyCompetitors function name (matches Vapi function name)
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
    
    // Extract Vapi tool call information
    const { toolCallId, parameters } = extractVapiToolCall(body);
    const { locationName, radiusKm = 10, minStores } = parameters;

    if (!locationName || typeof locationName !== "string") {
      return NextResponse.json(
        { success: false, error: "locationName is required and must be a string" },
        { status: 400 }
      );
    }

    const match = await resolveLocationName(locationName);

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

    // Fetch all potential competitors, then filter null coordinates in memory
    const allLocations = await prisma.location.findMany({
      where: {
        id: { not: match.locationId },
        type: { in: ["SHOPPING_CENTRE", "RETAIL_PARK"] },
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

    // Filter out locations with null or zero coordinates
    const locationsWithCoords = allLocations.filter(
      (loc) => loc.latitude != null && loc.longitude != null && 
               Number(loc.latitude) !== 0 && Number(loc.longitude) !== 0
    );

    // Calculate distances and filter by radius
    const competitors = locationsWithCoords
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
      .slice(0, 20);

    const formatted = formatNearbyCompetitors(
      competitors,
      match.name,
      "high"
    );

    // Combine summary, details, and insights for Vapi
    let resultText = formatted.summary;
    if (formatted.details) {
      resultText += ` ${formatted.details}`;
    }
    if (formatted.insights && formatted.insights.length > 0) {
      resultText += ` ${formatted.insights.join(" ")}`;
    }

    // Format response for Vapi tool calls
    const vapiResponse = formatVapiResponse(toolCallId, resultText);
    if (vapiResponse) {
      return NextResponse.json(vapiResponse);
    }

    return NextResponse.json({
      success: true,
      data: competitors,
      summary: formatted.summary,
      details: formatted.details,
      insights: formatted.insights,
    });
  } catch (error) {
    console.error("findNearbyCompetitors error", error);
    const errorMessage = error instanceof Error ? error.message : "Internal error";
    
    try {
      const body = await req.clone().json();
      const { toolCallId } = extractVapiToolCall(body);
      const vapiErrorResponse = formatVapiError(toolCallId, errorMessage);
      if (vapiErrorResponse) {
        // Always return HTTP 200 for Vapi, even for errors
        return NextResponse.json(vapiErrorResponse, { status: 200 });
      }
    } catch {
      // Ignore errors in error handling
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

