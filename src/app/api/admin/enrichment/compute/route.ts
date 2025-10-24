import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { computeEnrichmentStats } from "@/lib/enrichment-metrics";

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Check admin auth
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Check if user has admin role
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Not authorized. Admin access required." },
        { status: 403 }
      );
    }
    
    // Compute and save snapshot
    const snapshot = await computeEnrichmentStats();
    
    return NextResponse.json({
      success: true,
      snapshot,
      message: "Enrichment metrics computed successfully"
    });
    
  } catch (error) {
    console.error("Error computing enrichment metrics:", error);
    return NextResponse.json(
      { error: "Failed to compute enrichment metrics" },
      { status: 500 }
    );
  }
}

