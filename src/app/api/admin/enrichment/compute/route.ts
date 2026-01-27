import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeEnrichmentStats } from "@/lib/enrichment-metrics";

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Check admin auth
    const user = await getSessionUser();

    // ... inside handler ...
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Fetch full user to get role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    // Check if user has admin role
    if (!dbUser || dbUser.role !== 'ADMIN') {
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

