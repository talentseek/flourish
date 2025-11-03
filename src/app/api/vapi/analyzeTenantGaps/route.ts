import { NextRequest, NextResponse } from "next/server";
import { authenticateVapiRequest } from "@/lib/auth";
import {
  resolveLocationName,
  resolveMultipleLocationNames,
} from "@/lib/vapi-location-resolver";
import { performGapAnalysis } from "@/lib/tenant-comparison";
import { formatGapAnalysis } from "@/lib/vapi-formatters";

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
    const {
      targetLocationName,
      competitorLocationNames,
      detailLevel = "high",
    } = body;

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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}

