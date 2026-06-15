import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"

/**
 * POST /api/outreach/refresh-integrations
 * Re-fetches display name + email from Unipile for all active integrations.
 */
export async function POST() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const integrations = await prisma.userIntegration.findMany({
        where: { userId: session.user.id, status: "ACTIVE" },
    })

    if (integrations.length === 0) {
        return NextResponse.json({ updated: 0 })
    }

    const dsn = process.env.UNIPILE_DSN || ""
    const apiKey = process.env.UNIPILE_API_KEY || ""

    if (!dsn || !apiKey) {
        return NextResponse.json({ error: "Unipile not configured" }, { status: 503 })
    }

    let updated = 0

    for (const integration of integrations) {
        try {
            const res = await fetch(`${dsn}/api/v1/accounts/${integration.unipileAccountId}`, {
                headers: { "X-API-KEY": apiKey, "Accept": "application/json" },
            })

            if (!res.ok) {
                console.error(`[Refresh] Failed for ${integration.unipileAccountId}: ${res.status}`)
                continue
            }

            const data = (await res.json()) as {
                name?: string
                identifier?: string
            }

            await prisma.userIntegration.update({
                where: { id: integration.id },
                data: {
                    displayName: data.name || integration.displayName,
                    email: data.identifier || integration.email,
                },
            })
            updated++
        } catch (err) {
            console.error(`[Refresh] Error for ${integration.id}:`, err)
        }
    }

    return NextResponse.json({ updated })
}
