'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// ─── Types ──────────────────────────────────────────────

interface FloorMapViewData {
    id: string
    name: string
    imageUrl: string
    sortOrder: number
}

interface SpacePinViewData {
    id: string
    name: string
    sortOrder: number
    mapPinX: number | null
    mapPinY: number | null
    floorMapId: string | null
    types: string[]
    isExternal: boolean
}

interface SpaceMapViewProps {
    floorMaps: FloorMapViewData[]
    spaces: SpacePinViewData[]
    onSpaceClick?: (spaceId: string) => void
}

// ─── Component ──────────────────────────────────────────

export function SpaceMapView({ floorMaps, spaces, onSpaceClick }: SpaceMapViewProps) {
    const [activeMapId, setActiveMapId] = useState<string>(floorMaps[0]?.id || '')

    const activeMap = floorMaps.find(m => m.id === activeMapId)
    const pinnedSpaces = spaces.filter(
        s => s.floorMapId === activeMapId && s.mapPinX != null && s.mapPinY != null
    )

    if (floorMaps.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-sm text-muted-foreground">No floor maps available for this location.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Floor Plan</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                        {pinnedSpaces.length} spaces mapped
                    </Badge>
                </div>

                {/* Floor tabs */}
                {floorMaps.length > 1 && (
                    <div className="flex gap-2 mt-2">
                        {floorMaps.map(map => (
                            <button
                                key={map.id}
                                onClick={() => setActiveMapId(map.id)}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    activeMapId === map.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                {map.name}
                            </button>
                        ))}
                    </div>
                )}
            </CardHeader>

            {activeMap && (
                <CardContent>
                    <div className="relative border rounded-lg overflow-hidden bg-muted/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={activeMap.imageUrl}
                            alt={activeMap.name}
                            className="w-full h-auto block"
                            draggable={false}
                        />

                        {/* Pins */}
                        {pinnedSpaces.map((space) => (
                            <div
                                key={space.id}
                                className="absolute group cursor-pointer"
                                style={{
                                    left: `${space.mapPinX}%`,
                                    top: `${space.mapPinY}%`,
                                    transform: 'translate(-50%, -100%)',
                                }}
                                onClick={() => onSpaceClick?.(space.id)}
                            >
                                {/* Pin marker */}
                                <div className="relative">
                                    <div className="w-6 h-6 rounded-full bg-primary border-2 border-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-125">
                                        <span className="text-[9px] font-bold text-primary-foreground">
                                            {space.sortOrder}
                                        </span>
                                    </div>
                                    <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary mx-auto -mt-[1px]" />
                                </div>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover border rounded shadow-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    <div className="font-medium">{space.name}</div>
                                    {space.isExternal && (
                                        <div className="text-emerald-500 text-[10px]">External</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            )}
        </Card>
    )
}
