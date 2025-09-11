import { NextRequest, NextResponse } from "next/server";
import { currentUser, auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Update database
    const updatedDbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: { role: 'ADMIN' },
      create: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        role: 'ADMIN'
      }
    });

    // Update Clerk user's public metadata
    const updatedClerkUser = await clerkClient.users.updateUser(user.id, {
      publicMetadata: { role: 'ADMIN' }
    });

    // Check what the middleware sees
    const { sessionClaims } = auth();
    const middlewareRole = (sessionClaims?.publicMetadata as any)?.role?.toUpperCase?.() || "USER";

    return NextResponse.json({
      success: true,
      message: "User promoted to admin successfully!",
      user: {
        id: updatedDbUser.id,
        email: updatedDbUser.email,
        role: updatedDbUser.role
      },
      clerkMetadata: updatedClerkUser.publicMetadata,
      middlewareRole,
      sessionClaims,
      note: "You may need to sign out and sign back in for the role change to take effect in the middleware."
    });

  } catch (error) {
    console.error("Error promoting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
