import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  resolveLocationName,
  resolveMultipleLocationNames,
} from "@/lib/vapi-location-resolver";
import { performGapAnalysis } from "@/lib/tenant-comparison";
import { formatGapAnalysis } from "@/lib/vapi-formatters";

export const runtime = 'nodejs';

/**
 * POST /api/vapi/tenant-gap-analysis
 * 
 * Compare a target location with competitors to identify tenant gaps
 * Used by Vapi voice agent to provide detailed competitor analysis
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

    // Resolve location names to IDs
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

    // Perform gap analysis
    const gapAnalysis = await performGapAnalysis(
      targetMatch.locationId,
      competitorMatches.map((m) => m.locationId),
      detailLevel === "detailed"
    );

    // Format response
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
    console.error("tenant-gap-analysis error", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}

