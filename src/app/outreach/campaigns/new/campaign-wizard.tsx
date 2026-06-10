'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCampaign, addLeadsToCampaign } from '@/actions/outreach-actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Megaphone,
    Users,
    MessageSquare,
    Plus,
    Trash2,
    ChevronRight,
    ChevronLeft,
    Loader2,
    Check,
    AlertCircle,
    Linkedin,
    Mail,
    Eye,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────

interface Lead {
    id: string
    businessName: string
    contactName: string
    contactEmail: string
    linkedinUrl: string
    phone: string
    website: string
    address: string
}

interface Messages {
    linkedinMessage: string
    emailSubject: string
    emailBody: string
}

const STEPS = [
    { label: 'Campaign Details', icon: Megaphone },
    { label: 'Add Leads', icon: Users },
    { label: 'Write Messages', icon: MessageSquare },
] as const

const LINKEDIN_MAX_CHARS = 300

const emptyLead = (): Lead => ({
    id: crypto.randomUUID(),
    businessName: '',
    contactName: '',
    contactEmail: '',
    linkedinUrl: '',
    phone: '',
    website: '',
    address: '',
})

// ─── Wizard ─────────────────────────────────────────────────

export function CampaignWizard() {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Step 1
    const [campaignName, setCampaignName] = useState('')

    // Step 2
    const [leads, setLeads] = useState<Lead[]>([])
    const [currentLead, setCurrentLead] = useState<Lead>(emptyLead())

    // Step 3
    const [messages, setMessages] = useState<Messages>({
        linkedinMessage: '',
        emailSubject: '',
        emailBody: '',
    })

    const canProceed = (): boolean => {
        switch (step) {
            case 0:
                return campaignName.trim().length > 0
            case 1:
                return leads.length > 0
            case 2:
                return messages.linkedinMessage.trim().length > 0 || messages.emailBody.trim().length > 0
            default:
                return false
        }
    }

    const handleAddLead = () => {
        if (!currentLead.businessName.trim()) return
        setLeads(prev => [...prev, { ...currentLead, id: crypto.randomUUID() }])
        setCurrentLead(emptyLead())
    }

    const handleRemoveLead = (id: string) => {
        setLeads(prev => prev.filter(l => l.id !== id))
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        setError(null)

        try {
            const result = await createCampaign({
                name: campaignName.trim(),
                linkedinMessage: messages.linkedinMessage.trim() || undefined,
                emailSubject: messages.emailSubject.trim() || undefined,
                emailBody: messages.emailBody.trim() || undefined,
            })

            if (!result.success || !result.campaignId) {
                throw new Error('Failed to create campaign')
            }

            await addLeadsToCampaign(
                result.campaignId,
                leads.map(l => ({
                    businessName: l.businessName,
                    contactName: l.contactName || undefined,
                    contactEmail: l.contactEmail || undefined,
                    linkedinUrl: l.linkedinUrl || undefined,
                    phone: l.phone || undefined,
                    website: l.website || undefined,
                    address: l.address || undefined,
                }))
            )

            router.push(`/outreach/campaigns/${result.campaignId}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
            setIsSubmitting(false)
        }
    }

    const mergeTemplate = (template: string): string => {
        if (!leads.length || !template) return template
        const lead = leads[0]
        const firstName = lead.contactName?.split(' ')[0] || 'there'
        return template
            .replace(/\{\{firstName\}\}/g, firstName)
            .replace(/\{\{businessName\}\}/g, lead.businessName)
            .replace(/\{\{contactName\}\}/g, lead.contactName || '')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Create Campaign</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Set up your outreach campaign in three simple steps.
                </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2">
                {STEPS.map((s, i) => {
                    const Icon = s.icon
                    const isActive = i === step
                    const isComplete = i < step

                    return (
                        <div key={s.label} className="flex items-center gap-2 flex-1">
                            <button
                                onClick={() => i < step && setStep(i)}
                                disabled={i > step}
                                className={`
                                    flex items-center gap-2.5 px-3 py-2.5 rounded-lg w-full transition-all duration-200
                                    ${isActive
                                        ? 'bg-primary/10 border border-primary/30 text-primary'
                                        : isComplete
                                            ? 'bg-muted/50 border border-transparent text-muted-foreground hover:bg-muted cursor-pointer'
                                            : 'bg-muted/20 border border-transparent text-muted-foreground/40 cursor-not-allowed'
                                    }
                                `}
                            >
                                <div className={`
                                    flex items-center justify-center h-7 w-7 rounded-full shrink-0 text-xs font-semibold transition-colors
                                    ${isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : isComplete
                                            ? 'bg-primary/20 text-primary'
                                            : 'bg-muted text-muted-foreground/50'
                                    }
                                `}>
                                    {isComplete ? <Check className="h-3.5 w-3.5" /> : i + 1}
                                </div>
                                <div className="text-left min-w-0">
                                    <div className="text-xs font-medium truncate">{s.label}</div>
                                </div>
                            </button>
                            {i < STEPS.length - 1 && (
                                <ChevronRight className={`h-4 w-4 shrink-0 ${i < step ? 'text-primary/50' : 'text-muted-foreground/20'}`} />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Step Content */}
            {step === 0 && <StepCampaignDetails name={campaignName} setName={setCampaignName} />}
            {step === 1 && (
                <StepAddLeads
                    leads={leads}
                    currentLead={currentLead}
                    setCurrentLead={setCurrentLead}
                    onAdd={handleAddLead}
                    onRemove={handleRemoveLead}
                />
            )}
            {step === 2 && (
                <StepWriteMessages
                    messages={messages}
                    setMessages={setMessages}
                    mergeTemplate={mergeTemplate}
                    hasLeads={leads.length > 0}
                />
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
                <Button
                    variant="outline"
                    onClick={() => setStep(s => s - 1)}
                    disabled={step === 0}
                    className="gap-1.5"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </Button>

                {step < STEPS.length - 1 ? (
                    <Button
                        onClick={() => setStep(s => s + 1)}
                        disabled={!canProceed()}
                        className="gap-1.5"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={!canProceed() || isSubmitting}
                        className="gap-1.5"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating…
                            </>
                        ) : (
                            <>
                                <Check className="h-4 w-4" />
                                Create Campaign
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    )
}

// ─── Step 1: Campaign Details ───────────────────────────────

function StepCampaignDetails({
    name,
    setName,
}: {
    name: string
    setName: (v: string) => void
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-primary" />
                    Campaign Details
                </CardTitle>
                <CardDescription>
                    Give your campaign a descriptive name to identify it later.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="campaign-name">Campaign Name</Label>
                    <Input
                        id="campaign-name"
                        placeholder="e.g. Coffee Shops — Manchester"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                        Tip: Include the business type and location for easy reference.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

// ─── Step 2: Add Leads ──────────────────────────────────────

function StepAddLeads({
    leads,
    currentLead,
    setCurrentLead,
    onAdd,
    onRemove,
}: {
    leads: Lead[]
    currentLead: Lead
    setCurrentLead: (l: Lead) => void
    onAdd: () => void
    onRemove: (id: string) => void
}) {
    const updateField = (field: keyof Lead, value: string) => {
        setCurrentLead({ ...currentLead, [field]: value })
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Add Leads
                    </CardTitle>
                    <CardDescription>
                        Manually add businesses you want to reach out to. At least one lead is required.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="lead-business">
                                Business Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="lead-business"
                                placeholder="e.g. Brew & Bean"
                                value={currentLead.businessName}
                                onChange={e => updateField('businessName', e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && onAdd()}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="lead-contact">Contact Name</Label>
                            <Input
                                id="lead-contact"
                                placeholder="e.g. Sarah Johnson"
                                value={currentLead.contactName}
                                onChange={e => updateField('contactName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="lead-email">Contact Email</Label>
                            <Input
                                id="lead-email"
                                type="email"
                                placeholder="sarah@brewandbean.co.uk"
                                value={currentLead.contactEmail}
                                onChange={e => updateField('contactEmail', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="lead-linkedin">LinkedIn URL</Label>
                            <Input
                                id="lead-linkedin"
                                placeholder="https://linkedin.com/in/..."
                                value={currentLead.linkedinUrl}
                                onChange={e => updateField('linkedinUrl', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="lead-phone">Phone</Label>
                            <Input
                                id="lead-phone"
                                placeholder="07XXX XXXXXX"
                                value={currentLead.phone}
                                onChange={e => updateField('phone', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="lead-website">Website</Label>
                            <Input
                                id="lead-website"
                                placeholder="https://brewandbean.co.uk"
                                value={currentLead.website}
                                onChange={e => updateField('website', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <Label htmlFor="lead-address">Address</Label>
                            <Input
                                id="lead-address"
                                placeholder="123 High Street, Manchester, M1 1AA"
                                value={currentLead.address}
                                onChange={e => updateField('address', e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={onAdd}
                        disabled={!currentLead.businessName.trim()}
                        size="sm"
                        className="gap-1.5"
                    >
                        <Plus className="h-4 w-4" />
                        Add Lead
                    </Button>
                </CardContent>
            </Card>

            {/* Leads Table */}
            {leads.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                                Added Leads
                            </CardTitle>
                            <Badge variant="secondary">{leads.length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Business</TableHead>
                                        <TableHead className="hidden md:table-cell">Contact</TableHead>
                                        <TableHead className="hidden md:table-cell">Channel</TableHead>
                                        <TableHead className="w-[50px]" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leads.map(lead => (
                                        <TableRow key={lead.id}>
                                            <TableCell className="font-medium">
                                                {lead.businessName}
                                                {lead.address && (
                                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                        {lead.address}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="text-sm">{lead.contactName || '—'}</div>
                                                <div className="text-xs text-muted-foreground">{lead.contactEmail || ''}</div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="flex gap-1.5">
                                                    {lead.linkedinUrl && (
                                                        <Badge variant="outline" className="text-xs gap-1">
                                                            <Linkedin className="h-3 w-3" />
                                                            LI
                                                        </Badge>
                                                    )}
                                                    {lead.contactEmail && (
                                                        <Badge variant="outline" className="text-xs gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            Email
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => onRemove(lead.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {leads.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                    No leads added yet. Add at least one lead to continue.
                </div>
            )}
        </div>
    )
}

// ─── Step 3: Write Messages ─────────────────────────────────

function StepWriteMessages({
    messages,
    setMessages,
    mergeTemplate,
    hasLeads,
}: {
    messages: Messages
    setMessages: (m: Messages) => void
    mergeTemplate: (t: string) => string
    hasLeads: boolean
}) {
    const linkedinLength = messages.linkedinMessage.length
    const linkedinOverLimit = linkedinLength > LINKEDIN_MAX_CHARS

    return (
        <div className="space-y-4">
            {/* LinkedIn Message */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Linkedin className="h-5 w-5 text-primary" />
                        LinkedIn Message
                    </CardTitle>
                    <CardDescription>
                        Connection request note. Use {'{{firstName}}'} and {'{{businessName}}'} for personalization.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                        <Textarea
                            placeholder={`Hi {{firstName}},\n\nI noticed {{businessName}} could be a great fit for our retail space at Arndale Centre. Would you be open to a quick chat?\n\nBest regards`}
                            value={messages.linkedinMessage}
                            onChange={e => setMessages({ ...messages, linkedinMessage: e.target.value })}
                            rows={5}
                            className="resize-none"
                        />
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                                Variables: <code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{firstName}}'}</code>{' '}
                                <code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{businessName}}'}</code>
                            </p>
                            <span className={`text-xs font-mono ${linkedinOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {linkedinLength}/{LINKEDIN_MAX_CHARS}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Email */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        Email Template
                    </CardTitle>
                    <CardDescription>
                        Optional email to send alongside or instead of LinkedIn outreach.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="email-subject">Subject</Label>
                        <Input
                            id="email-subject"
                            placeholder="e.g. Retail space opportunity at Arndale Centre"
                            value={messages.emailSubject}
                            onChange={e => setMessages({ ...messages, emailSubject: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="email-body">Body</Label>
                        <Textarea
                            id="email-body"
                            placeholder={`Dear {{firstName}},\n\nI'm reaching out regarding a retail opportunity that I think would be perfect for {{businessName}}...\n\nBest regards`}
                            value={messages.emailBody}
                            onChange={e => setMessages({ ...messages, emailBody: e.target.value })}
                            rows={7}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            Variables: <code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{firstName}}'}</code>{' '}
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{businessName}}'}</code>{' '}
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{contactName}}'}</code>
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Validation hint */}
            {!messages.linkedinMessage.trim() && !messages.emailBody.trim() && (
                <div className="flex items-center gap-2 text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    At least one message (LinkedIn or Email) is required to create the campaign.
                </div>
            )}

            {/* Preview */}
            {hasLeads && (messages.linkedinMessage.trim() || messages.emailBody.trim()) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            Preview
                            <Badge variant="outline" className="font-normal text-xs">First lead</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {messages.linkedinMessage.trim() && (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <Linkedin className="h-3 w-3" />
                                    LinkedIn Message
                                </div>
                                <div className="rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                                    {mergeTemplate(messages.linkedinMessage)}
                                </div>
                            </div>
                        )}
                        {messages.emailBody.trim() && (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    Email
                                </div>
                                {messages.emailSubject.trim() && (
                                    <div className="text-sm font-medium">
                                        Subject: {mergeTemplate(messages.emailSubject)}
                                    </div>
                                )}
                                <div className="rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                                    {mergeTemplate(messages.emailBody)}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
