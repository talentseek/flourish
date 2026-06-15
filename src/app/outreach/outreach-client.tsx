'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
    Megaphone,
    Plus,
    Eye,
    Linkedin,
    Mail,
    CheckCircle2,
    Circle,
    LinkIcon,
    Unlink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { disconnectIntegration } from '@/actions/outreach-actions'

interface LeadStatus {
    status: string
}

interface Campaign {
    id: string
    name: string
    status: string
    leads: LeadStatus[]
    _count: { leads: number }
    createdAt: string
    updatedAt: string
}

interface Integration {
    id: string
    provider: string
    email: string | null
    displayName: string | null
    status: string
    createdAt: string
    updatedAt: string
}

interface OutreachClientProps {
    campaigns: Campaign[]
    integrations: Integration[]
}

const STATUS_BADGE: Record<string, { variant: 'outline' | 'default' | 'secondary'; className?: string }> = {
    DRAFT: { variant: 'outline' },
    ACTIVE: { variant: 'default', className: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    PAUSED: { variant: 'secondary' },
    COMPLETED: { variant: 'outline' },
}

function computeStats(leads: LeadStatus[]) {
    return {
        totalLeads: leads.length,
        sent: leads.filter(
            (l) => l.status === 'IN_PROGRESS' || l.status === 'COMPLETED' || l.status === 'REPLIED'
        ).length,
        replied: leads.filter((l) => l.status === 'REPLIED').length,
    }
}

export function OutreachClient({ campaigns, integrations }: OutreachClientProps) {
    const searchParams = useSearchParams()

    useEffect(() => {
        if (searchParams.get('connected') === 'true') {
            toast.success('Account connected successfully')
            // Clean URL without triggering navigation
            window.history.replaceState(null, '', '/outreach')
        }
    }, [searchParams])

    const linkedin = integrations.find((i) => i.provider === 'LINKEDIN' && i.status === 'ACTIVE')
    const microsoft = integrations.find((i) => i.provider === 'MICROSOFT' && i.status === 'ACTIVE')

    return (
        <>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Outreach</h1>
                <p className="text-muted-foreground">
                    Find and reach potential tenants for your locations
                </p>
            </div>

            <Tabs defaultValue={(!linkedin && !microsoft) ? 'accounts' : 'campaigns'} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                    <TabsTrigger value="accounts">
                        Connected Accounts
                        {!linkedin && !microsoft && (
                            <span className="ml-1.5 h-2 w-2 rounded-full bg-amber-500 inline-block animate-pulse" />
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Onboarding Banner */}
                {!linkedin && !microsoft && campaigns.length === 0 && (
                    <Card className="border-primary/30 bg-primary/5">
                        <CardContent className="py-4">
                            <div className="flex items-start gap-3">
                                <Megaphone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Get started with Outreach</p>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Circle className="h-3.5 w-3.5 text-amber-500" />
                                            <span><strong>Step 1:</strong> Connect your LinkedIn account in the <em>Connected Accounts</em> tab</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />
                                            <span><strong>Step 2:</strong> Create your first campaign to discover and reach leads</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ─── Campaigns Tab ─────────────────────────── */}
                <TabsContent value="campaigns" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div />
                        <Button asChild>
                            <Link href="/outreach/campaigns/new">
                                <Plus className="mr-2 h-4 w-4" />
                                New Campaign
                            </Link>
                        </Button>
                    </div>

                    {campaigns.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <Megaphone className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-semibold mb-1">No campaigns yet</h3>
                                <p className="text-muted-foreground text-sm max-w-sm mb-4">
                                    Create your first outreach campaign to start finding and
                                    contacting potential tenants.
                                </p>
                                <Button asChild>
                                    <Link href="/outreach/campaigns/new">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Campaign
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Leads</TableHead>
                                        <TableHead className="text-right">Sent</TableHead>
                                        <TableHead className="text-right">Replied</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {campaigns.map((campaign) => {
                                        const stats = computeStats(campaign.leads)
                                        const badge = STATUS_BADGE[campaign.status] ?? STATUS_BADGE.DRAFT

                                        return (
                                            <TableRow key={campaign.id}>
                                                <TableCell className="font-medium">
                                                    {campaign.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={badge.variant}
                                                        className={badge.className}
                                                    >
                                                        {campaign.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {stats.totalLeads}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {stats.sent}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {stats.replied}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {new Date(campaign.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/outreach/campaigns/${campaign.id}`}>
                                                            <Eye className="mr-1 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </Card>
                    )}
                </TabsContent>

                {/* ─── Connected Accounts Tab ────────────────── */}
                <TabsContent value="accounts" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* LinkedIn */}
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A66C2]/10">
                                    <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-base">LinkedIn</CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        Send connection requests &amp; follow-up messages
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {linkedin ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            <span className="text-sm">
                                                Connected as{' '}
                                                <span className="font-medium">
                                                    {linkedin.displayName || linkedin.email || 'LinkedIn User'}
                                                </span>
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={async () => {
                                                try {
                                                    await disconnectIntegration(linkedin.id)
                                                    toast.success('LinkedIn disconnected')
                                                    window.location.reload()
                                                } catch {
                                                    toast.error('Failed to disconnect')
                                                }
                                            }}
                                        >
                                            <Unlink className="mr-1 h-4 w-4" />
                                            Disconnect
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Circle className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                Not connected
                                            </span>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="/api/outreach/connect?provider=linkedin">
                                                <LinkIcon className="mr-1 h-4 w-4" />
                                                Connect
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Microsoft Email */}
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0078D4]/10">
                                    <Mail className="h-5 w-5 text-[#0078D4]" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-base">Microsoft Email</CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        Send outreach emails via Outlook
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {microsoft ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            <span className="text-sm">
                                                Connected as{' '}
                                                <span className="font-medium">
                                                    {microsoft.email || microsoft.displayName || 'Microsoft User'}
                                                </span>
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={async () => {
                                                try {
                                                    await disconnectIntegration(microsoft.id)
                                                    toast.success('Microsoft email disconnected')
                                                    window.location.reload()
                                                } catch {
                                                    toast.error('Failed to disconnect')
                                                }
                                            }}
                                        >
                                            <Unlink className="mr-1 h-4 w-4" />
                                            Disconnect
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Circle className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                Not connected
                                            </span>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="/api/outreach/connect?provider=microsoft">
                                                <LinkIcon className="mr-1 h-4 w-4" />
                                                Connect
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </>
    )
}
