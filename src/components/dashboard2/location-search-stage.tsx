"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, Building2, MapPin, Store } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Location } from "@/types/location"
import { generateSlug } from "@/lib/slug-utils"
import { cn } from "@/lib/utils"

interface LocationSearchStageProps {
  locations: Location[]
  onLocationSelect: (location: Location) => void
}

export function LocationSearchStage({ locations, onLocationSelect }: LocationSearchStageProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [showResults, setShowResults] = useState(false)

  const filteredLocations = useMemo(() => {
    if (!searchTerm.trim()) return []
    
    const term = searchTerm.toLowerCase()
    return locations
      .filter(location => 
        location.name.toLowerCase().includes(term) ||
        location.city.toLowerCase().includes(term) ||
        location.county.toLowerCase().includes(term)
      )
      .slice(0, 10) // Limit to 10 results
  }, [searchTerm, locations])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SHOPPING_CENTRE':
        return Building2
      case 'RETAIL_PARK':
      case 'OUTLET_CENTRE':
      case 'HIGH_STREET':
        return Store
      default:
        return MapPin
    }
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 px-4">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">Find Your Location</h1>
        <p className="text-lg text-muted-foreground">
          Search for a shopping centre, retail park, or high street to begin your analysis
        </p>
      </div>

      {/* Search Input */}
      <div className="w-full max-w-2xl relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, city, or county..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => setShowResults(true)}
            className="pl-12 h-14 text-lg border-2 border-[#E6FB60] focus-visible:ring-[#E6FB60] focus-visible:ring-2"
          />
        </div>

        {/* Results Dropdown */}
        {showResults && searchTerm && filteredLocations.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-[500px] overflow-y-auto">
            <div className="p-2 space-y-2">
              {filteredLocations.map((location) => {
                const Icon = getTypeIcon(location.type)
                return (
                  <Card
                    key={location.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => {
                      onLocationSelect(location)
                      setShowResults(false)
                      // Navigate to slug URL
                      const slug = generateSlug(location.name)
                      router.push(`/dashboard2/${slug}`)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{location.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {getTypeLabel(location.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {location.city}, {location.county}
                          </p>
                          {location.numberOfStores && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {location.numberOfStores} stores
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {showResults && searchTerm && filteredLocations.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 p-4 text-center text-muted-foreground">
            No locations found. Try a different search term.
          </div>
        )}
      </div>

      {/* Helper Text */}
      {!searchTerm && (
        <div className="text-center text-sm text-muted-foreground max-w-xl">
          <p>Start typing to search through our database of UK retail properties</p>
        </div>
      )}
    </div>
  )
}

