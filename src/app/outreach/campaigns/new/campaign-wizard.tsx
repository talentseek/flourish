'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createCampaign, addLeadsToCampaign, getUserCentres } from '@/actions/outreach-actions'
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
    Search,
    MessageSquare,
    Rocket,
    Plus,
    Trash2,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    ChevronUp,
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

const STEPS = [
    { label: 'Campaign Details', icon: Megaphone },
    { label: 'Find Leads', icon: Search },
    { label: 'Write Messages', icon: MessageSquare },
    { label: 'Review & Launch', icon: Rocket },
] as const

const LINKEDIN_MAX_CHARS = 300

const RADIUS_OPTIONS = [
    { value: 5, label: '5 miles' },
    { value: 10, label: '10 miles' },
    { value: 15, label: '15 miles' },
    { value: 20, label: '20 miles' },
    { value: 25, label: '25 miles' },
]

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

    // Step 1 — Campaign Details
    const [campaignName, setCampaignName] = useState('')
    const [category, setCategory] = useState('')
    const [selectedCentreId, setSelectedCentreId] = useState('')
    const [postcode, setPostcode] = useState('')
    const [radius, setRadius] = useState<number>(10)

    // Centres from database
    const [centres, setCentres] = useState<Array<{ id: string; name: string; city: string; postcode: string; type: string; latitude: number; longitude: number; label: string }>>([])
    const [centresLoading, setCentresLoading] = useState(true)

    // Load centres on mount
    useEffect(() => {
        getUserCentres()
            .then(setCentres)
            .catch(() => setCentres([]))
            .finally(() => setCentresLoading(false))
    }, [])

    // Step 2 — Find Leads
    const [leads, setLeads] = useState<Lead[]>([])
    const [currentLead, setCurrentLead] = useState<Lead>(emptyLead())
    const [discoveredLeads, setDiscoveredLeads] = useState<DiscoveredLead[]>([])
    const [selectedPlaceIds, setSelectedPlaceIds] = useState<Set<string>>(new Set())
    const [isSearching, setIsSearching] = useState(false)
    const [searchError, setSearchError] = useState<string | null>(null)
    const [hasSearched, setHasSearched] = useState(false)

    // Step 3 — Messages
    const [messages, setMessages] = useState<Messages>({
        linkedinMessage: '',
        emailSubject: '',
        emailBody: '',
    })

    const categoryOptions = getCategoryOptions()
    const categoryLabel = categoryOptions.find(c => c.value === category)?.label ?? ''
    const selectedCentre = centres.find(c => c.id === selectedCentreId)

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

    const canProceed = (): boolean => {
        switch (step) {
            case 0:
                return (
                    campaignName.trim().length > 0 &&
                    category.length > 0 &&
                    selectedCentreId.length > 0 &&
                    radius > 0
                )
            case 1:
                return leads.length > 0
            case 2:
                return messages.linkedinMessage.trim().length > 0 || messages.emailBody.trim().length > 0
            case 3:
                return true
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
            setDiscoveredLeads(Array.isArray(results) ? results : [])
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

    const handleAddSelectedToLeads = () => {
        const existingPlaceIds = new Set(leads.map(l => l.placeId).filter(Boolean))
        const newLeads: Lead[] = discoveredLeads
            .filter(d => selectedPlaceIds.has(d.placeId) && !existingPlaceIds.has(d.placeId))
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
        setLeads(prev => [...prev, ...newLeads])
        setSelectedPlaceIds(new Set())
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        setError(null)

        try {
            const result = await createCampaign({
                name: campaignName.trim(),
                businessCategory: category || undefined,
                searchPostcode: postcode.trim() || undefined,
                searchRadius: radius || undefined,
                locationId: selectedCentreId || undefined,
                locationName: selectedCentre?.name || undefined,
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
                    googleRating: l.googleRating ?? undefined,
                    googleReviews: l.googleReviews ?? undefined,
                    placeId: l.placeId || undefined,
                    latitude: l.latitude ?? undefined,
                    longitude: l.longitude ?? undefined,
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
            .replace(/\{\{centreName\}\}/g, selectedCentre?.name || '')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Create Campaign</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Set up your outreach campaign in four steps.
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
                <StepCampaignDetails
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
                />
            )}
            {step === 1 && (
                <StepFindLeads
                    leads={leads}
                    currentLead={currentLead}
                    setCurrentLead={setCurrentLead}
                    onAddManual={handleAddLead}
                    onRemove={handleRemoveLead}
                    discoveredLeads={discoveredLeads}
                    selectedPlaceIds={selectedPlaceIds}
                    isSearching={isSearching}
                    searchError={searchError}
                    hasSearched={hasSearched}
                    onDiscover={handleDiscover}
                    onTogglePlaceId={togglePlaceId}
                    onToggleSelectAll={toggleSelectAll}
                    onAddSelected={handleAddSelectedToLeads}
                    category={categoryLabel}
                    postcode={postcode}
                />
            )}
            {step === 2 && (
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
            {step === 3 && (
                <StepReviewLaunch
                    campaignName={campaignName}
                    categoryLabel={categoryLabel}
                    centreName={selectedCentre?.name || ''}
                    postcode={postcode}
                    radius={radius}
                    leadCount={leads.length}
                    messages={messages}
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
                        disabled={isSubmitting}
                        className="gap-1.5"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating…
                            </>
                        ) : (
                            <>
                                <Rocket className="h-4 w-4" />
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
    category,
    setCategory,
    selectedCentreId,
    setSelectedCentreId,
    radius,
    setRadius,
    categoryOptions,
    centres,
    centresLoading,
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
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-primary" />
                    Campaign Details
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
    )
}

// ─── Step 2: Find Leads ─────────────────────────────────────

function StepFindLeads({
    leads,
    currentLead,
    setCurrentLead,
    onAddManual,
    onRemove,
    discoveredLeads,
    selectedPlaceIds,
    isSearching,
    searchError,
    hasSearched,
    onDiscover,
    onTogglePlaceId,
    onToggleSelectAll,
    onAddSelected,
    category,
    postcode,
}: {
    leads: Lead[]
    currentLead: Lead
    setCurrentLead: (l: Lead) => void
    onAddManual: () => void
    onRemove: (id: string) => void
    discoveredLeads: DiscoveredLead[]
    selectedPlaceIds: Set<string>
    isSearching: boolean
    searchError: string | null
    hasSearched: boolean
    onDiscover: () => void
    onTogglePlaceId: (placeId: string) => void
    onToggleSelectAll: () => void
    onAddSelected: () => void
    category: string
    postcode: string
}) {
    const [manualOpen, setManualOpen] = useState(false)

    const updateField = (field: keyof Lead, value: string) => {
        setCurrentLead({ ...currentLead, [field]: value })
    }

    const allSelected = discoveredLeads.length > 0 && selectedPlaceIds.size === discoveredLeads.length

    return (
        <div className="space-y-4">
            {/* Discovery Search */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" />
                        Find Leads
                    </CardTitle>
                    <CardDescription>
                        Search for {category || 'businesses'} near {postcode.trim().toUpperCase() || 'your postcode'}. Select the ones you want in your campaign.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={onDiscover} disabled={isSearching} className="gap-2">
                        {isSearching ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Searching for businesses…
                            </>
                        ) : (
                            <>
                                <Search className="h-4 w-4" />
                                Search
                            </>
                        )}
                    </Button>

                    {searchError && (
                        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {searchError}
                        </div>
                    )}

                    {/* Discovery Results */}
                    {discoveredLeads.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Found <span className="font-medium text-foreground">{discoveredLeads.length}</span> businesses
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={onToggleSelectAll}>
                                        {allSelected ? 'Deselect All' : 'Select All'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        disabled={selectedPlaceIds.size === 0}
                                        onClick={onAddSelected}
                                        className="gap-1.5"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Add Selected ({selectedPlaceIds.size})
                                    </Button>
                                </div>
                            </div>

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
                                        {discoveredLeads.map(d => {
                                            const existsInCampaign = leads.some(l => l.placeId === d.placeId)
                                            return (
                                                <TableRow
                                                    key={d.placeId}
                                                    className={existsInCampaign ? 'opacity-50' : ''}
                                                >
                                                    <TableCell>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPlaceIds.has(d.placeId)}
                                                            onChange={() => onTogglePlaceId(d.placeId)}
                                                            disabled={existsInCampaign}
                                                            className="rounded border-input"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {d.businessName}
                                                        {existsInCampaign && (
                                                            <Badge variant="outline" className="ml-2 text-xs">Added</Badge>
                                                        )}
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
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {hasSearched && !isSearching && discoveredLeads.length === 0 && !searchError && (
                        <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                            No businesses found. Try adjusting your category, postcode, or radius.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Campaign Leads */}
            {leads.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                Campaign Leads
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
                    No leads added yet. Search above or add manually below.
                </div>
            )}

            {/* Manual Add (Collapsible) */}
            <Separator />
            <div>
                <button
                    onClick={() => setManualOpen(!manualOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full py-2"
                >
                    {manualOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    Or add leads manually
                </button>

                {manualOpen && (
                    <Card className="mt-3">
                        <CardContent className="pt-6 space-y-4">
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
                                        onKeyDown={e => e.key === 'Enter' && onAddManual()}
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
                                onClick={onAddManual}
                                disabled={!currentLead.businessName.trim()}
                                size="sm"
                                className="gap-1.5"
                            >
                                <Plus className="h-4 w-4" />
                                Add Lead
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

// ─── Step 3: Write Messages ─────────────────────────────────

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
        } catch (err) {
            setGenerateError(err instanceof Error ? err.message : 'Failed to generate')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* AI Generate Button */}
            <Card className="border-dashed border-primary/30 bg-primary/5">
                <CardContent className="flex items-center justify-between py-4">
                    <div className="space-y-1">
                        <div className="text-sm font-medium flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            AI Message Generation
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Let AI write your outreach messages based on your campaign details and leads.
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
                                Generate with AI
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

// ─── Step 4: Review & Launch ────────────────────────────────

function StepReviewLaunch({
    campaignName,
    categoryLabel,
    centreName,
    postcode,
    radius,
    leadCount,
    messages,
}: {
    campaignName: string
    categoryLabel: string
    centreName: string
    postcode: string
    radius: number
    leadCount: number
    messages: Messages
}) {
    const channels: string[] = []
    if (messages.linkedinMessage.trim()) channels.push('LinkedIn (follow-up)')
    if (messages.emailBody.trim()) channels.push('Email')

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-primary" />
                    Review & Launch
                </CardTitle>
                <CardDescription>
                    Review your campaign details before creating it.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SummaryItem label="Campaign Name" value={campaignName} />
                    <SummaryItem label="Business Category" value={categoryLabel || '—'} />
                    <SummaryItem label="Centre" value={centreName ? `${centreName} (${postcode.trim().toUpperCase()})` : postcode.trim().toUpperCase()} />
                    <SummaryItem label="Search Radius" value={`${radius} miles`} />
                    <SummaryItem label="Total Leads" value={String(leadCount)} />
                    <SummaryItem
                        label="Channels"
                        value={
                            channels.length > 0
                                ? channels.join(', ')
                                : 'None configured'
                        }
                    />
                    <SummaryItem label="Status" value="Draft — will be created as a draft campaign" />
                </div>

                {channels.length === 1 && (
                    <div className="flex items-center gap-2 text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 mt-4">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        Only {channels[0]} is configured. Leads without a matching contact method won&apos;t be reached through the other channel.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1 rounded-lg bg-muted/30 border border-border/50 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-sm font-medium">{value}</p>
        </div>
    )
}
