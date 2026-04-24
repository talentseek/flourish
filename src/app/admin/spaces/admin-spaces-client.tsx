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
import { Checkbox } from '@/components/ui/checkbox'
import { createSpace, updateSpace, deleteSpace } from '@/actions/space-actions'
import { Plus, Pencil, Trash2, MapPin, Zap, Droplets, ArrowDownToLine, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// ─── Constants ──────────────────────────────────────────

const SPACE_TYPES = [
    { value: 'GENERAL', label: 'General', description: 'Standard retail or pop-up unit' },
    { value: 'CHARITY', label: 'Charity', description: 'Discounted charitable use' },
    { value: 'PREMIUM', label: 'Premium', description: 'High-footfall premium position' },
    { value: 'PROMOTIONAL', label: 'Promotional', description: 'Brand activation / promotional' },
    { value: 'FOOD_AND_BEVERAGE', label: 'F&B', description: 'Food & beverage preparation or sales' },
    { value: 'KIOSK', label: 'Kiosk', description: 'Small freestanding kiosk unit' },
    { value: 'MARKET_STALL', label: 'Market Stall', description: 'Open market-style stall' },
    { value: 'EVENT_SPACE', label: 'Event Space', description: 'Large area for events or exhibitions' },
    { value: 'STORAGE', label: 'Storage', description: 'Storage or back-of-house use' },
    { value: 'SEASONAL', label: 'Seasonal', description: 'Seasonal pop-up (Christmas, summer, etc.)' },
    { value: 'SERVICES', label: 'Services', description: 'Service-based (repairs, beauty, etc.)' },
] as const

const POWER_PHASES = [
    {
        value: 'SINGLE_PHASE',
        label: 'Single Phase (230V)',
        description: 'Standard domestic supply — lighting, basic appliances, small equipment',
    },
    {
        value: 'THREE_PHASE',
        label: 'Three Phase (400V)',
        description: 'Industrial supply — heavy commercial equipment, large fridges, high-power cooking',
    },
] as const

const POWER_AMPERAGES = [
    { value: '13A', label: '13A (Standard)', description: 'Standard 3-pin plug — lighting, till, small appliance' },
    { value: '16A', label: '16 Amp', description: 'Blue Commando — small catering, coffee machines' },
    { value: '32A', label: '32 Amp', description: 'Red Commando — hot food, larger fridges' },
    { value: '63A', label: '63 Amp', description: 'Heavy catering, multiple circuits' },
    { value: '100A_PLUS', label: '100+ Amp', description: 'Large-format build, bespoke distribution board' },
] as const

const POWER_CONNECTIONS = [
    { value: 'UK_3PIN', label: 'UK 3-Pin Socket', description: 'Standard domestic 13A socket' },
    { value: 'COMMANDO_BLUE', label: 'Commando (Blue)', description: 'Industrial single-phase — 16A / 32A' },
    { value: 'COMMANDO_RED', label: 'Commando (Red)', description: 'Industrial three-phase — 32A / 63A' },
    { value: 'HARDWIRED', label: 'Hardwired', description: 'Fused spur or direct to breaker — no plug' },
] as const

const POWER_DELIVERIES = [
    { value: 'FLOOR_BOX', label: 'Floor Box', description: 'Recessed floor outlet beneath the unit' },
    { value: 'CEILING_DROP', label: 'Ceiling Drop / Power Pole', description: 'Power from above via drop cable or pole' },
    { value: 'WALL_MOUNTED', label: 'Wall Mounted', description: 'Socket on pillar, wall, or adjacent structure' },
] as const

// ─── Types ──────────────────────────────────────────────

interface SpaceData {
    id: string
    name: string
    types: string[]
    width: number | null
    length: number | null
    hasPower: boolean
    powerPhase: string | null
    powerAmperage: string | null
    powerConnection: string | null
    powerDelivery: string | null
    hasWater: boolean
    hasDrainage: boolean
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

// ─── Utility Toggle ─────────────────────────────────────

function UtilityToggle({
    id,
    label,
    icon: Icon,
    checked,
    onChange,
    color = 'emerald',
}: {
    id: string
    label: string
    icon: React.ElementType
    checked: boolean
    onChange: (checked: boolean) => void
    color?: 'emerald' | 'blue' | 'amber'
}) {
    const colorMap = {
        emerald: {
            active: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
            icon: 'text-emerald-400',
        },
        blue: {
            active: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
            icon: 'text-blue-400',
        },
        amber: {
            active: 'bg-amber-500/20 border-amber-500/50 text-amber-400',
            icon: 'text-amber-400',
        },
    }
    const colors = colorMap[color]

    return (
        <button
            type="button"
            id={id}
            onClick={() => onChange(!checked)}
            className={`
                flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-200 w-full
                ${checked
                    ? colors.active
                    : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'
                }
            `}
        >
            <Icon className={`h-4 w-4 flex-shrink-0 ${checked ? colors.icon : ''}`} />
            <span className="text-sm font-medium">{label}</span>
            <div
                className={`
                    ml-auto h-5 w-9 rounded-full transition-all duration-200 relative flex-shrink-0
                    ${checked ? 'bg-current opacity-40' : 'bg-muted-foreground/20'}
                `}
            >
                <div
                    className={`
                        absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200 shadow-sm
                        ${checked ? 'left-[18px] bg-white' : 'left-0.5 bg-muted-foreground/50'}
                    `}
                />
            </div>
        </button>
    )
}

// ─── Main Component ─────────────────────────────────────

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

    async function handleAddSpace(data: {
        name: string
        types: string[]
        width?: number
        length?: number
        hasPower: boolean
        powerPhase?: string
        powerAmperage?: string
        powerConnection?: string
        powerDelivery?: string
        hasWater: boolean
        hasDrainage: boolean
        defaultDailyRate?: number
        sortOrder?: number
    }) {
        setLoading(true)
        try {
            await createSpace({
                locationId: selectedLocationId,
                ...data,
            })
            setAddDialogOpen(false)
            router.refresh()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to create space')
        } finally {
            setLoading(false)
        }
    }

    async function handleEditSpace(data: {
        name: string
        types: string[]
        width?: number
        length?: number
        hasPower: boolean
        powerPhase?: string
        powerAmperage?: string
        powerConnection?: string
        powerDelivery?: string
        hasWater: boolean
        hasDrainage: boolean
        defaultDailyRate?: number
        sortOrder?: number
    }) {
        if (!editingSpace) return
        setLoading(true)
        try {
            await updateSpace(editingSpace.id, {
                ...data,
                width: data.width ?? null,
                length: data.length ?? null,
                defaultDailyRate: data.defaultDailyRate ?? null,
                powerPhase: data.hasPower ? (data.powerPhase || null) : null,
                powerAmperage: data.hasPower ? (data.powerAmperage || null) : null,
                powerConnection: data.hasPower ? (data.powerConnection || null) : null,
                powerDelivery: data.hasPower ? (data.powerDelivery || null) : null,
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

    function getTypeLabel(value: string) {
        return SPACE_TYPES.find((t) => t.value === value)?.label || value
    }

    return (
        <TooltipProvider>
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
                                        <TableHead>Types</TableHead>
                                        <TableHead>Dimensions</TableHead>
                                        <TableHead>Utilities</TableHead>
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
                                                <div className="flex flex-wrap gap-1">
                                                    {space.types.map((t) => (
                                                        <Badge key={t} variant="outline" className="text-xs">
                                                            {getTypeLabel(t)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {space.width && space.length
                                                    ? `${space.width}m × ${space.length}m`
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    {space.hasPower && (
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <span className="inline-flex items-center gap-0.5 text-amber-500">
                                                                    <Zap className="h-3.5 w-3.5" />
                                                                    <span className="text-xs">
                                                                        {space.powerPhase === 'THREE_PHASE' ? '3P' : '1P'}
                                                                        {space.powerAmperage ? ` ${POWER_AMPERAGES.find(a => a.value === space.powerAmperage)?.label || space.powerAmperage}` : ''}
                                                                    </span>
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-[300px]">
                                                                <div className="space-y-0.5 text-xs">
                                                                    <div>{space.powerPhase === 'THREE_PHASE' ? 'Three Phase (400V)' : 'Single Phase (230V)'}</div>
                                                                    {space.powerAmperage && <div>{POWER_AMPERAGES.find(a => a.value === space.powerAmperage)?.label || space.powerAmperage}</div>}
                                                                    {space.powerConnection && <div>{POWER_CONNECTIONS.find(c => c.value === space.powerConnection)?.label || space.powerConnection}</div>}
                                                                    {space.powerDelivery && <div>{POWER_DELIVERIES.find(d => d.value === space.powerDelivery)?.label || space.powerDelivery}</div>}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    {space.hasWater && (
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <Droplets className="h-3.5 w-3.5 text-blue-500" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>Water Access</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    {space.hasDrainage && (
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <ArrowDownToLine className="h-3.5 w-3.5 text-emerald-500" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>Drainage Access</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    {!space.hasPower && !space.hasWater && !space.hasDrainage && (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </div>
                                            </TableCell>
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
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Space</DialogTitle>
                        </DialogHeader>
                        <SpaceForm onSubmit={handleAddSpace} submitLabel="Create Space" loading={loading} />
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
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Space</DialogTitle>
                        </DialogHeader>
                        {editingSpace && (
                            <SpaceForm
                                onSubmit={handleEditSpace}
                                defaultValues={editingSpace}
                                submitLabel="Save Changes"
                                loading={loading}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    )
}

// ─── Space Form ─────────────────────────────────────────

function SpaceForm({
    onSubmit,
    defaultValues,
    submitLabel,
    loading,
}: {
    onSubmit: (data: {
        name: string
        types: string[]
        width?: number
        length?: number
        hasPower: boolean
        powerPhase?: string
        powerAmperage?: string
        powerConnection?: string
        powerDelivery?: string
        hasWater: boolean
        hasDrainage: boolean
        defaultDailyRate?: number
        sortOrder?: number
    }) => void
    defaultValues?: SpaceData
    submitLabel: string
    loading: boolean
}) {
    const [selectedTypes, setSelectedTypes] = useState<string[]>(
        defaultValues?.types || ['GENERAL']
    )
    const [hasPower, setHasPower] = useState(defaultValues?.hasPower || false)
    const [powerPhase, setPowerPhase] = useState(defaultValues?.powerPhase || 'SINGLE_PHASE')
    const [powerAmperage, setPowerAmperage] = useState(defaultValues?.powerAmperage || '')
    const [powerConnection, setPowerConnection] = useState(defaultValues?.powerConnection || '')
    const [powerDelivery, setPowerDelivery] = useState(defaultValues?.powerDelivery || '')
    const [hasWater, setHasWater] = useState(defaultValues?.hasWater || false)
    const [hasDrainage, setHasDrainage] = useState(defaultValues?.hasDrainage || false)

    function toggleType(value: string) {
        setSelectedTypes((prev) => {
            if (prev.includes(value)) {
                if (prev.length === 1) return prev // Must have at least one
                return prev.filter((t) => t !== value)
            }
            return [...prev, value]
        })
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        onSubmit({
            name: form.get('name') as string,
            types: selectedTypes,
            width: form.get('width') ? parseFloat(form.get('width') as string) : undefined,
            length: form.get('length') ? parseFloat(form.get('length') as string) : undefined,
            hasPower,
            powerPhase: hasPower ? powerPhase : undefined,
            powerAmperage: hasPower && powerAmperage ? powerAmperage : undefined,
            powerConnection: hasPower && powerConnection ? powerConnection : undefined,
            powerDelivery: hasPower && powerDelivery ? powerDelivery : undefined,
            hasWater,
            hasDrainage,
            defaultDailyRate: form.get('defaultDailyRate')
                ? parseFloat(form.get('defaultDailyRate') as string)
                : undefined,
            sortOrder: form.get('sortOrder')
                ? parseInt(form.get('sortOrder') as string)
                : undefined,
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Name + Sort */}
            <div className="grid grid-cols-[1fr_100px] gap-4">
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
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                        type="number"
                        id="sortOrder"
                        name="sortOrder"
                        defaultValue={defaultValues?.sortOrder || 0}
                    />
                </div>
            </div>

            {/* Row 2: Types multi-select */}
            <div className="space-y-2">
                <Label>Suitable For <span className="text-muted-foreground font-normal">(select all that apply)</span></Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SPACE_TYPES.map((st) => (
                        <label
                            key={st.value}
                            className={`
                                flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-all duration-150
                                ${selectedTypes.includes(st.value)
                                    ? 'bg-primary/10 border-primary/50 ring-1 ring-primary/20'
                                    : 'bg-muted/20 border-border hover:bg-muted/40'
                                }
                            `}
                        >
                            <Checkbox
                                checked={selectedTypes.includes(st.value)}
                                onCheckedChange={() => toggleType(st.value)}
                                className="mt-0.5"
                            />
                            <div className="min-w-0">
                                <div className="text-sm font-medium leading-tight">{st.label}</div>
                                <div className="text-xs text-muted-foreground leading-tight mt-0.5">{st.description}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Row 3: Dimensions + Rate */}
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

            {/* Row 4: Utility toggles */}
            <div className="space-y-3">
                <Label className="flex items-center gap-1.5">
                    Utilities
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[260px]">
                            Specify what services are available at this space. This helps operators know what equipment they can bring.
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <UtilityToggle
                        id="hasPower"
                        label="Power"
                        icon={Zap}
                        checked={hasPower}
                        onChange={setHasPower}
                        color="amber"
                    />
                    <UtilityToggle
                        id="hasWater"
                        label="Water"
                        icon={Droplets}
                        checked={hasWater}
                        onChange={setHasWater}
                        color="blue"
                    />
                    <UtilityToggle
                        id="hasDrainage"
                        label="Drainage"
                        icon={ArrowDownToLine}
                        checked={hasDrainage}
                        onChange={setHasDrainage}
                        color="emerald"
                    />
                </div>
            </div>

            {/* Row 5: Power Detail (conditional) */}
            {hasPower && (
                <div className="space-y-4 ml-1 pl-4 border-l-2 border-amber-500/30">
                    {/* Phase */}
                    <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Phase</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {POWER_PHASES.map((phase) => (
                                <label
                                    key={phase.value}
                                    className={`
                                        flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150
                                        ${powerPhase === phase.value
                                            ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/20'
                                            : 'bg-muted/20 border-border hover:bg-muted/40'
                                        }
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name="powerPhaseRadio"
                                        value={phase.value}
                                        checked={powerPhase === phase.value}
                                        onChange={() => setPowerPhase(phase.value)}
                                        className="mt-1 accent-amber-500"
                                    />
                                    <div>
                                        <div className="text-sm font-medium">{phase.label}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                            {phase.description}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Amperage */}
                    <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Amperage</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                            {POWER_AMPERAGES.map((amp) => (
                                <label
                                    key={amp.value}
                                    className={`
                                        flex flex-col p-2.5 rounded-lg border cursor-pointer transition-all duration-150 text-center
                                        ${powerAmperage === amp.value
                                            ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/20'
                                            : 'bg-muted/20 border-border hover:bg-muted/40'
                                        }
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name="powerAmperageRadio"
                                        value={amp.value}
                                        checked={powerAmperage === amp.value}
                                        onChange={() => setPowerAmperage(amp.value)}
                                        className="sr-only"
                                    />
                                    <div className="text-sm font-medium">{amp.label}</div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{amp.description}</div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Connection Type */}
                    <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Connection Type</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {POWER_CONNECTIONS.map((conn) => (
                                <label
                                    key={conn.value}
                                    className={`
                                        flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150
                                        ${powerConnection === conn.value
                                            ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/20'
                                            : 'bg-muted/20 border-border hover:bg-muted/40'
                                        }
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name="powerConnectionRadio"
                                        value={conn.value}
                                        checked={powerConnection === conn.value}
                                        onChange={() => setPowerConnection(conn.value)}
                                        className="sr-only"
                                    />
                                    <div>
                                        <div className="text-sm font-medium">{conn.label}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{conn.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Method */}
                    <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Delivery Method</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {POWER_DELIVERIES.map((del) => (
                                <label
                                    key={del.value}
                                    className={`
                                        flex flex-col p-3 rounded-lg border cursor-pointer transition-all duration-150
                                        ${powerDelivery === del.value
                                            ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/20'
                                            : 'bg-muted/20 border-border hover:bg-muted/40'
                                        }
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name="powerDeliveryRadio"
                                        value={del.value}
                                        checked={powerDelivery === del.value}
                                        onChange={() => setPowerDelivery(del.value)}
                                        className="sr-only"
                                    />
                                    <div className="text-sm font-medium">{del.label}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{del.description}</div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <DialogFooter>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : submitLabel}
                </Button>
            </DialogFooter>
        </form>
    )
}
