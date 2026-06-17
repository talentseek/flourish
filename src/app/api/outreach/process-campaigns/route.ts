import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
    sendBlankInvite,
    sendMessage,
    sendEmail,
    isConnected,
    getUserProfile,
    getIncomingMessageText,
} from '@/lib/unipile'

export const maxDuration = 60

const CRON_SECRET = process.env.CRON_SECRET || ''

const MAX_LEADS_PER_CAMPAIGN = 10

const DAILY_LIMITS: Record<string, number> = {
    LINKEDIN_INVITE: 25,
    LINKEDIN_MESSAGE: 50,
    EMAIL: 50,
}

const OPT_OUT_KEYWORDS = [
    'unsubscribe',
    'stop',
    'remove me',
    'not interested',
    'opt out',
    "don't contact",
    'do not contact',
]

const REOON_API_KEY = process.env.REOON_API_KEY || ''

// Third-party platforms — emails from these domains are never real business contacts
const BLOCKED_DOMAINS = new Set([
    'fresha.com', 'booksy.com', 'godaddy.com', 'wix.com', 'squarespace.com',
    'wordpress.com', 'shopify.com', 'petsathome.com', 'jollyes.com', 'pata.pet',
    'wanderboat.ai', 'tracxn.com', 'visiteastleigh.co.uk', 'morphmarket.com',
    'vets4pets.com', 'yell.com', 'facebook.com', 'instagram.com', 'twitter.com',
    'linkedin.com', 'google.com', 'trustpilot.com', 'tripadvisor.com',
    'yelp.com', 'uber.com', 'deliveroo.com', 'justeat.com', 'salonspy.com',
    'treatwell.co.uk', 'freeindex.co.uk', 'cylex.co.uk', 'hotfrog.co.uk',
    'bark.com', 'checkatrade.com', 'mybuilder.com', 'ratedpeople.com',
    'wahanda.com', 'genbook.com', 'appointy.com', 'setmore.com',
    'calendly.com', 'acuityscheduling.com', 'timely.com', 'mailchimp.com',
    'sendinblue.com', 'hubspot.com', 'zoho.com', 'zendesk.com',
])

const GENERIC_PREFIXES = /^(info|hello|contact|enquir|admin|sales|support|office|mail|team|bookings?|reception|no-?reply|webmaster|postmaster)@/i

function isBlockedEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain) return true
    if (BLOCKED_DOMAINS.has(domain)) return true
    if (GENERIC_PREFIXES.test(email)) return true
    return false
}

async function verifyEmailWithReoon(email: string): Promise<boolean> {
    if (!REOON_API_KEY) return true // Skip if no key
    try {
        const res = await fetch(
            `https://emailverifier.reoon.com/api/v1/verify?email=${encodeURIComponent(email)}&key=${REOON_API_KEY}&mode=quick`
        )
        if (!res.ok) return true // Assume valid on API error
        const data = (await res.json()) as { status?: string }
        return data.status !== 'invalid'
    } catch { return true }
}

// ─── Helpers ────────────────────────────────────────────────

function isBusinessHours(): boolean {
    const now = new Date()
    const ukTime = new Date(
        now.toLocaleString('en-US', { timeZone: 'Europe/London' })
    )
    const day = ukTime.getDay()
    const hour = ukTime.getHours()
    return day >= 1 && day <= 5 && hour >= 8 && hour < 18
}

function isOptOut(text: string): boolean {
    const lower = text.toLowerCase()
    return OPT_OUT_KEYWORDS.some((kw) => lower.includes(kw))
}

function mergeTemplate(
    template: string,
    lead: { businessName: string; contactName: string | null },
    senderName: string
): string {
    const firstName = lead.contactName?.split(' ')[0] || 'there'
    return template
        .replace(/\{\{businessName\}\}/g, lead.businessName)
        .replace(/\{\{contactName\}\}/g, lead.contactName || 'there')
        .replace(/\{\{firstName\}\}/g, firstName)
        .replace(/\{\{senderName\}\}/g, senderName)
        .replace(/\[Your Name\]/g, senderName)
}

function addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

function addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function getToday(): Date {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
}

// ─── Rate Limiting ──────────────────────────────────────────

type DailyCountMap = Record<string, number>

async function getDailyCounts(userId: string): Promise<DailyCountMap> {
    const today = getToday()
    const rows = await prisma.dailySendCount.findMany({
        where: { userId, date: today },
    })
    const map: DailyCountMap = {}
    for (const row of rows) {
        map[row.channel] = row.count
    }
    return map
}

function canSend(counts: DailyCountMap, channel: string): boolean {
    const current = counts[channel] || 0
    const limit = DAILY_LIMITS[channel] || 0
    return current < limit
}

async function incrementDailyCount(
    userId: string,
    channel: string
): Promise<void> {
    const today = getToday()
    await prisma.dailySendCount.upsert({
        where: { userId_date_channel: { userId, date: today, channel } },
        update: { count: { increment: 1 } },
        create: { userId, date: today, channel, count: 1 },
    })
}

// ─── Event Logging ──────────────────────────────────────────

async function logEvent(
    leadId: string,
    channel: string,
    body?: string,
    subject?: string
): Promise<void> {
    await prisma.outreachEvent.create({
        data: { leadId, channel, body, subject, status: 'SENT' },
    })
}

// ─── Pipeline Step Handlers ─────────────────────────────────

interface PipelineContext {
    lead: {
        id: string
        businessName: string
        contactName: string | null
        contactEmail: string | null
        linkedinUrl: string | null
        linkedinProviderId: string | null
        currentStep: number
        linkedinInviteSentAt: Date | null
    }
    campaign: {
        linkedinMessage: string | null
        emailSubject: string | null
        emailBody: string | null
    }
    linkedinAccountId: string | null
    emailAccountId: string | null
    senderName: string
    dailyCounts: DailyCountMap
    userId: string
    stats: BatchStats
}

interface BatchStats {
    invites: number
    messages: number
    emails: number
    replies: number
    errors: number
}

async function handleStep0(ctx: PipelineContext): Promise<void> {
    const { lead, campaign, linkedinAccountId, emailAccountId } = ctx
    const now = new Date()

    const hasLinkedIn =
        lead.linkedinUrl && campaign.linkedinMessage && linkedinAccountId
    const hasEmail =
        lead.contactEmail && campaign.emailBody && emailAccountId

    if (hasLinkedIn) {
        // Resolve provider ID
        let providerId = lead.linkedinProviderId
        if (!providerId) {
            const profile = (await getUserProfile(
                linkedinAccountId!,
                lead.linkedinUrl!
            )) as { provider_id: string | null }

            providerId = profile.provider_id
            if (!providerId) {
                console.log(
                    `[Pipeline] Could not resolve provider ID for lead ${lead.id} (${lead.linkedinUrl})`
                )
                if (hasEmail) {
                    // Fall through to email-only
                    await handleStep3(ctx)
                    return
                }
                await prisma.outreachLead.update({
                    where: { id: lead.id },
                    data: { status: 'FAILED' },
                })
                ctx.stats.errors++
                return
            }
            await prisma.outreachLead.update({
                where: { id: lead.id },
                data: { linkedinProviderId: providerId },
            })
        }

        // Check if already connected
        const alreadyConnected = await isConnected(
            linkedinAccountId!,
            providerId
        )
        if (alreadyConnected) {
            console.log(
                `[Pipeline] Lead ${lead.id} already connected — skipping to DM`
            )
            await prisma.outreachLead.update({
                where: { id: lead.id },
                data: {
                    linkedinProviderId: providerId,
                    currentStep: 2,
                    status: 'IN_PROGRESS',
                    linkedinInviteAccepted: now,
                },
            })
            // Process DM immediately
            ctx.lead = {
                ...ctx.lead,
                linkedinProviderId: providerId,
                currentStep: 2,
            }
            await handleStep2(ctx)
            return
        }

        // Rate limit check
        if (!canSend(ctx.dailyCounts, 'LINKEDIN_INVITE')) {
            console.log(
                `[Pipeline] Daily invite limit reached for user ${ctx.userId}`
            )
            return
        }

        // Send blank invite
        await sendBlankInvite(linkedinAccountId!, providerId)
        console.log(`[Pipeline] Invite sent to lead ${lead.id}`)

        await logEvent(lead.id, 'LINKEDIN_INVITE')
        await incrementDailyCount(ctx.userId, 'LINKEDIN_INVITE')
        ctx.dailyCounts['LINKEDIN_INVITE'] =
            (ctx.dailyCounts['LINKEDIN_INVITE'] || 0) + 1
        ctx.stats.invites++

        await prisma.outreachInvitation.create({
            data: {
                leadId: lead.id,
                providerId,
                status: 'PENDING',
                sentAt: now,
            },
        })

        await prisma.outreachLead.update({
            where: { id: lead.id },
            data: {
                linkedinProviderId: providerId,
                currentStep: 1,
                nextStepAt: addDays(now, 2),
                status: 'IN_PROGRESS',
                linkedinInviteSentAt: now,
            },
        })
    } else if (hasEmail) {
        // Email-only path
        await prisma.outreachLead.update({
            where: { id: lead.id },
            data: { currentStep: 3, status: 'IN_PROGRESS' },
        })
        ctx.lead = { ...ctx.lead, currentStep: 3 }
        await handleStep3(ctx)
    } else {
        console.log(
            `[Pipeline] Lead ${lead.id} has no contact method — marking FAILED`
        )
        await prisma.outreachLead.update({
            where: { id: lead.id },
            data: { status: 'FAILED' },
        })
        ctx.stats.errors++
    }
}

async function handleStep1(ctx: PipelineContext): Promise<void> {
    const { lead, linkedinAccountId } = ctx
    const now = new Date()

    if (!linkedinAccountId || !lead.linkedinProviderId) {
        console.log(
            `[Pipeline] Step 1: Missing LinkedIn context for lead ${lead.id}`
        )
        ctx.stats.errors++
        return
    }

    const accepted = await isConnected(
        linkedinAccountId,
        lead.linkedinProviderId
    )

    if (accepted) {
        console.log(`[Pipeline] Invite accepted for lead ${lead.id}`)

        await prisma.outreachInvitation.updateMany({
            where: { leadId: lead.id, status: 'PENDING' },
            data: { status: 'ACCEPTED', acceptedAt: now },
        })

        await prisma.outreachLead.update({
            where: { id: lead.id },
            data: {
                linkedinInviteAccepted: now,
                currentStep: 2,
                nextStepAt: null,
            },
        })

        // Send DM immediately
        ctx.lead = { ...ctx.lead, currentStep: 2 }
        await handleStep2(ctx)
        return
    }

    // Not accepted — check if expired (> 3 days since invite)
    const inviteSentAt = lead.linkedinInviteSentAt
    const daysSinceInvite = inviteSentAt
        ? (now.getTime() - inviteSentAt.getTime()) / (1000 * 60 * 60 * 24)
        : 0

    if (daysSinceInvite > 3) {
        console.log(
            `[Pipeline] Invite expired for lead ${lead.id} (${daysSinceInvite.toFixed(1)} days)`
        )

        await prisma.outreachInvitation.updateMany({
            where: { leadId: lead.id, status: 'PENDING' },
            data: { status: 'EXPIRED' },
        })

        if (lead.contactEmail && ctx.campaign.emailBody && ctx.emailAccountId) {
            await prisma.outreachLead.update({
                where: { id: lead.id },
                data: { currentStep: 3, nextStepAt: null },
            })
            ctx.lead = { ...ctx.lead, currentStep: 3 }
            await handleStep3(ctx)
        } else {
            await prisma.outreachLead.update({
                where: { id: lead.id },
                data: { currentStep: 4, status: 'COMPLETED', nextStepAt: null },
            })
        }
        return
    }

    // Still waiting — check again later
    await prisma.outreachLead.update({
        where: { id: lead.id },
        data: { nextStepAt: addHours(now, 12) },
    })
    console.log(
        `[Pipeline] Invite still pending for lead ${lead.id} — checking again in 12h`
    )
}

async function handleStep2(ctx: PipelineContext): Promise<void> {
    const { lead, campaign, linkedinAccountId } = ctx
    const now = new Date()

    if (!linkedinAccountId || !lead.linkedinProviderId) {
        console.log(
            `[Pipeline] Step 2: Missing LinkedIn context for lead ${lead.id}`
        )
        ctx.stats.errors++
        return
    }

    // Reply detection
    const incomingText = await getIncomingMessageText(
        linkedinAccountId,
        lead.linkedinProviderId
    )
    if (incomingText && incomingText.trim().length > 0) {
        console.log(`[Pipeline] Reply detected for lead ${lead.id} (LinkedIn)`)
        ctx.stats.replies++

        const replyData: Record<string, unknown> = {
            status: 'REPLIED',
            repliedAt: now,
            replyChannel: 'LINKEDIN',
            replyDetectedVia: 'PRE_DM_CHECK',
            currentStep: 4,
            nextStepAt: null,
        }

        if (isOptOut(incomingText)) {
            replyData.status = 'OPTED_OUT'
            replyData.optedOutAt = now
            console.log(
                `[Pipeline] Opt-out detected for lead ${lead.id}`
            )
        }

        await prisma.outreachLead.update({
            where: { id: lead.id },
            data: replyData,
        })

        await prisma.outreachEvent.create({
            data: {
                leadId: lead.id,
                channel: 'LINKEDIN_MESSAGE',
                body: incomingText,
                status: 'REPLIED',
            },
        })
        return
    }

    if (!campaign.linkedinMessage) {
        console.log(
            `[Pipeline] Step 2: No LinkedIn message template for lead ${lead.id}`
        )
        ctx.stats.errors++
        return
    }

    // Rate limit check
    if (!canSend(ctx.dailyCounts, 'LINKEDIN_MESSAGE')) {
        console.log(
            `[Pipeline] Daily message limit reached for user ${ctx.userId}`
        )
        return
    }

    const mergedMessage = mergeTemplate(
        campaign.linkedinMessage,
        lead,
        ctx.senderName
    )

    await sendMessage(linkedinAccountId, lead.linkedinProviderId, mergedMessage)
    console.log(`[Pipeline] DM sent to lead ${lead.id}`)

    await logEvent(lead.id, 'LINKEDIN_MESSAGE', mergedMessage)
    await incrementDailyCount(ctx.userId, 'LINKEDIN_MESSAGE')
    ctx.dailyCounts['LINKEDIN_MESSAGE'] =
        (ctx.dailyCounts['LINKEDIN_MESSAGE'] || 0) + 1
    ctx.stats.messages++

    const hasEmail =
        lead.contactEmail && campaign.emailBody && ctx.emailAccountId

    await prisma.outreachLead.update({
        where: { id: lead.id },
        data: {
            linkedinMessageSentAt: now,
            currentStep: hasEmail ? 3 : 4,
            nextStepAt: hasEmail ? addDays(now, 3) : null,
            status: hasEmail ? 'IN_PROGRESS' : 'COMPLETED',
        },
    })
}

async function handleStep3(ctx: PipelineContext): Promise<void> {
    const { lead, campaign, emailAccountId } = ctx
    const now = new Date()

    if (!emailAccountId || !lead.contactEmail || !campaign.emailBody) {
        console.log(
            `[Pipeline] Step 3: Missing email context for lead ${lead.id}`
        )
        await prisma.outreachLead.update({
            where: { id: lead.id },
            data: { currentStep: 4, status: 'COMPLETED', nextStepAt: null },
        })
        return
    }

    // Pre-send: block third-party platform emails
    if (isBlockedEmail(lead.contactEmail)) {
        console.log(
            `[Pipeline] Blocked email domain for lead ${lead.id}: ${lead.contactEmail}`
        )
        await prisma.outreachLead.update({
            where: { id: lead.id },
            data: { contactEmail: null, currentStep: 4, status: 'FAILED', nextStepAt: null },
        })
        ctx.stats.errors++
        return
    }

    // Pre-send: Reoon verification
    const emailValid = await verifyEmailWithReoon(lead.contactEmail)
    if (!emailValid) {
        console.log(
            `[Pipeline] Reoon rejected email for lead ${lead.id}: ${lead.contactEmail}`
        )
        await prisma.outreachLead.update({
            where: { id: lead.id },
            data: { contactEmail: null, currentStep: 4, status: 'FAILED', nextStepAt: null },
        })
        ctx.stats.errors++
        return
    }

    // Rate limit check
    if (!canSend(ctx.dailyCounts, 'EMAIL')) {
        console.log(
            `[Pipeline] Daily email limit reached for user ${ctx.userId}`
        )
        return
    }

    const mergedSubject = campaign.emailSubject
        ? mergeTemplate(campaign.emailSubject, lead, ctx.senderName)
        : `Reaching out to ${lead.businessName}`

    const mergedBody = mergeTemplate(campaign.emailBody, lead, ctx.senderName)

    const sent = await sendEmail(
        emailAccountId,
        {
            display_name: lead.contactName || lead.businessName,
            identifier: lead.contactEmail,
        },
        mergedSubject,
        mergedBody
    )

    if (!sent) {
        console.log(`[Pipeline] Email send failed for lead ${lead.id}`)
        ctx.stats.errors++
        return
    }

    console.log(`[Pipeline] Email sent to lead ${lead.id}`)

    await logEvent(lead.id, 'EMAIL', mergedBody, mergedSubject)
    await incrementDailyCount(ctx.userId, 'EMAIL')
    ctx.dailyCounts['EMAIL'] = (ctx.dailyCounts['EMAIL'] || 0) + 1
    ctx.stats.emails++

    await prisma.outreachLead.update({
        where: { id: lead.id },
        data: {
            emailSentAt: now,
            currentStep: 4,
            status: 'COMPLETED',
            nextStepAt: null,
        },
    })
}

// ─── Main Handler ───────────────────────────────────────────

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isBusinessHours()) {
        console.log('[Pipeline] Outside business hours — skipping')
        return NextResponse.json({ skipped: 'outside_business_hours' })
    }

    const startedAt = new Date()

    try {
        const campaigns = await prisma.outreachCampaign.findMany({
            where: { status: 'ACTIVE' },
            include: {
                user: {
                    include: {
                        integrations: { where: { status: 'ACTIVE' } },
                    },
                },
            },
        })

        console.log(`[Pipeline] Found ${campaigns.length} active campaigns`)

        const globalStats: BatchStats = {
            invites: 0,
            messages: 0,
            emails: 0,
            replies: 0,
            errors: 0,
        }
        let totalProcessed = 0

        for (const campaign of campaigns) {
            const { user } = campaign
            const linkedinIntegration = user.integrations.find(
                (i) => i.provider === 'LINKEDIN'
            )
            const emailIntegration = user.integrations.find(
                (i) => i.provider === 'MICROSOFT'
            )
            const senderName =
                linkedinIntegration?.displayName ||
                emailIntegration?.displayName ||
                user.name ||
                'Team'

            const now = new Date()

            const leads = await prisma.outreachLead.findMany({
                where: {
                    campaignId: campaign.id,
                    enrichmentStatus: 'ENRICHED',
                    status: { in: ['QUEUED', 'IN_PROGRESS'] },
                    OR: [
                        { currentStep: 0 },
                        { nextStepAt: { lte: now } },
                    ],
                },
                take: MAX_LEADS_PER_CAMPAIGN,
                orderBy: { createdAt: 'asc' },
            })

            console.log(
                `[Pipeline] Campaign ${campaign.id}: ${leads.length} actionable leads`
            )

            const dailyCounts = await getDailyCounts(campaign.userId)

            for (const lead of leads) {
                try {
                    const ctx: PipelineContext = {
                        lead: {
                            id: lead.id,
                            businessName: lead.businessName,
                            contactName: lead.contactName,
                            contactEmail: lead.contactEmail,
                            linkedinUrl: lead.linkedinUrl,
                            linkedinProviderId: lead.linkedinProviderId,
                            currentStep: lead.currentStep,
                            linkedinInviteSentAt: lead.linkedinInviteSentAt,
                        },
                        campaign: {
                            linkedinMessage: campaign.linkedinMessage,
                            emailSubject: campaign.emailSubject,
                            emailBody: campaign.emailBody,
                        },
                        linkedinAccountId:
                            linkedinIntegration?.unipileAccountId || null,
                        emailAccountId:
                            emailIntegration?.unipileAccountId || null,
                        senderName,
                        dailyCounts,
                        userId: campaign.userId,
                        stats: globalStats,
                    }

                    switch (lead.currentStep) {
                        case 0:
                            await handleStep0(ctx)
                            break
                        case 1:
                            await handleStep1(ctx)
                            break
                        case 2:
                            await handleStep2(ctx)
                            break
                        case 3:
                            await handleStep3(ctx)
                            break
                        default:
                            console.log(
                                `[Pipeline] Lead ${lead.id} at step ${lead.currentStep} — no action`
                            )
                    }

                    totalProcessed++
                } catch (err) {
                    console.error(
                        `[Pipeline] Error processing lead ${lead.id}:`,
                        err
                    )
                    globalStats.errors++
                }
            }
        }

        // Write batch log
        await prisma.batchLog.create({
            data: {
                batchNumber: Date.now(),
                invitesSent: globalStats.invites,
                messagesSent: globalStats.messages,
                emailsSent: globalStats.emails,
                repliesDetected: globalStats.replies,
                errors: globalStats.errors,
                startedAt,
                completedAt: new Date(),
            },
        })

        console.log(
            `[Pipeline] Batch complete — processed: ${totalProcessed}, invites: ${globalStats.invites}, messages: ${globalStats.messages}, emails: ${globalStats.emails}, replies: ${globalStats.replies}, errors: ${globalStats.errors}`
        )

        return NextResponse.json({
            processed: totalProcessed,
            invitesSent: globalStats.invites,
            messagesSent: globalStats.messages,
            emailsSent: globalStats.emails,
            repliesDetected: globalStats.replies,
            errors: globalStats.errors,
            campaignsProcessed: campaigns.length,
        })
    } catch (err) {
        console.error('[Pipeline] Fatal error:', err)
        return NextResponse.json(
            { error: 'Pipeline failed', details: String(err) },
            { status: 500 }
        )
    }
}
