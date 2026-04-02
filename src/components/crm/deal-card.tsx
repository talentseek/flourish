"use client"

import { useDraggable } from "@dnd-kit/core"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
        ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
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
            <Link href={`/crm/${deal.id}`}>
                <Card className={`cursor-grab hover:shadow-md transition-shadow ${isDragging ? "opacity-50 rotate-2 shadow-lg" : ""} ${hasOverdue ? "border-amber-500/50" : ""}`}>
                    <CardContent className="p-3 space-y-2">
                        <div className="font-medium text-sm leading-tight">{deal.title}</div>

                        {deal.organisation && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Building2 className="h-3 w-3 shrink-0" />
                                <span className="truncate">{deal.organisation.name}</span>
                            </div>
                        )}

                        {deal.locations.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                    {deal.locations[0].locationName}
                                    {deal.locations.length > 1 && ` +${deal.locations.length - 1} more`}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            {deal.value ? (
                                <Badge variant="secondary" className="text-xs font-mono">
                                    {formatValue(deal.value)}
                                </Badge>
                            ) : <span />}

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {deal._count.activities > 0 && (
                                    <span className="flex items-center gap-0.5">
                                        <MessageSquare className="h-3 w-3" />
                                        {deal._count.activities}
                                    </span>
                                )}
                                {hasOverdue && (
                                    <span className="flex items-center gap-0.5 text-amber-500">
                                        <Calendar className="h-3 w-3" />
                                        {overdueFollowUps.length}
                                    </span>
                                )}
                            </div>
                        </div>

                        {showOwner && deal.owner?.name && (
                            <p className="text-[10px] text-muted-foreground/60">{deal.owner.name}</p>
                        )}
                    </CardContent>
                </Card>
            </Link>
        </div>
    )
}
