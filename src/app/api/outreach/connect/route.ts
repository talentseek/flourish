import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

/**
 * Initiate Unipile Hosted Auth flow.
 * GET /api/outreach/connect?provider=linkedin|microsoft
 * Redirects user to Unipile's hosted auth page.
 */
export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    const provider = request.nextUrl.searchParams.get("provider")
    if (!provider || !["linkedin", "microsoft"].includes(provider)) {
        return NextResponse.json({ error: "Invalid provider. Use 'linkedin' or 'microsoft'" }, { status: 400 })
    }

    const dsn = process.env.UNIPILE_DSN
    const apiKey = process.env.UNIPILE_API_KEY

    if (!dsn || !apiKey) {
        return NextResponse.json({ error: "Unipile not configured" }, { status: 500 })
    }

    try {
        const providerMap: Record<string, string> = {
            linkedin: "LINKEDIN",
            microsoft: "OUTLOOK",
        }

        const origin = request.nextUrl.origin
        const notifyUrl = `${origin}/api/outreach/connect-callback?provider=${provider}&userId=${session.user.id}`
        const expiresOn = new Date(Date.now() + 60 * 60 * 1000).toISOString()

        const payload = {
            type: "create",
            providers: [providerMap[provider]],
            expiresOn,
            success_redirect_url: `${origin}/outreach?connected=true`,
            failure_redirect_url: `${origin}/outreach?error=auth_failed`,
            notify_url: notifyUrl,
            name: session.user.id,
        }

        const res = await fetch(`${dsn}/api/v1/hosted/accounts/link`, {
            method: "POST",
            headers: {
                "X-API-KEY": apiKey,
                "accept": "application/json",
                "content-type": "application/json",
            },
            body: JSON.stringify(payload),
        })

        if (!res.ok) {
            const text = await res.text()
            console.error("[Unipile] Auth link failed:", res.status, text)
            return NextResponse.json(
                { error: "Failed to create auth link", status: res.status, detail: text },
                { status: 500 }
            )
        }

        const data = (await res.json()) as { url?: string }
        if (data.url) {
            return NextResponse.redirect(data.url)
        }

        return NextResponse.json({ error: "No auth URL returned" }, { status: 500 })
    } catch (err) {
        console.error("[Unipile] Connect error:", err)
        return NextResponse.json(
            { error: "Connection failed", detail: err instanceof Error ? err.message : String(err) },
            { status: 500 }
        )
    }
}
