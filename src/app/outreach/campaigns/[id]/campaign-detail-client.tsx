'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    ArrowLeft,
    Play,
    Pause,
    Trash2,
    Users,
    Clock,
    Linkedin,
    UserCheck,
    MessageSquare,
    Mail,
    Reply,
    AlertTriangle,
    X,
    Sparkles,
    Loader2,
    Zap,
} from 'lucide-react'
import {
    launchCampaign,
    pauseCampaign,
    deleteCampaign,
    removeLeadFromCampaign,
} from '@/actions/outreach-actions'

// ─── Types ──────────────────────────────────────────────────

interface CampaignData {
    id: string
    name: string
    status: string
    businessCategory: string | null
    searchPostcode: string | null
    searchRadius: number | null
    linkedinMessage: string | null
    emailSubject: string | null
    emailBody: string | null
    createdAt: string
    leads: LeadData[]
}

interface LeadData {
    id: string
    businessName: string
    contactName: string | null
    contactEmail: string | null
    linkedinUrl: string | null
    website: string | null
    status: string
    enrichmentStatus: string | null
    enrichmentScore: number | null
    linkedinInviteSentAt: string | null
    linkedinMessageSentAt: string | null
    emailSentAt: string | null
    repliedAt: string | null
    events: { createdAt: string }[]
}

// ─── Helpers ────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
    DRAFT: { label: 'Draft', variant: 'secondary' },
    ACTIVE: { label: 'Active', variant: 'default', className: 'bg-emerald-600 hover:bg-emerald-700' },
    PAUSED: { label: 'Paused', variant: 'outline', className: 'border-yellow-500 text-yellow-500' },
    COMPLETED: { label: 'Completed', variant: 'default', className: 'bg-blue-600 hover:bg-blue-700' },
}

const LEAD_STATUS: Record<string, { emoji: string; label: string; className: string }> = {
    QUEUED: { emoji: '⏳', label: 'Queued', className: 'text-muted-foreground' },
    IN_PROGRESS: { emoji: '📤', label: 'In Progress', className: 'text-blue-400' },
    COMPLETED: { emoji: '✅', label: 'Completed', className: 'text-green-400' },
    REPLIED: { emoji: '💬', label: 'Replied', className: 'text-emerald-400 font-bold' },
    OPTED_OUT: { emoji: '🚫', label: 'Opted Out', className: 'text-yellow-400' },
    FAILED: { emoji: '❌', label: 'Failed', className: 'text-red-400' },
}

function computeStats(leads: LeadData[]) {
    return {
        total: leads.length,
        queued: leads.filter((l) => l.status === 'QUEUED').length,
        linkedinSent: leads.filter((l) => l.linkedinInviteSentAt).length,
        accepted: leads.filter((l) => l.linkedinMessageSentAt).length,
        messaged: leads.filter((l) => l.linkedinMessageSentAt).length,
        emailsSent: leads.filter((l) => l.emailSentAt).length,
        replied: leads.filter((l) => l.status === 'REPLIED').length,
    }
}

function getLastActivity(lead: LeadData): string {
    if (lead.events.length > 0) {
        return new Date(lead.events[0].createdAt).toLocaleDateString()
    }
    const dates = [lead.repliedAt, lead.emailSentAt, lead.linkedinMessageSentAt, lead.linkedinInviteSentAt]
        .filter(Boolean) as string[]
    if (dates.length === 0) return 'Not started'
    const latest = dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
    return new Date(latest).toLocaleDateString()
}

// ─── Component ──────────────────────────────────────────────

export function CampaignDetailClient({ campaign }: { campaign: CampaignData }) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)
    const [enriching, setEnriching] = useState(false)
    const [enrichProgress, setEnrichProgress] = useState<{ done: number; total: number } | null>(null)

    const stats = computeStats(campaign.leads)
    const statusCfg = STATUS_CONFIG[campaign.status] ?? { label: campaign.status, variant: 'secondary' as const }
    const canModify = campaign.status === 'DRAFT' || campaign.status === 'PAUSED'
    const hasTemplates = !!(campaign.linkedinMessage || campaign.emailBody)

    const pendingLeads = campaign.leads.filter(
        (l) => !l.enrichmentStatus || l.enrichmentStatus === 'PENDING'
    )
    const hasUnenrichedLeads = pendingLeads.length > 0

    async function handleAction(action: string) {
        setLoading(action)
        try {
            if (action === 'launch') await launchCampaign(campaign.id)
            if (action === 'pause') await pauseCampaign(campaign.id)
            if (action === 'delete') {
                await deleteCampaign(campaign.id)
                router.push('/outreach')
                return
            }
            router.refresh()
        } catch (err: any) {
            alert(err.message ?? 'Action failed')
        } finally {
            setLoading(null)
        }
    }

    async function handleRemoveLead(leadId: string) {
        setLoading(`remove-${leadId}`)
        try {
            await removeLeadFromCampaign(leadId)
            router.refresh()
        } catch (err: any) {
            alert(err.message ?? 'Failed to remove lead')
        } finally {
            setLoading(null)
        }
    }

    async function handleEnrichLeads() {
        setEnriching(true)
        setEnrichProgress({ done: 0, total: pendingLeads.length })

        // Process in batches of 10
        const batchSize = 10
        let done = 0

        for (let i = 0; i < pendingLeads.length; i += batchSize) {
            const batch = pendingLeads.slice(i, i + batchSize)
            const leadIds = batch.map((l) => l.id)

            try {
                await fetch('/api/outreach/enrich', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ leadIds }),
                })
            } catch {
                // Continue on error
            }

            done += batch.length
            setEnrichProgress({ done, total: pendingLeads.length })
        }

        setEnriching(false)
        setEnrichProgress(null)
        router.refresh()
    }

    const statCards = [
        { label: 'Total Leads', value: stats.total, icon: Users },
        { label: 'Queued', value: stats.queued, icon: Clock },
        { label: 'LinkedIn Sent', value: stats.linkedinSent, icon: Linkedin },
        { label: 'Accepted', value: stats.accepted, icon: UserCheck },
        { label: 'Messaged', value: stats.messaged, icon: MessageSquare },
        { label: 'Emails Sent', value: stats.emailsSent, icon: Mail },
        { label: 'Replied', value: stats.replied, icon: Reply },
    ]

    return (
        <>
            {/* Back link */}
            <Link
                href="/outreach"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Outreach
            </Link>

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
                    <Badge variant={statusCfg.variant} className={statusCfg.className}>
                        {statusCfg.label}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    {campaign.status === 'DRAFT' && (
                        <Button
                            size="sm"
                            onClick={() => handleAction('launch')}
                            disabled={loading === 'launch'}
                        >
                            <Play className="h-4 w-4 mr-1" />
                            {loading === 'launch' ? 'Launching…' : 'Launch'}
                        </Button>
                    )}
                    {campaign.status === 'ACTIVE' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction('pause')}
                            disabled={loading === 'pause'}
                        >
                            <Pause className="h-4 w-4 mr-1" />
                            {loading === 'pause' ? 'Pausing…' : 'Pause'}
                        </Button>
                    )}
                    {campaign.status === 'PAUSED' && (
                        <Button
                            size="sm"
                            onClick={() => handleAction('launch')}
                            disabled={loading === 'launch'}
                        >
                            <Play className="h-4 w-4 mr-1" />
                            {loading === 'launch' ? 'Resuming…' : 'Resume'}
                        </Button>
                    )}
                    {campaign.status !== 'ACTIVE' && (
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction('delete')}
                            disabled={loading === 'delete'}
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {loading === 'delete' ? 'Deleting…' : 'Delete'}
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {hasUnenrichedLeads && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEnrichLeads}
                            disabled={enriching}
                            className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                        >
                            {enriching ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Enriching {enrichProgress?.done}/{enrichProgress?.total}…
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Enrich {pendingLeads.length} Lead{pendingLeads.length !== 1 ? 's' : ''}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {statCards.map((stat) => (
                    <Card key={stat.label}>
                        <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-2xl font-bold tabular-nums">{stat.value}</span>
                            <span className="text-xs text-muted-foreground">{stat.label}</span>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Separator />

            {/* Message Templates */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Message Templates</h2>

                {!hasTemplates && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>No templates configured</AlertTitle>
                        <AlertDescription>
                            Add a LinkedIn message or email template before launching this campaign.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Linkedin className="h-4 w-4" />
                                LinkedIn Message
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {campaign.linkedinMessage ? (
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {campaign.linkedinMessage}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No LinkedIn message set</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email Template
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {campaign.emailSubject ? (
                                <>
                                    <div>
                                        <span className="text-xs text-muted-foreground">Subject: </span>
                                        <span className="text-sm font-medium">{campaign.emailSubject}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {campaign.emailBody}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No email template set</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator />

            {/* Leads Table */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">
                    Leads <span className="text-muted-foreground font-normal">({campaign.leads.length})</span>
                </h2>

                {campaign.leads.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No leads added to this campaign yet.
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Business</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>LinkedIn</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Enrichment</TableHead>
                                        <TableHead>Last Activity</TableHead>
                                        {canModify && <TableHead className="w-10" />}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {campaign.leads.map((lead) => {
                                        const ls = LEAD_STATUS[lead.status] ?? {
                                            emoji: '❓',
                                            label: lead.status,
                                            className: 'text-muted-foreground',
                                        }
                                        return (
                                            <TableRow key={lead.id}>
                                                <TableCell className="font-medium">
                                                    {lead.businessName}
                                                </TableCell>
                                                <TableCell>
                                                    {lead.contactName ?? '—'}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {lead.contactEmail ?? '—'}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {lead.linkedinUrl ? (
                                                        <a
                                                            href={lead.linkedinUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-400 hover:underline truncate max-w-[180px] inline-block"
                                                        >
                                                            Profile ↗
                                                        </a>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={ls.className}>
                                                        {ls.emoji} {ls.label}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {lead.enrichmentStatus === 'ENRICHED' ? (
                                                        <Badge variant="outline" className="gap-1 text-emerald-400 border-emerald-400/30">
                                                            <Zap className="h-3 w-3" />
                                                            {lead.enrichmentScore ?? 0}%
                                                        </Badge>
                                                    ) : lead.enrichmentStatus === 'FAILED' ? (
                                                        <Badge variant="outline" className="text-red-400 border-red-400/30">
                                                            Failed
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">Pending</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {getLastActivity(lead)}
                                                </TableCell>
                                                {canModify && (
                                                    <TableCell>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-7 w-7 text-muted-foreground hover:text-red-400"
                                                            onClick={() => handleRemoveLead(lead.id)}
                                                            disabled={loading === `remove-${lead.id}`}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                )}
            </div>
        </>
    )
}
