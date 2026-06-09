import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Admin-only impersonation endpoint using Better Auth's admin plugin.
 * Uses auth.api.impersonateUser to properly create a session.
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

    try {
        // Use Better Auth's admin plugin to properly create an impersonation session
        const impersonationResult = await auth.api.impersonateUser({
            body: { userId: targetUser.id },
            headers: await headers(),
        })

        // Build redirect URL based on target user's role
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

        // Set the session cookie from the impersonation result
        const token = impersonationResult.session?.token
        if (token) {
            const cookieOptions = {
                httpOnly: true,
                sameSite: "lax" as const,
                path: "/",
                maxAge: 7 * 24 * 60 * 60,
            }

            // Set both cookie variants for dev (HTTP) and production (HTTPS)
            response.cookies.set("better-auth.session_token", token, {
                ...cookieOptions,
                secure: process.env.NODE_ENV === "production",
            })
            response.cookies.set("__Secure-better-auth.session_token", token, {
                ...cookieOptions,
                secure: true,
            })
        }

        return response
    } catch (error) {
        console.error("[Impersonate] Error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Impersonation failed" },
            { status: 500 }
        )
    }
}
