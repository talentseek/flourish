import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || ""
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ""
const COMPANIES_HOUSE_API_KEY = process.env.COMPANIES_HOUSE_API_KEY || ""
const APOLLO_API_KEY = process.env.APOLLO_API_KEY || ""
const REOON_API_KEY = process.env.REOON_API_KEY || ""

interface EnrichmentResult {
    leadId: string
    contactName: string | null
    contactEmail: string | null
    linkedinUrl: string | null
    jobTitle: string | null
    score: number
    status: "ENRICHED" | "FAILED"
}

// ─── Layer 1: Website Scrape (Firecrawl) ────────────────────

async function scrapeWebsite(url: string): Promise<string | null> {
    try {
        // Try Firecrawl first
        if (FIRECRAWL_API_KEY) {
            const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
                },
                body: JSON.stringify({
                    url,
                    formats: ["markdown"],
                    onlyMainContent: true,
                    timeout: 15000,
                }),
            })
            if (res.ok) {
                const data = (await res.json()) as { data?: { markdown?: string } }
                if (data.data?.markdown) {
                    return data.data.markdown.slice(0, 8000)
                }
            }
        }

        // Fallback: raw fetch
        const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; FlourishBot/1.0)" },
            signal: AbortSignal.timeout(10000),
        })
        if (res.ok) {
            const html = await res.text()
            // Strip HTML tags for basic text extraction
            return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 8000)
        }
    } catch {
        // Scrape failed
    }
    return null
}

// ─── Layer 2: LLM Extraction (GPT-4o-mini via OpenRouter) ──

interface LLMExtraction {
    ownerName: string | null
    ownerEmail: string | null
    ownerRole: string | null
    emails: string[]
    phones: string[]
    linkedinUrl: string | null
    companyNumber: string | null
    confidence: "HIGH" | "MEDIUM" | "LOW"
}

async function llmExtract(
    websiteContent: string,
    businessName: string
): Promise<LLMExtraction | null> {
    if (!OPENROUTER_API_KEY) return null

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content:
                            "Extract business owner/contact information from website content. Return JSON only.",
                    },
                    {
                        role: "user",
                        content: `Extract the owner/key contact details for "${businessName}" from this website content. Return JSON with: ownerName (string|null), ownerEmail (string|null), ownerRole (string|null), emails (string[]), phones (string[]), linkedinUrl (string|null), companyNumber (string|null), confidence (HIGH|MEDIUM|LOW).\n\nContent:\n${websiteContent}`,
                    },
                ],
                response_format: { type: "json_object" },
                max_tokens: 500,
                temperature: 0.1,
            }),
        })

        if (!res.ok) return null

        const data = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>
        }
        const content = data.choices?.[0]?.message?.content
        if (!content) return null

        return JSON.parse(content) as LLMExtraction
    } catch {
        return null
    }
}

// ─── Layer 3: Regex Email Extraction ────────────────────────

function extractEmails(text: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const matches = text.match(emailRegex) || []
    // Filter out common junk emails
    const blocklist = [
        "noreply",
        "no-reply",
        "support",
        "admin",
        "webmaster",
        "postmaster",
        "mailer-daemon",
        "example.com",
        "sentry.io",
        "wixpress.com",
    ]
    return matches.filter(
        (email) => !blocklist.some((b) => email.toLowerCase().includes(b))
    )
}

// ─── Layer 4: Companies House Lookup ────────────────────────

async function companiesHouseLookup(
    businessName: string
): Promise<{ directorName: string | null; companyNumber: string | null }> {
    if (!COMPANIES_HOUSE_API_KEY) return { directorName: null, companyNumber: null }

    try {
        const searchRes = await fetch(
            `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(businessName)}&items_per_page=3`,
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(COMPANIES_HOUSE_API_KEY + ":").toString("base64")}`,
                },
            }
        )

        if (!searchRes.ok) return { directorName: null, companyNumber: null }

        const searchData = (await searchRes.json()) as {
            items?: Array<{ company_number: string; title: string }>
        }
        const company = searchData.items?.[0]
        if (!company) return { directorName: null, companyNumber: null }

        // Fetch officers
        const officersRes = await fetch(
            `https://api.company-information.service.gov.uk/company/${company.company_number}/officers?items_per_page=5`,
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(COMPANIES_HOUSE_API_KEY + ":").toString("base64")}`,
                },
            }
        )

        if (!officersRes.ok) return { directorName: null, companyNumber: company.company_number }

        const officersData = (await officersRes.json()) as {
            items?: Array<{ name: string; officer_role: string; resigned_on?: string }>
        }
        const activeDirector = officersData.items?.find(
            (o) => !o.resigned_on && (o.officer_role === "director" || o.officer_role === "secretary")
        )

        // Format name: "SURNAME, Firstname" → "Firstname Surname"
        let directorName = activeDirector?.name || null
        if (directorName && directorName.includes(",")) {
            const parts = directorName.split(",").map((p) => p.trim())
            directorName = `${parts[1]} ${parts[0]}`
            // Title case
            directorName = directorName
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase())
        }

        return { directorName, companyNumber: company.company_number }
    } catch {
        return { directorName: null, companyNumber: null }
    }
}

// ─── Layer 5: Apollo People Search ──────────────────────────

async function apolloSearch(
    domain: string | null,
    companyName: string
): Promise<{
    name: string | null
    email: string | null
    linkedinUrl: string | null
    title: string | null
}> {
    if (!APOLLO_API_KEY) return { name: null, email: null, linkedinUrl: null, title: null }

    try {
        const body: Record<string, unknown> = {
            per_page: 3,
            person_titles: ["owner", "founder", "director", "managing director", "ceo"],
        }
        if (domain) {
            body.q_organization_domains = domain
        } else {
            body.q_organization_name = companyName
        }

        const res = await fetch("https://api.apollo.io/v1/mixed_people/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": APOLLO_API_KEY,
            },
            body: JSON.stringify(body),
        })

        if (!res.ok) return { name: null, email: null, linkedinUrl: null, title: null }

        const data = (await res.json()) as {
            people?: Array<{
                name: string
                email: string
                linkedin_url: string
                title: string
            }>
        }

        const person = data.people?.[0]
        if (!person) return { name: null, email: null, linkedinUrl: null, title: null }

        return {
            name: person.name || null,
            email: person.email || null,
            linkedinUrl: person.linkedin_url || null,
            title: person.title || null,
        }
    } catch {
        return { name: null, email: null, linkedinUrl: null, title: null }
    }
}

// ─── Layer 6: Email Construction ────────────────────────────

function constructEmails(
    name: string | null,
    domain: string | null
): string[] {
    if (!name || !domain) return []

    const parts = name.toLowerCase().split(" ")
    if (parts.length < 2) return [`${parts[0]}@${domain}`]

    const first = parts[0]
    const last = parts[parts.length - 1]

    return [
        `${first}.${last}@${domain}`,
        `${first}@${domain}`,
        `${first[0]}${last}@${domain}`,
        `info@${domain}`,
    ]
}

function extractDomain(website: string | null): string | null {
    if (!website) return null
    try {
        const url = new URL(website.startsWith("http") ? website : `https://${website}`)
        return url.hostname.replace(/^www\./, "")
    } catch {
        return null
    }
}

// ─── Layer 7: Email Verification (Reoon) ────────────────────

async function verifyEmail(email: string): Promise<boolean> {
    if (!REOON_API_KEY) return true // Skip verification if no key

    try {
        const res = await fetch(
            `https://emailverifier.reoon.com/api/v1/verify?email=${encodeURIComponent(email)}&key=${REOON_API_KEY}&mode=quick`
        )

        if (!res.ok) return false

        const data = (await res.json()) as { status?: string }
        return data.status === "valid" || data.status === "safe"
    } catch {
        return false
    }
}

// ─── Enrichment Pipeline ────────────────────────────────────

async function enrichLead(lead: {
    id: string
    businessName: string
    website: string | null
}): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {
        leadId: lead.id,
        contactName: null,
        contactEmail: null,
        linkedinUrl: null,
        jobTitle: null,
        score: 0,
        status: "FAILED",
    }

    const domain = extractDomain(lead.website)

    // Layer 1: Scrape website
    let websiteContent: string | null = null
    if (lead.website) {
        websiteContent = await scrapeWebsite(lead.website)
    }

    // Layer 2: LLM extraction
    let llmResult: LLMExtraction | null = null
    if (websiteContent) {
        llmResult = await llmExtract(websiteContent, lead.businessName)

        if (llmResult) {
            result.contactName = llmResult.ownerName
            result.contactEmail = llmResult.ownerEmail
            result.linkedinUrl = llmResult.linkedinUrl
            result.jobTitle = llmResult.ownerRole

            // Early exit if high confidence with both name and email
            if (
                llmResult.confidence === "HIGH" &&
                result.contactName &&
                result.contactEmail
            ) {
                result.score = 90
                result.status = "ENRICHED"
                return result
            }
        }
    }

    // Layer 3: Regex email extraction from scraped content
    if (!result.contactEmail && websiteContent) {
        const regexEmails = extractEmails(websiteContent)
        if (regexEmails.length > 0) {
            result.contactEmail = regexEmails[0]
        }
    }

    // Layer 4: Companies House lookup
    if (!result.contactName) {
        const chResult = await companiesHouseLookup(lead.businessName)
        if (chResult.directorName) {
            result.contactName = chResult.directorName
            result.jobTitle = result.jobTitle || "Director"
        }
    }

    // Layer 5: Apollo people search
    if (!result.contactEmail || !result.linkedinUrl) {
        const apolloResult = await apolloSearch(domain, lead.businessName)
        if (apolloResult.name && !result.contactName) {
            result.contactName = apolloResult.name
        }
        if (apolloResult.email && !result.contactEmail) {
            result.contactEmail = apolloResult.email
        }
        if (apolloResult.linkedinUrl && !result.linkedinUrl) {
            result.linkedinUrl = apolloResult.linkedinUrl
        }
        if (apolloResult.title && !result.jobTitle) {
            result.jobTitle = apolloResult.title
        }
    }

    // Layer 6: Email construction if we have name + domain but no email
    if (!result.contactEmail && result.contactName && domain) {
        const candidates = constructEmails(result.contactName, domain)
        for (const candidate of candidates) {
            const isValid = await verifyEmail(candidate)
            if (isValid) {
                result.contactEmail = candidate
                break
            }
        }
    }

    // Layer 7: Verify final email
    if (result.contactEmail) {
        const isValid = await verifyEmail(result.contactEmail)
        if (!isValid) {
            result.contactEmail = null
        }
    }

    // Score the enrichment
    if (result.contactName) result.score += 30
    if (result.contactEmail) result.score += 40
    if (result.linkedinUrl) result.score += 20
    if (result.jobTitle) result.score += 10

    result.status = result.score >= 30 ? "ENRICHED" : "FAILED"

    return result
}

// ─── Main handler ───────────────────────────────────────────

export async function POST(req: NextRequest) {
    // Auth check
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

    const { leadIds } = await req.json()

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
        return NextResponse.json({ error: "leadIds array is required" }, { status: 400 })
    }

    // Cap at 25 leads per enrichment request
    const cappedIds = leadIds.slice(0, 25)

    // Fetch leads from DB
    const leads = await prisma.outreachLead.findMany({
        where: {
            id: { in: cappedIds },
            campaign: { userId: session.user.id },
        },
        select: {
            id: true,
            businessName: true,
            website: true,
        },
    })

    if (leads.length === 0) {
        return NextResponse.json({ error: "No leads found" }, { status: 404 })
    }

    // Process leads sequentially (to respect API rate limits)
    const results: EnrichmentResult[] = []
    for (const lead of leads) {
        try {
            const result = await enrichLead(lead)
            results.push(result)

            // Update lead in DB
            await prisma.outreachLead.update({
                where: { id: lead.id },
                data: {
                    contactName: result.contactName,
                    contactEmail: result.contactEmail,
                    linkedinUrl: result.linkedinUrl,
                    jobTitle: result.jobTitle,
                    enrichmentScore: result.score,
                    enrichmentStatus: result.status,
                },
            })
        } catch (err) {
            console.error(`[Enrich] Failed for lead ${lead.id}:`, err)
            results.push({
                leadId: lead.id,
                contactName: null,
                contactEmail: null,
                linkedinUrl: null,
                jobTitle: null,
                score: 0,
                status: "FAILED",
            })
        }
    }

    const enriched = results.filter((r) => r.status === "ENRICHED").length
    const failed = results.filter((r) => r.status === "FAILED").length

    return NextResponse.json({
        success: true,
        total: results.length,
        enriched,
        failed,
        results,
    })
}
