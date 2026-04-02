"use client"

import { useState, useTransition } from "react"
import { DealStage } from "@prisma/client"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, TrendingUp, Briefcase, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DealCard } from "./deal-card"
import { CreateDealDialog } from "./create-deal-dialog"
import { updateDealStage } from "@/app/crm/actions"

type DealData = {
    id: string
    title: string
    stage: DealStage
    value: number | null
    notes: string | null
    createdAt: string
    organisation: { id: string; name: string } | null
    owner?: { id: string; name: string | null } | null
    locations: { id: string; locationName: string; locationCity: string | null; locationId: string | null }[]
    contacts: { contact: { id: string; name: string; email: string | null } }[]
    followUps: { id: string; dueDate: string; description: string }[]
    _count: { activities: number }
}

type StageConfig = {
    key: DealStage
    label: string
    tooltip: string
    color: string
}

const STAGES: StageConfig[] = [
    { key: "LEAD", label: "Lead", tooltip: "Identified but no contact made yet", color: "bg-slate-500" },
    { key: "CONTACTED", label: "Contacted", tooltip: "Initial outreach sent (email, call, or LinkedIn)", color: "bg-blue-500" },
    { key: "MEETING_SCHEDULED", label: "Meeting", tooltip: "Face-to-face or virtual meeting confirmed", color: "bg-amber-500" },
    { key: "PROPOSAL_SENT", label: "Proposal", tooltip: "Presentation or proposal delivered to prospect", color: "bg-purple-500" },
    { key: "NEGOTIATION", label: "Negotiation", tooltip: "Terms being discussed, awaiting decision", color: "bg-orange-500" },
    { key: "WON", label: "Won", tooltip: "Contract signed — deal closed successfully", color: "bg-emerald-500" },
    { key: "LOST", label: "Lost", tooltip: "Deal didn't close — record reason for future reference", color: "bg-red-500" },
]

export function CrmKanban({
    initialDeals,
    allDeals: allDealsInitial,
    stats,
    userId,
}: {
    initialDeals: DealData[]
    allDeals: DealData[]
    stats: { totalDeals: number; totalValue: number; activeValue: number; stages: { stage: DealStage; count: number; value: number }[] }
    userId: string
}) {
    const [deals, setDeals] = useState(initialDeals)
    const [allDeals] = useState(allDealsInitial)
    const [activeTab, setActiveTab] = useState("my-pipeline")
    const [createOpen, setCreateOpen] = useState(false)
    const [activeDragId, setActiveDragId] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
    const currentDeals = activeTab === "my-pipeline" ? deals : allDeals

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveDragId(null)
        const { active, over } = event
        if (!over) return

        const dealId = active.id as string
        const newStage = over.id as DealStage

        const deal = deals.find((d) => d.id === dealId)
        if (!deal || deal.stage === newStage) return

        // Optimistic update
        setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d)))

        startTransition(async () => {
            try {
                await updateDealStage(dealId, newStage)
            } catch {
                // Revert on failure
                setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: deal.stage } : d)))
            }
        })
    }

    const activeDeal = activeDragId ? currentDeals.find((d) => d.id === activeDragId) : null

    const formatValue = (v: number) => {
        if (v >= 1_000_000) return `£${(v / 1_000_000).toFixed(1)}M`
        if (v >= 1_000) return `£${(v / 1_000).toFixed(0)}k`
        return `£${v}`
    }

    return (
        <TooltipProvider>
            <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">CRM Pipeline</h1>
                        <p className="text-muted-foreground">Manage your sales pipeline and deals</p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> New Deal
                    </Button>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Pipeline</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatValue(stats.activeValue)}</div>
                            <p className="text-xs text-muted-foreground">{stats.totalDeals} total deals</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Won</CardTitle>
                            <Briefcase className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-500">
                                {formatValue(stats.stages.find((s) => s.stage === "WON")?.value || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.stages.find((s) => s.stage === "WON")?.count || 0} deals closed
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Follow-ups Due</CardTitle>
                            <Info className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-500">
                                {currentDeals.reduce((sum, d) => sum + d.followUps.filter((f) => new Date(f.dueDate) <= new Date()).length, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">overdue or due today</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="my-pipeline">My Pipeline</TabsTrigger>
                        <TabsTrigger value="team">Team</TabsTrigger>
                    </TabsList>

                    <TabsContent value="my-pipeline">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                            <div className="grid grid-cols-7 gap-3 overflow-x-auto">
                                {STAGES.map((stage) => {
                                    const stageDeals = deals.filter((d) => d.stage === stage.key)
                                    const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)
                                    return (
                                        <KanbanColumn key={stage.key} stage={stage} deals={stageDeals} stageValue={stageValue} formatValue={formatValue} />
                                    )
                                })}
                            </div>
                            <DragOverlay>{activeDeal ? <DealCard deal={activeDeal} isDragging /> : null}</DragOverlay>
                        </DndContext>
                    </TabsContent>

                    <TabsContent value="team">
                        <div className="grid grid-cols-7 gap-3 overflow-x-auto">
                            {STAGES.map((stage) => {
                                const stageDeals = allDeals.filter((d) => d.stage === stage.key)
                                const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)
                                return (
                                    <KanbanColumn key={stage.key} stage={stage} deals={stageDeals} stageValue={stageValue} formatValue={formatValue} isTeamView />
                                )
                            })}
                        </div>
                    </TabsContent>
                </Tabs>

                <CreateDealDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={(deal) => {
                    setDeals((prev) => [deal as DealData, ...prev])
                    setCreateOpen(false)
                }} />
            </div>
        </TooltipProvider>
    )
}

function KanbanColumn({
    stage,
    deals,
    stageValue,
    formatValue,
    isTeamView,
}: {
    stage: StageConfig
    deals: DealData[]
    stageValue: number
    formatValue: (v: number) => string
    isTeamView?: boolean
}) {
    const { useDroppable } = require("@dnd-kit/core")
    const { setNodeRef } = useDroppable({ id: stage.key })

    return (
        <div ref={setNodeRef} className="min-w-[200px]">
            <div className="flex items-center gap-2 mb-3 px-1">
                <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                <span className="text-sm font-semibold">{stage.label}</span>
                <Badge variant="secondary" className="text-xs ml-auto">{deals.length}</Badge>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                        <p className="text-xs">{stage.tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </div>
            {stageValue > 0 && (
                <p className="text-xs text-muted-foreground mb-2 px-1">{formatValue(stageValue)}</p>
            )}
            <div className="space-y-2 min-h-[100px] p-1 rounded-lg bg-muted/30">
                {deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} showOwner={isTeamView} />
                ))}
            </div>
        </div>
    )
}
