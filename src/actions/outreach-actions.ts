'use server'

import { prisma } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { enrichLeadsByCampaignId } from '@/lib/enrich-pipeline'

// ─── Auth Helper ────────────────────────────────────────────

async function verifyRMOrAdmin() {
    const user = await getSessionUser()
    if (!user) throw new Error('Not authenticated')

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true, role: true },
    })
    if (!dbUser) throw new Error('User not found')
    if (dbUser.role !== 'REGIONAL_MANAGER' && dbUser.role !== 'ADMIN') {
        throw new Error('Access denied')
    }
    return dbUser
}

async function verifyAdmin() {
    const user = await getSessionUser()
    if (!user) throw new Error('Not authenticated')

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true, role: true },
    })
    if (!dbUser) throw new Error('User not found')
    if (dbUser.role !== 'ADMIN') {
        throw new Error('Admin access required')
    }
    return dbUser
}

// ─── Admin: All Campaigns Overview ─────────────────────────

export async function getAllCampaignsForAdmin() {
    await verifyAdmin()

    return prisma.outreachCampaign.findMany({
        include: {
            user: {
                select: { id: true, name: true, email: true, role: true },
            },
            location: {
                select: { id: true, name: true, city: true },
            },
            _count: { select: { leads: true } },
            leads: {
                select: { status: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    })
}

export async function getAllRMIntegrationStatus() {
    await verifyAdmin()

    const users = await prisma.user.findMany({
        where: {
            role: { in: ['REGIONAL_MANAGER', 'ADMIN'] },
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            integrations: {
                where: { status: 'ACTIVE' },
                select: { provider: true, displayName: true, email: true },
            },
        },
        orderBy: { name: 'asc' },
    })

    return users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        hasLinkedIn: u.integrations.some((i) => i.provider === 'LINKEDIN'),
        hasEmail: u.integrations.some((i) => i.provider === 'MICROSOFT'),
        linkedInName: u.integrations.find((i) => i.provider === 'LINKEDIN')?.displayName ?? null,
        emailAddress: u.integrations.find((i) => i.provider === 'MICROSOFT')?.email ?? null,
    }))
}

// ─── User Integrations ─────────────────────────────────────

export async function getUserIntegrations() {
    const user = await verifyRMOrAdmin()
    return prisma.userIntegration.findMany({
        where: { userId: user.id },
        orderBy: { provider: 'asc' },
    })
}

export async function saveUserIntegration(data: {
    provider: string
    unipileAccountId: string
    email?: string
    displayName?: string
}) {
    const user = await verifyRMOrAdmin()

    const integration = await prisma.userIntegration.upsert({
        where: {
            userId_provider: {
                userId: user.id,
                provider: data.provider,
            },
        },
        update: {
            unipileAccountId: data.unipileAccountId,
            email: data.email,
            displayName: data.displayName,
            status: 'ACTIVE',
        },
        create: {
            userId: user.id,
            provider: data.provider,
            unipileAccountId: data.unipileAccountId,
            email: data.email,
            displayName: data.displayName,
            status: 'ACTIVE',
        },
    })

    revalidatePath('/outreach')
    return integration
}

export async function disconnectIntegration(integrationId: string) {
    const user = await verifyRMOrAdmin()

    const integration = await prisma.userIntegration.findUnique({
        where: { id: integrationId },
    })
    if (!integration || integration.userId !== user.id) {
        throw new Error('Integration not found')
    }

    await prisma.userIntegration.update({
        where: { id: integrationId },
        data: { status: 'DISCONNECTED' },
    })

    revalidatePath('/outreach')
    return { success: true }
}

// ─── Centres (Locations) ────────────────────────────────────

export async function getUserCentres() {
    const user = await verifyRMOrAdmin()

    const where = user.role === 'ADMIN'
        ? { isManaged: true }
        : { isManaged: true, regionalManager: user.name }

    const locations = await prisma.location.findMany({
        where,
        select: {
            id: true,
            name: true,
            city: true,
            postcode: true,
            type: true,
            latitude: true,
            longitude: true,
        },
        orderBy: { name: 'asc' },
    })

    return locations.map((loc) => ({
        id: loc.id,
        name: loc.name,
        city: loc.city,
        postcode: loc.postcode,
        type: loc.type,
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
        label: `${loc.name}, ${loc.city}`,
    }))
}

// ─── Campaigns ──────────────────────────────────────────────

export async function getCampaigns() {
    const user = await verifyRMOrAdmin()

    return prisma.outreachCampaign.findMany({
        where: { userId: user.id },
        include: {
            _count: { select: { leads: true } },
            leads: {
                select: { status: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    })
}

export async function getCampaign(id: string) {
    const user = await verifyRMOrAdmin()

    const campaign = await prisma.outreachCampaign.findUnique({
        where: { id },
        include: {
            leads: {
                orderBy: { createdAt: 'asc' },
                include: {
                    events: { orderBy: { createdAt: 'desc' }, take: 1 },
                },
            },
        },
    })

    if (!campaign || campaign.userId !== user.id) {
        throw new Error('Campaign not found')
    }

    return campaign
}

interface CreateCampaignData {
    name: string
    businessCategory?: string
    searchPostcode?: string
    searchRadius?: number
    locationId?: string
    locationName?: string
    linkedinMessage?: string
    emailSubject?: string
    emailBody?: string
}

export async function createCampaign(data: CreateCampaignData) {
    const user = await verifyRMOrAdmin()

    // Check for duplicate campaign name
    if (data.name) {
        const existing = await prisma.outreachCampaign.findFirst({
            where: { userId: user.id, name: data.name },
        })
        if (existing) {
            // Append a number to make it unique
            const count = await prisma.outreachCampaign.count({
                where: { userId: user.id, name: { startsWith: data.name } },
            })
            data.name = `${data.name} (${count + 1})`
        }
    }

    const campaign = await prisma.outreachCampaign.create({
        data: {
            userId: user.id,
            name: data.name,
            businessCategory: data.businessCategory,
            searchPostcode: data.searchPostcode,
            searchRadius: data.searchRadius,
            locationId: data.locationId,
            locationName: data.locationName,
            linkedinMessage: data.linkedinMessage,
            emailSubject: data.emailSubject,
            emailBody: data.emailBody,
        },
    })

    revalidatePath('/outreach')
    return { success: true, campaignId: campaign.id }
}

export async function updateCampaign(
    id: string,
    data: Partial<CreateCampaignData>
) {
    const user = await verifyRMOrAdmin()

    const existing = await prisma.outreachCampaign.findUnique({
        where: { id },
    })
    if (!existing || existing.userId !== user.id) {
        throw new Error('Campaign not found')
    }

    await prisma.outreachCampaign.update({
        where: { id },
        data,
    })

    revalidatePath('/outreach')
    revalidatePath(`/outreach/campaigns/${id}`)
    return { success: true }
}

export async function deleteCampaign(id: string) {
    const user = await verifyRMOrAdmin()

    const existing = await prisma.outreachCampaign.findUnique({
        where: { id },
    })
    if (!existing || existing.userId !== user.id) {
        throw new Error('Campaign not found')
    }
    if (existing.status === 'ACTIVE') {
        throw new Error('Cannot delete an active campaign. Pause it first.')
    }

    await prisma.outreachCampaign.delete({ where: { id } })

    revalidatePath('/outreach')
    return { success: true }
}

export async function launchCampaign(id: string) {
    const user = await verifyRMOrAdmin()

    const campaign = await prisma.outreachCampaign.findUnique({
        where: { id },
        include: { _count: { select: { leads: true } } },
    })
    if (!campaign || campaign.userId !== user.id) {
        throw new Error('Campaign not found')
    }
    if (campaign.status !== 'DRAFT' && campaign.status !== 'PAUSED') {
        throw new Error('Campaign must be in DRAFT or PAUSED status to launch')
    }
    if (campaign._count.leads === 0) {
        throw new Error('Add at least one lead before launching')
    }

    // Verify user has at least one connected account
    const integrations = await prisma.userIntegration.findMany({
        where: { userId: user.id, status: 'ACTIVE' },
    })
    if (integrations.length === 0) {
        throw new Error('Connect your LinkedIn or email account first')
    }

    // Need at least email OR linkedin message defined
    if (!campaign.emailBody && !campaign.linkedinMessage) {
        throw new Error('Add at least one message template (email or LinkedIn)')
    }

    await prisma.outreachCampaign.update({
        where: { id },
        data: { status: 'ACTIVE' },
    })

    revalidatePath('/outreach')
    revalidatePath(`/outreach/campaigns/${id}`)
    return { success: true }
}

export async function pauseCampaign(id: string) {
    const user = await verifyRMOrAdmin()

    const campaign = await prisma.outreachCampaign.findUnique({
        where: { id },
    })
    if (!campaign || campaign.userId !== user.id) {
        throw new Error('Campaign not found')
    }
    if (campaign.status !== 'ACTIVE') {
        throw new Error('Only active campaigns can be paused')
    }

    await prisma.outreachCampaign.update({
        where: { id },
        data: { status: 'PAUSED' },
    })

    revalidatePath('/outreach')
    revalidatePath(`/outreach/campaigns/${id}`)
    return { success: true }
}

export async function completeCampaign(id: string) {
    const user = await verifyRMOrAdmin()

    const campaign = await prisma.outreachCampaign.findUnique({
        where: { id },
    })
    if (!campaign || campaign.userId !== user.id) {
        throw new Error('Campaign not found')
    }

    await prisma.outreachCampaign.update({
        where: { id },
        data: { status: 'COMPLETED' },
    })

    revalidatePath('/outreach')
    revalidatePath(`/outreach/campaigns/${id}`)
    return { success: true }
}

// ─── Integration Status (for wizard gate) ───────────────────

export async function getIntegrationStatus() {
    const user = await verifyRMOrAdmin()

    const integrations = await prisma.userIntegration.findMany({
        where: { userId: user.id, status: 'ACTIVE' },
        select: { provider: true, displayName: true, email: true },
    })

    return {
        hasLinkedIn: integrations.some(i => i.provider === 'LINKEDIN'),
        hasEmail: integrations.some(i => i.provider === 'MICROSOFT'),
        linkedInName: integrations.find(i => i.provider === 'LINKEDIN')?.displayName ?? null,
        emailAddress: integrations.find(i => i.provider === 'MICROSOFT')?.email ?? null,
        connected: integrations.length > 0,
    }
}

// ─── Create & Launch (combined action) ──────────────────────

export async function createAndLaunchCampaign(
    data: CreateCampaignData,
    leads: LeadInput[],
    asDraft: boolean = false,
) {
    const user = await verifyRMOrAdmin()

    if (leads.length === 0) {
        throw new Error('Add at least one lead before creating a campaign')
    }
    if (!data.linkedinMessage && !data.emailBody) {
        throw new Error('Add at least one message template (LinkedIn or email)')
    }

    // If launching (not draft), verify connected accounts
    if (!asDraft) {
        const integrations = await prisma.userIntegration.findMany({
            where: { userId: user.id, status: 'ACTIVE' },
        })
        if (integrations.length === 0) {
            throw new Error('Connect your LinkedIn or email account before launching')
        }
    }

    // Deduplicate campaign name
    if (data.name) {
        const existing = await prisma.outreachCampaign.findFirst({
            where: { userId: user.id, name: data.name },
        })
        if (existing) {
            const count = await prisma.outreachCampaign.count({
                where: { userId: user.id, name: { startsWith: data.name } },
            })
            data.name = `${data.name} (${count + 1})`
        }
    }

    // Create campaign
    const campaign = await prisma.outreachCampaign.create({
        data: {
            userId: user.id,
            name: data.name,
            status: asDraft ? 'DRAFT' : 'ACTIVE',
            businessCategory: data.businessCategory,
            searchPostcode: data.searchPostcode,
            searchRadius: data.searchRadius,
            locationId: data.locationId,
            locationName: data.locationName,
            linkedinMessage: data.linkedinMessage,
            emailSubject: data.emailSubject,
            emailBody: data.emailBody,
        },
    })

    // Add leads
    await prisma.outreachLead.createMany({
        data: leads.map((lead) => ({
            campaignId: campaign.id,
            businessName: lead.businessName,
            address: lead.address,
            phone: lead.phone,
            website: lead.website,
            googleRating: lead.googleRating,
            googleReviews: lead.googleReviews,
            placeId: lead.placeId,
            latitude: lead.latitude,
            longitude: lead.longitude,
            contactName: lead.contactName,
            contactEmail: lead.contactEmail,
            linkedinUrl: lead.linkedinUrl,
            jobTitle: lead.jobTitle,
            enrichmentStatus: lead.contactEmail || lead.linkedinUrl ? 'ENRICHED' : 'PENDING',
            personalization: {
                firstName: lead.contactName?.split(' ')[0] || '',
                businessName: lead.businessName,
            },
        })),
        skipDuplicates: true,
    })

    // Auto-enrich: fire-and-forget background enrichment for PENDING leads
    // Calls the enrichment pipeline directly (not via HTTP) to avoid auth issues
    enrichLeadsByCampaignId(campaign.id).catch((err) => {
        console.error('[Auto-Enrich] Background enrichment error:', err)
    })

    revalidatePath('/outreach')
    return { success: true, campaignId: campaign.id }
}

// ─── Leads ──────────────────────────────────────────────────

interface LeadInput {
    businessName: string
    address?: string
    phone?: string
    website?: string
    googleRating?: number
    googleReviews?: number
    placeId?: string
    latitude?: number
    longitude?: number
    contactName?: string
    contactEmail?: string
    linkedinUrl?: string
    jobTitle?: string
}

export async function addLeadsToCampaign(
    campaignId: string,
    leads: LeadInput[]
) {
    const user = await verifyRMOrAdmin()

    const campaign = await prisma.outreachCampaign.findUnique({
        where: { id: campaignId },
    })
    if (!campaign || campaign.userId !== user.id) {
        throw new Error('Campaign not found')
    }
    if (campaign.status === 'ACTIVE') {
        throw new Error('Cannot add leads to an active campaign. Pause it first.')
    }

    const created = await prisma.outreachLead.createMany({
        data: leads.map((lead) => ({
            campaignId,
            businessName: lead.businessName,
            address: lead.address,
            phone: lead.phone,
            website: lead.website,
            googleRating: lead.googleRating,
            googleReviews: lead.googleReviews,
            placeId: lead.placeId,
            latitude: lead.latitude,
            longitude: lead.longitude,
            contactName: lead.contactName,
            contactEmail: lead.contactEmail,
            linkedinUrl: lead.linkedinUrl,
            jobTitle: lead.jobTitle,
            enrichmentStatus: lead.contactEmail || lead.linkedinUrl ? 'ENRICHED' : 'PENDING',
            personalization: {
                firstName: lead.contactName?.split(' ')[0] || '',
                businessName: lead.businessName,
            },
        })),
        skipDuplicates: true,
    })

    revalidatePath(`/outreach/campaigns/${campaignId}`)
    return { success: true, count: created.count }
}

export async function removeLeadFromCampaign(leadId: string) {
    const user = await verifyRMOrAdmin()

    const lead = await prisma.outreachLead.findUnique({
        where: { id: leadId },
        include: { campaign: true },
    })
    if (!lead || lead.campaign.userId !== user.id) {
        throw new Error('Lead not found')
    }

    await prisma.outreachLead.delete({ where: { id: leadId } })

    revalidatePath(`/outreach/campaigns/${lead.campaignId}`)
    return { success: true }
}

export async function updateLead(
    leadId: string,
    data: Partial<LeadInput>
) {
    const user = await verifyRMOrAdmin()

    const lead = await prisma.outreachLead.findUnique({
        where: { id: leadId },
        include: { campaign: true },
    })
    if (!lead || lead.campaign.userId !== user.id) {
        throw new Error('Lead not found')
    }

    await prisma.outreachLead.update({
        where: { id: leadId },
        data,
    })

    revalidatePath(`/outreach/campaigns/${lead.campaignId}`)
    return { success: true }
}

// ─── Stats ──────────────────────────────────────────────────

export async function getCampaignStats(campaignId: string) {
    const user = await verifyRMOrAdmin()

    const campaign = await prisma.outreachCampaign.findUnique({
        where: { id: campaignId },
    })
    if (!campaign || campaign.userId !== user.id) {
        throw new Error('Campaign not found')
    }

    const leads = await prisma.outreachLead.findMany({
        where: { campaignId },
        select: { status: true, linkedinInviteSentAt: true, emailSentAt: true },
    })

    return {
        total: leads.length,
        queued: leads.filter((l) => l.status === 'QUEUED').length,
        inProgress: leads.filter((l) => l.status === 'IN_PROGRESS').length,
        completed: leads.filter((l) => l.status === 'COMPLETED').length,
        replied: leads.filter((l) => l.status === 'REPLIED').length,
        optedOut: leads.filter((l) => l.status === 'OPTED_OUT').length,
        failed: leads.filter((l) => l.status === 'FAILED').length,
        linkedinSent: leads.filter((l) => l.linkedinInviteSentAt).length,
        emailsSent: leads.filter((l) => l.emailSentAt).length,
    }
}
