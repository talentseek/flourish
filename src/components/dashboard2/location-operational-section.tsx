"use client"

import { Car, Bus, Building2, Calendar, PoundSterling, Zap, Phone, Globe } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { Location } from "@/types/location"

interface LocationOperationalSectionProps {
  location: Location
}

export function LocationOperationalSection({ location }: LocationOperationalSectionProps) {
  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) {
      return 'N/A'
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'N/A'
    }
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const hasOperationalData = location.parkingSpaces || location.carParkPrice || 
                             location.evCharging || location.publicTransit ||
                             location.owner || location.management || 
                             location.openedYear || location.numberOfFloors ||
                             location.totalFloorArea || location.anchorTenants ||
                             location.phone || location.website

  if (!hasOperationalData) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operational Details</CardTitle>
        <CardDescription>Physical characteristics and operational information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contact Information */}
        {(location.website || location.phone) && (
          <div className="space-y-3">
            <h4 className="font-semibold">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {location.phone && (
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{location.phone}</span>
                </div>
              )}
              {location.website && (
                <Button
                  variant="outline"
                  className="justify-start"
                  asChild
                >
                  <a
                    href={location.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Opening Hours */}
        {location.openingHours && (
          <div className="space-y-3">
            <h4 className="font-semibold">Opening Hours</h4>
            <div className="p-3 border rounded-lg bg-muted/50">
              {(() => {
                // Handle different formats of opening hours
                if (typeof location.openingHours === 'string') {
                  return <div className="text-sm whitespace-pre-wrap">{location.openingHours}</div>
                }
                
                // If it's an object with weekday_text array, use that
                if (
                  typeof location.openingHours === 'object' &&
                  location.openingHours !== null &&
                  'weekday_text' in location.openingHours &&
                  Array.isArray((location.openingHours as any).weekday_text)
                ) {
                  const hours = location.openingHours as { weekday_text: string[] }
                  return (
                    <div className="space-y-1">
                      {hours.weekday_text.map((day, index) => (
                        <div key={index} className="text-sm">
                          {day}
                        </div>
                      ))}
                    </div>
                  )
                }
                
                // Fallback: display as formatted JSON
                return (
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {JSON.stringify(location.openingHours, null, 2)}
                  </pre>
                )
              })()}
            </div>
          </div>
        )}

        {/* Parking & Transport */}
        {(location.parkingSpaces || location.carParkPrice || location.evCharging || location.publicTransit) && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Car className="h-4 w-4" />
              Parking & Transport
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {location.parkingSpaces && (
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{formatNumber(location.parkingSpaces)} spaces</div>
                    <div className="text-xs text-muted-foreground">Parking available</div>
                  </div>
                </div>
              )}
              {location.carParkPrice !== undefined && (
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  <PoundSterling className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{formatCurrency(location.carParkPrice)}</div>
                    <div className="text-xs text-muted-foreground">0-2 hours parking</div>
                  </div>
                </div>
              )}
              {location.evCharging && (
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      EV Charging Available
                      {location.evChargingSpaces && ` (${location.evChargingSpaces} spaces)`}
                    </div>
                    <div className="text-xs text-muted-foreground">Electric vehicle charging</div>
                  </div>
                </div>
              )}
              {location.publicTransit && (
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  <Bus className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Public Transit</div>
                    <div className="text-xs text-muted-foreground">{location.publicTransit}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Property Details */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Property Details
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {location.openedYear && (
              <div className="p-3 border rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-lg font-bold">{location.openedYear}</div>
                <div className="text-xs text-muted-foreground">Opened</div>
              </div>
            )}
            {location.numberOfFloors && (
              <div className="p-3 border rounded-lg text-center">
                <div className="text-lg font-bold">{location.numberOfFloors}</div>
                <div className="text-xs text-muted-foreground">Floors</div>
              </div>
            )}
            {location.totalFloorArea && (
              <div className="p-3 border rounded-lg text-center">
                <div className="text-lg font-bold">{formatNumber(location.totalFloorArea)}</div>
                <div className="text-xs text-muted-foreground">sq ft</div>
              </div>
            )}
            {location.anchorTenants !== undefined && (
              <div className="p-3 border rounded-lg text-center">
                <div className="text-lg font-bold">{location.anchorTenants}</div>
                <div className="text-xs text-muted-foreground">Anchor Tenants</div>
              </div>
            )}
          </div>
        </div>

        {/* Ownership & Management */}
        {(location.owner || location.management) && (
          <div className="space-y-3">
            <h4 className="font-semibold">Ownership & Management</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {location.owner && (
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Owner</div>
                  <div className="font-medium">{location.owner}</div>
                </div>
              )}
              {location.management && (
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Management</div>
                  <div className="font-medium">{location.management}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

