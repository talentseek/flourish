import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Better Auth handles session refresh automatically via client/headers.
    // This endpoint can serve as a validity check.

    return NextResponse.json({
      success: true,
      message: "Session is valid.",
      user: session.user
    });

  } catch (error) {
    console.error("Error checking session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
