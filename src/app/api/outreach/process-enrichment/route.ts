import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { enrichLeadsByCampaignId } from '@/lib/enrich-pipeline'

export const maxDuration = 60

const CRON_SECRET = process.env.CRON_SECRET || ''
const BATCH_SIZE = 10 // Max leads to enrich per campaign per tick

/**
 * POST /api/outreach/process-enrichment
 *
 * Cron-triggered endpoint that processes PENDING leads in small batches.
 * Called every 5 minutes by cron-job.org.
 *
 * Unlike the fire-and-forget enrichment on campaign creation,
 * this processes in small batches to stay within Vercel's timeout.
 */
export async function POST(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Find all campaigns that have PENDING leads (any status, not just ACTIVE)
        const campaignsWithPending = await prisma.outreachCampaign.findMany({
            where: {
                leads: {
                    some: { enrichmentStatus: 'PENDING' },
                },
            },
            select: {
                id: true,
                name: true,
            },
        })

        if (campaignsWithPending.length === 0) {
            return NextResponse.json({ message: 'No pending leads to enrich', processed: 0 })
        }

        console.log(`[Enrich-Cron] Found ${campaignsWithPending.length} campaigns with pending leads`)

        let totalEnriched = 0
        let totalFailed = 0
        const results: Array<{ campaign: string; enriched: number; failed: number }> = []

        for (const campaign of campaignsWithPending) {
            // Get a small batch of PENDING leads for this campaign
            const pendingLeads = await prisma.outreachLead.findMany({
                where: { campaignId: campaign.id, enrichmentStatus: 'PENDING' },
                select: { id: true, businessName: true, website: true, phone: true, address: true },
                take: BATCH_SIZE,
            })

            if (pendingLeads.length === 0) continue

            console.log(`[Enrich-Cron] Processing ${pendingLeads.length} leads for "${campaign.name}"`)

            let enriched = 0
            let failed = 0

            for (const lead of pendingLeads) {
                try {
                    const result = await enrichSingleLead(lead)
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
                    if (result.status === 'ENRICHED') enriched++
                    else failed++
                } catch (err) {
                    console.error(`[Enrich-Cron] Error enriching lead ${lead.id}:`, err)
                    await prisma.outreachLead.update({
                        where: { id: lead.id },
                        data: { enrichmentStatus: 'FAILED', enrichmentScore: 0 },
                    }).catch(() => {})
                    failed++
                }
            }

            totalEnriched += enriched
            totalFailed += failed
            results.push({ campaign: campaign.name, enriched, failed })
            console.log(`[Enrich-Cron] "${campaign.name}": ${enriched} enriched, ${failed} failed`)
        }

        console.log(`[Enrich-Cron] Complete: ${totalEnriched} enriched, ${totalFailed} failed across ${campaignsWithPending.length} campaigns`)

        return NextResponse.json({
            processed: totalEnriched + totalFailed,
            enriched: totalEnriched,
            failed: totalFailed,
            campaigns: results,
        })
    } catch (err) {
        console.error('[Enrich-Cron] Fatal error:', err)
        return NextResponse.json(
            { error: 'Internal error', message: (err as Error).message },
            { status: 500 }
        )
    }
}

// ─── Single Lead Enrichment (extracted from enrich-pipeline.ts) ──────

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || ''
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const COMPANIES_HOUSE_API_KEY = process.env.COMPANIES_HOUSE_API_KEY || ''
const APOLLO_API_KEY = process.env.APOLLO_API_KEY || ''
const REOON_API_KEY = process.env.REOON_API_KEY || ''

interface LeadInput {
    id: string
    businessName: string
    website: string | null
    phone: string | null
    address: string | null
}

interface EnrichmentResult {
    contactName: string | null
    contactEmail: string | null
    linkedinUrl: string | null
    jobTitle: string | null
    score: number
    status: 'ENRICHED' | 'FAILED'
}

/**
 * Enrich a single lead through the multi-layer pipeline.
 * This is a self-contained version that doesn't depend on the main enrich-pipeline
 * module to avoid import issues with 'use server' directives in cron context.
 */
async function enrichSingleLead(lead: LeadInput): Promise<EnrichmentResult> {
    let contactName: string | null = null
    let contactEmail: string | null = null
    let linkedinUrl: string | null = null
    let jobTitle: string | null = null
    let score = 0

    // Layer 1: Website scrape
    let websiteContent: string | null = null
    if (lead.website) {
        websiteContent = await scrapeWebsite(lead.website)
        if (websiteContent) score += 10
    }

    // Layer 2: LLM extraction from website content
    if (websiteContent) {
        const extraction = await extractWithLLM(websiteContent, lead.businessName)
        if (extraction) {
            contactName = extraction.ownerName
            contactEmail = extraction.ownerEmail
            jobTitle = extraction.ownerRole
            if (contactName) score += 20
            if (contactEmail) score += 25
        }
    }

    // Layer 3: Regex fallback for emails
    if (!contactEmail && websiteContent) {
        const emailMatch = websiteContent.match(
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
        )
        if (emailMatch) {
            const email = emailMatch[0].toLowerCase()
            if (!email.includes('example') && !email.includes('noreply') && !email.includes('info@')) {
                contactEmail = email
                score += 15
            }
        }
    }

    // Layer 4: Companies House director lookup
    if (!contactName && COMPANIES_HOUSE_API_KEY) {
        const director = await lookupCompaniesHouse(lead.businessName)
        if (director) {
            contactName = director.name
            jobTitle = director.role || 'Director'
            score += 15
        }
    }

    // Layer 5: Apollo people search
    if (APOLLO_API_KEY && (!contactEmail || !linkedinUrl)) {
        const apollo = await searchApollo(lead.businessName, lead.address)
        if (apollo) {
            if (!contactName && apollo.name) { contactName = apollo.name; score += 10 }
            if (!contactEmail && apollo.email) { contactEmail = apollo.email; score += 20 }
            if (!linkedinUrl && apollo.linkedinUrl) { linkedinUrl = apollo.linkedinUrl; score += 10 }
            if (!jobTitle && apollo.title) jobTitle = apollo.title
        }
    }

    // Layer 6: Email verification
    if (contactEmail && REOON_API_KEY) {
        const valid = await verifyEmail(contactEmail)
        if (!valid) {
            contactEmail = null
            score = Math.max(0, score - 20)
        } else {
            score += 10
        }
    }

    const status = (contactName || contactEmail || linkedinUrl) ? 'ENRICHED' as const : 'FAILED' as const
    return { contactName, contactEmail, linkedinUrl, jobTitle, score: Math.min(100, score), status }
}

// ─── Layer Helpers ──────────────────────────────────────────

async function scrapeWebsite(url: string): Promise<string | null> {
    try {
        if (FIRECRAWL_API_KEY) {
            const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${FIRECRAWL_API_KEY}` },
                body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true, timeout: 15000 }),
            })
            if (res.ok) {
                const data = (await res.json()) as { data?: { markdown?: string } }
                if (data.data?.markdown) return data.data.markdown.slice(0, 8000)
            }
        }
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FlourishBot/1.0)' },
            signal: AbortSignal.timeout(10000),
        })
        if (res.ok) {
            const html = await res.text()
            return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 8000)
        }
    } catch { /* scrape failed */ }
    return null
}

interface LLMExtraction {
    ownerName: string | null
    ownerEmail: string | null
    ownerRole: string | null
    emails: string[]
}

async function extractWithLLM(content: string, businessName: string): Promise<LLMExtraction | null> {
    if (!OPENROUTER_API_KEY) return null
    try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENROUTER_API_KEY}` },
            body: JSON.stringify({
                model: 'google/gemini-flash-1.5',
                messages: [{
                    role: 'user',
                    content: `Extract owner/manager contact info from this ${businessName} website content. Return JSON only:
{"ownerName":"name or null","ownerEmail":"email or null","ownerRole":"role or null","emails":["all@emails.found"]}

Content: ${content.slice(0, 4000)}`
                }],
                max_tokens: 200,
                temperature: 0,
            }),
        })
        if (!res.ok) return null
        const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
        const text = data.choices?.[0]?.message?.content || ''
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) return JSON.parse(jsonMatch[0]) as LLMExtraction
    } catch { /* LLM failed */ }
    return null
}

async function lookupCompaniesHouse(businessName: string): Promise<{ name: string; role: string } | null> {
    if (!COMPANIES_HOUSE_API_KEY) return null
    try {
        const searchRes = await fetch(
            `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(businessName)}&items_per_page=1`,
            { headers: { Authorization: `Basic ${Buffer.from(COMPANIES_HOUSE_API_KEY + ':').toString('base64')}` } }
        )
        if (!searchRes.ok) return null
        const searchData = (await searchRes.json()) as { items?: Array<{ company_number?: string }> }
        const companyNumber = searchData.items?.[0]?.company_number
        if (!companyNumber) return null

        const officersRes = await fetch(
            `https://api.company-information.service.gov.uk/company/${companyNumber}/officers?items_per_page=1`,
            { headers: { Authorization: `Basic ${Buffer.from(COMPANIES_HOUSE_API_KEY + ':').toString('base64')}` } }
        )
        if (!officersRes.ok) return null
        const officersData = (await officersRes.json()) as { items?: Array<{ name?: string; officer_role?: string }> }
        const officer = officersData.items?.[0]
        if (!officer?.name) return null
        // Companies House returns names as "SURNAME, Forenames" — flip them
        const parts = officer.name.split(', ')
        const name = parts.length === 2
            ? `${parts[1]} ${parts[0].charAt(0)}${parts[0].slice(1).toLowerCase()}`
            : officer.name
        return { name, role: officer.officer_role || 'Director' }
    } catch { /* CH failed */ }
    return null
}

interface ApolloResult {
    name: string | null
    email: string | null
    linkedinUrl: string | null
    title: string | null
}

async function searchApollo(businessName: string, address: string | null): Promise<ApolloResult | null> {
    if (!APOLLO_API_KEY) return null
    try {
        const res = await fetch('https://api.apollo.io/v1/mixed_people/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Api-Key': APOLLO_API_KEY },
            body: JSON.stringify({
                q_organization_name: businessName,
                person_titles: ['owner', 'director', 'founder', 'manager', 'proprietor'],
                per_page: 1,
            }),
        })
        if (!res.ok) return null
        const data = (await res.json()) as { people?: Array<{ name?: string; email?: string; linkedin_url?: string; title?: string }> }
        const person = data.people?.[0]
        if (!person) return null
        return {
            name: person.name || null,
            email: person.email || null,
            linkedinUrl: person.linkedin_url || null,
            title: person.title || null,
        }
    } catch { /* Apollo failed */ }
    return null
}

async function verifyEmail(email: string): Promise<boolean> {
    if (!REOON_API_KEY) return true // Skip verification if no key
    try {
        const res = await fetch(
            `https://emailverifier.reoon.com/api/v1/verify?email=${encodeURIComponent(email)}&key=${REOON_API_KEY}&mode=quick`
        )
        if (!res.ok) return true // Assume valid on API error
        const data = (await res.json()) as { status?: string }
        return data.status !== 'invalid'
    } catch { return true }
}
