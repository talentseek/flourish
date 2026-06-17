import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { getCampaigns, getUserIntegrations, getAllCampaignsForAdmin, getAllRMIntegrationStatus } from '@/actions/outreach-actions'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { OutreachClient } from './outreach-client'

export const runtime = 'nodejs'

export default async function OutreachPage() {
    const sessionUser = await getSessionUser()
    if (!sessionUser) redirect('/login')

    const dbUser = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { role: true, name: true }
    })

    if (!dbUser) redirect('/login')
    if (dbUser.role !== 'ADMIN' && dbUser.role !== 'REGIONAL_MANAGER') {
        redirect('/dashboard')
    }

    const isAdmin = dbUser.role === 'ADMIN'

    const [campaigns, integrations, allCampaigns, rmIntegrations] = await Promise.all([
        getCampaigns(),
        getUserIntegrations(),
        isAdmin ? getAllCampaignsForAdmin() : Promise.resolve(null),
        isAdmin ? getAllRMIntegrationStatus() : Promise.resolve(null),
    ])

    // Serialize Decimal fields to plain numbers for client component
    const serializedCampaigns = campaigns.map((c) => ({
        ...c,
        leads: c.leads.map((l) => ({ status: l.status })),
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
    }))

    const serializedIntegrations = integrations.map((i) => ({
        ...i,
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
    }))

    const serializedAllCampaigns = allCampaigns?.map((c) => ({
        ...c,
        leads: c.leads.map((l) => ({ status: l.status })),
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        location: c.location ? { id: c.location.id, name: c.location.name, city: c.location.city } : null,
    })) ?? null

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" userRole={dbUser.role} />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="p-4 md:p-6 space-y-4 max-w-[1600px] mx-auto w-full">
                        <OutreachClient
                            campaigns={serializedCampaigns}
                            integrations={serializedIntegrations}
                            allCampaigns={serializedAllCampaigns}
                            rmIntegrations={rmIntegrations}
                        />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
