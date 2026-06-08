'use client'

import { format, startOfDay, startOfMonth, endOfMonth, differenceInDays, getDaysInMonth, addMonths, isSameMonth } from 'date-fns'
import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BookingStatus } from '@prisma/client'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

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
    operator?: { id: string; companyName: string; tradingName?: string | null } | null
}

interface DiaryAnnualViewProps {
    spaces: SpaceData[]
    bookings: BookingData[]
    currentDate: Date
    activeFilter: BookingStatus | 'ALL'
    onMonthClick: (date: Date) => void
    onBookingClick: (booking: BookingData, space: SpaceData) => void
}

function getBarColor(status: string) {
    switch (status) {
        case 'CONFIRMED': return 'bg-emerald-500 hover:bg-emerald-600'
        case 'UNCONFIRMED': return 'bg-amber-400 hover:bg-amber-500'
        case 'CANCELLED': return 'bg-red-400/50 hover:bg-red-400/70'
        default: return 'bg-gray-400 hover:bg-gray-500'
    }
}

export function DiaryAnnualView({
    spaces,
    bookings,
    currentDate,
    activeFilter,
    onMonthClick,
    onBookingClick,
}: DiaryAnnualViewProps) {
    const year = currentDate.getFullYear()
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1))
    const today = startOfDay(new Date())

    function getSpaceBookings(spaceId: string): BookingData[] {
        return bookings.filter((b) => {
            if (b.spaceId !== spaceId) return false
            if (activeFilter !== 'ALL' && b.status !== activeFilter) return false
            const bStart = startOfDay(new Date(b.startDate))
            const bEnd = startOfDay(new Date(b.endDate))
            const yearStart = new Date(year, 0, 1)
            const yearEnd = new Date(year, 11, 31)
            return bStart <= yearEnd && bEnd >= yearStart
        })
    }

    // For a booking within a given month, return the proportional position
    function getBarInMonth(booking: BookingData, month: Date) {
        const mStart = startOfMonth(month)
        const mEnd = endOfMonth(month)
        const daysInM = getDaysInMonth(month)

        const bStart = startOfDay(new Date(booking.startDate))
        const bEnd = startOfDay(new Date(booking.endDate))

        // Check if booking overlaps this month
        if (bStart > mEnd || bEnd < mStart) return null

        const effectiveStart = bStart < mStart ? mStart : bStart
        const effectiveEnd = bEnd > mEnd ? mEnd : bEnd

        const startDay = differenceInDays(effectiveStart, mStart)
        const span = differenceInDays(effectiveEnd, effectiveStart) + 1

        const leftPct = (startDay / daysInM) * 100
        const widthPct = (span / daysInM) * 100

        return { leftPct, widthPct }
    }

    // Arrange bookings into rows within a month for a space
    function arrangeBookingsForMonth(spaceBookings: BookingData[], month: Date): { booking: BookingData; rowIdx: number }[] {
        const result: { booking: BookingData; rowIdx: number }[] = []
        const rows: { endDay: number }[][] = []
        const mStart = startOfMonth(month)
        const mEnd = endOfMonth(month)
        const daysInM = getDaysInMonth(month)

        const relevant = spaceBookings
            .filter(b => {
                const bStart = startOfDay(new Date(b.startDate))
                const bEnd = startOfDay(new Date(b.endDate))
                return bStart <= mEnd && bEnd >= mStart
            })
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

        for (const booking of relevant) {
            const bStart = startOfDay(new Date(booking.startDate))
            const bEnd = startOfDay(new Date(booking.endDate))
            const effectiveStart = bStart < mStart ? mStart : bStart
            const effectiveEnd = bEnd > mEnd ? mEnd : bEnd
            const startDay = differenceInDays(effectiveStart, mStart)
            const endDay = differenceInDays(effectiveEnd, mStart)

            let placed = false
            for (let r = 0; r < rows.length; r++) {
                const overlaps = rows[r].some(e => startDay <= e.endDay && endDay >= (e.endDay - (e.endDay - startDay)))
                if (!overlaps) {
                    const overlapCheck = rows[r].every(e => startDay > e.endDay)
                    if (overlapCheck) {
                        rows[r].push({ endDay })
                        result.push({ booking, rowIdx: r })
                        placed = true
                        break
                    }
                }
            }
            if (!placed) {
                rows.push([{ endDay }])
                result.push({ booking, rowIdx: rows.length - 1 })
            }
        }
        return result
    }

    return (
        <TooltipProvider delayDuration={200}>
            <div className="border rounded-lg overflow-x-auto">
                <div
                    className="grid"
                    style={{
                        gridTemplateColumns: '160px repeat(12, minmax(80px, 1fr))',
                        minWidth: '1120px',
                    }}
                >
                    {/* Header */}
                    <div className="bg-muted/50 text-left text-xs font-medium text-muted-foreground p-2 border-b border-r sticky left-0 z-20">
                        Space
                    </div>
                    {months.map((month) => {
                        const isCurrentMonth = isSameMonth(month, today)
                        return (
                            <div
                                key={month.toISOString()}
                                className={cn(
                                    'text-center text-xs font-medium p-2 border-b border-r cursor-pointer hover:bg-muted/80 transition-colors',
                                    isCurrentMonth
                                        ? 'bg-primary/10 text-primary font-bold'
                                        : 'bg-muted/50 text-muted-foreground'
                                )}
                                onClick={() => onMonthClick(month)}
                            >
                                {format(month, 'MMM')}
                            </div>
                        )
                    })}

                    {/* Space rows */}
                    {spaces.map((space) => {
                        const spaceBookings = getSpaceBookings(space.id)

                        // Calculate max row count across all months
                        let maxRows = 1
                        for (const month of months) {
                            const arranged = arrangeBookingsForMonth(spaceBookings, month)
                            const rowCount = arranged.length > 0 ? Math.max(...arranged.map(a => a.rowIdx)) + 1 : 0
                            maxRows = Math.max(maxRows, rowCount)
                        }
                        const rowHeight = Math.max(32, maxRows * 16 + 12)

                        return (
                            <div key={space.id} className="contents">
                                {/* Space name */}
                                <div
                                    className="text-xs font-medium p-2 border-b border-r sticky left-0 bg-background z-10 flex items-start"
                                    style={{ minHeight: `${rowHeight}px` }}
                                >
                                    <div className="flex items-center gap-1 relative group/name">
                                        <span className="cursor-default truncate max-w-[130px]">{space.name}</span>
                                        {space.images.length > 0 && (
                                            <ImageIcon className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                        )}
                                    </div>
                                </div>

                                {/* Month cells */}
                                {months.map((month) => {
                                    const isCurrentMonth = isSameMonth(month, today)
                                    const arranged = arrangeBookingsForMonth(spaceBookings, month)

                                    return (
                                        <div
                                            key={month.toISOString()}
                                            className={cn(
                                                'border-b border-r relative cursor-pointer hover:bg-muted/30 transition-colors',
                                                isCurrentMonth && 'bg-primary/5'
                                            )}
                                            style={{ minHeight: `${rowHeight}px` }}
                                            onClick={() => onMonthClick(month)}
                                        >
                                            {arranged.map(({ booking, rowIdx }) => {
                                                const bar = getBarInMonth(booking, month)
                                                if (!bar) return null
                                                const displayName = booking.operator?.companyName || booking.companyName || 'Unknown'

                                                return (
                                                    <Tooltip key={booking.id}>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                className={cn(
                                                                    'absolute rounded-sm transition-colors',
                                                                    getBarColor(booking.status)
                                                                )}
                                                                style={{
                                                                    top: `${4 + rowIdx * 16}px`,
                                                                    left: `${bar.leftPct}%`,
                                                                    width: `${Math.max(bar.widthPct, 4)}%`,
                                                                    height: '12px',
                                                                    zIndex: 5,
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    onBookingClick(booking, space)
                                                                }}
                                                            />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="text-xs">
                                                            <div className="font-medium">{displayName}</div>
                                                            <div className="text-muted-foreground">
                                                                {format(new Date(booking.startDate), 'dd MMM')} – {format(new Date(booking.endDate), 'dd MMM yyyy')}
                                                            </div>
                                                            <div className="text-muted-foreground capitalize">{booking.status.toLowerCase()}</div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )
                                            })}
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>
        </TooltipProvider>
    )
}
