"use client"

import { useState, useTransition } from "react"
import { DealStage } from "@prisma/client"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, TrendingUp, Trophy, AlertCircle, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DealCard } from "./deal-card"
import { CreateDealDialog } from "./create-deal-dialog"
import { DigestToggle } from "./digest-toggle"
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
    accent: string
    bg: string
}

const STAGES: StageConfig[] = [
    { key: "LEAD", label: "Lead", tooltip: "Identified but no contact made yet", accent: "#94a3b8", bg: "rgba(148, 163, 184, 0.08)" },
    { key: "CONTACTED", label: "Contacted", tooltip: "Initial outreach sent (email, call, or LinkedIn)", accent: "#60a5fa", bg: "rgba(96, 165, 250, 0.08)" },
    { key: "MEETING_SCHEDULED", label: "Meeting", tooltip: "Face-to-face or virtual meeting confirmed", accent: "#fbbf24", bg: "rgba(251, 191, 36, 0.08)" },
    { key: "PROPOSAL_SENT", label: "Proposal", tooltip: "Presentation or proposal delivered to prospect", accent: "#a78bfa", bg: "rgba(167, 139, 250, 0.08)" },
    { key: "NEGOTIATION", label: "Negotiation", tooltip: "Terms being discussed, awaiting decision", accent: "#fb923c", bg: "rgba(251, 146, 60, 0.08)" },
    { key: "WON", label: "Won", tooltip: "Contract signed — deal closed successfully", accent: "#34d399", bg: "rgba(52, 211, 153, 0.08)" },
    { key: "LOST", label: "Lost", tooltip: "Deal didn't close — record reason for future reference", accent: "#f87171", bg: "rgba(248, 113, 113, 0.08)" },
]

function formatValue(v: number) {
    if (v >= 1_000_000) return `£${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `£${(v / 1_000).toFixed(0)}k`
    return `£${v}`
}

export function CrmKanban({
    initialDeals,
    allDeals: allDealsInitial,
    stats,
    userId,
    digestEnabled,
}: {
    initialDeals: DealData[]
    allDeals: DealData[]
    stats: { totalDeals: number; totalValue: number; activeValue: number; stages: { stage: DealStage; count: number; value: number }[] }
    userId: string
    digestEnabled: boolean
}) {
    const [deals, setDeals] = useState(initialDeals)
    const [allDeals] = useState(allDealsInitial)
    const [activeTab, setActiveTab] = useState("my-pipeline")
    const [createOpen, setCreateOpen] = useState(false)
    const [activeDragId, setActiveDragId] = useState<string | null>(null)
    const [, startTransition] = useTransition()

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

    const handleDragStart = (event: DragStartEvent) => setActiveDragId(event.active.id as string)

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveDragId(null)
        const { active, over } = event
        if (!over) return

        const dealId = active.id as string
        const newStage = over.id as DealStage

        const deal = deals.find((d) => d.id === dealId)
        if (!deal || deal.stage === newStage) return

        setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d)))
        startTransition(async () => {
            try { await updateDealStage(dealId, newStage) }
            catch { setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: deal.stage } : d))) }
        })
    }

    const activeDeal = activeDragId ? deals.find((d) => d.id === activeDragId) : null
    const overdueTotalCount = deals.reduce((sum, d) => sum + d.followUps.filter((f) => new Date(f.dueDate) <= new Date()).length, 0)

    const wonStats = stats.stages.find((s) => s.stage === "WON")

    return (
        <TooltipProvider delayDuration={200}>
            <div className="flex flex-col gap-6 h-full">
                {/* ── Header ── */}
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Manage deals and sales opportunities</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <DigestToggle initialEnabled={digestEnabled} />
                        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1.5">
                            <Plus className="h-4 w-4" /> New Deal
                        </Button>
                    </div>
                </div>

                {/* ── Stats Strip ── */}
                <div className="flex items-center gap-6 rounded-lg border px-5 py-3">
                    <StatBlock icon={<TrendingUp className="h-4 w-4" />} label="Active Pipeline" value={formatValue(stats.activeValue)} sub={`${stats.totalDeals} deals`} />
                    <div className="h-8 w-px bg-border" />
                    <StatBlock icon={<Trophy className="h-4 w-4 text-emerald-400" />} label="Won" value={formatValue(wonStats?.value || 0)} sub={`${wonStats?.count || 0} closed`} valueClass="text-emerald-400" />
                    <div className="h-8 w-px bg-border" />
                    <StatBlock icon={<AlertCircle className="h-4 w-4 text-amber-400" />} label="Follow-ups Due" value={String(overdueTotalCount)} sub="overdue / today" valueClass={overdueTotalCount > 0 ? "text-amber-400" : ""} />
                </div>

                {/* ── Tabs + Board ── */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                    <TabsList className="w-fit">
                        <TabsTrigger value="my-pipeline">My Pipeline</TabsTrigger>
                        <TabsTrigger value="team">Team</TabsTrigger>
                    </TabsList>

                    <TabsContent value="my-pipeline" className="flex-1 mt-4 min-h-0">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                            <KanbanBoard deals={deals} />
                            <DragOverlay dropAnimation={null}>
                                {activeDeal ? <DealCard deal={activeDeal} isDragging /> : null}
                            </DragOverlay>
                        </DndContext>
                    </TabsContent>

                    <TabsContent value="team" className="flex-1 mt-4 min-h-0">
                        <KanbanBoard deals={allDeals} isTeamView />
                    </TabsContent>
                </Tabs>

                <CreateDealDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={(deal) => { setDeals((prev) => [deal as DealData, ...prev]); setCreateOpen(false) }} />
            </div>
        </TooltipProvider>
    )
}

/* ── Stats Block ── */
function StatBlock({ icon, label, value, sub, valueClass }: { icon: React.ReactNode; label: string; value: string; sub: string; valueClass?: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-md bg-muted/50">{icon}</div>
            <div>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                <p className={`text-lg font-bold leading-tight ${valueClass || ""}`}>{value}</p>
                <p className="text-[11px] text-muted-foreground/70">{sub}</p>
            </div>
        </div>
    )
}

/* ── Board (horizontal scroll container) ── */
function KanbanBoard({ deals, isTeamView }: { deals: DealData[]; isTeamView?: boolean }) {
    return (
        <div className="flex gap-3 overflow-x-auto pb-4 h-full" style={{ scrollbarWidth: "thin" }}>
            {STAGES.map((stage) => {
                const stageDeals = deals.filter((d) => d.stage === stage.key)
                const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)
                return (
                    <KanbanColumn
                        key={stage.key}
                        stage={stage}
                        deals={stageDeals}
                        stageValue={stageValue}
                        isTeamView={isTeamView}
                    />
                )
            })}
        </div>
    )
}

/* ── Column ── */
function KanbanColumn({
    stage,
    deals,
    stageValue,
    isTeamView,
}: {
    stage: StageConfig
    deals: DealData[]
    stageValue: number
    isTeamView?: boolean
}) {
    const { setNodeRef, isOver } = useDroppable({ id: stage.key })

    return (
        <div
            ref={setNodeRef}
            className="flex flex-col shrink-0 rounded-xl transition-colors duration-150"
            style={{
                width: 280,
                backgroundColor: isOver ? stage.bg : "transparent",
            }}
        >
            {/* Column Header */}
            <div className="flex items-center gap-2 px-3 py-2.5 mb-1">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.accent }} />
                <span className="text-[13px] font-semibold truncate">{stage.label}</span>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <button className="shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 transition-opacity">
                            <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px]">
                        <p className="text-xs leading-relaxed">{stage.tooltip}</p>
                    </TooltipContent>
                </Tooltip>

                <div className="ml-auto flex items-center gap-1.5">
                    {stageValue > 0 && (
                        <span className="text-[11px] font-medium text-muted-foreground tabular-nums">{formatValue(stageValue)}</span>
                    )}
                    <Badge variant="secondary" className="h-5 min-w-[20px] justify-center px-1.5 text-[11px] font-semibold">
                        {deals.length}
                    </Badge>
                </div>
            </div>

            {/* Column Body */}
            <div
                className="flex-1 flex flex-col gap-2 px-1.5 pb-2 min-h-[120px] rounded-lg"
                style={{ backgroundColor: deals.length > 0 ? stage.bg : "transparent" }}
            >
                {deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} showOwner={isTeamView} />
                ))}
            </div>
        </div>
    )
}
