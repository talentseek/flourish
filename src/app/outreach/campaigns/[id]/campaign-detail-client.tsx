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
    FlaskConical,
    Eye,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Pencil,
    Save,
} from 'lucide-react'
import {
    launchCampaign,
    pauseCampaign,
    deleteCampaign,
    removeLeadFromCampaign,
    updateCampaign,
    completeCampaign,
} from '@/actions/outreach-actions'

// ─── Types ──────────────────────────────────────────────────

interface CampaignData {
    id: string
    name: string
    status: string
    businessCategory: string | null
    locationId: string | null
    locationName: string | null
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
    linkedinInviteAccepted: string | null
    linkedinMessageSentAt: string | null
    emailSentAt: string | null
    repliedAt: string | null
    events: { createdAt: string }[]
}

interface DryRunLeadResult {
    leadId: string
    businessName: string
    contactName: string | null
    contactEmail: string | null
    linkedinUrl: string | null
    linkedinMessage: string | null
    emailSubject: string | null
    emailBody: string | null
    canSendLinkedin: boolean
    canSendEmail: boolean
    issues: string[]
    ready: boolean
}

interface DryRunResult {
    simulated: boolean
    summary: {
        totalLeads: number
        readyToSend: number
        linkedinReady: number
        emailReady: number
        withIssues: number
        notEnriched: number
    }
    leads: DryRunLeadResult[]
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
        accepted: leads.filter((l) => l.linkedinInviteAccepted).length,
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
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [enriching, setEnriching] = useState(false)
    const [enrichProgress, setEnrichProgress] = useState<{ done: number; total: number } | null>(null)

    // Dry run state
    const [dryRunning, setDryRunning] = useState(false)
    const [dryRunResults, setDryRunResults] = useState<DryRunResult | null>(null)
    const [expandedLead, setExpandedLead] = useState<string | null>(null)

    // Template editing state
    const [editingTemplates, setEditingTemplates] = useState(false)
    const [templateLinkedin, setTemplateLinkedin] = useState(campaign.linkedinMessage || '')
    const [templateEmailSubject, setTemplateEmailSubject] = useState(campaign.emailSubject || '')
    const [templateEmailBody, setTemplateEmailBody] = useState(campaign.emailBody || '')
    const [savingTemplates, setSavingTemplates] = useState(false)
    const [generatingMessages, setGeneratingMessages] = useState(false)

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
        setErrorMsg(null)
        try {
            if (action === 'launch') await launchCampaign(campaign.id)
            if (action === 'pause') await pauseCampaign(campaign.id)
            if (action === 'delete') {
                if (!window.confirm('Delete this campaign and all leads? This cannot be undone.')) {
                    setLoading(null)
                    return
                }
                await deleteCampaign(campaign.id)
                router.push('/outreach')
                return
            }
            router.refresh()
        } catch (err: any) {
            setErrorMsg(err.message ?? 'Action failed')
        } finally {
            setLoading(null)
        }
    }

    async function handleRemoveLead(leadId: string) {
        setLoading(`remove-${leadId}`)
        setErrorMsg(null)
        try {
            await removeLeadFromCampaign(leadId)
            router.refresh()
        } catch (err: any) {
            setErrorMsg(err.message ?? 'Failed to remove lead')
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

    async function handleDryRun(simulate: boolean) {
        setDryRunning(true)
        setErrorMsg(null)
        try {
            const res = await fetch('/api/outreach/dry-run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId: campaign.id, simulate }),
            })
            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body.error || `Dry run failed (${res.status})`)
            }
            const data = await res.json()
            setDryRunResults(data as DryRunResult)
            if (simulate) {
                router.refresh()
            }
        } catch (err: any) {
            setErrorMsg(err.message ?? 'Dry run failed')
        } finally {
            setDryRunning(false)
        }
    }

    async function handleSaveTemplates() {
        setSavingTemplates(true)
        setErrorMsg(null)
        try {
            await updateCampaign(campaign.id, {
                linkedinMessage: templateLinkedin.trim() || undefined,
                emailSubject: templateEmailSubject.trim() || undefined,
                emailBody: templateEmailBody.trim() || undefined,
            })
            setEditingTemplates(false)
            router.refresh()
        } catch (err: any) {
            setErrorMsg(err.message ?? 'Failed to save templates')
        } finally {
            setSavingTemplates(false)
        }
    }

    async function handleGenerateMessages() {
        setGeneratingMessages(true)
        setErrorMsg(null)
        try {
            const res = await fetch('/api/outreach/generate-messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: campaign.businessCategory || campaign.name,
                    location: campaign.searchPostcode || '',
                    centreName: campaign.locationName || '',
                    tone: 'friendly',
                }),
            })
            if (!res.ok) throw new Error('Failed to generate messages')
            const data = await res.json()
            if (data.linkedinMessage) setTemplateLinkedin(data.linkedinMessage)
            if (data.emailSubject) setTemplateEmailSubject(data.emailSubject)
            if (data.emailBody) setTemplateEmailBody(data.emailBody)
            setEditingTemplates(true)
        } catch (err: any) {
            setErrorMsg(err.message ?? 'Failed to generate messages')
        } finally {
            setGeneratingMessages(false)
        }
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
            {/* Inline error alert */}
            {errorMsg && (
                <Alert variant="destructive" className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{errorMsg}</AlertDescription>
                    </div>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={() => setErrorMsg(null)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </Alert>
            )}

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
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
                        <Badge variant={statusCfg.variant} className={statusCfg.className}>
                            {statusCfg.label}
                        </Badge>
                    </div>
                    {campaign.locationName && (
                        <p className="text-sm text-muted-foreground mt-1">{campaign.locationName}</p>
                    )}
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
                    {hasUnenrichedLeads && campaign.status !== 'ACTIVE' && (
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

            {/* DRAFT: Review & Launch flow */}
            {campaign.status === 'DRAFT' && (
                <Alert className="border-primary/50 bg-primary/5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary">Review Your Leads</AlertTitle>
                    <AlertDescription className="text-primary/80">
                        {hasUnenrichedLeads ? (
                            <>Your leads are being enriched with contact details. Once complete, review the leads table below and remove any businesses that aren&apos;t a good fit. Then click <strong>Launch Campaign</strong> when you&apos;re ready.</>
                        ) : (
                            <>Enrichment complete. Review the leads table below — remove any businesses that aren&apos;t a good fit, then click <strong>Launch Campaign</strong> to go live.</>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            {/* Auto-enrichment in progress (for DRAFT campaigns too) */}
            {hasUnenrichedLeads && (
                <Alert className="border-blue-500/50 bg-blue-500/10">
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    <AlertTitle className="text-blue-500">Enriching Leads</AlertTitle>
                    <AlertDescription className="text-blue-400/80">
                        {pendingLeads.length} lead{pendingLeads.length !== 1 ? 's are' : ' is'} being enriched in the background. Contact names, emails and LinkedIn profiles will appear shortly. Refresh to see progress.
                    </AlertDescription>
                </Alert>
            )}

            {/* Active campaign notice */}
            {campaign.status === 'ACTIVE' && !hasUnenrichedLeads && (
                <Alert className="border-emerald-500/50 bg-emerald-500/10">
                    <AlertTriangle className="h-4 w-4 text-emerald-500" />
                    <AlertTitle className="text-emerald-500">Campaign Active</AlertTitle>
                    <AlertDescription className="text-emerald-400/80">
                        This campaign is live. LinkedIn invites and follow-up messages are being sent automatically during UK business hours (Mon–Fri). Replies and acceptances are tracked in real-time.
                    </AlertDescription>
                </Alert>
            )}

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
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Message Templates</h2>
                    <div className="flex items-center gap-2">
                        {canModify && !editingTemplates && (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleGenerateMessages}
                                    disabled={generatingMessages}
                                    className="gap-1.5"
                                >
                                    {generatingMessages ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                                    ) : (
                                        <><Sparkles className="h-4 w-4" /> Generate with AI</>
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingTemplates(true)}
                                    className="gap-1.5"
                                >
                                    <Pencil className="h-4 w-4" /> Edit
                                </Button>
                            </>
                        )}
                        {editingTemplates && (
                            <>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setEditingTemplates(false)
                                        setTemplateLinkedin(campaign.linkedinMessage || '')
                                        setTemplateEmailSubject(campaign.emailSubject || '')
                                        setTemplateEmailBody(campaign.emailBody || '')
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSaveTemplates}
                                    disabled={savingTemplates}
                                    className="gap-1.5"
                                >
                                    {savingTemplates ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                                    ) : (
                                        <><Save className="h-4 w-4" /> Save Templates</>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {!hasTemplates && !editingTemplates && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>No templates configured</AlertTitle>
                        <AlertDescription>
                            Add a LinkedIn message or email template before launching this campaign.
                            Click &quot;Generate with AI&quot; or &quot;Edit&quot; above to get started.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Linkedin className="h-4 w-4" />
                                LinkedIn Follow-up Message
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {editingTemplates ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={templateLinkedin}
                                        onChange={(e) => setTemplateLinkedin(e.target.value)}
                                        className="w-full h-24 text-sm rounded-md border border-input bg-transparent px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                        placeholder="Hi {{firstName}}, I saw your business {{businessName}}…"
                                        maxLength={300}
                                    />
                                    <p className={`text-xs ${templateLinkedin.length > 280 ? 'text-red-400' : 'text-muted-foreground'}`}>
                                        {templateLinkedin.length}/300 characters
                                    </p>
                                </div>
                            ) : campaign.linkedinMessage ? (
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
                            {editingTemplates ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-muted-foreground">Subject</label>
                                        <input
                                            type="text"
                                            value={templateEmailSubject}
                                            onChange={(e) => setTemplateEmailSubject(e.target.value)}
                                            className="w-full text-sm rounded-md border border-input bg-transparent px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            placeholder="Partnership opportunity with {{centreName}}"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground">Body</label>
                                        <textarea
                                            value={templateEmailBody}
                                            onChange={(e) => setTemplateEmailBody(e.target.value)}
                                            className="w-full h-32 text-sm rounded-md border border-input bg-transparent px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                            placeholder="Dear {{firstName}},\n\nI'm reaching out because…"
                                        />
                                    </div>
                                </div>
                            ) : campaign.emailSubject ? (
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

            {/* 🧪 Dry Run Panel */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-amber-500" />
                        Test &amp; Preview
                    </h2>
                    <div className="flex items-center gap-2">
                        {dryRunResults && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDryRunResults(null)}
                                className="text-muted-foreground"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear Results
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDryRun(false)}
                            disabled={dryRunning || campaign.leads.length === 0}
                            className="gap-1.5 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                        >
                            {dryRunning ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Running…
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4" />
                                    Preview Messages
                                </>
                            )}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                if (window.confirm('Simulate sending to all leads? This will update lead statuses and create test events. Use this to verify the full flow.')) {
                                    handleDryRun(true)
                                }
                            }}
                            disabled={dryRunning || campaign.leads.length === 0}
                            className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            <FlaskConical className="h-4 w-4" />
                            Simulate Send
                        </Button>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground">
                    Preview resolved messages for each lead, or simulate sending to test the full lifecycle without contacting anyone.
                </p>

                {dryRunResults && (
                    <>
                        {/* Summary cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <DryRunStat label="Total Leads" value={dryRunResults.summary.totalLeads} />
                            <DryRunStat label="Ready to Send" value={dryRunResults.summary.readyToSend} good />
                            <DryRunStat label="LinkedIn Ready" value={dryRunResults.summary.linkedinReady} />
                            <DryRunStat label="Email Ready" value={dryRunResults.summary.emailReady} />
                            <DryRunStat label="With Issues" value={dryRunResults.summary.withIssues} warn={dryRunResults.summary.withIssues > 0} />
                            <DryRunStat label="Not Enriched" value={dryRunResults.summary.notEnriched} warn={dryRunResults.summary.notEnriched > 0} />
                        </div>

                        {dryRunResults.simulated && (
                            <Alert className="border-amber-500/50 bg-amber-500/10">
                                <FlaskConical className="h-4 w-4 text-amber-500" />
                                <AlertTitle className="text-amber-500">Simulation Complete</AlertTitle>
                                <AlertDescription className="text-amber-400/80">
                                    Lead statuses and events have been updated with test data. Refresh the page to see updated stats. Events are prefixed with [TEST].
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Per-lead results */}
                        <div className="space-y-2">
                            {dryRunResults.leads.map((lead) => (
                                <Card key={lead.leadId} className={lead.issues.length > 0 && !lead.issues.every(i => i.includes('fallback')) ? 'border-amber-500/30' : ''}>
                                    <div
                                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                                        onClick={() => setExpandedLead(expandedLead === lead.leadId ? null : lead.leadId)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {lead.canSendLinkedin || lead.canSendEmail ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                                            )}
                                            <div>
                                                <span className="font-medium text-sm">{lead.businessName}</span>
                                                {lead.contactName && (
                                                    <span className="text-muted-foreground text-sm"> — {lead.contactName}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {lead.canSendLinkedin && (
                                                    <Badge variant="outline" className="text-xs py-0">
                                                        <Linkedin className="h-3 w-3 mr-1" />
                                                        LinkedIn
                                                    </Badge>
                                                )}
                                                {lead.canSendEmail && (
                                                    <Badge variant="outline" className="text-xs py-0">
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        Email
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        {expandedLead === lead.leadId ? (
                                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>

                                    {expandedLead === lead.leadId && (
                                        <CardContent className="pt-0 pb-4 space-y-3">
                                            {lead.issues.length > 0 && (
                                                <div className="space-y-1">
                                                    {lead.issues.map((issue, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-xs text-amber-500">
                                                            <AlertTriangle className="h-3 w-3 shrink-0" />
                                                            {issue}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {lead.linkedinMessage && (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                        <Linkedin className="h-3 w-3" />
                                                        LinkedIn Follow-up Message
                                                    </div>
                                                    <div className="rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                                                        {lead.linkedinMessage}
                                                    </div>
                                                </div>
                                            )}

                                            {lead.emailSubject && (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                        <Mail className="h-3 w-3" />
                                                        Email
                                                    </div>
                                                    <div className="rounded-md bg-muted/50 p-3 text-sm space-y-2">
                                                        <div className="font-medium">{lead.emailSubject}</div>
                                                        <div className="whitespace-pre-wrap text-muted-foreground">{lead.emailBody}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>

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

            {/* Launch CTA for DRAFT campaigns */}
            {campaign.status === 'DRAFT' && campaign.leads.length > 0 && !hasUnenrichedLeads && (
                <Card className="border-primary/50 bg-primary/5">
                    <CardContent className="flex items-center justify-between py-5">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Ready to launch?</p>
                            <p className="text-xs text-muted-foreground">
                                {campaign.leads.length} lead{campaign.leads.length !== 1 ? 's' : ''} will be contacted via LinkedIn and email over the coming days.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            onClick={() => handleAction('launch')}
                            disabled={loading === 'launch'}
                            className="gap-2"
                        >
                            {loading === 'launch' ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Launching…
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4" />
                                    Launch Campaign
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </>
    )
}

function DryRunStat({ label, value, good, warn }: { label: string; value: number; good?: boolean; warn?: boolean }) {
    return (
        <Card>
            <CardContent className="p-3 flex flex-col items-center text-center gap-0.5">
                <span className={`text-xl font-bold tabular-nums ${
                    warn ? 'text-amber-500' : good ? 'text-emerald-500' : ''
                }`}>
                    {value}
                </span>
                <span className="text-xs text-muted-foreground">{label}</span>
            </CardContent>
        </Card>
    )
}
