import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

function verifyCallbackToken(userId: string, token: string): boolean {
    const secret = process.env.CALLBACK_SECRET || "flourish-callback-default"
    const expected = crypto.createHmac("sha256", secret).update(userId).digest("hex")
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))
}

/**
 * Unipile Hosted Auth callback.
 * GET: Browser redirect after successful auth
 * POST: Webhook notification from Unipile with { status, account_id, name }
 */
export async function GET(request: NextRequest) {
    const accountId = request.nextUrl.searchParams.get("account_id")
    const provider = request.nextUrl.searchParams.get("provider")
    const userId = request.nextUrl.searchParams.get("userId")
    const token = request.nextUrl.searchParams.get("token")

    if (!accountId || !provider || !userId) {
        return NextResponse.redirect(new URL("/outreach?error=missing_params", request.url))
    }

    if (!token || !verifyCallbackToken(userId, token)) {
        console.error("[Unipile] Callback GET: invalid or missing token", { userId })
        return NextResponse.redirect(new URL("/outreach?error=invalid_token", request.url))
    }

    const normalizedProvider = normalizeProvider(provider)

    try {
        const details = await fetchAccountDetails(accountId)
        await upsertIntegration(userId, normalizedProvider, accountId, details.displayName, details.email)
        return NextResponse.redirect(new URL("/outreach?connected=true", request.url))
    } catch (err) {
        console.error("[Unipile] Callback GET error:", err)
        return NextResponse.redirect(new URL("/outreach?error=save_failed", request.url))
    }
}

/**
 * Unipile webhook POST notification.
 * Body: { status: "CREATION_SUCCESS", account_id: "xxx", name: "userId" }
 * name = the userId we passed when creating the hosted auth link
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        console.log("[Unipile] Callback POST:", JSON.stringify(body))

        const accountId = body.account_id
        const userId = body.name || request.nextUrl.searchParams.get("userId")
        const provider = request.nextUrl.searchParams.get("provider")

        if (!accountId || !userId) {
            console.error("[Unipile] Callback missing params:", { accountId, userId })
            return NextResponse.json({ ok: false, error: "missing account_id or userId" }, { status: 400 })
        }

        if (body.status !== "CREATION_SUCCESS") {
            console.warn("[Unipile] Callback POST: non-success status, skipping upsert", { status: body.status, accountId, userId })
            return NextResponse.json({ ok: true })
        }

        const normalizedProvider = provider
            ? normalizeProvider(provider)
            : "LINKEDIN" // default fallback

        const details = await fetchAccountDetails(accountId)
        await upsertIntegration(userId, normalizedProvider, accountId, details.displayName, details.email)

        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error("[Unipile] Callback POST error:", err)
        return NextResponse.json({ ok: false }, { status: 500 })
    }
}

function normalizeProvider(provider: string): string {
    const map: Record<string, string> = {
        linkedin: "LINKEDIN",
        microsoft: "MICROSOFT",
        outlook: "MICROSOFT",
    }
    return map[provider.toLowerCase()] ?? provider.toUpperCase()
}

async function upsertIntegration(
    userId: string,
    provider: string,
    unipileAccountId: string,
    displayName?: string | null,
    email?: string | null
) {
    await prisma.userIntegration.upsert({
        where: {
            userId_provider: { userId, provider },
        },
        create: {
            userId,
            provider,
            unipileAccountId,
            displayName: displayName || null,
            email: email || null,
            status: "ACTIVE",
        },
        update: {
            unipileAccountId,
            displayName: displayName || undefined,
            email: email || undefined,
            status: "ACTIVE",
        },
    })
}

/**
 * Fetch account details from Unipile to get display name + email.
 * Returns { displayName, email } or nulls if the API call fails.
 */
async function fetchAccountDetails(
    unipileAccountId: string
): Promise<{ displayName: string | null; email: string | null }> {
    const dsn = process.env.UNIPILE_DSN || ""
    const apiKey = process.env.UNIPILE_API_KEY || ""
    if (!dsn || !apiKey) return { displayName: null, email: null }

    try {
        const res = await fetch(`${dsn}/api/v1/accounts/${unipileAccountId}`, {
            headers: {
                "X-API-KEY": apiKey,
                "Accept": "application/json",
            },
        })
        if (!res.ok) {
            console.error(`[Unipile] Failed to fetch account ${unipileAccountId}: ${res.status}`)
            return { displayName: null, email: null }
        }

        const data = (await res.json()) as {
            name?: string
            identifier?: string
        }
        return {
            displayName: data.name || null,
            email: data.identifier || null,
        }
    } catch (err) {
        console.error("[Unipile] Failed to fetch account details:", err)
        return { displayName: null, email: null }
    }
}
