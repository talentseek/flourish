"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { DealStage, CrmActivityType } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
    ArrowLeft, Building2, MapPin, User, Phone, Mail, Linkedin,
    MessageSquare, Calendar, Check, Plus, Trash2, Briefcase, Pencil, X, Save,
    TrendingDown, TrendingUp, Users, BarChart3, Globe, Star, Clock
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
    updateDealStage, updateDeal, addActivity, createFollowUp,
    completeFollowUp, deleteFollowUp, addContactToDeal,
    removeContactFromDeal, removeLocationFromDeal, deleteDeal
} from "@/app/crm/actions"

type LocationData = {
    id: string; name: string; city: string; type: string
    footfall: number | null; numberOfStores: number | null; vacancy: any
    owner: string | null; management: string | null; googleRating: any
    googleReviews?: number | null
    healthIndex?: any; retailSpace?: number | null
    numberOfFloors?: number | null; anchorTenants?: number | null
    population?: number | null; medianAge?: number | null
    avgHouseholdIncome?: any
    percentMultiple?: any; percentIndependent?: any
    vacantUnits?: number | null; vacantFloorspace?: number | null
    instagram?: string | null; facebook?: string | null; website?: string | null
}

type FullDeal = {
    id: string; title: string; stage: DealStage; value: number | null
    notes: string | null; lostReason: string | null; createdAt: string; stageChangedAt: string
    organisation: { id: string; name: string; website: string | null } | null
    owner: { id: string; name: string | null; email: string } | null
    locations: {
        id: string; locationName: string; locationCity: string | null; locationId: string | null
        location: LocationData | null
    }[]
    contacts: {
        id: string; contact: {
            id: string; name: string; email: string | null; phone: string | null
            linkedin: string | null; jobTitle: string | null
        }
    }[]
    activities: { id: string; type: CrmActivityType; content: string; createdAt: string; user: { id: string; name: string | null } }[]
    followUps: { id: string; dueDate: string; description: string; completed: boolean; completedAt: string | null; createdAt: string }[]
}

const STAGE_OPTIONS: { value: DealStage; label: string; color: string }[] = [
    { value: "LEAD", label: "Lead", color: "bg-slate-500" },
    { value: "CONTACTED", label: "Contacted", color: "bg-blue-500" },
    { value: "MEETING_SCHEDULED", label: "Meeting Scheduled", color: "bg-amber-500" },
    { value: "PROPOSAL_SENT", label: "Proposal Sent", color: "bg-purple-500" },
    { value: "NEGOTIATION", label: "Negotiation", color: "bg-orange-500" },
    { value: "WON", label: "Won", color: "bg-emerald-500" },
    { value: "LOST", label: "Lost", color: "bg-red-500" },
]

const STAGE_LABEL = Object.fromEntries(STAGE_OPTIONS.map(s => [s.value, s.label]))
const STAGE_COLOR = Object.fromEntries(STAGE_OPTIONS.map(s => [s.value, s.color]))

const ACTIVITY_ICONS: Record<CrmActivityType, any> = {
    NOTE: MessageSquare, CALL: Phone, EMAIL: Mail, MEETING: Briefcase,
    VISIT: MapPin, STAGE_CHANGE: ArrowLeft, OTHER: MessageSquare,
}

function daysAgo(dateStr: string) {
    return Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

export function DealDetail({ deal: initialDeal, userId }: { deal: FullDeal; userId: string }) {
    const router = useRouter()
    const [deal, setDeal] = useState(initialDeal)
    const [isPending, startTransition] = useTransition()

    // Inline editing
    const [editingField, setEditingField] = useState<"title" | "value" | "notes" | null>(null)
    const [editTitle, setEditTitle] = useState(deal.title)
    const [editValue, setEditValue] = useState(deal.value?.toString() || "")
    const [editNotes, setEditNotes] = useState(deal.notes || "")

    // Lost reason modal
    const [showLostModal, setShowLostModal] = useState(false)
    const [lostReason, setLostReason] = useState("")
    const [pendingLostStage, setPendingLostStage] = useState(false)

    // Activity form
    const [activityType, setActivityType] = useState<CrmActivityType>("NOTE")
    const [activityContent, setActivityContent] = useState("")

    // Follow-up form
    const [followUpDate, setFollowUpDate] = useState("")
    const [followUpDesc, setFollowUpDesc] = useState("")

    // Contact form
    const [showContactForm, setShowContactForm] = useState(false)
    const [newContactName, setNewContactName] = useState("")
    const [newContactEmail, setNewContactEmail] = useState("")
    const [newContactPhone, setNewContactPhone] = useState("")
    const [newContactLinkedin, setNewContactLinkedin] = useState("")
    const [newContactJobTitle, setNewContactJobTitle] = useState("")

    const startEdit = (field: "title" | "value" | "notes") => {
        setEditingField(field)
        if (field === "title") setEditTitle(deal.title)
        if (field === "value") setEditValue(deal.value?.toString() || "")
        if (field === "notes") setEditNotes(deal.notes || "")
    }

    const cancelEdit = () => setEditingField(null)

    const saveEdit = (field: "title" | "value" | "notes") => {
        startTransition(async () => {
            const data: any = {}
            if (field === "title") data.title = editTitle.trim()
            if (field === "value") data.value = editValue ? parseInt(editValue) : null
            if (field === "notes") data.notes = editNotes.trim() || null
            await updateDeal(deal.id, data)
            setDeal(d => ({ ...d, ...data }))
            setEditingField(null)
            toast.success("Saved")
        })
    }

    const handleStageChange = (stage: DealStage) => {
        if (stage === "LOST") {
            setPendingLostStage(true)
            setShowLostModal(true)
            return
        }
        startTransition(async () => {
            await updateDealStage(deal.id, stage)
            setDeal((d) => ({ ...d, stage }))
            toast.success(`Stage → ${STAGE_LABEL[stage]}`)
        })
    }

    const handleConfirmLost = () => {
        startTransition(async () => {
            await updateDealStage(deal.id, "LOST")
            if (lostReason.trim()) {
                await updateDeal(deal.id, { lostReason: lostReason.trim() })
            }
            setDeal(d => ({ ...d, stage: "LOST", lostReason: lostReason.trim() || null }))
            setShowLostModal(false)
            setLostReason("")
            setPendingLostStage(false)
            toast.info("Deal marked as Lost")
        })
    }

    const handleAddActivity = () => {
        if (!activityContent.trim()) return
        startTransition(async () => {
            await addActivity(deal.id, activityType, activityContent.trim())
            setDeal((d) => ({
                ...d,
                activities: [{ id: Date.now().toString(), type: activityType, content: activityContent.trim(), createdAt: new Date().toISOString(), user: { id: userId, name: "You" } }, ...d.activities],
            }))
            setActivityContent("")
            toast.success("Activity logged")
        })
    }

    const handleAddFollowUp = () => {
        if (!followUpDate || !followUpDesc.trim()) return
        startTransition(async () => {
            const fu = await createFollowUp(deal.id, { dueDate: followUpDate, description: followUpDesc.trim() })
            setDeal((d) => ({
                ...d,
                followUps: [...d.followUps, { ...fu, dueDate: fu.dueDate.toISOString(), completed: false, completedAt: null, createdAt: fu.createdAt.toISOString() }],
            }))
            setFollowUpDate("")
            setFollowUpDesc("")
            toast.success("Follow-up added")
        })
    }

    const handleCompleteFollowUp = (fuId: string) => {
        startTransition(async () => {
            await completeFollowUp(fuId)
            setDeal((d) => ({
                ...d,
                followUps: d.followUps.map((f) => f.id === fuId ? { ...f, completed: true, completedAt: new Date().toISOString() } : f),
            }))
            toast.success("Follow-up completed ✓")
        })
    }

    const handleDeleteFollowUp = (fuId: string) => {
        startTransition(async () => {
            await deleteFollowUp(fuId)
            setDeal((d) => ({ ...d, followUps: d.followUps.filter(f => f.id !== fuId) }))
            toast("Follow-up deleted")
        })
    }

    const handleAddContact = () => {
        if (!newContactName.trim()) return
        startTransition(async () => {
            await addContactToDeal(deal.id, {
                name: newContactName.trim(),
                email: newContactEmail.trim() || undefined,
                phone: newContactPhone.trim() || undefined,
                linkedin: newContactLinkedin.trim() || undefined,
                jobTitle: newContactJobTitle.trim() || undefined,
            })
            router.refresh()
            setShowContactForm(false)
            setNewContactName(""); setNewContactEmail(""); setNewContactPhone(""); setNewContactLinkedin(""); setNewContactJobTitle("")
            toast.success("Contact added")
        })
    }

    const handleRemoveContact = (dealContactId: string) => {
        startTransition(async () => {
            await removeContactFromDeal(dealContactId, deal.id)
            setDeal(d => ({ ...d, contacts: d.contacts.filter(c => c.id !== dealContactId) }))
            toast("Contact removed")
        })
    }

    const handleRemoveLocation = (dealLocationId: string) => {
        if (!confirm("Remove this location from the deal?")) return
        startTransition(async () => {
            await removeLocationFromDeal(dealLocationId, deal.id)
            setDeal(d => ({ ...d, locations: d.locations.filter(l => l.id !== dealLocationId) }))
            toast("Location removed")
        })
    }

    const handleDelete = () => {
        if (!confirm("Are you sure you want to delete this deal? This cannot be undone.")) return
        startTransition(async () => {
            await deleteDeal(deal.id)
            router.push("/crm")
            toast.success("Deal deleted")
        })
    }

    const formatValue = (v: number) => {
        if (v >= 1_000_000) return `£${(v / 1_000_000).toFixed(1)}M`
        if (v >= 1_000) return `£${(v / 1_000).toFixed(0)}k`
        return `£${v}`
    }

    const stageAge = daysAgo(deal.stageChangedAt)
    const linkedLocation = deal.locations.find(l => l.location)?.location

    return (
        <>
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/crm">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        {editingField === "title" ? (
                            <div className="flex items-center gap-2">
                                <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="text-2xl font-bold h-10 w-[400px]" autoFocus onKeyDown={e => { if (e.key === "Enter") saveEdit("title"); if (e.key === "Escape") cancelEdit() }} />
                                <Button size="icon" variant="ghost" onClick={() => saveEdit("title")} disabled={isPending}><Save className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={cancelEdit}><X className="h-4 w-4" /></Button>
                            </div>
                        ) : (
                            <h1 className="text-2xl font-bold group flex items-center gap-2 cursor-pointer" onClick={() => startEdit("title")}>
                                {deal.title}
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h1>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            {deal.organisation && (
                                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{deal.organisation.name}</span>
                            )}
                            {editingField === "value" ? (
                                <div className="flex items-center gap-1">
                                    <span className="text-xs">£</span>
                                    <Input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} className="h-6 w-[100px] text-xs" autoFocus onKeyDown={e => { if (e.key === "Enter") saveEdit("value"); if (e.key === "Escape") cancelEdit() }} />
                                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => saveEdit("value")} disabled={isPending}><Save className="h-3 w-3" /></Button>
                                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={cancelEdit}><X className="h-3 w-3" /></Button>
                                </div>
                            ) : (
                                <span className="font-mono font-semibold cursor-pointer hover:text-foreground transition-colors group/val flex items-center gap-1" onClick={() => startEdit("value")}>
                                    {deal.value ? formatValue(deal.value) : "No value set"}
                                    <Pencil className="h-3 w-3 opacity-0 group-hover/val:opacity-100 transition-opacity" />
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {stageAge === 0 ? "Today" : `${stageAge}d in stage`}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={deal.stage} onValueChange={(v) => handleStageChange(v as DealStage)}>
                        <SelectTrigger className="w-[195px]">
                            <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${STAGE_COLOR[deal.stage]}`} />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {STAGE_OPTIONS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                    <span className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${s.color}`} />
                                        {s.label}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="contacts">Contacts ({deal.contacts.length})</TabsTrigger>
                    <TabsTrigger value="activity">Activity ({deal.activities.length})</TabsTrigger>
                    <TabsTrigger value="follow-ups">Follow-ups ({deal.followUps.filter((f) => !f.completed).length})</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4">
                    {/* Flourish Intelligence Panel */}
                    {linkedLocation && (
                        <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-emerald-500" />
                                    Flourish Intelligence
                                    <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">Live Data</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {linkedLocation.footfall && (
                                        <IntelStat label="Annual Footfall" value={`${(linkedLocation.footfall / 1_000_000).toFixed(1)}M`} icon={<Users className="h-3.5 w-3.5" />} />
                                    )}
                                    {linkedLocation.numberOfStores && (
                                        <IntelStat label="Stores" value={String(linkedLocation.numberOfStores)} icon={<Building2 className="h-3.5 w-3.5" />} />
                                    )}
                                    {linkedLocation.vacancy != null && Number(linkedLocation.vacancy) > 0 && (
                                        <IntelStat label="Vacancy Rate" value={`${(Number(linkedLocation.vacancy) * 100).toFixed(1)}%`} icon={<TrendingDown className="h-3.5 w-3.5" />} accent={Number(linkedLocation.vacancy) > 0.1 ? "text-amber-400" : "text-emerald-400"} />
                                    )}
                                    {linkedLocation.healthIndex != null && (
                                        <IntelStat label="Health Index" value={Number(linkedLocation.healthIndex).toFixed(0)} icon={<TrendingUp className="h-3.5 w-3.5" />} accent={Number(linkedLocation.healthIndex) > 50 ? "text-emerald-400" : "text-amber-400"} />
                                    )}
                                    {linkedLocation.googleRating && (
                                        <IntelStat label="Google Rating" value={`${linkedLocation.googleRating}${linkedLocation.googleReviews ? ` (${linkedLocation.googleReviews})` : ""}`} icon={<Star className="h-3.5 w-3.5" />} />
                                    )}
                                    {linkedLocation.retailSpace && (
                                        <IntelStat label="Retail Space" value={`${(linkedLocation.retailSpace / 1000).toFixed(0)}k sqft`} icon={<MapPin className="h-3.5 w-3.5" />} />
                                    )}
                                    {linkedLocation.percentMultiple != null && (
                                        <IntelStat label="Multiple Retailers" value={`${(Number(linkedLocation.percentMultiple) * 100).toFixed(0)}%`} icon={<Building2 className="h-3.5 w-3.5" />} />
                                    )}
                                    {linkedLocation.percentIndependent != null && (
                                        <IntelStat label="Independent" value={`${(Number(linkedLocation.percentIndependent) * 100).toFixed(0)}%`} icon={<Building2 className="h-3.5 w-3.5" />} />
                                    )}
                                    {linkedLocation.vacantUnits != null && (
                                        <IntelStat label="Vacant Units" value={String(linkedLocation.vacantUnits)} icon={<TrendingDown className="h-3.5 w-3.5" />} accent={linkedLocation.vacantUnits > 10 ? "text-amber-400" : ""} />
                                    )}
                                    {linkedLocation.population && (
                                        <IntelStat label="Local Population" value={`${(linkedLocation.population / 1000).toFixed(0)}k`} icon={<Users className="h-3.5 w-3.5" />} />
                                    )}
                                    {linkedLocation.medianAge && (
                                        <IntelStat label="Median Age" value={String(linkedLocation.medianAge)} icon={<Users className="h-3.5 w-3.5" />} />
                                    )}
                                    {linkedLocation.avgHouseholdIncome && (
                                        <IntelStat label="Avg Income" value={`£${(Number(linkedLocation.avgHouseholdIncome) / 1000).toFixed(0)}k`} icon={<TrendingUp className="h-3.5 w-3.5" />} />
                                    )}
                                </div>
                                {/* Social links */}
                                {(linkedLocation.website || linkedLocation.instagram || linkedLocation.facebook) && (
                                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/40">
                                        {linkedLocation.website && (
                                            <a href={linkedLocation.website} target="_blank" className="text-xs text-blue-500 flex items-center gap-1 hover:underline"><Globe className="h-3 w-3" />Website</a>
                                        )}
                                        {linkedLocation.instagram && (
                                            <a href={linkedLocation.instagram} target="_blank" className="text-xs text-blue-500 hover:underline">Instagram</a>
                                        )}
                                        {linkedLocation.facebook && (
                                            <a href={linkedLocation.facebook} target="_blank" className="text-xs text-blue-500 hover:underline">Facebook</a>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Linked Locations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-4 w-4" />Linked Locations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {deal.locations.length === 0 && <p className="text-sm text-muted-foreground">No locations linked</p>}
                            {deal.locations.map((dl) => (
                                <div key={dl.id} className="flex items-start gap-3 p-3 rounded-lg border group">
                                    <MapPin className={`h-4 w-4 mt-0.5 ${dl.locationId ? "text-emerald-500" : "text-muted-foreground"}`} />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm">{dl.locationName}</span>
                                            {dl.locationCity && <span className="text-xs text-muted-foreground">— {dl.locationCity}</span>}
                                            {dl.locationId && <Badge variant="outline" className="text-[10px]">Flourish</Badge>}
                                        </div>
                                        {dl.location && (
                                            <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                                                {dl.location.numberOfStores && <span>{dl.location.numberOfStores} stores</span>}
                                                {dl.location.footfall && <span>{(dl.location.footfall / 1_000_000).toFixed(1)}M footfall</span>}
                                                {dl.location.googleRating && <span>⭐ {dl.location.googleRating}</span>}
                                                {dl.location.owner && <span>Owner: {dl.location.owner}</span>}
                                            </div>
                                        )}
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500" onClick={() => handleRemoveLocation(dl.id)} disabled={isPending}>
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Notes</CardTitle>
                            {editingField !== "notes" && (
                                <Button size="sm" variant="ghost" onClick={() => startEdit("notes")} className="gap-1 text-muted-foreground">
                                    <Pencil className="h-3 w-3" /> Edit
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {editingField === "notes" ? (
                                <div className="space-y-2">
                                    <Textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={4} autoFocus placeholder="Add notes..." />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => saveEdit("notes")} disabled={isPending} className="gap-1">
                                            <Save className="h-3 w-3" /> Save
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                                    {deal.notes || "No notes yet. Click Edit to add some."}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Lost Reason (if applicable) */}
                    {deal.stage === "LOST" && deal.lostReason && (
                        <Card className="border-red-500/20">
                            <CardHeader><CardTitle className="text-lg text-red-400">Lost Reason</CardTitle></CardHeader>
                            <CardContent><p className="text-sm">{deal.lostReason}</p></CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* CONTACTS TAB */}
                <TabsContent value="contacts" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2"><User className="h-4 w-4" />Contacts</CardTitle>
                            <Button size="sm" variant="outline" onClick={() => setShowContactForm(!showContactForm)}>
                                <Plus className="h-3 w-3 mr-1" /> Add Contact
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {showContactForm && (
                                <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div><Label className="text-xs">Name *</Label><Input value={newContactName} onChange={(e) => setNewContactName(e.target.value)} placeholder="Contact name" /></div>
                                        <div><Label className="text-xs">Email</Label><Input value={newContactEmail} onChange={(e) => setNewContactEmail(e.target.value)} placeholder="Email" /></div>
                                        <div><Label className="text-xs">Phone</Label><Input value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} placeholder="Phone" /></div>
                                        <div><Label className="text-xs">LinkedIn</Label><Input value={newContactLinkedin} onChange={(e) => setNewContactLinkedin(e.target.value)} placeholder="LinkedIn URL" /></div>
                                        <div className="col-span-2"><Label className="text-xs">Job Title</Label><Input value={newContactJobTitle} onChange={(e) => setNewContactJobTitle(e.target.value)} placeholder="Job title" /></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleAddContact} disabled={!newContactName.trim() || isPending}>Add</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setShowContactForm(false)}>Cancel</Button>
                                    </div>
                                </div>
                            )}
                            {deal.contacts.length === 0 && !showContactForm && <p className="text-sm text-muted-foreground">No contacts linked</p>}
                            {deal.contacts.map((dc) => (
                                <div key={dc.id} className="flex items-start gap-3 p-3 rounded-lg border group">
                                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{dc.contact.name}</div>
                                        {dc.contact.jobTitle && <p className="text-xs text-muted-foreground">{dc.contact.jobTitle}</p>}
                                        <div className="flex gap-3 mt-1">
                                            {dc.contact.email && <a href={`mailto:${dc.contact.email}`} className="text-xs text-blue-500 flex items-center gap-1"><Mail className="h-3 w-3" />{dc.contact.email}</a>}
                                            {dc.contact.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{dc.contact.phone}</span>}
                                            {dc.contact.linkedin && <a href={dc.contact.linkedin} target="_blank" className="text-xs text-blue-500 flex items-center gap-1"><Linkedin className="h-3 w-3" />LinkedIn</a>}
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500" onClick={() => handleRemoveContact(dc.id)} disabled={isPending}>
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ACTIVITY TAB */}
                <TabsContent value="activity" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle className="text-lg">Log Activity</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex gap-2">
                                <Select value={activityType} onValueChange={(v) => setActivityType(v as CrmActivityType)}>
                                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NOTE">Note</SelectItem>
                                        <SelectItem value="CALL">Call</SelectItem>
                                        <SelectItem value="EMAIL">Email</SelectItem>
                                        <SelectItem value="MEETING">Meeting</SelectItem>
                                        <SelectItem value="VISIT">Visit</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Textarea value={activityContent} onChange={(e) => setActivityContent(e.target.value)} placeholder="What happened?" rows={2} className="flex-1" />
                            </div>
                            <Button size="sm" onClick={handleAddActivity} disabled={!activityContent.trim() || isPending}>Log Activity</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-lg">Timeline</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {deal.activities.map((a) => {
                                    const Icon = ACTIVITY_ICONS[a.type] || MessageSquare
                                    return (
                                        <div key={a.id} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Icon className="h-3.5 w-3.5" /></div>
                                                <div className="w-px flex-1 bg-border" />
                                            </div>
                                            <div className="pb-4 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px]">{a.type === "STAGE_CHANGE" ? "Stage Change" : a.type.charAt(0) + a.type.slice(1).toLowerCase()}</Badge>
                                                    <span className="text-xs text-muted-foreground">{a.user.name || "Unknown"} · {new Date(a.createdAt).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm mt-1">{a.content}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                                {deal.activities.length === 0 && <p className="text-sm text-muted-foreground">No activity yet</p>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FOLLOW-UPS TAB */}
                <TabsContent value="follow-ups" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle className="text-lg">Add Follow-up</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex gap-2">
                                <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="w-[180px]" />
                                <Input value={followUpDesc} onChange={(e) => setFollowUpDesc(e.target.value)} placeholder="What needs to be done?" className="flex-1" />
                                <Button size="sm" onClick={handleAddFollowUp} disabled={!followUpDate || !followUpDesc.trim() || isPending}>Add</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-lg">Reminders</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {deal.followUps.map((fu) => {
                                const isOverdue = !fu.completed && new Date(fu.dueDate) < new Date()
                                return (
                                    <div key={fu.id} className={`flex items-center gap-3 p-3 rounded-lg border group ${fu.completed ? "opacity-50" : isOverdue ? "border-amber-500/50 bg-amber-500/5" : ""}`}>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => !fu.completed && handleCompleteFollowUp(fu.id)} disabled={fu.completed || isPending}>
                                            <Check className={`h-3.5 w-3.5 ${fu.completed ? "text-emerald-500" : ""}`} />
                                        </Button>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${fu.completed ? "line-through" : ""}`}>{fu.description}</p>
                                            <p className={`text-xs ${isOverdue ? "text-amber-500 font-medium" : "text-muted-foreground"}`}>
                                                <Calendar className="h-3 w-3 inline mr-1" />
                                                {new Date(fu.dueDate).toLocaleDateString()}
                                                {isOverdue && " — Overdue"}
                                            </p>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500" onClick={() => handleDeleteFollowUp(fu.id)} disabled={isPending}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                )
                            })}
                            {deal.followUps.length === 0 && <p className="text-sm text-muted-foreground">No follow-ups set</p>}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>

        {/* Lost Reason Modal */}
        <Dialog open={showLostModal} onOpenChange={(open) => { if (!open) { setShowLostModal(false); setPendingLostStage(false) } }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Mark as Lost</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                    <p className="text-sm text-muted-foreground">Why was this deal lost? This helps improve your future pipeline.</p>
                    <Textarea value={lostReason} onChange={e => setLostReason(e.target.value)} placeholder="e.g. Went with competitor, budget cut, timing wrong..." rows={3} autoFocus />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => { setShowLostModal(false); setPendingLostStage(false) }}>Cancel</Button>
                    <Button variant="destructive" onClick={handleConfirmLost} disabled={isPending}>Mark as Lost</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    )
}

/* ── Intelligence Stat Card ── */
function IntelStat({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: string }) {
    return (
        <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-background/50 border border-border/40">
            <div className={`shrink-0 ${accent || "text-muted-foreground"}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className={`text-sm font-semibold tabular-nums leading-tight ${accent || ""}`}>{value}</p>
                <p className="text-[10px] text-muted-foreground truncate">{label}</p>
            </div>
        </div>
    )
}
