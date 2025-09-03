"use client"

import { useState, useMemo } from "react"
import { Search, MapPin, Building2, Users, Target, Map, Store } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ShoppingCentreSearch } from "@/components/shopping-centre-search"
import { LocationDetails } from "@/components/location-details"

// Types for database data
interface Location {
  id: string
  name: string
  type: 'SHOPPING_CENTRE' | 'RETAIL_PARK'
  address: string
  city: string
  county: string
  postcode: string
  latitude: number
  longitude: number
  phone?: string
  website?: string
  numberOfStores?: number
  parkingSpaces?: number
  totalFloorArea?: number
  numberOfFloors?: number
  anchorTenants?: number
  openedYear?: number
  tenants: Tenant[]
  
  // Enhanced details
  footfall?: number
  retailers?: number
  carParkPrice?: number
  retailSpace?: number
  evCharging?: boolean
  evChargingSpaces?: number
  
  // Social media links
  instagram?: string
  facebook?: string
  youtube?: string
  tiktok?: string
  
  // Online reviews
  googleRating?: number
  googleReviews?: number
  googleVotes?: number
  facebookRating?: number
  facebookReviews?: number
  facebookVotes?: number
  
  // SEO data
  seoKeywords?: any[]
  topPages?: any[]
  
  // Demographics
  population?: number
  medianAge?: number
  familiesPercent?: number
  seniorsPercent?: number
  avgHouseholdIncome?: number
  incomeVsNational?: number
  homeownership?: number
  homeownershipVsNational?: number
  carOwnership?: number
  carOwnershipVsNational?: number
}

interface Tenant {
  id: string
  name: string
  category: string
  subcategory?: string
  unitNumber?: string
  floor?: number
  isAnchorTenant: boolean
}

// Map placeholder component
function MapPlaceholder({ selectedCentre, distance, nearbyCentres }: { 
  selectedCentre: Location | null
  distance: number
  nearbyCentres: Location[]
}) {
  if (!selectedCentre) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Map View
          </CardTitle>
          <CardDescription>
            Select a target location to view the map
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No location selected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5" />
          Map View
        </CardTitle>
        <CardDescription>
          {selectedCentre.name} and nearby locations within {distance} miles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-muted rounded-lg relative overflow-hidden">
          {/* Map placeholder with visual representation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Target centre */}
              <div className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg z-10"></div>
              <div className="absolute -translate-x-1/2 -translate-y-1/2 mt-6 text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded">
                {selectedCentre.name}
              </div>
              
              {/* Search radius circle */}
              <div 
                className="absolute -translate-x-1/2 -translate-y-1/2 border-2 border-primary/30 rounded-full"
                style={{ 
                  width: `${Math.min(distance * 8, 200)}px`, 
                  height: `${Math.min(distance * 8, 200)}px` 
                }}
              ></div>
              
              {/* Nearby centres */}
              {nearbyCentres.slice(0, 8).map((centre, index) => {
                const angle = (index * 45) * (Math.PI / 180)
                const radius = Math.min(distance * 4, 100)
                const x = Math.cos(angle) * radius
                const y = Math.sin(angle) * radius
                
                return (
                  <div key={centre.id} className="absolute -translate-x-1/2 -translate-y-1/2">
                    <div 
                      className={`w-3 h-3 rounded-full border-2 border-white shadow-md ${
                        centre.type === 'SHOPPING_CENTRE' ? 'bg-secondary' : 'bg-orange-500'
                      }`}
                      style={{ 
                        transform: `translate(${x}px, ${y}px)` 
                      }}
                    ></div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Legend */}
          <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Target</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-secondary rounded-full"></div>
              <span>Shopping Centre</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Retail Park</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface GapAnalysisContentProps {
  locations: Location[]
}

export function GapAnalysisContent({ locations }: GapAnalysisContentProps) {
  const [selectedCentre, setSelectedCentre] = useState<Location | null>(null)
  const [distance, setDistance] = useState([25])
  const [selectedCentres, setSelectedCentres] = useState<string[]>([])
  const [locationTypeFilter, setLocationTypeFilter] = useState<string>("both")
  const [showLocationDetails, setShowLocationDetails] = useState(false)

  const handleCentreToggle = (centreId: string) => {
    setSelectedCentres(prev => 
      prev.includes(centreId) 
        ? prev.filter(id => id !== centreId)
        : [...prev, centreId]
    )
  }

  const handleCentreSelect = (centre: Location) => {
    setSelectedCentre(centre)
    setSelectedCentres([]) // Reset selections when target changes
  }

  // Calculate distances and filter nearby centres
  const nearbyCentres = useMemo(() => {
    if (!selectedCentre) return []
    
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 3959 // Earth's radius in miles
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      return R * c
    }

    // Calculate distances for all locations first
    const locationsWithDistance = locations.map(location => ({
      ...location,
      distance: calculateDistance(
        selectedCentre.latitude, 
        selectedCentre.longitude, 
        location.latitude, 
        location.longitude
      )
    }))

    let filtered = locationsWithDistance.filter(location => 
      location.id !== selectedCentre.id && 
      location.distance <= distance[0]
    )

    // Apply type filter
    if (locationTypeFilter === "shopping-centres") {
      filtered = filtered.filter(location => location.type === 'SHOPPING_CENTRE')
    } else if (locationTypeFilter === "retail-parks") {
      filtered = filtered.filter(location => location.type === 'RETAIL_PARK')
    }

    // Sort by distance
    return filtered.sort((a, b) => a.distance - b.distance)
  }, [selectedCentre, distance, locationTypeFilter, locations])

  const summaryStats = useMemo(() => {
    if (nearbyCentres.length === 0) return null
    
    const totalTenants = nearbyCentres.reduce((sum, centre) => sum + (centre.tenants?.length || 0), 0)
    const shoppingCentres = nearbyCentres.filter(centre => centre.type === 'SHOPPING_CENTRE').length
    const retailParks = nearbyCentres.filter(centre => centre.type === 'RETAIL_PARK').length
    
    return {
      totalCentres: nearbyCentres.length,
      totalTenants,
      shoppingCentres,
      retailParks
    }
  }, [nearbyCentres])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gap Analysis</h1>
        <p className="text-muted-foreground">
          Compare shopping centres and retail parks to identify tenant mix opportunities
        </p>
      </div>

      {/* Search and Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Configuration
          </CardTitle>
          <CardDescription>
            Select your target location and analysis parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Target Centre Search */}
          <div className="space-y-2">
            <Label htmlFor="centre-search">Target Location</Label>
            <ShoppingCentreSearch
              onCentreSelect={handleCentreSelect}
              selectedCentre={selectedCentre}
              locations={locations}
            />
          </div>

          {/* Distance Slider */}
          <div className="space-y-2">
            <Label>Search Radius: {distance[0]} miles</Label>
            <Slider value={distance} onValueChange={setDistance} max={50} min={5} step={5} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 miles</span>
              <span>50 miles</span>
            </div>
          </div>

          {/* Location Type Filter */}
          <div className="space-y-2">
            <Label>Location Types</Label>
            <Select value={locationTypeFilter} onValueChange={setLocationTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select location types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>Shopping Centres & Retail Parks</span>
                  </div>
                </SelectItem>
                <SelectItem value="shopping-centres">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>Shopping Centres Only</span>
                  </div>
                </SelectItem>
                <SelectItem value="retail-parks">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    <span>Retail Parks Only</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

                           {/* Action Buttons */}
                 <div className="flex gap-2">
                   <Button disabled={!selectedCentre || selectedCentres.length === 0}>
                     <Target className="h-4 w-4 mr-2" />
                     Analyze Gaps ({selectedCentres.length} selected)
                   </Button>
                   <Button 
                     variant="outline" 
                     disabled={!selectedCentre}
                     onClick={() => setShowLocationDetails(true)}
                   >
                     <Building2 className="h-4 w-4 mr-2" />
                     View Location Details
                   </Button>
                 </div>
        </CardContent>
      </Card>

      {/* Map and Summary Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Map Placeholder */}
        <MapPlaceholder
          selectedCentre={selectedCentre}
          distance={distance[0]}
          nearbyCentres={nearbyCentres}
        />

        {/* Summary Stats */}
        {summaryStats && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>
                  Overview of nearby locations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{summaryStats.totalCentres}</div>
                    <p className="text-xs text-muted-foreground">Total Locations</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {summaryStats.totalTenants.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Tenants</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-secondary">{summaryStats.shoppingCentres}</div>
                    <p className="text-xs text-muted-foreground">Shopping Centres</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-orange-600">{summaryStats.retailParks}</div>
                    <p className="text-xs text-muted-foreground">Retail Parks</p>
                  </div>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Within {distance[0]} miles of {selectedCentre?.name}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Nearby Locations */}
      {selectedCentre && (
        <Card>
          <CardHeader>
            <CardTitle>Nearby Locations</CardTitle>
            <CardDescription>
              Select locations within {distance[0]} miles to include in your gap analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {nearbyCentres.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No locations found within {distance[0]} miles of {selectedCentre.name}</p>
                <p className="text-sm">Try increasing the search radius or changing location types</p>
              </div>
            ) : (
              <div className="space-y-4">
                {nearbyCentres.map((centre) => (
                  <div key={centre.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Checkbox
                      id={`centre-${centre.id}`}
                      checked={selectedCentres.includes(centre.id)}
                      onCheckedChange={() => handleCentreToggle(centre.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{centre.name}</h3>
                        <Badge variant="secondary">{centre.distance.toFixed(1)} miles</Badge>
                        <Badge variant={centre.type === 'SHOPPING_CENTRE' ? "default" : "outline"}>
                          {centre.type === 'SHOPPING_CENTRE' ? "Shopping Centre" : "Retail Park"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {centre.city}, {centre.county}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>{centre.tenants?.length || 0} tenants</span>
                        {centre.numberOfStores && <span>{centre.numberOfStores} stores</span>}
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Details</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{centre.name}</DialogTitle>
                          <DialogDescription>
                            Detailed information about {centre.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold">Location Details</h4>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                              <div><span className="font-medium">Address:</span> {centre.address}</div>
                              <div><span className="font-medium">City:</span> {centre.city}</div>
                              <div><span className="font-medium">County:</span> {centre.county}</div>
                              <div><span className="font-medium">Postcode:</span> {centre.postcode}</div>
                              {centre.phone && <div><span className="font-medium">Phone:</span> {centre.phone}</div>}
                              {centre.website && <div><span className="font-medium">Website:</span> <a href={centre.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{centre.website}</a></div>}
                            </div>
                          </div>
                          {centre.tenants && centre.tenants.length > 0 && (
                            <div>
                              <h4 className="font-semibold">Sample Tenants</h4>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {centre.tenants.slice(0, 10).map((tenant, index) => (
                                  <Badge key={index} variant="outline">{tenant.name}</Badge>
                                ))}
                                {centre.tenants.length > 10 && (
                                  <Badge variant="secondary">+{centre.tenants.length - 10} more</Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Location Details Dialog */}
      {selectedCentre && (
        <Dialog open={showLocationDetails} onOpenChange={setShowLocationDetails}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <LocationDetails 
              location={selectedCentre} 
              onClose={() => setShowLocationDetails(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
