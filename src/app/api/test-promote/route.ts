import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Update database
    const updatedDbUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' }
    });

    return NextResponse.json({
      success: true,
      message: "User promoted to admin successfully!",
      user: {
        id: updatedDbUser.id,
        email: updatedDbUser.email,
        role: updatedDbUser.role
      },
      note: "Role updated in database."
    });

  } catch (error) {
    console.error("Error promoting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
