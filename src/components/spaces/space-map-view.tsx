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
    images: string[]
}

interface SpaceMapViewProps {
    floorMaps: FloorMapViewData[]
    spaces: SpacePinViewData[]
    onSpaceClick?: (spaceId: string) => void
}

// ─── Component ──────────────────────────────────────────

export function SpaceMapView({ floorMaps, spaces, onSpaceClick }: SpaceMapViewProps) {
    const [activeMapId, setActiveMapId] = useState<string>(floorMaps[0]?.id || '')
    const [hoveredSpaceId, setHoveredSpaceId] = useState<string | null>(null)

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
                        {pinnedSpaces.map((space) => {
                            const isHovered = hoveredSpaceId === space.id
                            const hasImages = space.images.length > 0
                            // Determine tooltip position to avoid overflow
                            const pinX = space.mapPinX ?? 0
                            const pinY = space.mapPinY ?? 0
                            const tooltipOnRight = pinX < 50
                            const tooltipAbove = pinY > 30

                            return (
                                <div
                                    key={space.id}
                                    className="absolute"
                                    style={{
                                        left: `${pinX}%`,
                                        top: `${pinY}%`,
                                        transform: 'translate(-50%, -100%)',
                                        zIndex: isHovered ? 50 : 10,
                                    }}
                                    onMouseEnter={() => setHoveredSpaceId(space.id)}
                                    onMouseLeave={() => setHoveredSpaceId(null)}
                                    onClick={() => onSpaceClick?.(space.id)}
                                >
                                    {/* Pin marker */}
                                    <div className="relative cursor-pointer">
                                        <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-200 ${
                                            isHovered ? 'bg-primary scale-125' : 'bg-primary'
                                        }`}>
                                            <span className="text-[9px] font-bold text-primary-foreground">
                                                {space.sortOrder}
                                            </span>
                                        </div>
                                        <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary mx-auto -mt-[1px]" />
                                    </div>

                                    {/* Rich tooltip */}
                                    {isHovered && (
                                        <div
                                            className={`absolute pointer-events-none ${
                                                tooltipAbove ? 'bottom-full mb-2' : 'top-full mt-2'
                                            } ${
                                                tooltipOnRight ? 'left-0' : 'right-0'
                                            }`}
                                            style={{ width: hasImages ? '240px' : 'auto' }}
                                        >
                                            <div className="bg-popover border rounded-lg shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
                                                {/* Images */}
                                                {hasImages && (
                                                    <div className={`grid ${space.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-0`}>
                                                        {space.images.map((url, i) => (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                key={i}
                                                                src={url}
                                                                alt={`${space.name} photo ${i + 1}`}
                                                                className="w-full h-28 object-cover"
                                                            />
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Info */}
                                                <div className="px-3 py-2">
                                                    <div className="font-medium text-sm">{space.name}</div>
                                                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                                                        {space.isExternal && (
                                                            <Badge variant="outline" className="text-[10px] px-1 py-0 text-emerald-600 border-emerald-500/40">
                                                                External
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            )}
        </Card>
    )
}
