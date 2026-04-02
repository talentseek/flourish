"use client"

import { useDraggable } from "@dnd-kit/core"
import { MapPin, Building2, Calendar, MessageSquare } from "lucide-react"
import Link from "next/link"

type DealData = {
    id: string
    title: string
    stage: string
    value: number | null
    organisation: { id: string; name: string } | null
    owner?: { id: string; name: string | null } | null
    locations: { id: string; locationName: string; locationCity: string | null; locationId: string | null }[]
    followUps: { id: string; dueDate: string; description: string }[]
    _count: { activities: number }
}

export function DealCard({ deal, isDragging, showOwner }: { deal: DealData; isDragging?: boolean; showOwner?: boolean }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: deal.id })

    const style = transform
        ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
        : undefined

    const overdueFollowUps = deal.followUps.filter((f) => new Date(f.dueDate) <= new Date())
    const hasOverdue = overdueFollowUps.length > 0

    const formatValue = (v: number) => {
        if (v >= 1_000_000) return `£${(v / 1_000_000).toFixed(1)}M`
        if (v >= 1_000) return `£${(v / 1_000).toFixed(0)}k`
        return `£${v}`
    }

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <Link href={`/crm/${deal.id}`} onClick={(e) => { if (isDragging) e.preventDefault() }}>
                <div
                    className={[
                        "rounded-lg border bg-card p-3 cursor-grab active:cursor-grabbing",
                        "transition-all duration-150",
                        "hover:border-foreground/20 hover:shadow-sm",
                        isDragging ? "opacity-60 rotate-1 shadow-xl scale-[1.02]" : "",
                        hasOverdue ? "border-amber-500/40" : "border-border/60",
                    ].join(" ")}
                >
                    {/* Title Row */}
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[13px] font-semibold leading-snug line-clamp-2">{deal.title}</h3>
                        {deal.value ? (
                            <span className="shrink-0 text-[11px] font-bold tabular-nums text-emerald-400">
                                {formatValue(deal.value)}
                            </span>
                        ) : null}
                    </div>

                    {/* Meta: Org + Location */}
                    <div className="mt-2 space-y-1">
                        {deal.organisation && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <Building2 className="h-3 w-3 shrink-0 opacity-50" />
                                <span className="truncate">{deal.organisation.name}</span>
                            </div>
                        )}
                        {deal.locations.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <MapPin className="h-3 w-3 shrink-0 opacity-50" />
                                <span className="truncate">
                                    {deal.locations[0].locationName}
                                    {deal.locations.length > 1 && (
                                        <span className="text-muted-foreground/50"> +{deal.locations.length - 1}</span>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Footer: Indicators + Owner */}
                    {(deal._count.activities > 0 || hasOverdue || (showOwner && deal.owner?.name)) && (
                        <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 text-muted-foreground/60">
                                {deal._count.activities > 0 && (
                                    <span className="flex items-center gap-0.5 text-[10px]">
                                        <MessageSquare className="h-2.5 w-2.5" />
                                        {deal._count.activities}
                                    </span>
                                )}
                                {hasOverdue && (
                                    <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                                        <Calendar className="h-2.5 w-2.5" />
                                        {overdueFollowUps.length}
                                    </span>
                                )}
                            </div>
                            {showOwner && deal.owner?.name && (
                                <span className="text-[10px] text-muted-foreground/50 truncate max-w-[100px]">
                                    {deal.owner.name}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </Link>
        </div>
    )
}
