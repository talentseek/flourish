import { NextRequest, NextResponse } from "next/server";
import { compareTenantCategories } from "@/lib/tenant-comparison";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("targetId");
  const competitorIdsParam = searchParams.get("competitorIds");

  if (!targetId) {
    return NextResponse.json({ error: "targetId is required" }, { status: 400 });
  }

  if (!competitorIdsParam) {
    return NextResponse.json({ error: "competitorIds is required (comma-separated)" }, { status: 400 });
  }

  const competitorIds = competitorIdsParam.split(",").filter(Boolean);

  if (competitorIds.length === 0) {
    return NextResponse.json({ error: "At least one competitor ID is required" }, { status: 400 });
  }

  try {
    const comparison = await compareTenantCategories(targetId, competitorIds);
    return NextResponse.json({ success: true, data: comparison });
  } catch (e: any) {
    console.error("tenant-comparison error", e);
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}

