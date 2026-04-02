"use client"

import { useState, useTransition, useCallback } from "react"
import { DealStage } from "@prisma/client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, X, MapPin, Search } from "lucide-react"
import { createDeal, searchLocations, searchOrganisations } from "@/app/crm/actions"

type LocationResult = {
    id: string; name: string; city: string | null; type: string
    footfall: number | null; numberOfStores: number | null; owner: string | null; management: string | null
}

type OrgSuggestion = { id?: string; name: string; source: string }

type SelectedLocation = { locationId?: string; locationName: string; locationCity?: string; isLinked: boolean }

export function CreateDealDialog({
    open,
    onOpenChange,
    onCreated,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreated: (deal: any) => void
}) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")

    // Form state
    const [title, setTitle] = useState("")
    const [stage, setStage] = useState<DealStage>("LEAD")
    const [value, setValue] = useState("")
    const [orgName, setOrgName] = useState("")
    const [notes, setNotes] = useState("")

    // Location search
    const [locationQuery, setLocationQuery] = useState("")
    const [locationResults, setLocationResults] = useState<LocationResult[]>([])
    const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>([])
    const [showLocationResults, setShowLocationResults] = useState(false)

    // Org search
    const [orgResults, setOrgResults] = useState<OrgSuggestion[]>([])
    const [showOrgResults, setShowOrgResults] = useState(false)

    // Contact
    const [contactName, setContactName] = useState("")
    const [contactEmail, setContactEmail] = useState("")

    // Debounced location search
    const handleLocationSearch = useCallback(async (q: string) => {
        setLocationQuery(q)
        if (q.length < 2) { setLocationResults([]); setShowLocationResults(false); return }
        const results = await searchLocations(q)
        setLocationResults(results)
        setShowLocationResults(true)
    }, [])

    // Debounced org search
    const handleOrgSearch = useCallback(async (q: string) => {
        setOrgName(q)
        if (q.length < 2) { setOrgResults([]); setShowOrgResults(false); return }
        const results = await searchOrganisations(q)
        setOrgResults(results)
        setShowOrgResults(true)
    }, [])

    const addLinkedLocation = (loc: LocationResult) => {
        if (selectedLocations.find((l) => l.locationId === loc.id)) return
        setSelectedLocations((prev) => [...prev, {
            locationId: loc.id,
            locationName: loc.name,
            locationCity: loc.city || undefined,
            isLinked: true,
        }])
        setLocationQuery("")
        setShowLocationResults(false)
    }

    const addCustomLocation = () => {
        if (!locationQuery.trim()) return
        setSelectedLocations((prev) => [...prev, {
            locationName: locationQuery.trim(),
            isLinked: false,
        }])
        setLocationQuery("")
        setShowLocationResults(false)
    }

    const removeLocation = (idx: number) => {
        setSelectedLocations((prev) => prev.filter((_, i) => i !== idx))
    }

    const handleSubmit = () => {
        if (!title.trim()) { setError("Title is required"); return }
        setError("")

        startTransition(async () => {
            try {
                const deal = await createDeal({
                    title: title.trim(),
                    stage,
                    value: value ? parseInt(value) : undefined,
                    organisationName: orgName.trim() || undefined,
                    notes: notes.trim() || undefined,
                    locations: selectedLocations.map((l) => ({
                        locationId: l.locationId,
                        locationName: l.locationName,
                        locationCity: l.locationCity,
                    })),
                    contacts: contactName.trim() ? [{
                        name: contactName.trim(),
                        email: contactEmail.trim() || undefined,
                    }] : undefined,
                })
                // Reset form
                setTitle(""); setStage("LEAD"); setValue(""); setOrgName(""); setNotes("")
                setSelectedLocations([]); setContactName(""); setContactEmail("")
                onCreated(deal)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to create deal")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Deal</DialogTitle>
                    <DialogDescription>Add a new deal to your sales pipeline</DialogDescription>
                </DialogHeader>

                <div className="grid gap-5 py-4">
                    {/* Row 1: Title + Stage */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="deal-title">Deal Title *</Label>
                            <Input id="deal-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fareham Shopping Centre" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Stage</Label>
                            <Select value={stage} onValueChange={(v) => setStage(v as DealStage)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LEAD">Lead</SelectItem>
                                    <SelectItem value="CONTACTED">Contacted</SelectItem>
                                    <SelectItem value="MEETING_SCHEDULED">Meeting Scheduled</SelectItem>
                                    <SelectItem value="PROPOSAL_SENT">Proposal Sent</SelectItem>
                                    <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                                    <SelectItem value="WON">Won</SelectItem>
                                    <SelectItem value="LOST">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 2: Value + Organisation */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="deal-value">Estimated Value (£)</Label>
                            <Input id="deal-value" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 200000" />
                        </div>
                        <div className="grid gap-2 relative">
                            <Label>Organisation / Landlord</Label>
                            <Input
                                value={orgName}
                                onChange={(e) => handleOrgSearch(e.target.value)}
                                onFocus={() => orgResults.length > 0 && setShowOrgResults(true)}
                                onBlur={() => setTimeout(() => setShowOrgResults(false), 200)}
                                placeholder="Search or type new..."
                            />
                            {showOrgResults && orgResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-[200] mt-1 bg-popover border rounded-md shadow-lg max-h-40 overflow-y-auto">
                                    {orgResults.map((org, i) => (
                                        <button key={i} className="w-full text-left px-3 py-2 hover:bg-accent text-sm flex items-center justify-between"
                                            onMouseDown={() => { setOrgName(org.name); setShowOrgResults(false) }}>
                                            <span>{org.name}</span>
                                            <Badge variant="outline" className="text-[10px]">{org.source}</Badge>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location Search */}
                    <div className="grid gap-2">
                        <Label>Locations</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                value={locationQuery}
                                onChange={(e) => handleLocationSearch(e.target.value)}
                                onFocus={() => locationResults.length > 0 && setShowLocationResults(true)}
                                onBlur={() => setTimeout(() => setShowLocationResults(false), 200)}
                                placeholder="Search Flourish locations or type a custom name..."
                            />
                            {showLocationResults && (
                                <div className="absolute top-full left-0 right-0 z-[200] mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    {locationResults.map((loc) => (
                                        <button key={loc.id} className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                                            onMouseDown={() => addLinkedLocation(loc)}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span className="font-medium">{loc.name}</span>
                                                    <span className="text-muted-foreground">— {loc.city}</span>
                                                </div>
                                                <Badge variant="outline" className="text-[10px]">Flourish</Badge>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5 ml-5">
                                                {loc.numberOfStores && `${loc.numberOfStores} stores`}
                                                {loc.footfall && ` · ${(loc.footfall / 1_000_000).toFixed(1)}M footfall`}
                                                {loc.owner && ` · ${loc.owner}`}
                                            </div>
                                        </button>
                                    ))}
                                    {locationQuery.length >= 2 && (
                                        <button className="w-full text-left px-3 py-2 hover:bg-accent text-sm border-t"
                                            onMouseDown={addCustomLocation}>
                                            <span className="text-muted-foreground">+ Add &quot;{locationQuery}&quot; as custom location</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        {selectedLocations.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                                {selectedLocations.map((loc, i) => (
                                    <Badge key={i} variant={loc.isLinked ? "default" : "outline"} className="flex items-center gap-1">
                                        {loc.isLinked && <MapPin className="h-3 w-3" />}
                                        {loc.locationName}
                                        {loc.locationCity && <span className="opacity-60">({loc.locationCity})</span>}
                                        <button onClick={() => removeLocation(i)} className="ml-1 hover:text-red-500">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Contact (Quick add) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="contact-name">Contact Name</Label>
                            <Input id="contact-name" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="e.g. Will Ashdown" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contact-email">Contact Email</Label>
                            <Input id="contact-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="e.g. will@cited.co.uk" />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="grid gap-2">
                        <Label htmlFor="deal-notes">Notes</Label>
                        <Textarea id="deal-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional context..." rows={3} />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isPending || !title.trim()}>
                        {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create Deal
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
