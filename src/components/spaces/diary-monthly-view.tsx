'use client'

import { format, isSameDay, startOfDay, differenceInDays, getDaysInMonth, startOfMonth, addDays } from 'date-fns'
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

interface DiaryMonthlyViewProps {
    spaces: SpaceData[]
    bookings: BookingData[]
    currentDate: Date
    activeFilter: BookingStatus | 'ALL'
    onCellClick: (space: SpaceData, date: Date) => void
    onBookingClick: (booking: BookingData, space: SpaceData) => void
}

function getBarColor(status: string) {
    switch (status) {
        case 'CONFIRMED': return 'bg-emerald-500/80 hover:bg-emerald-500 border-emerald-600'
        case 'UNCONFIRMED': return 'bg-amber-400/80 hover:bg-amber-400 border-amber-500'
        case 'CANCELLED': return 'bg-red-400/60 hover:bg-red-400/80 border-red-500 line-through opacity-50'
        default: return 'bg-gray-400/80 hover:bg-gray-400 border-gray-500'
    }
}

export function DiaryMonthlyView({
    spaces,
    bookings,
    currentDate,
    activeFilter,
    onCellClick,
    onBookingClick,
}: DiaryMonthlyViewProps) {
    const monthStart = startOfMonth(currentDate)
    const daysInMonth = getDaysInMonth(currentDate)
    const days = Array.from({ length: daysInMonth }, (_, i) => addDays(monthStart, i))
    const today = startOfDay(new Date())

    function getSpaceBookings(spaceId: string): BookingData[] {
        return bookings.filter((b) => {
            if (b.spaceId !== spaceId) return false
            if (activeFilter !== 'ALL' && b.status !== activeFilter) return false
            const bStart = startOfDay(new Date(b.startDate))
            const bEnd = startOfDay(new Date(b.endDate))
            const mStart = startOfDay(monthStart)
            const mEnd = startOfDay(addDays(monthStart, daysInMonth - 1))
            return bStart <= mEnd && bEnd >= mStart
        })
    }

    function getBarPosition(booking: BookingData) {
        const bStart = startOfDay(new Date(booking.startDate))
        const bEnd = startOfDay(new Date(booking.endDate))
        const mStart = startOfDay(monthStart)
        const mEnd = addDays(monthStart, daysInMonth - 1)
        const effectiveStart = bStart < mStart ? mStart : bStart
        const effectiveEnd = bEnd > mEnd ? mEnd : bEnd
        const startCol = differenceInDays(effectiveStart, mStart)
        const span = differenceInDays(effectiveEnd, effectiveStart) + 1
        return { startCol, span }
    }

    // Arrange bookings into non-overlapping rows
    function arrangeBookings(spaceBookings: BookingData[]): BookingData[][] {
        const rows: BookingData[][] = []
        const sorted = [...spaceBookings].sort((a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
        for (const booking of sorted) {
            const { startCol, span } = getBarPosition(booking)
            const endCol = startCol + span - 1
            let placed = false
            for (const row of rows) {
                const overlaps = row.some(existing => {
                    const ep = getBarPosition(existing)
                    const eEnd = ep.startCol + ep.span - 1
                    return startCol <= eEnd && endCol >= ep.startCol
                })
                if (!overlaps) {
                    row.push(booking)
                    placed = true
                    break
                }
            }
            if (!placed) rows.push([booking])
        }
        return rows
    }

    function hasBookingOnDay(spaceBookings: BookingData[], day: Date): boolean {
        const d = startOfDay(day)
        return spaceBookings.some(b => {
            const s = startOfDay(new Date(b.startDate))
            const e = startOfDay(new Date(b.endDate))
            return d >= s && d <= e
        })
    }

    return (
        <TooltipProvider delayDuration={200}>
            <div className="border rounded-lg overflow-x-auto">
                <div
                    className="grid"
                    style={{
                        gridTemplateColumns: `160px repeat(${daysInMonth}, minmax(28px, 1fr))`,
                        minWidth: `${160 + daysInMonth * 28}px`,
                    }}
                >
                    {/* Header: Space label */}
                    <div className="bg-muted/50 text-left text-xs font-medium text-muted-foreground p-2 border-b border-r sticky left-0 z-20" />

                    {/* Header: Day columns */}
                    {days.map((day) => {
                        const isToday = isSameDay(day, today)
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6
                        const isMonday = day.getDay() === 1 && day.getDate() > 1
                        return (
                            <div
                                key={day.toISOString()}
                                className={cn(
                                    'text-center text-[10px] font-medium py-1 border-b border-r',
                                    isToday ? 'bg-primary/15 text-primary font-bold' :
                                        isWeekend ? 'bg-muted/60 text-muted-foreground/60' :
                                            'bg-muted/50 text-muted-foreground',
                                    isMonday && 'border-l-2 border-l-muted-foreground/20'
                                )}
                            >
                                <div className="leading-tight">{format(day, 'EEEEE')}</div>
                                <div className="leading-tight">{day.getDate()}</div>
                            </div>
                        )
                    })}

                    {/* Space rows */}
                    {spaces.map((space) => {
                        const spaceBookings = getSpaceBookings(space.id)
                        const bookingRows = arrangeBookings(spaceBookings)
                        const rowCount = Math.max(1, bookingRows.length)
                        const rowHeight = rowCount * 22 + 12

                        return (
                            <div key={space.id} className="contents">
                                {/* Space name cell */}
                                <div
                                    className="text-xs font-medium p-2 border-b border-r sticky left-0 bg-background z-10 flex items-start"
                                    style={{ minHeight: `${rowHeight}px` }}
                                >
                                    <div className="flex items-center gap-1 relative group/name">
                                        <span className="cursor-default truncate max-w-[130px]">{space.name}</span>
                                        {space.images.length > 0 && (
                                            <ImageIcon className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                        )}
                                        {space.images.length > 0 && (
                                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 opacity-0 group-hover/name:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                                                <div className="bg-popover border rounded-lg shadow-xl overflow-hidden" style={{ width: '200px' }}>
                                                    <div className={`grid ${space.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-0`}>
                                                        {space.images.map((url, i) => (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img key={i} src={url} alt={`${space.name} ${i + 1}`} className="w-full h-20 object-cover" />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Day cells with booking bars overlaid */}
                                {days.map((day) => {
                                    const isToday = isSameDay(day, today)
                                    const isWeekend = day.getDay() === 0 || day.getDay() === 6
                                    const isMonday = day.getDay() === 1 && day.getDate() > 1
                                    const dayIdx = day.getDate() - 1
                                    const hasBooking = hasBookingOnDay(spaceBookings, day)

                                    // Render booking bars that START on this day
                                    const barsStartingHere = bookingRows.flatMap((row, rowIdx) =>
                                        row.filter(b => {
                                            const { startCol } = getBarPosition(b)
                                            return startCol === dayIdx
                                        }).map(b => ({ booking: b, rowIdx }))
                                    )

                                    return (
                                        <div
                                            key={day.toISOString()}
                                            className={cn(
                                                'border-b border-r relative',
                                                isToday && 'bg-primary/5',
                                                isWeekend && !isToday && 'bg-muted/20',
                                                isMonday && 'border-l-2 border-l-muted-foreground/20',
                                                !hasBooking && 'cursor-pointer hover:bg-muted/40 transition-colors'
                                            )}
                                            style={{ minHeight: `${rowHeight}px` }}
                                            onClick={() => {
                                                if (!hasBooking) onCellClick(space, day)
                                            }}
                                        >
                                            {barsStartingHere.map(({ booking, rowIdx }) => {
                                                const { span } = getBarPosition(booking)
                                                const displayName = booking.operator?.companyName || booking.companyName || ''
                                                const barLabel = span >= 3 ? displayName : ''

                                                return (
                                                    <Tooltip key={booking.id}>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                className={cn(
                                                                    'absolute text-[9px] text-white font-medium rounded-sm px-1 truncate cursor-pointer border transition-colors',
                                                                    getBarColor(booking.status)
                                                                )}
                                                                style={{
                                                                    top: `${4 + rowIdx * 22}px`,
                                                                    left: '1px',
                                                                    width: `calc(${span * 100}% - 2px)`,
                                                                    height: '18px',
                                                                    lineHeight: '16px',
                                                                    zIndex: 5,
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    onBookingClick(booking, space)
                                                                }}
                                                            >
                                                                {barLabel}
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="text-xs">
                                                            <div className="font-medium">{displayName || 'Unknown'}</div>
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
