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

    console.log("Current user:", user.id);
    console.log("Current publicMetadata:", user.publicMetadata);

    // Try to update the user's public metadata
    const updatedUser = await clerkClient.users.updateUser(user.id, {
      publicMetadata: { 
        role: 'ADMIN',
        test: 'updated_at_' + new Date().toISOString()
      }
    });

    console.log("Updated user publicMetadata:", updatedUser.publicMetadata);

    return NextResponse.json({
      success: true,
      message: "User metadata updated",
      before: user.publicMetadata,
      after: updatedUser.publicMetadata,
      userId: user.id
    });

  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { 
        error: "Failed to update user",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
