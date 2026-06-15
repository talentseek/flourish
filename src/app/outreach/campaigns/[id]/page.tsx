import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { getCampaign } from '@/actions/outreach-actions'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { CampaignDetailClient } from './campaign-detail-client'

export const runtime = 'nodejs'

export default async function CampaignDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const sessionUser = await getSessionUser()
    if (!sessionUser) redirect('/login')

    const dbUser = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { role: true },
    })

    if (!dbUser) redirect('/login')
    if (dbUser.role !== 'ADMIN' && dbUser.role !== 'REGIONAL_MANAGER') {
        redirect('/dashboard')
    }

    let campaign
    try {
        campaign = await getCampaign(id)
    } catch {
        redirect('/outreach')
    }

    const serialized = {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        businessCategory: campaign.businessCategory,
        locationName: campaign.locationName ?? null,
        searchPostcode: campaign.searchPostcode,
        searchRadius: campaign.searchRadius,
        linkedinMessage: campaign.linkedinMessage,
        emailSubject: campaign.emailSubject,
        emailBody: campaign.emailBody,
        createdAt: campaign.createdAt.toISOString(),
        leads: campaign.leads.map((lead) => ({
            id: lead.id,
            businessName: lead.businessName,
            contactName: lead.contactName,
            contactEmail: lead.contactEmail,
            linkedinUrl: lead.linkedinUrl,
            website: lead.website,
            status: lead.status,
            enrichmentStatus: lead.enrichmentStatus,
            enrichmentScore: lead.enrichmentScore,
            linkedinInviteSentAt: lead.linkedinInviteSentAt?.toISOString() ?? null,
            linkedinInviteAccepted: lead.linkedinInviteAccepted?.toISOString() ?? null,
            linkedinMessageSentAt: lead.linkedinMessageSentAt?.toISOString() ?? null,
            emailSentAt: lead.emailSentAt?.toISOString() ?? null,
            repliedAt: lead.repliedAt?.toISOString() ?? null,
            events: lead.events.map((e) => ({
                createdAt: e.createdAt.toISOString(),
            })),
        })),
    }

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" userRole={dbUser.role} />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="p-4 md:p-6 space-y-6 max-w-[1200px] mx-auto w-full">
                        <CampaignDetailClient campaign={serialized} />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
