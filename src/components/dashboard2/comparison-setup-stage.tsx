"use client"

import { useState, useMemo } from "react"
import { MapPin, Building2, Store, CheckCircle2, Filter, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Location } from "@/types/location"
import { GoogleMaps } from "@/components/google-maps"
import { cn } from "@/lib/utils"

type LocationType = 'SHOPPING_CENTRE' | 'RETAIL_PARK' | 'OUTLET_CENTRE' | 'HIGH_STREET'

interface ComparisonSetupStageProps {
  targetLocation: Location
  allLocations: Location[]
  radius: number
  onRadiusChange: (radius: number) => void
  selectedCompetitors: string[]
  onCompetitorsChange: (ids: string[]) => void
  onGenerateReport: () => void
}

export function ComparisonSetupStage({
  targetLocation,
  allLocations,
  radius,
  onRadiusChange,
  selectedCompetitors,
  onCompetitorsChange,
  onGenerateReport,
}: ComparisonSetupStageProps) {
  // State for location type filters (default: Shopping Centres only)
  const [selectedTypes, setSelectedTypes] = useState<LocationType[]>([
    'SHOPPING_CENTRE'
  ])

  // Enrichment gating — minimum tenants for comparison
  const MIN_TENANTS = 5
  const isSelectable = (location: Location) => location.tenants.length >= MIN_TENANTS
  const getDisabledReason = (location: Location) => {
    if (location.tenants.length === 0) return "No Tenant Data"
    return "Insufficient Data"
  }

  // Calculate distances and filter nearby locations
  const nearbyLocations = useMemo(() => {
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 3959 // Earth's radius in miles
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    }

    const locationsWithDistance = allLocations
      .filter(loc => loc.id !== targetLocation.id)
      .map(location => ({
        ...location,
        distance: calculateDistance(
          targetLocation.latitude,
          targetLocation.longitude,
          location.latitude,
          location.longitude
        )
      }))
      .filter(loc => loc.distance <= radius)
      .filter(loc => selectedTypes.includes(loc.type as LocationType))
      .sort((a, b) => a.distance - b.distance)

    return locationsWithDistance
  }, [targetLocation, allLocations, radius, selectedTypes])

  // Count locations by type
  const typeCounts = useMemo(() => {
    const counts: Record<LocationType, number> = {
      SHOPPING_CENTRE: 0,
      RETAIL_PARK: 0,
      OUTLET_CENTRE: 0,
      HIGH_STREET: 0,
    }

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 3959
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    }

    allLocations
      .filter(loc => loc.id !== targetLocation.id)
      .forEach(location => {
        const distance = calculateDistance(
          targetLocation.latitude,
          targetLocation.longitude,
          location.latitude,
          location.longitude
        )
        if (distance <= radius) {
          const type = location.type as LocationType
          if (type in counts) {
            counts[type]++
          }
        }
      })

    return counts
  }, [targetLocation, allLocations, radius])

  const handleTypeToggle = (type: LocationType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleSelectAllTypes = () => {
    setSelectedTypes(['SHOPPING_CENTRE', 'RETAIL_PARK', 'OUTLET_CENTRE', 'HIGH_STREET'])
  }

  const handleClearTypes = () => {
    setSelectedTypes([])
  }

  const handleToggleCompetitor = (locationId: string) => {
    const location = nearbyLocations.find(l => l.id === locationId)
    if (location && !isSelectable(location)) return
    if (selectedCompetitors.includes(locationId)) {
      onCompetitorsChange(selectedCompetitors.filter(id => id !== locationId))
    } else {
      onCompetitorsChange([...selectedCompetitors, locationId])
    }
  }

  const handleSelectAll = () => {
    onCompetitorsChange(nearbyLocations.filter(loc => isSelectable(loc)).map(loc => loc.id))
  }

  const handleClearAll = () => {
    onCompetitorsChange([])
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'SHOPPING_CENTRE':
        return 'Shopping Centre'
      case 'RETAIL_PARK':
        return 'Retail Park'
      case 'OUTLET_CENTRE':
        return 'Outlet Centre'
      case 'HIGH_STREET':
        return 'High Street'
      default:
        return type
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'SHOPPING_CENTRE':
        return 'default' as const
      case 'RETAIL_PARK':
        return 'secondary' as const
      case 'OUTLET_CENTRE':
        return 'destructive' as const
      default:
        return 'outline' as const
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Compare with Nearby Locations</h1>
        <p className="text-muted-foreground">
          Select locations within your search radius to compare with {targetLocation.name}
        </p>
      </div>

      {/* Radius Control */}
      <Card>
        <CardHeader>
          <CardTitle>Search Radius</CardTitle>
          <CardDescription>Adjust the radius to find nearby locations (default: 5 miles)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Radius: {radius} miles</Label>
            <Slider
              value={[radius]}
              onValueChange={(value) => onRadiusChange(value[0])}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 mile</span>
              <span>50 miles</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Found {nearbyLocations.length} location{nearbyLocations.length !== 1 ? 's' : ''} within {radius} miles
          </div>
        </CardContent>
      </Card>

      {/* Location Type Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter by Location Type
          </CardTitle>
          <CardDescription>
            Select which types of locations to include in your comparison
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="type-shopping-centre"
                checked={selectedTypes.includes('SHOPPING_CENTRE')}
                onCheckedChange={() => handleTypeToggle('SHOPPING_CENTRE')}
              />
              <Label
                htmlFor="type-shopping-centre"
                className="text-sm font-normal cursor-pointer flex items-center gap-2"
              >
                Shopping Centres
                <Badge variant="secondary" className="text-xs">
                  {typeCounts.SHOPPING_CENTRE}
                </Badge>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="type-retail-park"
                checked={selectedTypes.includes('RETAIL_PARK')}
                onCheckedChange={() => handleTypeToggle('RETAIL_PARK')}
              />
              <Label
                htmlFor="type-retail-park"
                className="text-sm font-normal cursor-pointer flex items-center gap-2"
              >
                Retail Parks
                <Badge variant="secondary" className="text-xs">
                  {typeCounts.RETAIL_PARK}
                </Badge>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="type-outlet-centre"
                checked={selectedTypes.includes('OUTLET_CENTRE')}
                onCheckedChange={() => handleTypeToggle('OUTLET_CENTRE')}
              />
              <Label
                htmlFor="type-outlet-centre"
                className="text-sm font-normal cursor-pointer flex items-center gap-2"
              >
                Outlet Centres
                <Badge variant="secondary" className="text-xs">
                  {typeCounts.OUTLET_CENTRE}
                </Badge>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="type-high-street"
                checked={selectedTypes.includes('HIGH_STREET')}
                onCheckedChange={() => handleTypeToggle('HIGH_STREET')}
              />
              <Label
                htmlFor="type-high-street"
                className="text-sm font-normal cursor-pointer flex items-center gap-2"
              >
                High Streets
                <Badge variant="secondary" className="text-xs">
                  {typeCounts.HIGH_STREET}
                </Badge>
              </Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAllTypes}
            >
              Select All Types
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearTypes}
              disabled={selectedTypes.length === 0}
            >
              Clear Types
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map and List Layout */}
      <div className="grid lg:grid-cols-[60%_40%] gap-6">
        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle>Map View</CardTitle>
            <CardDescription>
              {targetLocation.name} and nearby locations within {radius} miles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[600px] rounded-lg overflow-hidden">
              <GoogleMaps
                selectedCentre={targetLocation}
                distance={radius}
                nearbyCentres={nearbyLocations}
                className="h-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Nearby Locations</CardTitle>
                  <CardDescription>
                    Select locations to include in your comparison
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedCompetitors.length} selected
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {nearbyLocations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No locations found within {radius} miles</p>
                  <p className="text-sm">Try increasing the search radius</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 pb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      disabled={nearbyLocations.length === 0}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      disabled={selectedCompetitors.length === 0}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {nearbyLocations.map((location) => {
                      const isSelected = selectedCompetitors.includes(location.id)
                      const selectable = isSelectable(location)
                      return (
                        <Card
                          key={location.id}
                          className={cn(
                            "transition-all",
                            selectable ? "cursor-pointer" : "cursor-not-allowed opacity-50",
                            isSelected && selectable && "ring-2 ring-primary"
                          )}
                          onClick={() => handleToggleCompetitor(location.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={isSelected}
                                disabled={!selectable}
                                onCheckedChange={() => handleToggleCompetitor(location.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className={cn("font-semibold", !selectable && "text-muted-foreground")}>{location.name}</h3>
                                  {isSelected && selectable && (
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                  <Badge variant={getTypeBadgeVariant(location.type)} className="text-xs">
                                    {getTypeLabel(location.type)}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {location.distance.toFixed(1)} miles
                                  </Badge>
                                  {!selectable && (
                                    <Badge variant="destructive" className="text-xs flex items-center gap-1">
                                      <AlertTriangle className="h-3 w-3" />
                                      {getDisabledReason(location)}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {location.city}, {location.county}
                                </p>
                                {selectable && location.numberOfStores ? (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {location.numberOfStores} stores
                                  </p>
                                ) : !selectable ? (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Not enough data for comparison
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Generate Report Button */}
          <Button
            onClick={onGenerateReport}
            disabled={selectedCompetitors.length === 0}
            className="w-full"
            size="lg"
          >
            Generate Gap Analysis Report
            {selectedCompetitors.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedCompetitors.length} location{selectedCompetitors.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

