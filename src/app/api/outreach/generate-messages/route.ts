import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ""

interface GenerateRequest {
    campaignName: string
    businessCategory: string
    location: string
    centreName?: string
    sampleLeads: Array<{
        businessName: string
        contactName?: string | null
    }>
    tone?: "professional" | "friendly" | "casual"
    channel: "linkedin" | "email" | "both"
}

const SYSTEM_PROMPT = `You are an expert outreach copywriter for Flourish, a UK commercial property company that helps retail businesses find space in shopping centres, retail parks, and high streets.

Your job is to write compelling, personalised outreach messages that:
- Feel human and warm, not corporate or pushy
- Mention the specific business type naturally
- Keep it brief and to the point
- Include a clear but soft call-to-action
- Use British English spelling

IMPORTANT RULES:
- Use {{firstName}} for the contact's first name (fallback: "there")
- Use {{businessName}} for the business name
- Do NOT use any other variables
- LinkedIn follow-up messages MUST be under 300 characters
- Email subject lines should be 6-10 words
- Email body should be 3-5 short paragraphs
- Never use exclamation marks excessively
- Never say "I hope this email finds you well"
- Never use "synergy", "leverage", "circle back", or corporate jargon`

function buildUserPrompt(req: GenerateRequest): string {
    const leadExamples = req.sampleLeads.slice(0, 3).map(l =>
        `  - ${l.businessName}${l.contactName ? ` (${l.contactName})` : ""}`
    ).join("\n")

    const toneGuide = {
        professional: "Professional but approachable. Think: a confident business partner.",
        friendly: "Warm and conversational. Think: a helpful neighbour who happens to work in retail property.",
        casual: "Relaxed and direct. Think: a quick DM from someone who genuinely thinks this could work.",
    }

    return `Write outreach messages for a campaign called "${req.campaignName}".

Business type: ${req.businessCategory}
Location: ${req.centreName ? `${req.centreName} (${req.location})` : req.location}
Tone: ${toneGuide[req.tone || "friendly"]}

Sample businesses being contacted:
${leadExamples}

${req.channel === "linkedin" || req.channel === "both" ? `
Generate a LinkedIn follow-up message (sent after the connection request is accepted, NOT as a connection note). MUST be under 300 characters.
` : ""}
${req.channel === "email" || req.channel === "both" ? `
Generate an email with:
- Subject line (6-10 words)
- Body (3-5 short paragraphs)
` : ""}

Return JSON only:
{
  "linkedinMessage": "string or null",
  "emailSubject": "string or null",
  "emailBody": "string or null"
}`
}

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    })
    if (!dbUser || (dbUser.role !== "REGIONAL_MANAGER" && dbUser.role !== "ADMIN")) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    if (!OPENROUTER_API_KEY) {
        return NextResponse.json({ error: "AI generation not configured" }, { status: 503 })
    }

    const body = (await req.json()) as GenerateRequest

    if (!body.campaignName || !body.businessCategory) {
        return NextResponse.json({ error: "campaignName and businessCategory are required" }, { status: 400 })
    }

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://thisisflourish.co.uk",
                "X-Title": "Flourish Outreach",
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: buildUserPrompt(body) },
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
                max_tokens: 800,
            }),
        })

        if (!res.ok) {
            const errText = await res.text()
            console.error("[AI Generate] OpenRouter error:", res.status, errText)
            return NextResponse.json({ error: "AI generation failed" }, { status: 502 })
        }

        const data = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>
        }
        const content = data.choices?.[0]?.message?.content
        if (!content) {
            return NextResponse.json({ error: "No response from AI" }, { status: 502 })
        }

        const generated = JSON.parse(content) as {
            linkedinMessage: string | null
            emailSubject: string | null
            emailBody: string | null
        }

        return NextResponse.json({
            success: true,
            ...generated,
        })
    } catch (err) {
        console.error("[AI Generate] Error:", err)
        return NextResponse.json({ error: "AI generation failed" }, { status: 500 })
    }
}
