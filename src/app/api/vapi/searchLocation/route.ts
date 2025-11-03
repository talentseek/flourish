import { NextRequest, NextResponse } from "next/server";
import { authenticateVapiRequest } from "@/lib/auth";
import { searchLocationsByName } from "@/lib/vapi-location-resolver";
import { extractVapiToolCall, formatVapiResponse, formatVapiError } from "@/lib/vapi-response-formatter";

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
    
    // Extract Vapi tool call information
    const { isVapiToolCall, toolCallId, parameters } = extractVapiToolCall(body);
    
    // Log for debugging
    console.log('[searchLocation] Extracted:', { isVapiToolCall, hasToolCallId: !!toolCallId, parameters });
    
    const { locationName, city, limit = 5 } = parameters;

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

    const matches = await searchLocationsByName(locationName, limit, searchCity);

    if (matches.length === 0) {
      const noMatchMessage = `I couldn't find any locations matching "${locationName}"${city ? ` in ${city}` : ""}.`;
      
      // Format response for Vapi tool calls
      const vapiResponse = formatVapiResponse(toolCallId, noMatchMessage);
      if (vapiResponse) {
        return NextResponse.json(vapiResponse);
      }
      
      return NextResponse.json({
        success: true,
        data: [],
        summary: noMatchMessage,
        insights: [],
      });
    }

    const topMatch = matches[0];
    const summary =
      matches.length === 1
        ? `Found ${topMatch.name} in ${topMatch.city}.`
        : `Found ${matches.length} locations matching "${locationName}". The closest match is ${topMatch.name} in ${topMatch.city} with ${(topMatch.confidence * 100).toFixed(0)}% confidence.`;

    // Format response for Vapi tool calls
    const vapiResponse = formatVapiResponse(toolCallId, summary);
    if (vapiResponse) {
      console.log('[searchLocation] Returning Vapi format response');
      return NextResponse.json(vapiResponse, { status: 200 });
    } else {
      console.log('[searchLocation] No toolCallId, returning standard format');
    }

    // Standard API response format
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
    const errorMessage = error instanceof Error ? error.message : "Internal error";
    
    // Try to get toolCallId from request body for error response
    // Vapi requires HTTP 200 even for errors
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

