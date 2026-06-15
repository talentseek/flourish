import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"

/**
 * POST /api/outreach/dry-run
 * 
 * Processes a campaign's leads and returns what WOULD be sent
 * without actually calling Unipile. Optionally simulates the send
 * by updating lead statuses and creating test events.
 * 
 * Body: { campaignId: string, simulate?: boolean }
 */
export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { campaignId, simulate } = await req.json()

    if (!campaignId) {
        return NextResponse.json({ error: "campaignId is required" }, { status: 400 })
    }

    const campaign = await prisma.outreachCampaign.findUnique({
        where: { id: campaignId },
        include: {
            leads: {
                orderBy: { createdAt: "asc" },
            },
        },
    })

    if (!campaign || campaign.userId !== session.user.id) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const centreName = campaign.locationName || ""

    // Resolve template variables for each lead
    const results = campaign.leads.map((lead) => {
        const firstName = lead.contactName?.split(" ")[0] || "there"
        const businessName = lead.businessName

        function resolveTemplate(template: string | null): string | null {
            if (!template) return null
            return template
                .replace(/\{\{firstName\}\}/g, firstName)
                .replace(/\{\{businessName\}\}/g, businessName)
                .replace(/\{\{contactName\}\}/g, lead.contactName || "")
                .replace(/\{\{centreName\}\}/g, centreName)
        }

        const linkedinMessage = resolveTemplate(campaign.linkedinMessage)
        const emailSubject = resolveTemplate(campaign.emailSubject)
        const emailBody = resolveTemplate(campaign.emailBody)

        // Check what can actually be sent
        const issues: string[] = []
        if (linkedinMessage && !lead.linkedinUrl) {
            issues.push("No LinkedIn URL — cannot send LinkedIn message")
        }
        if (emailBody && !lead.contactEmail) {
            issues.push("No email address — cannot send email")
        }
        if (!lead.contactName) {
            issues.push("No contact name — using 'there' as fallback")
        }
        if (!linkedinMessage && !emailBody) {
            issues.push("No message templates configured")
        }

        const canSendLinkedin = !!(linkedinMessage && lead.linkedinUrl)
        const canSendEmail = !!(emailBody && lead.contactEmail)

        return {
            leadId: lead.id,
            businessName: lead.businessName,
            contactName: lead.contactName,
            contactEmail: lead.contactEmail,
            linkedinUrl: lead.linkedinUrl,
            status: lead.status,
            enrichmentStatus: lead.enrichmentStatus,

            // Resolved messages
            linkedinMessage,
            emailSubject,
            emailBody,

            // Readiness
            canSendLinkedin,
            canSendEmail,
            issues,
            ready: (canSendLinkedin || canSendEmail) && issues.filter(i => !i.includes("fallback")).length === 0,
        }
    })

    // Summary stats
    const summary = {
        totalLeads: results.length,
        readyToSend: results.filter((r) => r.canSendLinkedin || r.canSendEmail).length,
        linkedinReady: results.filter((r) => r.canSendLinkedin).length,
        emailReady: results.filter((r) => r.canSendEmail).length,
        withIssues: results.filter((r) => r.issues.length > 0).length,
        notEnriched: results.filter((r) => r.enrichmentStatus === "PENDING").length,
    }

    // If simulate mode, update lead statuses and create test events
    if (simulate) {
        const now = new Date()

        for (const result of results) {
            const updateData: Record<string, unknown> = {}
            const events: Array<{ leadId: string; channel: string; subject: string | null; body: string | null; status: string }> = []

            if (result.canSendLinkedin) {
                updateData.linkedinInviteSentAt = now
                updateData.status = "IN_PROGRESS"
                events.push({
                    leadId: result.leadId,
                    channel: "LINKEDIN_INVITE",
                    subject: null,
                    body: "[TEST] Blank connection request sent",
                    status: "SENT",
                })

                // Simulate connection accepted (after a "delay")
                updateData.linkedinInviteAccepted = now
                updateData.linkedinMessageSentAt = now

                events.push({
                    leadId: result.leadId,
                    channel: "LINKEDIN_MESSAGE",
                    subject: null,
                    body: `[TEST] ${result.linkedinMessage}`,
                    status: "SENT",
                })
            }

            if (result.canSendEmail) {
                updateData.emailSentAt = now
                events.push({
                    leadId: result.leadId,
                    channel: "EMAIL",
                    subject: `[TEST] ${result.emailSubject}`,
                    body: `[TEST] ${result.emailBody}`,
                    status: "SENT",
                })
            }

            if (Object.keys(updateData).length > 0) {
                updateData.status = "COMPLETED"

                await prisma.outreachLead.update({
                    where: { id: result.leadId },
                    data: updateData,
                })
            }

            if (events.length > 0) {
                await prisma.outreachEvent.createMany({ data: events })
            }
        }
    }

    return NextResponse.json({
        success: true,
        simulated: !!simulate,
        summary,
        leads: results,
    })
}
