"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, Building2, MapPin, Store, TrendingUp, Database, Sparkles, PoundSterling } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { generateSlug } from "@/lib/slug-utils"
import { cn } from "@/lib/utils"

// Minimal location type matching API response
interface LocationSearchResult {
  id: string
  name: string
  city: string
  county: string
  type: 'SHOPPING_CENTRE' | 'RETAIL_PARK' | 'OUTLET_CENTRE' | 'HIGH_STREET'
  numberOfStores?: number
}

export function V2LocationsSection() {
  const router = useRouter()
  const [locations, setLocations] = useState<LocationSearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    // Fetch locations from the API
    const loadLocations = async () => {
      try {
        const res = await fetch('/api/locations')
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        const data = await res.json()
        setLocations(data.locations || [])
      } catch (err) {
        console.error('Failed to load locations:', err)
      } finally {
        setLoading(false)
      }
    }
    loadLocations()
  }, [])

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

  const handleLocationSelect = (location: LocationSearchResult) => {
    setShowResults(false)
    // Navigate to public slug URL
    const slug = generateSlug(location.name)
    router.push(`/locations/${slug}`)
  }

  const stats = [
    { icon: Building2, value: "2,600+", label: "Retail Locations", color: "text-[#E6FB60]" },
    { icon: Database, value: "180K+", label: "Store Data Points", color: "text-[#E6FB60]" },
    { icon: Sparkles, value: "50K+", label: "AI Insights Generated", color: "text-[#E6FB60]" },
    { icon: PoundSterling, value: "£250M+", label: "Revenue Opportunities", color: "text-[#E6FB60]" },
  ]

  return (
    <section id="locations" className="py-16 bg-[#F7F4F2]">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#4D4A46]">Locations</h2>
          <p className="text-lg text-[#4D4A46] max-w-2xl mx-auto">
            Discover our portfolio of retail destinations
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="text-center bg-white border-[#D8D8D6]">
                <CardHeader className="pb-2">
                  <div className="flex justify-center mb-2">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <CardTitle className="text-2xl md:text-3xl font-bold text-[#4D4A46]">
                    {stat.value}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#4D4A46] font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="w-full max-w-2xl mx-auto relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4D4A46]" />
            <Input
              type="text"
              placeholder="Search by name, city, or county..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
              className="pl-12 h-14 text-lg border-2 border-[#E6FB60] bg-white text-[#4D4A46] placeholder:text-[#A69D94] focus-visible:ring-[#E6FB60] focus-visible:ring-2"
            />
          </div>

          {/* Results Dropdown */}
          {showResults && searchTerm && filteredLocations.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#D8D8D6] rounded-lg shadow-lg z-50 max-h-[500px] overflow-y-auto">
              <div className="p-2 space-y-2">
                {filteredLocations.map((location) => {
                  const Icon = getTypeIcon(location.type)
                  return (
                    <Card
                      key={location.id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleLocationSelect(location)}
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

          {showResults && searchTerm && filteredLocations.length === 0 && !loading && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#D8D8D6] rounded-lg shadow-lg z-50 p-4 text-center text-[#4D4A46]">
              No locations found. Try a different search term.
            </div>
          )}
        </div>

        {/* Helper Text */}
        {!searchTerm && (
          <div className="text-center text-base text-[#4D4A46] max-w-xl mx-auto mt-6">
            <p className="font-medium">Start typing to search through our database of UK retail properties</p>
          </div>
        )}
      </div>
    </section>
  )
}

