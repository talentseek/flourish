'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { createBooking, updateBooking, updateBookingStatus } from '@/actions/space-actions'
import { searchOperators } from '@/actions/operator-actions'
import { BookingStatus } from '@prisma/client'
import { format } from 'date-fns'
import { Search, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react'
import { checkBookingCompliance } from '@/lib/compliance-utils'

interface OperatorResult {
    id: string
    companyName: string
    tradingName: string | null
    contactName: string | null
    contactEmail: string | null
    contactPhone: string | null
    types: string[]
    licenses: { type: string; endDate: Date | string; coverValue?: number | string | null }[]
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
    patCertNumber?: string | null
    patExpiryDate?: Date | string | null
    equipmentList?: string | null
    operator?: { id: string; companyName: string; tradingName?: string | null } | null
}

interface BookingModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mode: 'create' | 'edit'
    spaceName: string
    spaceId: string
    defaultDate?: Date
    defaultRate?: number | null
    booking?: BookingData | null
    onSuccess: () => void
}

export function BookingModal({
    open,
    onOpenChange,
    mode,
    spaceName,
    spaceId,
    defaultDate,
    defaultRate,
    booking,
    onSuccess,
}: BookingModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Operator picker state
    const [operatorSearch, setOperatorSearch] = useState('')
    const [operatorResults, setOperatorResults] = useState<OperatorResult[]>([])
    const [selectedOperator, setSelectedOperator] = useState<OperatorResult | null>(null)
    const [showResults, setShowResults] = useState(false)
    const [searching, setSearching] = useState(false)

    const initialStart = booking?.startDate
        ? format(new Date(booking.startDate), 'yyyy-MM-dd')
        : defaultDate
            ? format(defaultDate, 'yyyy-MM-dd')
            : format(new Date(), 'yyyy-MM-dd')

    const initialEnd = booking?.endDate
        ? format(new Date(booking.endDate), 'yyyy-MM-dd')
        : initialStart

    // Pre-populate operator on edit
    useEffect(() => {
        if (mode === 'edit' && booking?.operator) {
            setSelectedOperator({
                id: booking.operator.id,
                companyName: booking.operator.companyName,
                tradingName: booking.operator.tradingName || null,
                contactName: null,
                contactEmail: null,
                contactPhone: null,
                types: [],
                licenses: []
            })
            setOperatorSearch(booking.operator.companyName)
        } else if (mode === 'create') {
            setSelectedOperator(null)
            setOperatorSearch('')
        }
    }, [mode, booking, open])

    const doSearch = useCallback(async (q: string) => {
        if (q.length < 2) {
            setOperatorResults([])
            return
        }
        setSearching(true)
        try {
            const results = await searchOperators(q)
            setOperatorResults(results as unknown as OperatorResult[])
            setShowResults(true)
        } catch {
            setOperatorResults([])
        } finally {
            setSearching(false)
        }
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => doSearch(operatorSearch), 300)
        return () => clearTimeout(timer)
    }, [operatorSearch, doSearch])

    function hasValidPLI(op: OperatorResult) {
        return op.licenses.some(
            l => l.type === 'PUBLIC_LIABILITY_INSURANCE' && new Date(l.endDate) > new Date()
        )
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!selectedOperator) {
            setError('Please select an operator')
            return
        }
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)

        try {
            if (mode === 'create') {
                await createBooking({
                    spaceId,
                    operatorId: selectedOperator.id,
                    startDate: formData.get('startDate') as string,
                    endDate: formData.get('endDate') as string,
                    brand: (formData.get('brand') as string) || undefined,
                    setupDetail: (formData.get('setupDetail') as string) || undefined,
                    description: (formData.get('description') as string) || undefined,
                    dailyRate: formData.get('dailyRate')
                        ? parseFloat(formData.get('dailyRate') as string)
                        : undefined,
                    notes: (formData.get('notes') as string) || undefined,
                    patCertNumber: (formData.get('patCertNumber') as string) || undefined,
                    patExpiryDate: (formData.get('patExpiryDate') as string) || undefined,
                    equipmentList: (formData.get('equipmentList') as string) || undefined,
                })
            } else if (booking) {
                await updateBooking(booking.id, {
                    operatorId: selectedOperator.id,
                    startDate: formData.get('startDate') as string,
                    endDate: formData.get('endDate') as string,
                    brand: (formData.get('brand') as string) || undefined,
                    setupDetail: (formData.get('setupDetail') as string) || undefined,
                    description: (formData.get('description') as string) || undefined,
                    dailyRate: formData.get('dailyRate')
                        ? parseFloat(formData.get('dailyRate') as string)
                        : undefined,
                    notes: (formData.get('notes') as string) || undefined,
                    patCertNumber: (formData.get('patCertNumber') as string) || undefined,
                    patExpiryDate: (formData.get('patExpiryDate') as string) || undefined,
                    equipmentList: (formData.get('equipmentList') as string) || undefined,
                })
            }

            onSuccess()
            onOpenChange(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    async function handleStatusChange(status: BookingStatus) {
        if (!booking) return
        setLoading(true)
        try {
            await updateBookingStatus(booking.id, status)
            onSuccess()
            onOpenChange(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'New Booking' : `Edit Booking ${booking?.reference}`}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">{spaceName}</p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Operator Picker */}
                    <div className="space-y-2">
                        <Label>Operator *</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search operators..."
                                value={operatorSearch}
                                onChange={e => {
                                    setOperatorSearch(e.target.value)
                                    setSelectedOperator(null)
                                }}
                                onFocus={() => operatorSearch.length >= 2 && setShowResults(true)}
                                className="pl-9"
                            />
                            {searching && (
                                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">Searching...</span>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {showResults && operatorResults.length > 0 && !selectedOperator && (
                            <div className="border rounded-md max-h-48 overflow-y-auto bg-background shadow-md">
                                {operatorResults.map(op => (
                                    <button
                                        key={op.id}
                                        type="button"
                                        className="w-full text-left px-3 py-2 hover:bg-muted flex items-center justify-between text-sm"
                                        onClick={() => {
                                            setSelectedOperator(op)
                                            setOperatorSearch(op.companyName)
                                            setShowResults(false)
                                        }}
                                    >
                                        <div>
                                            <span className="font-medium">{op.companyName}</span>
                                            {op.tradingName && <span className="text-muted-foreground ml-1">(t/a {op.tradingName})</span>}
                                        </div>
                                        {hasValidPLI(op) ? (
                                            <ShieldCheck className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <ShieldAlert className="h-4 w-4 text-red-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {showResults && operatorResults.length === 0 && operatorSearch.length >= 2 && !searching && !selectedOperator && (
                            <p className="text-xs text-muted-foreground p-2">No operators found. Add one at /admin/operators first.</p>
                        )}

                        {/* Selected Operator Card */}
                        {selectedOperator && (
                            <div className="border rounded-md p-3 bg-muted/30 flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-sm">{selectedOperator.companyName}</div>
                                    {selectedOperator.contactName && (
                                        <div className="text-xs text-muted-foreground">
                                            {selectedOperator.contactName}
                                            {selectedOperator.contactEmail && ` · ${selectedOperator.contactEmail}`}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {hasValidPLI(selectedOperator) ? (
                                        <Badge className="bg-green-600 text-xs gap-1"><ShieldCheck className="h-3 w-3" />PLI Valid</Badge>
                                    ) : (
                                        <Badge variant="destructive" className="text-xs gap-1"><ShieldAlert className="h-3 w-3" />No PLI</Badge>
                                    )}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedOperator(null)
                                            setOperatorSearch('')
                                        }}
                                    >
                                        Change
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Compliance warnings */}
                        {selectedOperator && selectedOperator.types.length > 0 && (() => {
                            const compliance = checkBookingCompliance(selectedOperator, {
                                patCertNumber: (document.getElementById('patCertNumber') as HTMLInputElement)?.value || null,
                                patExpiryDate: (document.getElementById('patExpiryDate') as HTMLInputElement)?.value || null,
                            })
                            if (compliance.canConfirm) return null
                            return (
                                <div className="border border-amber-300 bg-amber-50 rounded-md p-3 space-y-1">
                                    <div className="flex items-center gap-2 text-amber-800 font-medium text-sm">
                                        <AlertTriangle className="h-4 w-4" />
                                        Compliance issues — booking cannot be confirmed
                                    </div>
                                    <ul className="text-xs text-amber-700 list-disc pl-5 space-y-0.5">
                                        {compliance.issues.map((issue, i) => (
                                            <li key={i}>{issue}</li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        })()}
                    </div>

                    {/* Dates Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date *</Label>
                            <Input type="date" id="startDate" name="startDate" defaultValue={initialStart} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date *</Label>
                            <Input type="date" id="endDate" name="endDate" defaultValue={initialEnd} required />
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="brand">Brand</Label>
                            <Input
                                id="brand"
                                name="brand"
                                defaultValue={booking?.brand || ''}
                                placeholder="e.g. Sky, Tesla"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dailyRate">Daily Rate (£)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                id="dailyRate"
                                name="dailyRate"
                                defaultValue={
                                    booking?.dailyRate != null
                                        ? Number(booking.dailyRate)
                                        : defaultRate != null
                                            ? Number(defaultRate)
                                            : ''
                                }
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="setupDetail">Setup Detail</Label>
                        <Input
                            id="setupDetail"
                            name="setupDetail"
                            defaultValue={booking?.setupDetail || ''}
                            placeholder="Physical setup requirements"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={booking?.description || ''}
                            placeholder="Promotion description..."
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            defaultValue={booking?.notes || ''}
                            placeholder="Internal notes..."
                            rows={2}
                        />
                    </div>

                    {/* PAT Testing Section */}
                    <div className="border rounded-md p-4 space-y-3 bg-muted/20">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                            ⚡ PAT Testing
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="patCertNumber">Certificate Number</Label>
                                <Input
                                    id="patCertNumber"
                                    name="patCertNumber"
                                    defaultValue={booking?.patCertNumber || ''}
                                    placeholder="e.g. PAT-2026-001"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="patExpiryDate">Expiry Date</Label>
                                <Input
                                    type="date"
                                    id="patExpiryDate"
                                    name="patExpiryDate"
                                    defaultValue={
                                        booking?.patExpiryDate
                                            ? format(new Date(booking.patExpiryDate), 'yyyy-MM-dd')
                                            : ''
                                    }
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="equipmentList">Equipment List</Label>
                            <Textarea
                                id="equipmentList"
                                name="equipmentList"
                                defaultValue={booking?.equipmentList || ''}
                                placeholder="List all electrical equipment (e.g. 2x kettles, 1x coffee machine, 1x card reader)..."
                                rows={2}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            PAT certificate is required to confirm this booking.
                        </p>
                    </div>

                    {booking?.totalValue != null && (
                        <div className="text-sm text-muted-foreground">
                            Total Value: £{Number(booking.totalValue).toFixed(2)}
                        </div>
                    )}

                    {error && (
                        <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
                    )}

                    <DialogFooter className="flex items-center justify-between gap-2">
                        {mode === 'edit' && booking && (
                            <div className="flex gap-2 mr-auto">
                                {booking.status !== 'CONFIRMED' && (() => {
                                    const compliance = selectedOperator && selectedOperator.types.length > 0
                                        ? checkBookingCompliance(selectedOperator, {
                                            patCertNumber: booking.patCertNumber,
                                            patExpiryDate: booking.patExpiryDate,
                                        })
                                        : { canConfirm: false, issues: ['Operator data not loaded'] }
                                    return (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleStatusChange('CONFIRMED')}
                                            disabled={loading || !compliance.canConfirm}
                                            className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                                            title={compliance.canConfirm ? 'Confirm this booking' : compliance.issues.join(', ')}
                                        >
                                            Confirm
                                        </Button>
                                    )
                                })()}
                                {booking.status !== 'CANCELLED' && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusChange('CANCELLED')}
                                        disabled={loading}
                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                        Cancel Booking
                                    </Button>
                                )}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                Close
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading
                                    ? 'Saving...'
                                    : mode === 'create'
                                        ? 'Create Booking'
                                        : 'Save Changes'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
