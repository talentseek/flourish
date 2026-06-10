import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { CampaignWizard } from './campaign-wizard'

export const runtime = 'nodejs'

export default async function NewCampaignPage() {
    const sessionUser = await getSessionUser()
    if (!sessionUser) redirect('/login')

    const dbUser = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { role: true }
    })

    if (!dbUser) redirect('/login')
    if (dbUser.role !== 'REGIONAL_MANAGER' && dbUser.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" userRole={dbUser.role} />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="p-4 md:p-6 space-y-4 max-w-[1000px] mx-auto w-full">
                        <Link href="/outreach">
                            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Outreach
                            </Button>
                        </Link>
                        <CampaignWizard />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
