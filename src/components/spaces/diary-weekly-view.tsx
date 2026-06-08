'use client'

import { format, isSameDay, startOfDay, addDays, differenceInDays } from 'date-fns'
import { Plus, ImageIcon } from 'lucide-react'
import { BookingCard } from './booking-card'
import { cn } from '@/lib/utils'
import { BookingStatus } from '@prisma/client'

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

interface DiaryWeeklyViewProps {
    spaces: SpaceData[]
    bookings: BookingData[]
    days: Date[]
    windowStart: Date
    activeFilter: BookingStatus | 'ALL'
    onCellClick: (space: SpaceData, date: Date) => void
    onBookingClick: (booking: BookingData, space: SpaceData) => void
}

export function DiaryWeeklyView({
    spaces,
    bookings,
    days,
    windowStart,
    activeFilter,
    onCellClick,
    onBookingClick,
}: DiaryWeeklyViewProps) {
    const DAYS_COUNT = days.length

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

    function isBookingStart(booking: BookingData, date: Date): boolean {
        const bStart = startOfDay(new Date(booking.startDate))
        const wStart = startOfDay(windowStart)
        return isSameDay(bStart, date) || (bStart < wStart && isSameDay(date, wStart))
    }

    function getBookingSpan(booking: BookingData, fromDate: Date): number {
        const bEnd = startOfDay(new Date(booking.endDate))
        const lastVisible = addDays(windowStart, DAYS_COUNT - 1)
        const effectiveEnd = bEnd < lastVisible ? bEnd : lastVisible
        return differenceInDays(effectiveEnd, fromDate) + 1
    }

    return (
        <div className="border rounded-lg overflow-x-auto">
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
                            <td colSpan={DAYS_COUNT + 1} className="text-center text-muted-foreground py-12">
                                No spaces configured. Ask an admin to add spaces for this location.
                            </td>
                        </tr>
                    ) : (
                        spaces.map((space) => (
                            <tr key={space.id} className="group">
                                <td className="text-xs font-medium p-2 border-b border-r sticky left-0 bg-background z-10">
                                    <div className="flex items-center justify-between relative group/name">
                                        <span className="cursor-default">{space.name}</span>
                                        {space.images.length > 0 && (
                                            <ImageIcon className="h-3 w-3 text-blue-500 flex-shrink-0 ml-1" />
                                        )}
                                        {space.images.length > 0 && (
                                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 opacity-0 group-hover/name:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                                                <div className="bg-popover border rounded-lg shadow-xl overflow-hidden" style={{ width: '220px' }}>
                                                    <div className={`grid ${space.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-0`}>
                                                        {space.images.map((url, i) => (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                key={i}
                                                                src={url}
                                                                alt={`${space.name} photo ${i + 1}`}
                                                                className="w-full h-24 object-cover"
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="px-2 py-1.5">
                                                        <div className="text-xs font-medium truncate">{space.name}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                {days.map((day) => {
                                    const cellBookings = getBookingsForCell(space.id, day)
                                    const startingBookings = cellBookings.filter((b) =>
                                        isBookingStart(b, day)
                                    )
                                    const hasBookings = cellBookings.length > 0
                                    const isToday = isSameDay(day, new Date())
                                    const isWeekend = day.getDay() === 0 || day.getDay() === 6

                                    return (
                                        <td
                                            key={day.toISOString()}
                                            className={cn(
                                                'border-b border-r p-0.5 h-[44px] relative',
                                                isToday && 'bg-primary/5',
                                                isWeekend && !isToday && 'bg-muted/30',
                                                !hasBookings && 'cursor-pointer hover:bg-muted/40 transition-colors'
                                            )}
                                            onClick={() => {
                                                if (!hasBookings) onCellClick(space, day)
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
                                                            status={booking.status}
                                                            companyName={booking.companyName}
                                                            brand={booking.brand}
                                                            operator={booking.operator}
                                                            onClick={() => onBookingClick(booking, space)}
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
    )
}
