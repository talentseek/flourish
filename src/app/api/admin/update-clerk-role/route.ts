import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    // Check if current user is admin
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required" },
        { status: 400 }
      );
    }

    // Update Clerk user's public metadata
    const updatedClerkUser = await clerkClient.users.updateUser(userId, {
      publicMetadata: { role: role.toUpperCase() }
    });

    // Also update database
    const updatedDbUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role.toUpperCase() }
    });

    return NextResponse.json({
      success: true,
      clerkUser: {
        id: updatedClerkUser.id,
        publicMetadata: updatedClerkUser.publicMetadata
      },
      dbUser: {
        id: updatedDbUser.id,
        role: updatedDbUser.role
      }
    });

  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
