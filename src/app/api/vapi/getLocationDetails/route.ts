import { NextRequest, NextResponse } from "next/server";
import { authenticateVapiRequest } from "@/lib/auth";
import { resolveLocationName } from "@/lib/vapi-location-resolver";
import { formatLocationDetails } from "@/lib/vapi-formatters";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

/**
 * POST /api/vapi/getLocationDetails
 * 
 * Alias route for getLocationDetails function name (matches Vapi function name)
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
    const { locationName, detailLevel = "high" } = body;

    if (!locationName || typeof locationName !== "string") {
      return NextResponse.json(
        { success: false, error: "locationName is required and must be a string" },
        { status: 400 }
      );
    }

    const match = await resolveLocationName(locationName);

    const location = await prisma.location.findUnique({
      where: { id: match.locationId },
      include: {
        tenants: {
          take: 10,
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
    console.error("getLocationDetails error", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}

