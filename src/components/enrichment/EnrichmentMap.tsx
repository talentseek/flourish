"use client"

import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import { MapControls } from './MapControls'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui/button'

interface MapLocation {
    id: string
    name: string
    lat: number
    lng: number
    type: string
    isManaged: boolean
    score: number
    grade: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT'
    issues: {
        noWebsite: boolean
        noTenants: boolean
    }
}

const GRADE_COLORS = {
    POOR: '#ef4444',      // Red-500
    FAIR: '#fb923c',      // Orange-400
    GOOD: '#facc15',      // Yellow-400
    EXCELLENT: '#22c55e'  // Green-500
}

export default function EnrichmentMap() {
    const [locations, setLocations] = useState<MapLocation[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [types, setTypes] = useState<string[]>(['SHOPPING_CENTRE', 'RETAIL_PARK', 'OUTLET_CENTRE', 'HIGH_STREET'])
    const [isManagedOnly, setIsManagedOnly] = useState(false)
    const [highlightGaps, setHighlightGaps] = useState(false)

    useEffect(() => {
        fetch('/api/locations/enriched-map')
            .then(res => res.json())
            .then(data => {
                if (data.locations) setLocations(data.locations)
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const filteredLocations = useMemo(() => {
        return locations.filter(loc => {
            if (isManagedOnly && !loc.isManaged) return false
            if (!types.includes(loc.type)) return false
            return true
        })
    }, [locations, isManagedOnly, types])

    const stats = {
        total: locations.length,
        visible: filteredLocations.length,
        avgScore: Math.round(filteredLocations.reduce((acc, curr) => acc + curr.score, 0) / (filteredLocations.length || 1))
    }

    if (loading) return <div className="flex items-center justify-center h-screen bg-slate-50">Loading Map Data...</div>

    return (
        <div className="relative h-screen w-full">
            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={[54.5, -3]} // Center of UK
                    zoom={6}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {filteredLocations.map(loc => {
                        const hasIssues = loc.issues.noWebsite || loc.issues.noTenants
                        const isGapHighlighted = highlightGaps && hasIssues

                        return (
                            <CircleMarker
                                key={loc.id}
                                center={[loc.lat, loc.lng]}
                                radius={isGapHighlighted ? 8 : 5}
                                pathOptions={{
                                    color: isGapHighlighted ? '#000' : 'white',
                                    weight: isGapHighlighted ? 2 : 1,
                                    fillColor: GRADE_COLORS[loc.grade],
                                    fillOpacity: 0.8
                                }}
                            >
                                <Popup>
                                    <div className="min-w-[200px]">
                                        <h3 className="font-bold text-base mb-1">{loc.name}</h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded text-white`} style={{ backgroundColor: GRADE_COLORS[loc.grade] }}>
                                                {loc.score}% {loc.grade}
                                            </span>
                                            {loc.isManaged && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded border">Managed</span>}
                                        </div>

                                        <div className="space-y-1 text-sm text-slate-600 mb-3">
                                            <p>Type: {loc.type.replace('_', ' ').toLowerCase()}</p>
                                            {loc.issues.noWebsite && <p className="text-red-500 flex items-center gap-1">⚠️ No Website</p>}
                                            {loc.issues.noTenants && <p className="text-red-500 flex items-center gap-1">⚠️ No Tenant Data</p>}
                                        </div>

                                        <a href={`/dashboard/locations/${loc.id}`} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" className="w-full h-8">View Location</Button>
                                        </a>
                                    </div>
                                </Popup>
                                <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                                    {loc.name} ({loc.score}%)
                                </Tooltip>
                            </CircleMarker>
                        )
                    })}
                </MapContainer>
            </div>

            <MapControls
                types={types}
                setTypes={setTypes}
                isManagedOnly={isManagedOnly}
                setIsManagedOnly={setIsManagedOnly}
                highlightGaps={highlightGaps}
                setHighlightGaps={setHighlightGaps}
                stats={stats}
            />
        </div>
    )
}
