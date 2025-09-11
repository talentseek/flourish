import { NextRequest, NextResponse } from "next/server";
import { getLargestCategoryAggregationWithinRadius } from "@/lib/analytics";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");
  const radiusKmParam = searchParams.get("radiusKm");

  if (!locationId) {
    return NextResponse.json({ error: "locationId is required" }, { status: 400 });
  }

  const radiusKm = Math.max(0, Number(radiusKmParam ?? 5));
  if (!Number.isFinite(radiusKm)) {
    return NextResponse.json({ error: "radiusKm must be a number" }, { status: 400 });
  }

  try {
    const data = await getLargestCategoryAggregationWithinRadius(locationId, radiusKm);
    return NextResponse.json({ locationId, radiusKm, data });
  } catch (e) {
    console.error("largest-category-within-radius error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


