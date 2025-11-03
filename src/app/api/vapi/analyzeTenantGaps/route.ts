import { NextRequest, NextResponse } from "next/server";
import { authenticateVapiRequest } from "@/lib/auth";
import {
  resolveLocationName,
  resolveMultipleLocationNames,
} from "@/lib/vapi-location-resolver";
import { performGapAnalysis } from "@/lib/tenant-comparison";
import { formatGapAnalysis } from "@/lib/vapi-formatters";
import { extractVapiToolCall, formatVapiResponse, formatVapiError } from "@/lib/vapi-response-formatter";

export const runtime = 'nodejs';

/**
 * POST /api/vapi/analyzeTenantGaps
 * 
 * Alias route for analyzeTenantGaps function name (matches Vapi function name)
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
    const {
      targetLocationName,
      competitorLocationNames,
      detailLevel = "high",
    } = parameters;

    if (!targetLocationName || typeof targetLocationName !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "targetLocationName is required and must be a string",
        },
        { status: 400 }
      );
    }

    if (
      !competitorLocationNames ||
      !Array.isArray(competitorLocationNames) ||
      competitorLocationNames.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "competitorLocationNames is required and must be a non-empty array",
        },
        { status: 400 }
      );
    }

    const targetMatch = await resolveLocationName(targetLocationName);
    const competitorMatches = await resolveMultipleLocationNames(
      competitorLocationNames
    );

    if (competitorMatches.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not resolve any competitor locations",
        },
        { status: 400 }
      );
    }

    const gapAnalysis = await performGapAnalysis(
      targetMatch.locationId,
      competitorMatches.map((m) => m.locationId),
      detailLevel === "detailed"
    );

    const formatted = formatGapAnalysis(
      gapAnalysis,
      detailLevel as "high" | "detailed"
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
      data: {
        target: {
          id: targetMatch.locationId,
          name: targetMatch.name,
        },
        competitors: competitorMatches.map((m) => ({
          id: m.locationId,
          name: m.name,
        })),
        gapAnalysis: {
          priorities: gapAnalysis.priorities,
          missingCategories: gapAnalysis.comparison.gaps.missingCategories,
          underRepresented: gapAnalysis.comparison.gaps.underRepresented,
          missingBrands:
            detailLevel === "detailed" ? gapAnalysis.missingBrands : undefined,
        },
      },
      summary: formatted.summary,
      details: formatted.details,
      insights: formatted.insights,
    });
  } catch (error) {
    console.error("analyzeTenantGaps error", error);
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

