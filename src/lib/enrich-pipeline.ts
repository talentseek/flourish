'use server'

import { prisma } from '@/lib/db'

// Re-export the enrichment pipeline logic from the API route
// so it can be called directly from server actions without HTTP

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

// ─── Layer 1: Website Scrape ────────────────────────────────

async function scrapeWebsite(url: string): Promise<string | null> {
    try {
        if (FIRECRAWL_API_KEY) {
            const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
                },
                body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true, timeout: 15000 }),
            })
            if (res.ok) {
                const data = (await res.json()) as { data?: { markdown?: string } }
                if (data.data?.markdown) return data.data.markdown.slice(0, 8000)
            }
        }
        const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; FlourishBot/1.0)" },
            signal: AbortSignal.timeout(10000),
        })
        if (res.ok) {
            const html = await res.text()
            return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 8000)
        }
    } catch { /* scrape failed */ }
    return null
}

// ─── Layer 2: LLM Extraction ────────────────────────────────

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

async function llmExtract(websiteContent: string, businessName: string): Promise<LLMExtraction | null> {
    if (!OPENROUTER_API_KEY) return null
    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENROUTER_API_KEY}` },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [
                    { role: "system", content: "Extract business owner/contact information from website content. Return JSON only." },
                    { role: "user", content: `Extract the owner/key contact details for "${businessName}" from this website content. Return JSON with: ownerName (string|null), ownerEmail (string|null), ownerRole (string|null), emails (string[]), phones (string[]), linkedinUrl (string|null), companyNumber (string|null), confidence (HIGH|MEDIUM|LOW).\n\nContent:\n${websiteContent}` },
                ],
                response_format: { type: "json_object" },
                max_tokens: 500,
                temperature: 0.1,
            }),
        })
        if (!res.ok) return null
        const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
        const content = data.choices?.[0]?.message?.content
        if (!content) return null
        return JSON.parse(content) as LLMExtraction
    } catch { return null }
}

// ─── Layer 3: Regex Email ───────────────────────────────────

function extractEmails(text: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const matches = text.match(emailRegex) || []
    const blocklist = ["noreply", "no-reply", "support", "admin", "webmaster", "postmaster", "mailer-daemon", "example.com", "sentry.io", "wixpress.com"]
    return matches.filter((email) => !blocklist.some((b) => email.toLowerCase().includes(b)))
}

// ─── Layer 4: Companies House ───────────────────────────────

function isReasonableCompanyMatch(businessName: string, chTitle: string): boolean {
    const normalize = (s: string) => s.toLowerCase().replace(/\b(ltd|limited|llp|plc|inc|group|uk|the)\b/gi, "").replace(/[^a-z0-9]/g, "")
    const a = normalize(businessName)
    const b = normalize(chTitle)
    if (!a || !b) return false
    if (b.includes(a) || a.includes(b)) return true
    const shorter = a.length < b.length ? a : b
    const longer = a.length >= b.length ? a : b
    let matches = 0
    for (const ch of shorter) { if (longer.includes(ch)) matches++ }
    return matches / shorter.length > 0.7
}

async function companiesHouseLookup(businessName: string): Promise<{ directorName: string | null; companyNumber: string | null }> {
    if (!COMPANIES_HOUSE_API_KEY) return { directorName: null, companyNumber: null }
    try {
        const searchRes = await fetch(`https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(businessName)}&items_per_page=5`, {
            headers: { Authorization: `Basic ${Buffer.from(COMPANIES_HOUSE_API_KEY + ":").toString("base64")}` },
        })
        if (!searchRes.ok) return { directorName: null, companyNumber: null }
        const searchData = (await searchRes.json()) as { items?: Array<{ company_number: string; title: string; company_status?: string }> }
        const company = searchData.items?.find((c) => c.company_status === "active" && isReasonableCompanyMatch(businessName, c.title)) || searchData.items?.find((c) => isReasonableCompanyMatch(businessName, c.title))
        if (!company) return { directorName: null, companyNumber: null }

        const officersRes = await fetch(`https://api.company-information.service.gov.uk/company/${company.company_number}/officers?items_per_page=5`, {
            headers: { Authorization: `Basic ${Buffer.from(COMPANIES_HOUSE_API_KEY + ":").toString("base64")}` },
        })
        if (!officersRes.ok) return { directorName: null, companyNumber: company.company_number }
        const officersData = (await officersRes.json()) as { items?: Array<{ name: string; officer_role: string; resigned_on?: string }> }
        const activeDirector = officersData.items?.find((o) => !o.resigned_on && (o.officer_role === "director" || o.officer_role === "secretary"))

        let directorName = activeDirector?.name || null
        if (directorName && directorName.includes(",")) {
            const parts = directorName.split(",").map((p) => p.trim())
            directorName = `${parts[1]} ${parts[0]}`.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
        }
        return { directorName, companyNumber: company.company_number }
    } catch { return { directorName: null, companyNumber: null } }
}

// ─── Layer 5a: Apollo Search ────────────────────────────────

async function apolloSearch(domain: string | null, companyName: string): Promise<{ name: string | null; email: string | null; linkedinUrl: string | null; title: string | null }> {
    if (!APOLLO_API_KEY) return { name: null, email: null, linkedinUrl: null, title: null }
    try {
        const searches: Array<Record<string, unknown>> = []
        if (domain) searches.push({ per_page: 5, person_seniorities: ["founder", "owner", "c_suite", "director"], q_organization_domains: domain })
        searches.push({ per_page: 5, person_seniorities: ["founder", "owner", "c_suite", "director"], person_locations: ["United Kingdom"], q_organization_name: companyName })
        searches.push({ per_page: 3, q_organization_name: companyName, organization_locations: ["United Kingdom"] })

        for (const body of searches) {
            const res = await fetch("https://api.apollo.io/v1/mixed_people/api_search", {
                method: "POST", headers: { "Content-Type": "application/json", "X-Api-Key": APOLLO_API_KEY }, body: JSON.stringify(body),
            })
            if (!res.ok) continue
            const data = (await res.json()) as { people?: Array<{ name: string; email: string; linkedin_url: string; title: string }> }
            const person = data.people?.[0]
            if (person) return { name: person.name || null, email: person.email || null, linkedinUrl: person.linkedin_url || null, title: person.title || null }
        }
        return { name: null, email: null, linkedinUrl: null, title: null }
    } catch { return { name: null, email: null, linkedinUrl: null, title: null } }
}

// ─── Layer 5b: Apollo Match ─────────────────────────────────

async function apolloMatch(contactName: string, businessName: string, domain: string | null): Promise<{ email: string | null; linkedinUrl: string | null; title: string | null }> {
    if (!APOLLO_API_KEY || !contactName) return { email: null, linkedinUrl: null, title: null }
    try {
        const nameParts = contactName.split(" ")
        const body: Record<string, unknown> = { organization_name: businessName }
        if (nameParts.length >= 2) { body.first_name = nameParts[0]; body.last_name = nameParts[nameParts.length - 1] } else { body.name = contactName }
        if (domain) body.domain = domain

        const res = await fetch("https://api.apollo.io/v1/people/match", {
            method: "POST", headers: { "Content-Type": "application/json", "X-Api-Key": APOLLO_API_KEY }, body: JSON.stringify(body),
        })
        if (!res.ok) return { email: null, linkedinUrl: null, title: null }
        const data = (await res.json()) as { person?: { email: string | null; linkedin_url: string | null; title: string | null } }
        if (data.person) return { email: data.person.email || null, linkedinUrl: data.person.linkedin_url || null, title: data.person.title || null }
        return { email: null, linkedinUrl: null, title: null }
    } catch { return { email: null, linkedinUrl: null, title: null } }
}

// ─── Layer 6: Email Construction ────────────────────────────

function constructEmails(name: string | null, domain: string | null): string[] {
    if (!name || !domain) return []
    const parts = name.toLowerCase().split(" ")
    if (parts.length < 2) return [`${parts[0]}@${domain}`]
    const first = parts[0], last = parts[parts.length - 1]
    return [`${first}.${last}@${domain}`, `${first}@${domain}`, `${first[0]}${last}@${domain}`, `info@${domain}`]
}

const PLATFORM_DOMAINS = [
    "instagram.com", "facebook.com", "twitter.com", "x.com", "tiktok.com", "youtube.com", "linkedin.com",
    "square.site", "squarespace.com", "wix.com", "wixsite.com", "wordpress.com", "blogspot.com", "tumblr.com",
    "etsy.com", "amazon.co.uk", "amazon.com", "ebay.co.uk", "ebay.com",
    "yell.com", "mapquest.com", "yelp.com", "tripadvisor.com", "google.com", "google.co.uk", "trustpilot.com",
    "hotfrog.co.uk", "cylex-uk.co.uk", "192.com", "thomsonlocal.com", "scoot.co.uk", "freeindex.co.uk",
]

function extractDomain(website: string | null): string | null {
    if (!website) return null
    try {
        const url = new URL(website.startsWith("http") ? website : `https://${website}`)
        const hostname = url.hostname.replace(/^www\./, "")
        if (PLATFORM_DOMAINS.some(pd => hostname === pd || hostname.endsWith(`.${pd}`))) return null
        return hostname
    } catch { return null }
}

// ─── Layer 0: Website Discovery ─────────────────────────────

async function discoverWebsite(businessName: string, address: string | null): Promise<string | null> {
    if (!FIRECRAWL_API_KEY) return null
    try {
        const city = address?.split(",").slice(-2, -1)[0]?.trim() || ""
        const res = await fetch("https://api.firecrawl.dev/v1/search", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${FIRECRAWL_API_KEY}` },
            body: JSON.stringify({ query: `"${businessName}" ${city} website`, limit: 3 }),
        })
        if (!res.ok) return null
        const data = (await res.json()) as { data?: Array<{ url?: string }> }
        for (const r of (data.data || [])) {
            if (!r.url) continue
            if (extractDomain(r.url)) return r.url
        }
    } catch { /* skip */ }
    return null
}

// ─── Layer 7: Email Verification ────────────────────────────

async function verifyEmail(email: string): Promise<boolean> {
    if (!REOON_API_KEY) return true
    try {
        const res = await fetch(`https://emailverifier.reoon.com/api/v1/verify?email=${encodeURIComponent(email)}&key=${REOON_API_KEY}&mode=quick`)
        if (!res.ok) return false
        const data = (await res.json()) as { status?: string }
        return data.status === "valid" || data.status === "safe"
    } catch { return false }
}

// ─── Enrichment Pipeline ────────────────────────────────────

async function enrichLead(
    lead: { id: string; businessName: string; website: string | null; phone: string | null; address: string | null },
    directorUsageCount: Map<string, number>
): Promise<EnrichmentResult> {
    const result: EnrichmentResult = { leadId: lead.id, contactName: null, contactEmail: null, linkedinUrl: null, jobTitle: null, score: 0, status: "FAILED" }

    let website = lead.website
    let domain = extractDomain(website)
    console.log(`[Enrich] Starting: "${lead.businessName}" | website: ${website || 'NONE'} | domain: ${domain || 'NONE'}`)

    // Layer 0: Website discovery
    if (!domain && lead.phone) {
        const discovered = await discoverWebsite(lead.businessName, lead.address)
        if (discovered) { website = discovered; domain = extractDomain(discovered) }
    }

    // Layer 1: Scrape website
    let websiteContent: string | null = null
    if (website && domain) { websiteContent = await scrapeWebsite(website) }

    // Layer 2: LLM extraction
    if (websiteContent) {
        const llmResult = await llmExtract(websiteContent, lead.businessName)
        if (llmResult) {
            result.contactName = llmResult.ownerName; result.contactEmail = llmResult.ownerEmail
            result.linkedinUrl = llmResult.linkedinUrl; result.jobTitle = llmResult.ownerRole
            if (llmResult.confidence === "HIGH" && result.contactName && result.contactEmail && result.linkedinUrl) {
                result.score = 100; result.status = "ENRICHED"; return result
            }
        }
    }

    // Layer 3: Regex email
    if (!result.contactEmail && websiteContent) {
        const regexEmails = extractEmails(websiteContent)
        if (regexEmails.length > 0) result.contactEmail = regexEmails[0]
    }

    // Layer 4: Companies House
    if (!result.contactName) {
        const chResult = await companiesHouseLookup(lead.businessName)
        if (chResult.directorName) {
            const dirKey = chResult.directorName.toLowerCase()
            const usageCount = directorUsageCount.get(dirKey) || 0
            if (usageCount < 2) {
                result.contactName = chResult.directorName; result.jobTitle = result.jobTitle || "Director"
                directorUsageCount.set(dirKey, usageCount + 1)
            }
        }
    }

    // Layer 5a: Apollo search
    if (!result.contactEmail || !result.linkedinUrl) {
        const apolloResult = await apolloSearch(domain, lead.businessName)
        if (apolloResult.name && !result.contactName) result.contactName = apolloResult.name
        if (apolloResult.email && !result.contactEmail) result.contactEmail = apolloResult.email
        if (apolloResult.linkedinUrl && !result.linkedinUrl) result.linkedinUrl = apolloResult.linkedinUrl
        if (apolloResult.title && !result.jobTitle) result.jobTitle = apolloResult.title
    }

    // Layer 5b: Apollo match
    if (result.contactName && !result.linkedinUrl) {
        const matchResult = await apolloMatch(result.contactName, lead.businessName, domain)
        if (matchResult.linkedinUrl) result.linkedinUrl = matchResult.linkedinUrl
        if (matchResult.email && !result.contactEmail) result.contactEmail = matchResult.email
        if (matchResult.title && !result.jobTitle) result.jobTitle = matchResult.title
    }

    // Layer 6: Email construction
    if (!result.contactEmail && result.contactName && domain) {
        for (const candidate of constructEmails(result.contactName, domain)) {
            if (await verifyEmail(candidate)) { result.contactEmail = candidate; break }
        }
    }

    // Layer 7: Verify final email
    if (result.contactEmail) {
        if (!(await verifyEmail(result.contactEmail))) result.contactEmail = null
    }

    // Score
    if (result.contactName) result.score += 30
    if (result.contactEmail) result.score += 40
    if (result.linkedinUrl) result.score += 20
    if (result.jobTitle) result.score += 10
    result.status = result.score >= 30 ? "ENRICHED" : "FAILED"
    console.log(`[Enrich] Done: "${lead.businessName}" → score=${result.score} status=${result.status}`)
    return result
}

// ─── Public: Enrich leads by campaign ID ────────────────────

export async function enrichLeadsByCampaignId(campaignId: string) {
    const pendingLeads = await prisma.outreachLead.findMany({
        where: { campaignId, enrichmentStatus: 'PENDING' },
        select: { id: true, businessName: true, website: true, phone: true, address: true },
    })

    if (pendingLeads.length === 0) return { enriched: 0, failed: 0 }

    console.log(`[Auto-Enrich] Starting enrichment for ${pendingLeads.length} leads in campaign ${campaignId}`)

    const directorUsageCount = new Map<string, number>()

    // Pre-seed director dedup
    const existingDirectors = await prisma.outreachLead.findMany({
        where: { campaignId, enrichmentStatus: "ENRICHED", jobTitle: "Director", contactName: { not: null } },
        select: { contactName: true },
    })
    for (const d of existingDirectors) {
        if (d.contactName) {
            const key = d.contactName.toLowerCase()
            directorUsageCount.set(key, (directorUsageCount.get(key) || 0) + 1)
        }
    }

    let enriched = 0, failed = 0

    for (const lead of pendingLeads) {
        try {
            const result = await enrichLead(lead, directorUsageCount)
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
            if (result.status === "ENRICHED") enriched++; else failed++
        } catch (err) {
            console.error(`[Auto-Enrich] Failed for lead ${lead.id}:`, err)
            failed++
        }
    }

    console.log(`[Auto-Enrich] Complete: ${enriched} enriched, ${failed} failed`)
    return { enriched, failed }
}
