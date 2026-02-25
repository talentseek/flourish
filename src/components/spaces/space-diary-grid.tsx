'use client'

import { useState, useCallback, useTransition } from 'react'
import { format, addDays, startOfDay, differenceInDays, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BookingCard } from './booking-card'
import { BookingModal } from './booking-modal'
import { SpaceDiaryToolbar } from './space-diary-toolbar'
import { getBookingsForDiary } from '@/actions/space-actions'
import { BookingStatus, LicenseType, SpaceType } from '@prisma/client'
import { cn } from '@/lib/utils'

// --- Types ---

interface SpaceData {
    id: string
    name: string
    type: SpaceType
    defaultDailyRate: number | null
}

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

interface SpaceDiaryGridProps {
    locationId: string
    locationName: string
    spaces: SpaceData[]
    initialBookings: BookingData[]
    initialWindowStart: Date
}

const DAYS_VISIBLE = 10

export function SpaceDiaryGrid({
    locationId,
    locationName,
    spaces,
    initialBookings,
    initialWindowStart,
}: SpaceDiaryGridProps) {
    const [windowStart, setWindowStart] = useState(startOfDay(initialWindowStart))
    const [bookings, setBookings] = useState<BookingData[]>(initialBookings)
    const [activeFilter, setActiveFilter] = useState<BookingStatus | 'ALL'>('ALL')
    const [isPending, startTransition] = useTransition()

    // Modal state
    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
    const [selectedSpaceId, setSelectedSpaceId] = useState<string>('')
    const [selectedSpaceName, setSelectedSpaceName] = useState('')
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [selectedDefaultRate, setSelectedDefaultRate] = useState<number | null>(null)
    const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null)

    const windowEnd = addDays(windowStart, DAYS_VISIBLE - 1)
    const days = Array.from({ length: DAYS_VISIBLE }, (_, i) => addDays(windowStart, i))

    const refreshBookings = useCallback(() => {
        startTransition(async () => {
            const fresh = await getBookingsForDiary(
                locationId,
                windowStart,
                addDays(windowStart, DAYS_VISIBLE - 1)
            )
            setBookings(
                fresh.map((b) => ({
                    ...b,
                    startDate: new Date(b.startDate),
                    endDate: new Date(b.endDate),
                    dailyRate: b.dailyRate ? Number(b.dailyRate) : null,
                    totalValue: b.totalValue ? Number(b.totalValue) : null,
                }))
            )
        })
    }, [locationId, windowStart])

    function navigateDays(offset: number) {
        const newStart = addDays(windowStart, offset)
        setWindowStart(newStart)
        startTransition(async () => {
            const newEnd = addDays(newStart, DAYS_VISIBLE - 1)
            const fresh = await getBookingsForDiary(locationId, newStart, newEnd)
            setBookings(
                fresh.map((b) => ({
                    ...b,
                    startDate: new Date(b.startDate),
                    endDate: new Date(b.endDate),
                    dailyRate: b.dailyRate ? Number(b.dailyRate) : null,
                    totalValue: b.totalValue ? Number(b.totalValue) : null,
                }))
            )
        })
    }

    function goToToday() {
        const today = startOfDay(new Date())
        setWindowStart(today)
        startTransition(async () => {
            const end = addDays(today, DAYS_VISIBLE - 1)
            const fresh = await getBookingsForDiary(locationId, today, end)
            setBookings(
                fresh.map((b) => ({
                    ...b,
                    startDate: new Date(b.startDate),
                    endDate: new Date(b.endDate),
                    dailyRate: b.dailyRate ? Number(b.dailyRate) : null,
                    totalValue: b.totalValue ? Number(b.totalValue) : null,
                }))
            )
        })
    }

    function handleCellClick(space: SpaceData, date: Date) {
        setSelectedSpaceId(space.id)
        setSelectedSpaceName(space.name)
        setSelectedDate(date)
        setSelectedDefaultRate(space.defaultDailyRate)
        setSelectedBooking(null)
        setModalMode('create')
        setModalOpen(true)
    }

    function handleBookingClick(booking: BookingData, space: SpaceData) {
        setSelectedSpaceId(space.id)
        setSelectedSpaceName(space.name)
        setSelectedDate(new Date(booking.startDate))
        setSelectedDefaultRate(space.defaultDailyRate)
        setSelectedBooking(booking)
        setModalMode('edit')
        setModalOpen(true)
    }

    // Get bookings for a specific space on a specific day
    function getBookingsForCell(spaceId: string, date: Date): BookingData[] {
        return bookings.filter((b) => {
            if (b.spaceId !== spaceId) return false
            if (activeFilter !== 'ALL' && b.status !== activeFilter) return false
            const start = startOfDay(new Date(b.startDate))
            const end = startOfDay(new Date(b.endDate))
            const day = startOfDay(date)
            return day >= start && day <= end
        })
    }

    // Check if a booking starts on this day (to render the card)
    function isBookingStart(booking: BookingData, date: Date): boolean {
        const bStart = startOfDay(new Date(booking.startDate))
        const wStart = startOfDay(windowStart)
        // Show at the start of the booking, or at the start of the window if booking started before
        return isSameDay(bStart, date) || (bStart < wStart && isSameDay(date, wStart))
    }

    // Calculate how many columns a booking spans from a given start day
    function getBookingSpan(booking: BookingData, fromDate: Date): number {
        const bEnd = startOfDay(new Date(booking.endDate))
        const lastVisible = addDays(windowStart, DAYS_VISIBLE - 1)
        const effectiveEnd = bEnd < lastVisible ? bEnd : lastVisible
        return differenceInDays(effectiveEnd, fromDate) + 1
    }

    return (
        <div className="space-y-4">
            <SpaceDiaryToolbar
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                locationName={locationName}
            />

            {/* Date Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigateDays(-DAYS_VISIBLE)} disabled={isPending}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToToday} disabled={isPending}>
                        <CalendarDays className="h-4 w-4 mr-1" />
                        Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => navigateDays(DAYS_VISIBLE)} disabled={isPending}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                    {format(windowStart, 'dd MMM yyyy')} — {format(windowEnd, 'dd MMM yyyy')}
                </span>
            </div>

            {/* Grid */}
            <div className={cn(
                'border rounded-lg overflow-x-auto',
                isPending && 'opacity-60 pointer-events-none'
            )}>
                <table className="w-full min-w-[800px] border-collapse">
                    <thead>
                        <tr className="bg-muted/50">
                            <th className="text-left text-xs font-medium text-muted-foreground p-2 border-b border-r w-[160px] sticky left-0 bg-muted/50 z-10">
                                Space
                            </th>
                            {days.map((day) => (
                                <th
                                    key={day.toISOString()}
                                    className={cn(
                                        'text-center text-xs font-medium p-2 border-b border-r min-w-[100px]',
                                        isSameDay(day, new Date())
                                            ? 'bg-primary/10 text-primary font-bold'
                                            : 'text-muted-foreground'
                                    )}
                                >
                                    <div>{format(day, 'EEE')}</div>
                                    <div>{format(day, 'dd/MM')}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {spaces.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={DAYS_VISIBLE + 1}
                                    className="text-center text-muted-foreground py-12"
                                >
                                    No spaces configured. Ask an admin to add spaces for this location.
                                </td>
                            </tr>
                        ) : (
                            spaces.map((space) => (
                                <tr key={space.id} className="group">
                                    <td className="text-xs font-medium p-2 border-b border-r sticky left-0 bg-background z-10">
                                        <div className="flex items-center justify-between">
                                            <span>{space.name}</span>
                                            <span className="text-[10px] text-muted-foreground font-normal">
                                                {space.type}
                                            </span>
                                        </div>
                                    </td>
                                    {days.map((day) => {
                                        const cellBookings = getBookingsForCell(space.id, day)
                                        const startingBookings = cellBookings.filter((b) =>
                                            isBookingStart(b, day)
                                        )
                                        const hasBookings = cellBookings.length > 0
                                        const isToday = isSameDay(day, new Date())

                                        return (
                                            <td
                                                key={day.toISOString()}
                                                className={cn(
                                                    'border-b border-r p-0.5 h-[44px] relative',
                                                    isToday && 'bg-primary/5',
                                                    !hasBookings && 'cursor-pointer hover:bg-muted/40 transition-colors'
                                                )}
                                                onClick={() => {
                                                    if (!hasBookings) handleCellClick(space, day)
                                                }}
                                            >
                                                {startingBookings.map((booking) => {
                                                    const span = getBookingSpan(booking, day)
                                                    return (
                                                        <div
                                                            key={booking.id}
                                                            className="absolute inset-y-0.5 left-0.5 z-10"
                                                            style={{
                                                                width: `calc(${span * 100}% - 4px)`,
                                                            }}
                                                        >
                                                            <BookingCard
                                                                id={booking.id}
                                                                reference={booking.reference}
                                                                companyName={booking.companyName}
                                                                brand={booking.brand}
                                                                status={booking.status}
                                                                startDate={booking.startDate}
                                                                endDate={booking.endDate}
                                                                dailyRate={booking.dailyRate}
                                                                onClick={() => handleBookingClick(booking, space)}
                                                            />
                                                        </div>
                                                    )
                                                })}
                                                {!hasBookings && (
                                                    <div className="flex items-center justify-center h-full opacity-0 group-hover:opacity-30 transition-opacity">
                                                        <Plus className="h-3 w-3" />
                                                    </div>
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Booking Modal */}
            <BookingModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                mode={modalMode}
                spaceName={selectedSpaceName}
                spaceId={selectedSpaceId}
                defaultDate={selectedDate}
                defaultRate={selectedDefaultRate}
                booking={selectedBooking}
                onSuccess={refreshBookings}
            />
        </div>
    )
}
