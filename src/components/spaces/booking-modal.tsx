'use client'

import { useState } from 'react'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createBooking, updateBooking, updateBookingStatus } from '@/actions/space-actions'
import { BookingStatus, LicenseType } from '@prisma/client'
import { format } from 'date-fns'

interface BookingData {
    id: string
    reference: string
    spaceId: string
    startDate: Date
    endDate: Date
    status: BookingStatus
    licenseType: LicenseType
    companyName: string
    contactName?: string | null
    contactEmail?: string | null
    contactPhone?: string | null
    brand?: string | null
    setupDetail?: string | null
    description?: string | null
    dailyRate?: number | null
    totalValue?: number | null
    notes?: string | null
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

    const initialStart = booking?.startDate
        ? format(new Date(booking.startDate), 'yyyy-MM-dd')
        : defaultDate
            ? format(defaultDate, 'yyyy-MM-dd')
            : format(new Date(), 'yyyy-MM-dd')

    const initialEnd = booking?.endDate
        ? format(new Date(booking.endDate), 'yyyy-MM-dd')
        : initialStart

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)

        try {
            if (mode === 'create') {
                await createBooking({
                    spaceId,
                    startDate: formData.get('startDate') as string,
                    endDate: formData.get('endDate') as string,
                    companyName: formData.get('companyName') as string,
                    contactName: (formData.get('contactName') as string) || undefined,
                    contactEmail: (formData.get('contactEmail') as string) || undefined,
                    contactPhone: (formData.get('contactPhone') as string) || undefined,
                    licenseType: formData.get('licenseType') as LicenseType,
                    brand: (formData.get('brand') as string) || undefined,
                    setupDetail: (formData.get('setupDetail') as string) || undefined,
                    description: (formData.get('description') as string) || undefined,
                    dailyRate: formData.get('dailyRate')
                        ? parseFloat(formData.get('dailyRate') as string)
                        : undefined,
                    notes: (formData.get('notes') as string) || undefined,
                })
            } else if (booking) {
                await updateBooking(booking.id, {
                    startDate: formData.get('startDate') as string,
                    endDate: formData.get('endDate') as string,
                    companyName: formData.get('companyName') as string,
                    contactName: (formData.get('contactName') as string) || undefined,
                    contactEmail: (formData.get('contactEmail') as string) || undefined,
                    contactPhone: (formData.get('contactPhone') as string) || undefined,
                    licenseType: formData.get('licenseType') as LicenseType,
                    brand: (formData.get('brand') as string) || undefined,
                    setupDetail: (formData.get('setupDetail') as string) || undefined,
                    description: (formData.get('description') as string) || undefined,
                    dailyRate: formData.get('dailyRate')
                        ? parseFloat(formData.get('dailyRate') as string)
                        : undefined,
                    notes: (formData.get('notes') as string) || undefined,
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
                    {/* Dates Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date *</Label>
                            <Input
                                type="date"
                                id="startDate"
                                name="startDate"
                                defaultValue={initialStart}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date *</Label>
                            <Input
                                type="date"
                                id="endDate"
                                name="endDate"
                                defaultValue={initialEnd}
                                required
                            />
                        </div>
                    </div>

                    {/* Company & Contact */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name *</Label>
                            <Input
                                id="companyName"
                                name="companyName"
                                defaultValue={booking?.companyName || ''}
                                placeholder="e.g. Scottish Power"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactName">Contact Name</Label>
                            <Input
                                id="contactName"
                                name="contactName"
                                defaultValue={booking?.contactName || ''}
                                placeholder="John Smith"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">Email</Label>
                            <Input
                                type="email"
                                id="contactEmail"
                                name="contactEmail"
                                defaultValue={booking?.contactEmail || ''}
                                placeholder="john@company.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">Phone</Label>
                            <Input
                                id="contactPhone"
                                name="contactPhone"
                                defaultValue={booking?.contactPhone || ''}
                                placeholder="07..."
                            />
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="licenseType">License Type *</Label>
                            <Select
                                name="licenseType"
                                defaultValue={booking?.licenseType || 'PROMOTION'}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PROMOTION">Promotion</SelectItem>
                                    <SelectItem value="TENANCY">Tenancy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="brand">Brand</Label>
                            <Input
                                id="brand"
                                name="brand"
                                defaultValue={booking?.brand || ''}
                                placeholder="e.g. Sky, Tesla"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                        <div className="space-y-2">
                            <Label>Total Value</Label>
                            <div className="text-sm text-muted-foreground pt-2">
                                {booking?.totalValue != null
                                    ? `£${Number(booking.totalValue).toFixed(2)}`
                                    : 'Calculated on save'}
                            </div>
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

                    {error && (
                        <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
                    )}

                    <DialogFooter className="flex items-center justify-between gap-2">
                        {mode === 'edit' && booking && (
                            <div className="flex gap-2 mr-auto">
                                {booking.status !== 'CONFIRMED' && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusChange('CONFIRMED')}
                                        disabled={loading}
                                        className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                                    >
                                        Confirm
                                    </Button>
                                )}
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
