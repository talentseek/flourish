'use client'

import { cn } from '@/lib/utils'
import { BookingStatus } from '@prisma/client'

interface BookingCardProps {
    id: string
    reference: string
    companyName: string
    brand?: string | null
    status: BookingStatus
    startDate: Date
    endDate: Date
    dailyRate?: number | null
    onClick?: () => void
}

const statusColors: Record<BookingStatus, string> = {
    CONFIRMED: 'bg-emerald-500/90 hover:bg-emerald-500 border-emerald-600',
    UNCONFIRMED: 'bg-amber-500/90 hover:bg-amber-500 border-amber-600',
    CANCELLED: 'bg-red-400/70 hover:bg-red-400 border-red-500 line-through opacity-60',
}

export function BookingCard({
    reference,
    companyName,
    brand,
    status,
    onClick,
}: BookingCardProps) {
    const displayName = brand || companyName

    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full text-left px-2 py-1 rounded text-xs font-medium text-white truncate border transition-colors cursor-pointer',
                statusColors[status]
            )}
            title={`${reference} — ${companyName}${brand ? ` (${brand})` : ''} — ${status}`}
        >
            {displayName}
        </button>
    )
}
