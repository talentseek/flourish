import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Admin-only impersonation endpoint.
 * Creates a new session for the target user and sets the session cookie.
 * The admin's original session is replaced — they must log in again to return to admin.
 */
export async function POST(req: NextRequest) {
    // Verify the current user is an ADMIN
    const currentSession = await auth.api.getSession({
        headers: await headers(),
    })

    if (!currentSession?.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: currentSession.user.id },
        select: { role: true },
    })

    if (currentUser?.role !== "ADMIN") {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { userId } = await req.json()
    if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true },
    })

    if (!targetUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create a new session for the target user using Better Auth's internal API
    const now = new Date()
    const newSession = await prisma.session.create({
        data: {
            id: crypto.randomUUID(),
            userId: targetUser.id,
            token: crypto.randomUUID(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            createdAt: now,
            updatedAt: now,
            ipAddress: req.headers.get("x-forwarded-for") || "impersonation",
            userAgent: req.headers.get("user-agent") || "admin-impersonation",
        },
    })

    // Build redirect response based on target user's role
    const redirectUrl = targetUser.role === "ADMIN"
        ? "/admin"
        : targetUser.role === "REGIONAL_MANAGER"
            ? "/dashboard/regional"
            : "/dashboard"

    const response = NextResponse.json({
        success: true,
        redirectUrl,
        impersonating: { name: targetUser.name, email: targetUser.email, role: targetUser.role },
    })

    // Set the session cookie — Better Auth uses "better-auth.session_token" by default
    response.cookies.set("better-auth.session_token", newSession.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
}
