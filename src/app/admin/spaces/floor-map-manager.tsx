'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createFloorMap, deleteFloorMap, updateSpacePin, removeSpacePin } from '@/actions/floor-map-actions'
import { uploadFile, deleteFile } from '@/actions/upload-actions'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Upload, Map, X } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────

export interface FloorMapData {
    id: string
    name: string
    imageUrl: string
    sortOrder: number
}

export interface SpacePinData {
    id: string
    name: string
    sortOrder: number
    mapPinX: number | null
    mapPinY: number | null
    floorMapId: string | null
}

// ─── Floor Map Manager ──────────────────────────────────

export function FloorMapManager({
    locationId,
    floorMaps,
    spaces,
}: {
    locationId: string
    floorMaps: FloorMapData[]
    spaces: SpacePinData[]
}) {
    const router = useRouter()
    const [activeMapId, setActiveMapId] = useState<string>(floorMaps[0]?.id || '')
    const [addMapOpen, setAddMapOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [placingSpaceId, setPlacingSpaceId] = useState<string | null>(null)
    const mapContainerRef = useRef<HTMLDivElement>(null)

    const activeMap = floorMaps.find(m => m.id === activeMapId)

    // Spaces pinned to the active map
    const pinnedSpaces = spaces.filter(s => s.floorMapId === activeMapId && s.mapPinX != null && s.mapPinY != null)
    // Spaces not pinned to any map (available for placement)
    const unpinnedSpaces = spaces.filter(s => !s.floorMapId || (s.mapPinX == null && s.mapPinY == null))

    // ─── Upload new map ─────────────────────────────────

    async function handleUploadMap(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setUploading(true)
        try {
            const form = new FormData(e.currentTarget)
            const name = form.get('mapName') as string
            const file = form.get('mapFile') as File
            if (!name || !file) throw new Error('Name and file required')

            // Upload file to Blob
            const uploadForm = new FormData()
            uploadForm.set('file', file)
            const imageUrl = await uploadFile(uploadForm)

            // Create floor map record
            await createFloorMap({
                locationId,
                name,
                imageUrl,
                sortOrder: floorMaps.length,
            })
            setAddMapOpen(false)
            router.refresh()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to upload map')
        } finally {
            setUploading(false)
        }
    }

    // ─── Delete map ─────────────────────────────────────

    async function handleDeleteMap(mapId: string) {
        const map = floorMaps.find(m => m.id === mapId)
        if (!map) return
        if (!confirm(`Delete "${map.name}"? All pins on this map will be removed.`)) return
        try {
            await deleteFile(map.imageUrl)
            await deleteFloorMap(mapId)
            router.refresh()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete map')
        }
    }

    // ─── Place pin on click ─────────────────────────────

    const handleMapClick = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
        if (!placingSpaceId || !activeMapId || !mapContainerRef.current) return

        const rect = mapContainerRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        try {
            await updateSpacePin(placingSpaceId, activeMapId, x, y)
            setPlacingSpaceId(null)
            router.refresh()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to place pin')
        }
    }, [placingSpaceId, activeMapId, router])

    // ─── Remove pin ─────────────────────────────────────

    async function handleRemovePin(spaceId: string) {
        try {
            await removeSpacePin(spaceId)
            router.refresh()
        } catch {
            alert('Failed to remove pin')
        }
    }

    if (floorMaps.length === 0 && !addMapOpen) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <Map className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">No floor maps uploaded for this location.</p>
                    <Button variant="outline" size="sm" onClick={() => setAddMapOpen(true)} className="gap-1">
                        <Upload className="h-3.5 w-3.5" />
                        Upload Floor Map
                    </Button>

                    {/* Upload Dialog */}
                    <Dialog open={addMapOpen} onOpenChange={setAddMapOpen}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Upload Floor Map</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleUploadMap} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mapName">Floor Name</Label>
                                    <Input id="mapName" name="mapName" placeholder="e.g. Ground Floor" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mapFile">Map Image (SVG, PNG, JPG)</Label>
                                    <Input id="mapFile" name="mapFile" type="file" accept=".svg,.png,.jpg,.jpeg,.webp" required />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={uploading}>
                                        {uploading ? 'Uploading...' : 'Upload'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Floor Maps</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setAddMapOpen(true)} className="gap-1">
                        <Plus className="h-3.5 w-3.5" />
                        Add Floor
                    </Button>
                </div>

                {/* Map tabs */}
                {floorMaps.length > 0 && (
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
                <CardContent className="space-y-3">
                    {/* Pin placement toolbar */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Select
                            value={placingSpaceId || ''}
                            onValueChange={(v) => setPlacingSpaceId(v || null)}
                        >
                            <SelectTrigger className="w-[250px] h-8 text-xs">
                                <SelectValue placeholder="Select space to place pin..." />
                            </SelectTrigger>
                            <SelectContent>
                                {unpinnedSpaces.map(s => (
                                    <SelectItem key={s.id} value={s.id} className="text-xs">
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {placingSpaceId && (
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/40 animate-pulse">
                                    Click on map to place pin
                                </Badge>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPlacingSpaceId(null)}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto text-red-500 hover:text-red-700 text-xs h-7"
                            onClick={() => handleDeleteMap(activeMap.id)}
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete Map
                        </Button>
                    </div>

                    {/* Map with pins */}
                    <div
                        ref={mapContainerRef}
                        className={`relative border rounded-lg overflow-hidden bg-muted/20 ${placingSpaceId ? 'cursor-crosshair' : ''}`}
                        onClick={handleMapClick}
                    >
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
                                className="absolute group"
                                style={{
                                    left: `${space.mapPinX}%`,
                                    top: `${space.mapPinY}%`,
                                    transform: 'translate(-50%, -100%)',
                                }}
                            >
                                {/* Pin marker */}
                                <div className="relative">
                                    <div className="w-6 h-6 rounded-full bg-primary border-2 border-white shadow-lg flex items-center justify-center">
                                        <span className="text-[9px] font-bold text-primary-foreground">
                                            {space.sortOrder}
                                        </span>
                                    </div>
                                    {/* Pin point */}
                                    <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary mx-auto -mt-[1px]" />
                                </div>

                                {/* Tooltip on hover */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover border rounded shadow-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    {space.name}
                                </div>

                                {/* Remove button on hover */}
                                <button
                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleRemovePin(space.id)
                                    }}
                                >
                                    <X className="h-2.5 w-2.5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Pinned spaces count */}
                    <p className="text-xs text-muted-foreground">
                        {pinnedSpaces.length} of {spaces.length} spaces pinned to this map
                    </p>
                </CardContent>
            )}

            {/* Upload Dialog */}
            <Dialog open={addMapOpen} onOpenChange={setAddMapOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload Floor Map</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUploadMap} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="mapName">Floor Name</Label>
                            <Input id="mapName" name="mapName" placeholder="e.g. Ground Floor" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mapFile">Map Image (SVG, PNG, JPG)</Label>
                            <Input id="mapFile" name="mapFile" type="file" accept=".svg,.png,.jpg,.jpeg,.webp" required />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Upload'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
