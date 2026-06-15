'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createAndLaunchCampaign, getUserCentres, getIntegrationStatus } from '@/actions/outreach-actions'
import { getCategoryOptions } from '@/lib/business-categories'
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
    MessageSquare,
    Rocket,
    ChevronRight,
    ChevronLeft,
    Loader2,
    Check,
    AlertCircle,
    Linkedin,
    Mail,
    Eye,
    Star,
    ExternalLink,
    MapPin,
    Sparkles,
    Building2,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    ShieldCheck,
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
    googleRating?: number | null
    googleReviews?: number | null
    placeId?: string
    latitude?: number | null
    longitude?: number | null
}

interface DiscoveredLead {
    businessName: string
    address: string | null
    phone: string | null
    website: string | null
    googleRating: number | null
    googleReviews: number | null
    placeId: string
    latitude: number | null
    longitude: number | null
    distanceMiles: number
    score: number
}

interface Messages {
    linkedinMessage: string
    emailSubject: string
    emailBody: string
}

interface IntegrationStatus {
    hasLinkedIn: boolean
    hasEmail: boolean
    linkedInName: string | null
    emailAddress: string | null
    connected: boolean
}

const STEPS = [
    { label: 'Setup', icon: Megaphone },
    { label: 'Messages', icon: MessageSquare },
    { label: 'Preview & Launch', icon: Rocket },
] as const

const LINKEDIN_MAX_CHARS = 300

const RADIUS_OPTIONS = [
    { value: 5, label: '5 miles' },
    { value: 10, label: '10 miles' },
    { value: 15, label: '15 miles' },
    { value: 20, label: '20 miles' },
    { value: 25, label: '25 miles' },
]

// ─── Wizard ─────────────────────────────────────────────────

export function CampaignWizard() {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Integration gate
    const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null)
    const [integrationLoading, setIntegrationLoading] = useState(true)

    // Step 1 — Setup
    const [campaignName, setCampaignName] = useState('')
    const [category, setCategory] = useState('')
    const [selectedCentreId, setSelectedCentreId] = useState('')
    const [postcode, setPostcode] = useState('')
    const [radius, setRadius] = useState<number>(10)

    // Centres from database
    const [centres, setCentres] = useState<Array<{ id: string; name: string; city: string; postcode: string; type: string; latitude: number; longitude: number; label: string }>>([])
    const [centresLoading, setCentresLoading] = useState(true)

    // Leads (populated from discovery)
    const [leads, setLeads] = useState<Lead[]>([])
    const [discoveredLeads, setDiscoveredLeads] = useState<DiscoveredLead[]>([])
    const [selectedPlaceIds, setSelectedPlaceIds] = useState<Set<string>>(new Set())
    const [isSearching, setIsSearching] = useState(false)
    const [searchError, setSearchError] = useState<string | null>(null)
    const [hasSearched, setHasSearched] = useState(false)

    // Step 2 — Messages
    const [messages, setMessages] = useState<Messages>({
        linkedinMessage: '',
        emailSubject: '',
        emailBody: '',
    })

    const categoryOptions = getCategoryOptions()
    const categoryLabel = categoryOptions.find(c => c.value === category)?.label ?? ''
    const selectedCentre = centres.find(c => c.id === selectedCentreId)

    // Load centres + integration status on mount
    useEffect(() => {
        getUserCentres()
            .then(setCentres)
            .catch(() => setCentres([]))
            .finally(() => setCentresLoading(false))

        getIntegrationStatus()
            .then(setIntegrationStatus)
            .catch(() => setIntegrationStatus({ hasLinkedIn: false, hasEmail: false, linkedInName: null, emailAddress: null, connected: false }))
            .finally(() => setIntegrationLoading(false))
    }, [])

    // When centre changes, update postcode
    useEffect(() => {
        if (selectedCentre) {
            setPostcode(selectedCentre.postcode)
        }
    }, [selectedCentreId, selectedCentre])

    // Auto-generate campaign name
    useEffect(() => {
        if (category && selectedCentre) {
            setCampaignName(`${categoryLabel} — ${selectedCentre.name}`)
        }
    }, [category, selectedCentreId, categoryLabel, selectedCentre])

    // Sync leads from selectedPlaceIds whenever selection changes
    useEffect(() => {
        if (discoveredLeads.length === 0) return
        const newLeads: Lead[] = discoveredLeads
            .filter(d => selectedPlaceIds.has(d.placeId))
            .map(d => ({
                id: crypto.randomUUID(),
                businessName: d.businessName,
                contactName: '',
                contactEmail: '',
                linkedinUrl: '',
                phone: d.phone ?? '',
                website: d.website ?? '',
                address: d.address ?? '',
                googleRating: d.googleRating,
                googleReviews: d.googleReviews,
                placeId: d.placeId,
                latitude: d.latitude,
                longitude: d.longitude,
            }))
        setLeads(newLeads)
    }, [selectedPlaceIds, discoveredLeads])

    const canProceed = (): boolean => {
        switch (step) {
            case 0:
                return (
                    campaignName.trim().length > 0 &&
                    category.length > 0 &&
                    selectedCentreId.length > 0 &&
                    radius > 0 &&
                    leads.length > 0
                )
            case 1:
                return messages.linkedinMessage.trim().length > 0 || messages.emailBody.trim().length > 0
            case 2:
                return true
            default:
                return false
        }
    }

    const handleDiscover = async () => {
        setIsSearching(true)
        setSearchError(null)
        setDiscoveredLeads([])
        setSelectedPlaceIds(new Set())
        setHasSearched(true)

        try {
            const res = await fetch('/api/outreach/discover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    postcode: postcode.trim(),
                    radiusMiles: radius,
                    lat: selectedCentre?.latitude,
                    lng: selectedCentre?.longitude,
                }),
            })
            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body.error || `Search failed (${res.status})`)
            }
            const data = await res.json()
            const results: DiscoveredLead[] = data.results ?? data.leads ?? data ?? []
            const validResults = Array.isArray(results) ? results : []
            setDiscoveredLeads(validResults)
            // Auto-select all leads
            setSelectedPlaceIds(new Set(validResults.map(d => d.placeId)))
        } catch (err) {
            setSearchError(err instanceof Error ? err.message : 'Search failed')
        } finally {
            setIsSearching(false)
        }
    }

    const togglePlaceId = (placeId: string) => {
        setSelectedPlaceIds(prev => {
            const next = new Set(prev)
            if (next.has(placeId)) next.delete(placeId)
            else next.add(placeId)
            return next
        })
    }

    const toggleSelectAll = () => {
        if (selectedPlaceIds.size === discoveredLeads.length) {
            setSelectedPlaceIds(new Set())
        } else {
            setSelectedPlaceIds(new Set(discoveredLeads.map(d => d.placeId)))
        }
    }

    const handleNext = async () => {
        if (step === 0) {
            // Auto-search if not searched yet, then advance
            if (!hasSearched || discoveredLeads.length === 0) {
                await handleDiscover()
            }
            // Only advance if we have leads after search
            // Use a slight delay to let state settle from the discover call
            setTimeout(() => {
                setStep(s => s + 1)
            }, 0)
            return
        }
        setStep(s => s + 1)
    }

    const mergeTemplate = (template: string, lead?: Lead): string => {
        const target = lead || leads[0]
        if (!target || !template) return template
        const firstName = target.contactName?.split(' ')[0] || 'there'
        return template
            .replace(/\{\{firstName\}\}/g, firstName)
            .replace(/\{\{businessName\}\}/g, target.businessName)
            .replace(/\{\{contactName\}\}/g, target.contactName || '')
            .replace(/\{\{centreName\}\}/g, selectedCentre?.name || '')
    }

    const handleSubmit = async (asDraft: boolean) => {
        setIsSubmitting(true)
        setError(null)

        try {
            const result = await createAndLaunchCampaign(
                {
                    name: campaignName.trim(),
                    businessCategory: category || undefined,
                    searchPostcode: postcode.trim() || undefined,
                    searchRadius: radius || undefined,
                    locationId: selectedCentreId || undefined,
                    locationName: selectedCentre?.name || undefined,
                    linkedinMessage: messages.linkedinMessage.trim() || undefined,
                    emailSubject: messages.emailSubject.trim() || undefined,
                    emailBody: messages.emailBody.trim() || undefined,
                },
                leads.map(l => ({
                    businessName: l.businessName,
                    contactName: l.contactName || undefined,
                    contactEmail: l.contactEmail || undefined,
                    linkedinUrl: l.linkedinUrl || undefined,
                    phone: l.phone || undefined,
                    website: l.website || undefined,
                    address: l.address || undefined,
                    googleRating: l.googleRating ?? undefined,
                    googleReviews: l.googleReviews ?? undefined,
                    placeId: l.placeId || undefined,
                    latitude: l.latitude ?? undefined,
                    longitude: l.longitude ?? undefined,
                })),
                asDraft
            )

            if (!result.success || !result.campaignId) {
                throw new Error('Failed to create campaign')
            }

            router.push(`/outreach/campaigns/${result.campaignId}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
            setIsSubmitting(false)
        }
    }

    // ─── Loading state ──────────────────────────────────────
    if (integrationLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // ─── Connected Accounts Gate ────────────────────────────
    if (integrationStatus && !integrationStatus.connected) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">Connect Your Accounts</CardTitle>
                        <CardDescription>
                            Before creating campaigns, you need to connect at least one LinkedIn or email account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button onClick={() => router.push('/outreach')} className="gap-2">
                            Go to Settings
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // ─── Wizard ─────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Create Campaign</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Set up your outreach campaign in three steps.
                </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2">
                {STEPS.map((s, i) => {
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
            {step === 0 && (
                <StepSetup
                    name={campaignName}
                    setName={setCampaignName}
                    category={category}
                    setCategory={setCategory}
                    selectedCentreId={selectedCentreId}
                    setSelectedCentreId={setSelectedCentreId}
                    radius={radius}
                    setRadius={setRadius}
                    categoryOptions={categoryOptions}
                    centres={centres}
                    centresLoading={centresLoading}
                    discoveredLeads={discoveredLeads}
                    selectedPlaceIds={selectedPlaceIds}
                    isSearching={isSearching}
                    searchError={searchError}
                    hasSearched={hasSearched}
                    onTogglePlaceId={togglePlaceId}
                    onToggleSelectAll={toggleSelectAll}
                    leads={leads}
                />
            )}
            {step === 1 && (
                <StepWriteMessages
                    messages={messages}
                    setMessages={setMessages}
                    mergeTemplate={mergeTemplate}
                    hasLeads={leads.length > 0}
                    campaignName={campaignName}
                    businessCategory={categoryLabel}
                    postcode={postcode}
                    centreName={selectedCentre?.name || ''}
                    sampleLeads={leads.slice(0, 3).map(l => ({ businessName: l.businessName, contactName: l.contactName || null }))}
                />
            )}
            {step === 2 && (
                <StepPreviewLaunch
                    campaignName={campaignName}
                    categoryLabel={categoryLabel}
                    centreName={selectedCentre?.name || ''}
                    postcode={postcode}
                    radius={radius}
                    leads={leads}
                    messages={messages}
                    integrationStatus={integrationStatus}
                    mergeTemplate={mergeTemplate}
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
                        onClick={handleNext}
                        disabled={step === 0 ? (
                            campaignName.trim().length === 0 ||
                            category.length === 0 ||
                            selectedCentreId.length === 0 ||
                            radius <= 0 ||
                            isSearching
                        ) : !canProceed()}
                        className="gap-1.5"
                    >
                        {isSearching ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Searching…
                            </>
                        ) : (
                            <>
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                ) : (
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => handleSubmit(true)}
                            disabled={isSubmitting}
                            className="gap-1.5"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                'Save as Draft'
                            )}
                        </Button>
                        <Button
                            onClick={() => handleSubmit(false)}
                            disabled={isSubmitting}
                            className="gap-1.5"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Launching…
                                </>
                            ) : (
                                <>
                                    Create & Launch
                                    <Rocket className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Step 1: Setup ──────────────────────────────────────────

function StepSetup({
    name,
    setName,
    category,
    setCategory,
    selectedCentreId,
    setSelectedCentreId,
    radius,
    setRadius,
    categoryOptions,
    centres,
    centresLoading,
    discoveredLeads,
    selectedPlaceIds,
    isSearching,
    searchError,
    hasSearched,
    onTogglePlaceId,
    onToggleSelectAll,
    leads,
}: {
    name: string
    setName: (v: string) => void
    category: string
    setCategory: (v: string) => void
    selectedCentreId: string
    setSelectedCentreId: (v: string) => void
    radius: number
    setRadius: (v: number) => void
    categoryOptions: { value: string; label: string }[]
    centres: Array<{ id: string; name: string; city: string; postcode: string; type: string; latitude: number; longitude: number; label: string }>
    centresLoading: boolean
    discoveredLeads: DiscoveredLead[]
    selectedPlaceIds: Set<string>
    isSearching: boolean
    searchError: string | null
    hasSearched: boolean
    onTogglePlaceId: (placeId: string) => void
    onToggleSelectAll: () => void
    leads: Lead[]
}) {
    const allSelected = discoveredLeads.length > 0 && selectedPlaceIds.size === discoveredLeads.length

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-primary" />
                        Campaign Setup
                    </CardTitle>
                    <CardDescription>
                        Select your centre and the business type you want to target.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="campaign-centre">
                                <Building2 className="inline h-3.5 w-3.5 mr-1" />
                                Centre <span className="text-destructive">*</span>
                            </Label>
                            <select
                                id="campaign-centre"
                                value={selectedCentreId}
                                onChange={e => setSelectedCentreId(e.target.value)}
                                disabled={centresLoading}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                            >
                                <option value="">
                                    {centresLoading ? 'Loading centres…' : 'Select a centre…'}
                                </option>
                                {centres.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.label} ({c.postcode})
                                    </option>
                                ))}
                            </select>
                            {centres.length === 0 && !centresLoading && (
                                <p className="text-xs text-destructive">
                                    No centres assigned to your account. Contact an admin.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="campaign-category">
                                Business Category <span className="text-destructive">*</span>
                            </Label>
                            <select
                                id="campaign-category"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value="">Select a category…</option>
                                {categoryOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="campaign-radius">
                                Search Radius <span className="text-destructive">*</span>
                            </Label>
                            <select
                                id="campaign-radius"
                                value={radius}
                                onChange={e => setRadius(Number(e.target.value))}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                {RADIUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="campaign-name">
                                Campaign Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="campaign-name"
                                placeholder="e.g. Coffee Shops — Arndale Centre"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Auto-generated from category and centre. You can edit it.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Search status */}
            {isSearching && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 border border-border/50 rounded-lg px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    Searching for businesses…
                </div>
            )}

            {searchError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {searchError}
                </div>
            )}

            {/* Discovered leads results */}
            {hasSearched && !isSearching && discoveredLeads.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                Discovered Leads
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="gap-1">
                                    <Check className="h-3 w-3" />
                                    {selectedPlaceIds.size} of {discoveredLeads.length} selected
                                </Badge>
                                <Button variant="outline" size="sm" onClick={onToggleSelectAll}>
                                    {allSelected ? 'Deselect All' : 'Select All'}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40px]">
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={onToggleSelectAll}
                                                className="rounded border-input"
                                            />
                                        </TableHead>
                                        <TableHead>Business Name</TableHead>
                                        <TableHead className="hidden md:table-cell">Address</TableHead>
                                        <TableHead className="hidden sm:table-cell">Rating</TableHead>
                                        <TableHead className="hidden sm:table-cell">Reviews</TableHead>
                                        <TableHead className="hidden lg:table-cell">Website</TableHead>
                                        <TableHead className="hidden md:table-cell">Distance</TableHead>
                                        <TableHead className="hidden lg:table-cell">Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {discoveredLeads.map(d => (
                                        <TableRow key={d.placeId}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPlaceIds.has(d.placeId)}
                                                    onChange={() => onTogglePlaceId(d.placeId)}
                                                    className="rounded border-input"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {d.businessName}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                                                {d.address || '—'}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                {d.googleRating != null ? (
                                                    <span className="flex items-center gap-1 text-sm">
                                                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                        {d.googleRating.toFixed(1)}
                                                    </span>
                                                ) : '—'}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                                                {d.googleReviews ?? '—'}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                {d.website ? (
                                                    <a
                                                        href={d.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                        Link
                                                    </a>
                                                ) : '—'}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                                {d.distanceMiles.toFixed(1)} mi
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <Badge variant="secondary" className="text-xs font-mono">
                                                    {d.score.toFixed(0)}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {hasSearched && !isSearching && discoveredLeads.length === 0 && !searchError && (
                <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                    No businesses found. Try adjusting your category, centre, or radius.
                </div>
            )}

            {/* Success count badge */}
            {leads.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
                    <Check className="h-4 w-4 shrink-0" />
                    {leads.length} businesses found within {radius} miles
                </div>
            )}
        </div>
    )
}

// ─── Step 2: Write Messages ─────────────────────────────────

function StepWriteMessages({
    messages,
    setMessages,
    mergeTemplate,
    hasLeads,
    campaignName,
    businessCategory,
    postcode,
    centreName,
    sampleLeads,
}: {
    messages: Messages
    setMessages: (m: Messages) => void
    mergeTemplate: (t: string) => string
    hasLeads: boolean
    campaignName: string
    businessCategory: string
    postcode: string
    centreName: string
    sampleLeads: Array<{ businessName: string; contactName: string | null }>
}) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [generateError, setGenerateError] = useState<string | null>(null)
    const [hasGenerated, setHasGenerated] = useState(false)
    const linkedinLength = messages.linkedinMessage.length
    const linkedinOverLimit = linkedinLength > LINKEDIN_MAX_CHARS

    const handleAIGenerate = async () => {
        setIsGenerating(true)
        setGenerateError(null)
        try {
            const res = await fetch('/api/outreach/generate-messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignName,
                    businessCategory,
                    location: postcode,
                    centreName,
                    sampleLeads,
                    tone: 'friendly',
                    channel: 'both',
                }),
            })
            if (!res.ok) throw new Error('AI generation failed')
            const data = await res.json()
            setMessages({
                linkedinMessage: data.linkedinMessage || messages.linkedinMessage,
                emailSubject: data.emailSubject || messages.emailSubject,
                emailBody: data.emailBody || messages.emailBody,
            })
            setHasGenerated(true)
        } catch (err) {
            setGenerateError(err instanceof Error ? err.message : 'Failed to generate')
        } finally {
            setIsGenerating(false)
        }
    }

    // Auto-generate on mount if messages are empty
    useEffect(() => {
        const isEmpty = !messages.linkedinMessage.trim() && !messages.emailBody.trim()
        if (isEmpty && !hasGenerated && !isGenerating) {
            handleAIGenerate()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="space-y-4">
            {/* AI Generate Banner */}
            <Card className="border-dashed border-primary/30 bg-primary/5">
                <CardContent className="flex items-center justify-between py-4">
                    <div className="space-y-1">
                        <div className="text-sm font-medium flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            {isGenerating ? 'Generating your messages…' : 'AI-Generated Messages'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {isGenerating
                                ? 'Crafting personalized LinkedIn and email templates based on your campaign details.'
                                : 'Messages have been auto-generated. Edit below or regenerate for a fresh version.'}
                        </p>
                    </div>
                    <Button
                        onClick={handleAIGenerate}
                        disabled={isGenerating}
                        variant="outline"
                        size="sm"
                        className="gap-1.5 shrink-0"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating…
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Regenerate
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {generateError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {generateError}
                </div>
            )}
            {/* LinkedIn Message */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Linkedin className="h-5 w-5 text-primary" />
                        LinkedIn Follow-up Message
                    </CardTitle>
                    <CardDescription>
                        Sent after the connection request is accepted. Use {'{{firstName}}'}, {'{{businessName}}'}, and {'{{centreName}}'} for personalization.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                        <Textarea
                            placeholder={`Hi {{firstName}},\n\nI noticed {{businessName}} could be a great fit for our retail space at {{centreName}}. Would you be open to a quick chat?\n\nBest regards`}
                            value={messages.linkedinMessage}
                            onChange={e => setMessages({ ...messages, linkedinMessage: e.target.value })}
                            rows={5}
                            className="resize-none"
                        />
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                                Variables: <code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{firstName}}'}</code>{' '}
                                <code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{businessName}}'}</code>{' '}
                                <code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{centreName}}'}</code>
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
                            placeholder={`e.g. Retail space opportunity at ${centreName || 'your centre'}`}
                            value={messages.emailSubject}
                            onChange={e => setMessages({ ...messages, emailSubject: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="email-body">Body</Label>
                        <Textarea
                            id="email-body"
                            placeholder={`Dear {{firstName}},\n\nI'm reaching out regarding a retail opportunity at ${centreName || '{{centreName}}'} that I think would be perfect for {{businessName}}...\n\nBest regards`}
                            value={messages.emailBody}
                            onChange={e => setMessages({ ...messages, emailBody: e.target.value })}
                            rows={7}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            Variables: <code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{firstName}}'}</code>{' '}
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{businessName}}'}</code>{' '}
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{centreName}}'}</code>{' '}
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

// ─── Step 3: Preview & Launch ───────────────────────────────

function StepPreviewLaunch({
    campaignName,
    categoryLabel,
    centreName,
    postcode,
    radius,
    leads,
    messages,
    integrationStatus,
    mergeTemplate,
}: {
    campaignName: string
    categoryLabel: string
    centreName: string
    postcode: string
    radius: number
    leads: Lead[]
    messages: Messages
    integrationStatus: IntegrationStatus | null
    mergeTemplate: (t: string, lead?: Lead) => string
}) {
    const hasLinkedInTemplate = messages.linkedinMessage.trim().length > 0
    const hasEmailTemplate = messages.emailBody.trim().length > 0
    const leadsWithoutLinkedIn = leads.filter(l => !l.linkedinUrl).length

    return (
        <div className="space-y-4">
            {/* Campaign Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Rocket className="h-5 w-5 text-primary" />
                        Campaign Summary
                    </CardTitle>
                    <CardDescription>
                        Review everything before launching.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SummaryItem label="Campaign Name" value={campaignName} />
                        <SummaryItem label="Centre" value={centreName ? `${centreName} (${postcode.trim().toUpperCase()})` : postcode.trim().toUpperCase()} />
                        <SummaryItem label="Category" value={categoryLabel || '—'} />
                        <SummaryItem label="Radius" value={`${radius} miles`} />
                        <SummaryItem label="Leads" value={String(leads.length)} />
                    </div>
                </CardContent>
            </Card>

            {/* Safety Checks */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Safety Checks
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <SafetyCheck
                            passed={integrationStatus?.hasLinkedIn ?? false}
                            label={integrationStatus?.hasLinkedIn
                                ? `LinkedIn connected (${integrationStatus.linkedInName || 'Connected'})`
                                : 'LinkedIn not connected'
                            }
                        />
                        <SafetyCheck
                            passed={integrationStatus?.hasEmail ?? false}
                            label={integrationStatus?.hasEmail
                                ? `Email connected (${integrationStatus.emailAddress || 'Connected'})`
                                : 'Email not connected'
                            }
                        />
                        <SafetyCheck
                            passed={hasLinkedInTemplate}
                            label={hasLinkedInTemplate ? 'LinkedIn message template ready' : 'No LinkedIn message template'}
                        />
                        <SafetyCheck
                            passed={hasEmailTemplate}
                            label={hasEmailTemplate ? 'Email template ready' : 'No email template'}
                        />
                        <SafetyCheck
                            passed={leads.length > 0}
                            label={`${leads.length} leads ready`}
                        />
                        {leadsWithoutLinkedIn > 0 && (
                            <div className="flex items-center gap-2 text-sm text-amber-500">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                {leadsWithoutLinkedIn} leads missing LinkedIn (email only)
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Pipeline Preview */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Pipeline Preview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <PipelineStep day="Day 1-2" description="LinkedIn invites (25/day max)" />
                        <PipelineStep day="Day 3+" description="Wait for acceptances" />
                        <PipelineStep day="Day 4+" description="Follow-up DMs to accepted" />
                        <PipelineStep day="Day 7+" description="Email to remaining" />
                    </div>
                </CardContent>
            </Card>

            {/* Sample Messages */}
            {leads.length > 0 && (messages.linkedinMessage.trim() || messages.emailBody.trim()) && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            Sample Messages
                            <Badge variant="outline" className="font-normal text-xs">First {Math.min(2, leads.length)} leads</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {leads.slice(0, 2).map((lead, idx) => (
                            <div key={lead.id} className="space-y-3">
                                {idx > 0 && <Separator />}
                                <div className="text-xs font-medium text-muted-foreground">
                                    {lead.businessName}
                                </div>
                                {messages.linkedinMessage.trim() && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Linkedin className="h-3 w-3" />
                                            LinkedIn
                                        </div>
                                        <div className="rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                                            {mergeTemplate(messages.linkedinMessage, lead)}
                                        </div>
                                    </div>
                                )}
                                {messages.emailBody.trim() && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Mail className="h-3 w-3" />
                                            Email
                                        </div>
                                        {messages.emailSubject.trim() && (
                                            <div className="text-sm font-medium">
                                                Subject: {mergeTemplate(messages.emailSubject, lead)}
                                            </div>
                                        )}
                                        <div className="rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                                            {mergeTemplate(messages.emailBody, lead)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

// ─── Shared Components ──────────────────────────────────────

function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1 rounded-lg bg-muted/30 border border-border/50 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-sm font-medium">{value}</p>
        </div>
    )
}

function SafetyCheck({ passed, label }: { passed: boolean; label: string }) {
    return (
        <div className={`flex items-center gap-2 text-sm ${passed ? 'text-emerald-500' : 'text-muted-foreground'}`}>
            {passed ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {label}
        </div>
    )
}

function PipelineStep({ day, description }: { day: string; description: string }) {
    return (
        <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono text-xs shrink-0 w-16 justify-center">
                {day}
            </Badge>
            <span className="text-sm text-muted-foreground">{description}</span>
        </div>
    )
}
