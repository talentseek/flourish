import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Update Clerk user's public metadata
    const updatedClerkUser = await clerkClient.users.updateUser(user.id, {
      publicMetadata: { role: 'ADMIN' }
    });

    // Force session refresh by updating the user
    await clerkClient.sessions.revokeSession(user.id);

    return NextResponse.json({
      success: true,
      message: "Session refreshed! Please sign out and sign back in.",
      user: {
        id: updatedClerkUser.id,
        publicMetadata: updatedClerkUser.publicMetadata
      }
    });

  } catch (error) {
    console.error("Error refreshing session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
