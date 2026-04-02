"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { DealStage, CrmActivityType } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    ArrowLeft, Building2, MapPin, User, Phone, Mail, Linkedin,
    MessageSquare, Calendar, Check, Plus, Trash2, Briefcase
} from "lucide-react"
import Link from "next/link"
import { updateDealStage, updateDeal, addActivity, createFollowUp, completeFollowUp, addContactToDeal, deleteDeal } from "@/app/crm/actions"

type FullDeal = {
    id: string; title: string; stage: DealStage; value: number | null
    notes: string | null; lostReason: string | null; createdAt: string; stageChangedAt: string
    organisation: { id: string; name: string; website: string | null } | null
    owner: { id: string; name: string | null; email: string } | null
    locations: {
        id: string; locationName: string; locationCity: string | null; locationId: string | null
        location: {
            id: string; name: string; city: string; type: string
            footfall: number | null; numberOfStores: number | null; vacancy: any
            owner: string | null; management: string | null; googleRating: any
        } | null
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

const STAGE_COLORS: Record<DealStage, string> = {
    LEAD: "bg-slate-500", CONTACTED: "bg-blue-500", MEETING_SCHEDULED: "bg-amber-500",
    PROPOSAL_SENT: "bg-purple-500", NEGOTIATION: "bg-orange-500", WON: "bg-emerald-500", LOST: "bg-red-500",
}

const ACTIVITY_ICONS: Record<CrmActivityType, any> = {
    NOTE: MessageSquare, CALL: Phone, EMAIL: Mail, MEETING: Briefcase,
    VISIT: MapPin, STAGE_CHANGE: ArrowLeft, OTHER: MessageSquare,
}

export function DealDetail({ deal: initialDeal, userId }: { deal: FullDeal; userId: string }) {
    const router = useRouter()
    const [deal, setDeal] = useState(initialDeal)
    const [isPending, startTransition] = useTransition()

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

    const handleStageChange = (stage: DealStage) => {
        startTransition(async () => {
            await updateDealStage(deal.id, stage)
            setDeal((d) => ({ ...d, stage }))
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
        })
    }

    const handleCompleteFollowUp = (fuId: string) => {
        startTransition(async () => {
            await completeFollowUp(fuId)
            setDeal((d) => ({
                ...d,
                followUps: d.followUps.map((f) => f.id === fuId ? { ...f, completed: true, completedAt: new Date().toISOString() } : f),
            }))
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
        })
    }

    const handleDelete = () => {
        if (!confirm("Are you sure you want to delete this deal?")) return
        startTransition(async () => {
            await deleteDeal(deal.id)
            router.push("/crm")
        })
    }

    const formatValue = (v: number) => {
        if (v >= 1_000_000) return `£${(v / 1_000_000).toFixed(1)}M`
        if (v >= 1_000) return `£${(v / 1_000).toFixed(0)}k`
        return `£${v}`
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/crm">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{deal.title}</h1>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            {deal.organisation && (
                                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{deal.organisation.name}</span>
                            )}
                            {deal.value && <span className="font-mono font-semibold">{formatValue(deal.value)}</span>}
                            <span>Created {new Date(deal.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={deal.stage} onValueChange={(v) => handleStageChange(v as DealStage)}>
                        <SelectTrigger className="w-[180px]">
                            <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${STAGE_COLORS[deal.stage]}`} />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {(["LEAD", "CONTACTED", "MEETING_SCHEDULED", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST"] as DealStage[]).map((s) => (
                                <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
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
                    {/* Linked Locations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-4 w-4" />Linked Locations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {deal.locations.length === 0 && <p className="text-sm text-muted-foreground">No locations linked</p>}
                            {deal.locations.map((dl) => (
                                <div key={dl.id} className="flex items-start gap-3 p-3 rounded-lg border">
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
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    {deal.notes && (
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Notes</CardTitle></CardHeader>
                            <CardContent><p className="text-sm whitespace-pre-wrap">{deal.notes}</p></CardContent>
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
                                <div key={dc.id} className="flex items-start gap-3 p-3 rounded-lg border">
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
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ACTIVITY TAB */}
                <TabsContent value="activity" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Log Activity</CardTitle>
                        </CardHeader>
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
                                                    <Badge variant="outline" className="text-[10px]">{a.type}</Badge>
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
                                    <div key={fu.id} className={`flex items-center gap-3 p-3 rounded-lg border ${fu.completed ? "opacity-50" : isOverdue ? "border-amber-500/50 bg-amber-500/5" : ""}`}>
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => !fu.completed && handleCompleteFollowUp(fu.id)} disabled={fu.completed || isPending}>
                                            <Check className={`h-3.5 w-3.5 ${fu.completed ? "text-emerald-500" : ""}`} />
                                        </Button>
                                        <div className="flex-1">
                                            <p className={`text-sm ${fu.completed ? "line-through" : ""}`}>{fu.description}</p>
                                            <p className={`text-xs ${isOverdue ? "text-amber-500 font-medium" : "text-muted-foreground"}`}>
                                                <Calendar className="h-3 w-3 inline mr-1" />
                                                {new Date(fu.dueDate).toLocaleDateString()}
                                                {isOverdue && " — Overdue"}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                            {deal.followUps.length === 0 && <p className="text-sm text-muted-foreground">No follow-ups set</p>}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
