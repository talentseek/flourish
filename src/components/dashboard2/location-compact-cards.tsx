"use client"

import { Car, PoundSterling, Zap, Bus, Building2, Calendar, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Location } from "@/types/location"

interface LocationCardProps {
    location: Location
}

// Compact Parking Card
export function LocationParkingCard({ location }: LocationCardProps) {
    const formatNumber = (num: number | undefined | null) => {
        if (num === undefined || num === null || isNaN(num)) return 'N/A'
        return num.toLocaleString()
    }

    const formatCurrency = (amount: number | undefined | null) => {
        if (amount === undefined || amount === null || isNaN(amount)) return null
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            maximumFractionDigits: 2,
        }).format(amount)
    }

    const hasData = location.parkingSpaces || location.carParkPrice !== undefined ||
        location.evCharging || location.publicTransit

    if (!hasData) return null

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Parking & Transport
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {location.parkingSpaces && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Spaces</span>
                        <span className="font-semibold">{formatNumber(location.parkingSpaces)}</span>
                    </div>
                )}
                {location.carParkPrice !== undefined && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">0-2 hrs</span>
                        <span className="font-semibold">{formatCurrency(location.carParkPrice)}</span>
                    </div>
                )}
                {location.evCharging && (
                    <div className="flex items-center gap-2 text-green-600">
                        <Zap className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            EV Charging{location.evChargingSpaces ? ` (${location.evChargingSpaces})` : ''}
                        </span>
                    </div>
                )}
                {location.publicTransit && (
                    <div className="flex items-start gap-2 text-blue-600">
                        <Bus className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{location.publicTransit}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// Compact Property Details Card
export function LocationPropertyCard({ location }: LocationCardProps) {
    const formatNumber = (num: number | undefined | null) => {
        if (num === undefined || num === null || isNaN(num)) return 'N/A'
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K'
        return num.toLocaleString()
    }

    // Format opening hours from JSON to display string
    const formatOpeningHours = (hours: any) => {
        if (!hours || typeof hours !== 'object') return null
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        const formatted = days
            .filter(day => hours[day])
            .map(day => `${day.slice(0, 3)}: ${hours[day]}`)
        return formatted.length > 0 ? formatted : null
    }

    const openingHours = formatOpeningHours(location.openingHours)

    const hasData = location.openedYear || location.numberOfFloors ||
        location.anchorTenants || openingHours

    if (!hasData) return null

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Property Details
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {location.openedYear && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Opened</span>
                        <span className="font-semibold">{location.openedYear}</span>
                    </div>
                )}
                {location.numberOfFloors && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Floors</span>
                        <span className="font-semibold">{location.numberOfFloors}</span>
                    </div>
                )}
                {location.anchorTenants !== undefined && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Anchor Tenants</span>
                        <span className="font-semibold">{location.anchorTenants}</span>
                    </div>
                )}
                {openingHours && (
                    <div className="pt-2 border-t">
                        <span className="text-xs text-muted-foreground block mb-1">Opening Hours</span>
                        <div className="text-xs space-y-0.5">
                            {openingHours.map((line, i) => (
                                <div key={i}>{line}</div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// Compact Ownership Card
export function LocationOwnershipCard({ location }: LocationCardProps) {
    const hasData = location.owner || location.management

    if (!hasData) return null

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Ownership & Contact
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {location.owner && (
                    <div>
                        <span className="text-xs text-muted-foreground block">Owner</span>
                        <span className="text-sm font-medium">{location.owner}</span>
                    </div>
                )}
                {location.management && (
                    <div>
                        <span className="text-xs text-muted-foreground block">Management</span>
                        <span className="text-sm font-medium">{location.management}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
