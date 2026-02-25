'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { createSpace, updateSpace, deleteSpace } from '@/actions/space-actions'
import { SpaceType } from '@prisma/client'
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SpaceData {
    id: string
    name: string
    type: SpaceType
    width: number | null
    length: number | null
    hasPower: boolean
    defaultDailyRate: number | null
    sortOrder: number
    isActive: boolean
}

interface LocationData {
    id: string
    name: string
    city: string
    type: string
    spaces: SpaceData[]
}

interface AdminSpacesClientProps {
    locations: LocationData[]
}

export function AdminSpacesClient({ locations }: AdminSpacesClientProps) {
    const router = useRouter()
    const [selectedLocationId, setSelectedLocationId] = useState<string>(
        locations[0]?.id || ''
    )
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingSpace, setEditingSpace] = useState<SpaceData | null>(null)
    const [loading, setLoading] = useState(false)

    const selectedLocation = locations.find((l) => l.id === selectedLocationId)
    const spaces = selectedLocation?.spaces || []

    async function handleAddSpace(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const form = new FormData(e.currentTarget)
        try {
            await createSpace({
                locationId: selectedLocationId,
                name: form.get('name') as string,
                type: (form.get('type') as SpaceType) || 'GENERAL',
                width: form.get('width') ? parseFloat(form.get('width') as string) : undefined,
                length: form.get('length') ? parseFloat(form.get('length') as string) : undefined,
                hasPower: form.get('hasPower') === 'on',
                defaultDailyRate: form.get('defaultDailyRate')
                    ? parseFloat(form.get('defaultDailyRate') as string)
                    : undefined,
                sortOrder: form.get('sortOrder')
                    ? parseInt(form.get('sortOrder') as string)
                    : undefined,
            })
            setAddDialogOpen(false)
            router.refresh()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to create space')
        } finally {
            setLoading(false)
        }
    }

    async function handleEditSpace(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!editingSpace) return
        setLoading(true)
        const form = new FormData(e.currentTarget)
        try {
            await updateSpace(editingSpace.id, {
                name: form.get('name') as string,
                type: (form.get('type') as SpaceType) || 'GENERAL',
                width: form.get('width') ? parseFloat(form.get('width') as string) : null,
                length: form.get('length') ? parseFloat(form.get('length') as string) : null,
                hasPower: form.get('hasPower') === 'on',
                defaultDailyRate: form.get('defaultDailyRate')
                    ? parseFloat(form.get('defaultDailyRate') as string)
                    : null,
                sortOrder: form.get('sortOrder')
                    ? parseInt(form.get('sortOrder') as string)
                    : 0,
            })
            setEditDialogOpen(false)
            setEditingSpace(null)
            router.refresh()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update space')
        } finally {
            setLoading(false)
        }
    }

    async function handleDeleteSpace(spaceId: string) {
        if (!confirm('Deactivate this space? It will be hidden from the diary.')) return
        try {
            await deleteSpace(spaceId)
            router.refresh()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete space')
        }
    }

    function SpaceForm({
        onSubmit,
        defaultValues,
        submitLabel,
    }: {
        onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
        defaultValues?: SpaceData
        submitLabel: string
    }) {
        return (
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Space Name *</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={defaultValues?.name || ''}
                            placeholder="e.g. Kiosk 1"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select name="type" defaultValue={defaultValues?.type || 'GENERAL'}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="GENERAL">General</SelectItem>
                                <SelectItem value="CHARITY">Charity</SelectItem>
                                <SelectItem value="PREMIUM">Premium</SelectItem>
                                <SelectItem value="PROMOTIONAL">Promotional</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="width">Width (m)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            id="width"
                            name="width"
                            defaultValue={defaultValues?.width || ''}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="length">Length (m)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            id="length"
                            name="length"
                            defaultValue={defaultValues?.length || ''}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="defaultDailyRate">Daily Rate (£)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            id="defaultDailyRate"
                            name="defaultDailyRate"
                            defaultValue={defaultValues?.defaultDailyRate || ''}
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="sortOrder">Sort Order</Label>
                        <Input
                            type="number"
                            id="sortOrder"
                            name="sortOrder"
                            defaultValue={defaultValues?.sortOrder || 0}
                        />
                    </div>
                    <div className="flex items-center gap-2 pt-7">
                        <Switch
                            id="hasPower"
                            name="hasPower"
                            defaultChecked={defaultValues?.hasPower || false}
                        />
                        <Label htmlFor="hasPower">Has Power</Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : submitLabel}
                    </Button>
                </DialogFooter>
            </form>
        )
    }

    return (
        <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Space Management</h1>
                <p className="text-muted-foreground">
                    Configure bookable spaces for managed locations.
                </p>
            </div>

            {/* Location Picker */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Label>Location:</Label>
                </div>
                <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                    <SelectTrigger className="w-[350px]">
                        <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                        {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id}>
                                {loc.name} — {loc.city}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    onClick={() => setAddDialogOpen(true)}
                    disabled={!selectedLocationId}
                    className="gap-1"
                >
                    <Plus className="h-4 w-4" />
                    Add Space
                </Button>
            </div>

            {/* Spaces Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        {selectedLocation?.name || 'No Location Selected'} — Spaces
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {spaces.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No spaces configured for this location.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Dimensions</TableHead>
                                    <TableHead>Power</TableHead>
                                    <TableHead>Daily Rate</TableHead>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {spaces.map((space) => (
                                    <TableRow key={space.id} className={!space.isActive ? 'opacity-50' : ''}>
                                        <TableCell className="font-medium">{space.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">
                                                {space.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {space.width && space.length
                                                ? `${space.width}m × ${space.length}m`
                                                : '—'}
                                        </TableCell>
                                        <TableCell>{space.hasPower ? '⚡ Yes' : '—'}</TableCell>
                                        <TableCell>
                                            {space.defaultDailyRate
                                                ? `£${space.defaultDailyRate.toFixed(2)}`
                                                : '—'}
                                        </TableCell>
                                        <TableCell>{space.sortOrder}</TableCell>
                                        <TableCell>
                                            <Badge variant={space.isActive ? 'default' : 'secondary'}>
                                                {space.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditingSpace(space)
                                                        setEditDialogOpen(true)
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                {space.isActive && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteSpace(space.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add Space Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Space</DialogTitle>
                    </DialogHeader>
                    <SpaceForm onSubmit={handleAddSpace} submitLabel="Create Space" />
                </DialogContent>
            </Dialog>

            {/* Edit Space Dialog */}
            <Dialog
                open={editDialogOpen}
                onOpenChange={(open) => {
                    setEditDialogOpen(open)
                    if (!open) setEditingSpace(null)
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Space</DialogTitle>
                    </DialogHeader>
                    {editingSpace && (
                        <SpaceForm
                            onSubmit={handleEditSpace}
                            defaultValues={editingSpace}
                            submitLabel="Save Changes"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
