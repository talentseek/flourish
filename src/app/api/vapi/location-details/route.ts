import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { resolveLocationName } from "@/lib/vapi-location-resolver";
import { formatLocationDetails } from "@/lib/vapi-formatters";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

/**
 * POST /api/vapi/location-details
 * 
 * Get detailed information about a specific location
 * Used by Vapi voice agent to retrieve location metrics
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
    const { locationName, detailLevel = "high" } = body;

    if (!locationName || typeof locationName !== "string") {
      return NextResponse.json(
        { success: false, error: "locationName is required and must be a string" },
        { status: 400 }
      );
    }

    // Resolve location name to ID
    const match = await resolveLocationName(locationName);

    // Fetch full location details
    const location = await prisma.location.findUnique({
      where: { id: match.locationId },
      include: {
        tenants: {
          take: 10, // Limit tenants for response size
          include: {
            categoryRef: true,
          },
        },
      },
    });

    if (!location) {
      return NextResponse.json(
        { success: false, error: "Location not found" },
        { status: 404 }
      );
    }

    // Format response for voice
    const formatted = formatLocationDetails(
      {
        name: location.name,
        city: location.city,
        numberOfStores: location.numberOfStores,
        totalFloorArea: location.totalFloorArea,
        parkingSpaces: location.parkingSpaces,
        googleRating: location.googleRating ? Number(location.googleRating) : null,
        vacancy: location.vacancy ? Number(location.vacancy) : null,
        footfall: location.footfall,
      },
      detailLevel as "high" | "detailed"
    );

    return NextResponse.json({
      success: true,
      data: {
        id: location.id,
        name: location.name,
        city: location.city,
        county: location.county,
        address: location.address,
        numberOfStores: location.numberOfStores,
        totalFloorArea: location.totalFloorArea,
        parkingSpaces: location.parkingSpaces,
        googleRating: location.googleRating ? Number(location.googleRating) : null,
        vacancy: location.vacancy ? Number(location.vacancy) : null,
        footfall: location.footfall,
        tenantCount: location.tenants.length,
      },
      summary: formatted.summary,
      details: formatted.details,
      insights: formatted.insights,
    });
  } catch (error) {
    console.error("location-details error", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}

