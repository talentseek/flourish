'use client'

import { useState } from 'react'
import { SpaceDiaryGrid } from '@/components/spaces/space-diary-grid'
import { SpaceMapView } from '@/components/spaces/space-map-view'
import { Button } from '@/components/ui/button'
import { Map, CalendarDays } from 'lucide-react'
import { BookingStatus } from '@prisma/client'

interface SpaceData {
    id: string
    name: string
    types: string[]
    defaultDailyRate: number | null
}

interface BookingData {
    id: string
    reference: string
    spaceId: string
    operatorId: string | null
    startDate: Date
    endDate: Date
    status: BookingStatus
    companyName?: string | null
    brand?: string | null
    setupDetail?: string | null
    description?: string | null
    dailyRate?: number | null
    totalValue?: number | null
    notes?: string | null
    operator?: { id: string; companyName: string; tradingName?: string | null } | null
}

interface FloorMapWithSpaces {
    id: string
    name: string
    imageUrl: string
    sortOrder: number
    spaces: {
        id: string
        name: string
        sortOrder: number
        mapPinX: number | null
        mapPinY: number | null
        types: string[]
        isExternal: boolean
        images: string[]
    }[]
}

interface DiaryPageClientProps {
    locationId: string
    locationName: string
    spaces: SpaceData[]
    initialBookings: BookingData[]
    initialWindowStart: Date
    floorMaps: FloorMapWithSpaces[]
}

export function DiaryPageClient({
    locationId,
    locationName,
    spaces,
    initialBookings,
    initialWindowStart,
    floorMaps,
}: DiaryPageClientProps) {
    const [view, setView] = useState<'diary' | 'map'>('diary')
    const hasFloorMaps = floorMaps.length > 0

    // Flatten floor map spaces for the map view
    const allMapSpaces = floorMaps.flatMap(m =>
        m.spaces.map(s => ({ ...s, floorMapId: m.id }))
    )
    const floorMapsForView = floorMaps.map(m => ({
        id: m.id,
        name: m.name,
        imageUrl: m.imageUrl,
        sortOrder: m.sortOrder,
    }))

    return (
        <div className="space-y-4">
            {/* View toggle — only show if maps exist */}
            {hasFloorMaps && (
                <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-fit">
                    <Button
                        variant={view === 'diary' ? 'default' : 'ghost'}
                        size="sm"
                        className="gap-1.5 h-8"
                        onClick={() => setView('diary')}
                    >
                        <CalendarDays className="h-3.5 w-3.5" />
                        Diary
                    </Button>
                    <Button
                        variant={view === 'map' ? 'default' : 'ghost'}
                        size="sm"
                        className="gap-1.5 h-8"
                        onClick={() => setView('map')}
                    >
                        <Map className="h-3.5 w-3.5" />
                        Map
                    </Button>
                </div>
            )}

            {view === 'diary' ? (
                <SpaceDiaryGrid
                    locationId={locationId}
                    locationName={locationName}
                    spaces={spaces}
                    initialBookings={initialBookings}
                    initialWindowStart={initialWindowStart}
                />
            ) : (
                <SpaceMapView
                    floorMaps={floorMapsForView}
                    spaces={allMapSpaces}
                />
            )}
        </div>
    )
}
