'use client'

import { format } from 'date-fns'
import { Calendar, MapPin, Building2, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { BookingStatus } from '@prisma/client'

interface UpcomingBooking {
    id: string
    reference: string
    companyName: string
    brand?: string | null
    startDate: string | Date
    endDate: string | Date
    status: BookingStatus
    space: {
        name: string
        location: {
            id: string
            name: string
        }
    }
}

interface UpcomingBookingsWidgetProps {
    bookings: UpcomingBooking[]
}

const statusBadge: Record<BookingStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    CONFIRMED: { label: 'Confirmed', variant: 'default' },
    UNCONFIRMED: { label: 'Unconfirmed', variant: 'secondary' },
    CANCELLED: { label: 'Cancelled', variant: 'destructive' },
}

export function UpcomingBookingsWidget({ bookings }: UpcomingBookingsWidgetProps) {
    if (bookings.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="h-5 w-5" />
                        Upcoming Bookings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No upcoming bookings across your locations.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5" />
                    Upcoming Bookings
                    <Badge variant="outline" className="ml-auto">{bookings.length}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {bookings.slice(0, 8).map((booking) => {
                    const start = new Date(booking.startDate)
                    const end = new Date(booking.endDate)
                    const badge = statusBadge[booking.status]

                    return (
                        <Link
                            key={booking.id}
                            href={`/dashboard/regional/spaces/${booking.space.location.id}`}
                            className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all group"
                        >
                            <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm truncate">
                                        {booking.brand || booking.companyName}
                                    </span>
                                    <Badge variant={badge.variant} className="text-[10px] h-5">
                                        {badge.label}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {booking.space.location.name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Building2 className="h-3 w-3" />
                                        {booking.space.name}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {format(start, 'dd MMM')} — {format(end, 'dd MMM yyyy')}
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </Link>
                    )
                })}
            </CardContent>
        </Card>
    )
}
