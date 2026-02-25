'use client'

import { BookingStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SpaceDiaryToolbarProps {
    activeFilter: BookingStatus | 'ALL'
    onFilterChange: (filter: BookingStatus | 'ALL') => void
    locationName: string
}

const filters: { label: string; value: BookingStatus | 'ALL' }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Unconfirmed', value: 'UNCONFIRMED' },
    { label: 'Cancelled', value: 'CANCELLED' },
]

export function SpaceDiaryToolbar({
    activeFilter,
    onFilterChange,
    locationName,
}: SpaceDiaryToolbarProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
    )
}
