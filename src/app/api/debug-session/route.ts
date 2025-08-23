import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = auth();
    const role = (sessionClaims?.publicMetadata as any)?.role?.toUpperCase?.() || "USER";
    
    return NextResponse.json({
      userId,
      sessionClaims,
      role,
      publicMetadata: sessionClaims?.publicMetadata,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error getting session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
