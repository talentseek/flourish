import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Flame, Lock, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

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
                    <div className="p-4 md:p-6 space-y-6 max-w-[900px] mx-auto w-full">
                        <Link href="/outreach">
                            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Outreach Dashboard
                            </Button>
                        </Link>

                        <Card className="border-amber-500/30 bg-card">
                            <CardHeader className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10 gap-1.5 py-0.5">
                                        <Flame className="h-3.5 w-3.5 text-amber-500" />
                                        Infrastructure Warmup in Progress (28%)
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">Phase 2: Day 6 of 21</span>
                                </div>
                                <CardTitle className="text-xl flex items-center gap-2 mt-2">
                                    <Lock className="h-5 w-5 text-amber-500" />
                                    New Campaign Creation is Temporarily Paused
                                </CardTitle>
                                <CardDescription>
                                    Our pool of 14 secondary domain mailboxes across 7 newly provisioned domains is currently undergoing automated deliverability ramp-up.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-2 p-4 rounded-lg bg-muted/40 border">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-foreground">Deliverability Warmup Progress</span>
                                        <span className="text-amber-600 dark:text-amber-400 font-bold">28% Complete</span>
                                    </div>
                                    <Progress value={28} className="h-2 bg-amber-500/20 [&>div]:bg-amber-500" />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Estimated time until 100% deliverability clearance: <strong>~15 days remaining</strong>.
                                        This protocol guarantees that future campaigns achieve &gt;98% inbox placement and protects Flourish from spam filters.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                    <div className="p-3 rounded-md border bg-background">
                                        <div className="text-muted-foreground">Active Domains</div>
                                        <div className="text-base font-semibold mt-0.5">7 Domains</div>
                                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                                            <ShieldCheck className="h-3 w-3" /> SPF / DKIM Valid
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-md border bg-background">
                                        <div className="text-muted-foreground">Provisioned Mailboxes</div>
                                        <div className="text-base font-semibold mt-0.5">14 Mailboxes</div>
                                        <div className="text-[11px] text-muted-foreground mt-0.5">2 mailboxes / domain</div>
                                    </div>
                                    <div className="p-3 rounded-md border bg-background">
                                        <div className="text-muted-foreground">Assigned Team</div>
                                        <div className="text-base font-semibold mt-0.5">5 Regional Managers</div>
                                        <div className="text-[11px] text-muted-foreground mt-0.5">Amanda, Paula, Sophie, Giorgia (3) • Callum (2)</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <Button asChild>
                                        <Link href="/outreach">
                                            View Mailbox Pool &amp; Warmup Status
                                        </Link>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href="/dashboard">
                                            Return to Dashboard
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
