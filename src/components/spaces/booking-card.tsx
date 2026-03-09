'use client'

import { cn } from '@/lib/utils'

interface BookingCardProps {
    status: string
    companyName?: string | null
    brand?: string | null
    operator?: { companyName: string; tradingName?: string | null } | null
    onClick?: () => void
}

export function BookingCard({ status, companyName, brand, operator, onClick }: BookingCardProps) {
    const displayName = operator?.companyName || companyName || 'Unknown'
    const displaySub = brand || operator?.tradingName || null

    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full text-left text-[11px] px-1.5 py-0.5 rounded truncate font-medium leading-tight',
                status === 'CONFIRMED' && 'bg-emerald-100 text-emerald-800 border border-emerald-200',
                status === 'UNCONFIRMED' && 'bg-amber-100 text-amber-800 border border-amber-200',
                status === 'CANCELLED' && 'bg-red-100 text-red-800 border border-red-200 line-through opacity-60'
            )}
        >
            {displayName}
            {displaySub && <span className="opacity-70"> · {displaySub}</span>}
        </button>
    )
}
