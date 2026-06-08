'use client'

import { useState, useCallback, useTransition } from 'react'
import {
    startOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
    addWeeks,
    addMonths,
    addYears,
    addDays,
} from 'date-fns'
import { SpaceDiaryToolbar, DiaryViewMode } from './space-diary-toolbar'
import { DiaryWeeklyView } from './diary-weekly-view'
import { DiaryMonthlyView } from './diary-monthly-view'
import { DiaryAnnualView } from './diary-annual-view'
import { BookingModal } from './booking-modal'
import { getBookingsForDiary } from '@/actions/space-actions'
import { BookingStatus } from '@prisma/client'
import { cn } from '@/lib/utils'

interface SpaceData {
    id: string
    name: string
    types: string[]
    images: string[]
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
    patCertNumber?: string | null
    patExpiryDate?: Date | string | null
    equipmentList?: string | null
    operator?: { id: string; companyName: string; tradingName?: string | null } | null
}

interface SpaceDiaryGridProps {
    locationId: string
    locationName: string
    spaces: SpaceData[]
    initialBookings: BookingData[]
    initialWindowStart: Date
}

function getWindow(viewMode: DiaryViewMode, date: Date): { start: Date; end: Date } {
    switch (viewMode) {
        case 'weekly': {
            const s = startOfWeek(date, { weekStartsOn: 1 })
            const e = endOfWeek(date, { weekStartsOn: 1 })
            return { start: s, end: e }
        }
        case 'monthly': {
            const s = startOfMonth(date)
            const e = endOfMonth(date)
            return { start: s, end: e }
        }
        case 'annual': {
            const s = startOfYear(date)
            const e = endOfYear(date)
            return { start: s, end: e }
        }
    }
}

function navigateDate(viewMode: DiaryViewMode, date: Date, direction: -1 | 0 | 1): Date {
    if (direction === 0) return startOfDay(new Date())
    switch (viewMode) {
        case 'weekly': return addWeeks(date, direction)
        case 'monthly': return addMonths(date, direction)
        case 'annual': return addYears(date, direction)
    }
}

export function SpaceDiaryGrid({
    locationId,
    locationName,
    spaces,
    initialBookings,
    initialWindowStart,
}: SpaceDiaryGridProps) {
    const [viewMode, setViewMode] = useState<DiaryViewMode>('weekly')
    const [currentDate, setCurrentDate] = useState(startOfDay(initialWindowStart))
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

    const mapBookings = useCallback((raw: Awaited<ReturnType<typeof getBookingsForDiary>>): BookingData[] => {
        return raw.map((b) => ({
            ...b,
            startDate: new Date(b.startDate),
            endDate: new Date(b.endDate),
            dailyRate: b.dailyRate ? Number(b.dailyRate) : null,
            totalValue: b.totalValue ? Number(b.totalValue) : null,
        }))
    }, [])

    const fetchBookings = useCallback((date: Date, mode: DiaryViewMode) => {
        const { start, end } = getWindow(mode, date)
        startTransition(async () => {
            const fresh = await getBookingsForDiary(locationId, start, end)
            setBookings(mapBookings(fresh))
        })
    }, [locationId, mapBookings])

    function handleViewModeChange(mode: DiaryViewMode) {
        setViewMode(mode)
        fetchBookings(currentDate, mode)
    }

    function handleDateChange(date: Date) {
        setCurrentDate(date)
        fetchBookings(date, viewMode)
    }

    function handleNavigate(direction: -1 | 0 | 1) {
        const newDate = navigateDate(viewMode, currentDate, direction)
        setCurrentDate(newDate)
        fetchBookings(newDate, viewMode)
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

    function handleMonthClick(month: Date) {
        setViewMode('monthly')
        setCurrentDate(month)
        fetchBookings(month, 'monthly')
    }

    function refreshBookings() {
        fetchBookings(currentDate, viewMode)
    }

    // Compute days array for weekly view
    const weeklyWindow = getWindow('weekly', currentDate)
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weeklyWindow.start, i))

    return (
        <div className="space-y-4">
            <SpaceDiaryToolbar
                locationName={locationName}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                currentDate={currentDate}
                onDateChange={handleDateChange}
                onNavigate={handleNavigate}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                isPending={isPending}
            />

            <div className={cn(isPending && 'opacity-60 pointer-events-none transition-opacity')}>
                {viewMode === 'weekly' && (
                    <DiaryWeeklyView
                        spaces={spaces}
                        bookings={bookings}
                        days={weekDays}
                        windowStart={weeklyWindow.start}
                        activeFilter={activeFilter}
                        onCellClick={handleCellClick}
                        onBookingClick={handleBookingClick}
                    />
                )}

                {viewMode === 'monthly' && (
                    <DiaryMonthlyView
                        spaces={spaces}
                        bookings={bookings}
                        currentDate={currentDate}
                        activeFilter={activeFilter}
                        onCellClick={handleCellClick}
                        onBookingClick={handleBookingClick}
                    />
                )}

                {viewMode === 'annual' && (
                    <DiaryAnnualView
                        spaces={spaces}
                        bookings={bookings}
                        currentDate={currentDate}
                        activeFilter={activeFilter}
                        onMonthClick={handleMonthClick}
                        onBookingClick={handleBookingClick}
                    />
                )}
            </div>

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
