import { NextRequest, NextResponse } from "next/server";
import { authenticateVapiRequest } from "@/lib/auth";
import { searchLocationsByName } from "@/lib/vapi-location-resolver";

export const runtime = 'nodejs';

/**
 * POST /api/vapi/searchLocation
 * 
 * Alias route for searchLocation function name (matches Vapi function name)
 * Redirects to location-search endpoint logic
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
    const { locationName, city, limit = 5 } = body;

    if (!locationName || typeof locationName !== "string") {
      return NextResponse.json(
        { success: false, error: "locationName is required and must be a string" },
        { status: 400 }
      );
    }

    const matches = await searchLocationsByName(locationName, limit);

    if (matches.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        summary: `I couldn't find any locations matching "${locationName}"${city ? ` in ${city}` : ""}.`,
        insights: [],
      });
    }

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
    console.error("searchLocation error", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}

