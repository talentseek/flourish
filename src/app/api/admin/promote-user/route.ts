import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

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

    const { userId, email } = await request.json();

    if (!userId && !email) {
      return NextResponse.json(
        { error: "Either userId or email is required" },
        { status: 400 }
      );
    }

    // Find user by userId or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { email: email }
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error("Error promoting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
