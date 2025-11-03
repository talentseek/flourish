import { NextRequest, NextResponse } from "next/server";
import { authenticateVapiRequest } from "@/lib/auth";
import { searchLocationsByName } from "@/lib/vapi-location-resolver";

export const runtime = 'nodejs';

/**
 * POST /api/vapi/location-search
 * 
 * Search for locations by name with fuzzy matching
 * Used by Vapi voice agent to find shopping centres
 * Accepts either Clerk authentication (web) or Vapi API key (server-to-server)
 */
export async function POST(req: NextRequest) {
  try {
    // Validate authentication (Clerk for web, API key for Vapi)
    const auth = await authenticateVapiRequest(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { locationName, city, limit = 5 } = body;

    if (!locationName || typeof locationName !== "string") {
      return NextResponse.json(
        { success: false, error: "locationName is required and must be a string" },
        { status: 400 }
      );
    }

    // Extract city from locationName if it contains "in [city]" pattern
    let searchCity = city;
    const cityMatch = locationName.match(/\bin\s+([A-Za-z\s]+?)(?:\s+shopping|$)/i);
    if (cityMatch && !searchCity) {
      searchCity = cityMatch[1].trim();
    }

    // Search locations
    const matches = await searchLocationsByName(locationName, limit, searchCity);

    if (matches.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        summary: `I couldn't find any locations matching "${locationName}"${city ? ` in ${city}` : ""}.`,
        insights: [],
      });
    }

    // Format response
    const topMatch = matches[0];
    const summary =
      matches.length === 1
        ? `Found ${topMatch.name} in ${topMatch.city}.`
        : `Found ${matches.length} locations matching "${locationName}". The closest match is ${topMatch.name} in ${topMatch.city} with ${(topMatch.confidence * 100).toFixed(0)}% confidence.`;

    return NextResponse.json({
      success: true,
      data: matches,
      summary,
      insights: matches.length > 1
        ? [`Consider being more specific if you meant a different location.`]
        : [],
    });
  } catch (error) {
    console.error("location-search error", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}

