'use client'

import { BookingStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export type DiaryViewMode = 'weekly' | 'monthly' | 'annual'

interface SpaceDiaryToolbarProps {
    locationName: string
    viewMode: DiaryViewMode
    onViewModeChange: (mode: DiaryViewMode) => void
    currentDate: Date
    onDateChange: (date: Date) => void
    onNavigate: (direction: -1 | 0 | 1) => void
    activeFilter: BookingStatus | 'ALL'
    onFilterChange: (filter: BookingStatus | 'ALL') => void
    isPending: boolean
}

const filters: { label: string; value: BookingStatus | 'ALL' }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Unconfirmed', value: 'UNCONFIRMED' },
    { label: 'Cancelled', value: 'CANCELLED' },
]

const viewModes: { label: string; value: DiaryViewMode }[] = [
    { label: 'Week', value: 'weekly' },
    { label: 'Month', value: 'monthly' },
    { label: 'Year', value: 'annual' },
]

function getDateRangeLabel(viewMode: DiaryViewMode, currentDate: Date): string {
    switch (viewMode) {
        case 'weekly': {
            const ws = startOfWeek(currentDate, { weekStartsOn: 1 })
            const we = endOfWeek(currentDate, { weekStartsOn: 1 })
            const sameMonth = ws.getMonth() === we.getMonth()
            if (sameMonth) {
                return `${format(ws, 'd')} – ${format(we, 'd MMM yyyy')}`
            }
            return `${format(ws, 'd MMM')} – ${format(we, 'd MMM yyyy')}`
        }
        case 'monthly':
            return format(currentDate, 'MMMM yyyy')
        case 'annual':
            return format(currentDate, 'yyyy')
    }
}

export function SpaceDiaryToolbar({
    locationName,
    viewMode,
    onViewModeChange,
    currentDate,
    onDateChange,
    onNavigate,
    activeFilter,
    onFilterChange,
    isPending,
}: SpaceDiaryToolbarProps) {
    const [calendarOpen, setCalendarOpen] = useState(false)

    return (
        <div className="space-y-3">
            {/* Row 1: Title + Status Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{locationName}</h1>
                    <p className="text-sm text-muted-foreground">Space Booking Diary</p>
                </div>
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    {filters.map((f) => (
                        <Button
                            key={f.value}
                            variant="ghost"
                            size="sm"
                            onClick={() => onFilterChange(f.value)}
                            className={cn(
                                'text-xs h-7 px-3',
                                activeFilter === f.value &&
                                'bg-background shadow-sm text-foreground'
                            )}
                        >
                            {f.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Row 2: View Mode + Navigation + Date Picker */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* View mode switcher */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    {viewModes.map((vm) => (
                        <Button
                            key={vm.value}
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewModeChange(vm.value)}
                            className={cn(
                                'text-xs h-7 px-4',
                                viewMode === vm.value &&
                                'bg-background shadow-sm text-foreground'
                            )}
                        >
                            {vm.label}
                        </Button>
                    ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onNavigate(-1)}
                        disabled={isPending}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => onNavigate(0)}
                        disabled={isPending}
                    >
                        Today
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onNavigate(1)}
                        disabled={isPending}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    {/* Date picker */}
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 font-medium"
                                disabled={isPending}
                            >
                                <CalendarDays className="h-3.5 w-3.5" />
                                {getDateRangeLabel(viewMode, currentDate)}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={currentDate}
                                onSelect={(date) => {
                                    if (date) {
                                        onDateChange(date)
                                        setCalendarOpen(false)
                                    }
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    )
}
