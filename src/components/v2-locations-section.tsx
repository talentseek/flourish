"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, MapPin, Building2, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { V2LocationsMap } from "@/components/v2-locations-map"
import { generateSlug } from "@/lib/slug-utils"
import Link from "next/link"
import Image from "next/image"

// Location type matching API response
interface LocationSearchResult {
  id: string
  name: string
  city: string
  county: string
  type: 'SHOPPING_CENTRE' | 'RETAIL_PARK' | 'OUTLET_CENTRE' | 'HIGH_STREET'
  numberOfStores?: number
  heroImage?: string
  latitude: number
  longitude: number
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'SHOPPING_CENTRE': return 'Shopping Centre'
    case 'RETAIL_PARK': return 'Retail Park'
    case 'OUTLET_CENTRE': return 'Outlet Centre'
    case 'HIGH_STREET': return 'High Street'
    default: return type
  }
}

export function V2LocationsSection() {
  const [locations, setLocations] = useState<LocationSearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await fetch('/api/locations')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
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

  // Filter locations based on search query
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return locations.filter(loc =>
      loc.name.toLowerCase().includes(query) ||
      loc.city.toLowerCase().includes(query) ||
      loc.county.toLowerCase().includes(query)
    )
  }, [locations, searchQuery])

  const showResults = searchQuery.trim().length > 0

  return (
    <section id="locations" className="py-16 bg-[#F7F4F2]">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#4D4A46]">Our Locations</h2>
          <p className="text-lg text-[#4D4A46] max-w-2xl mx-auto">
            Discover our portfolio of retail destinations across the UK
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4D4A46]/60" />
            <Input
              type="text"
              placeholder="Search for a Flourish location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg bg-white border-2 border-[#D8D8D6] focus:border-[#E6FB60] focus-visible:ring-[#E6FB60] text-[#4D4A46] placeholder:text-[#4D4A46]/50 rounded-xl"
            />
          </div>
        </div>

        {/* Search Results */}
        {showResults && (
          <div className="max-w-4xl mx-auto mb-8">
            {filteredLocations.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl border-2 border-[#D8D8D6]">
                <p className="text-[#4D4A46]/70">No Flourish locations found matching &quot;{searchQuery}&quot;</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredLocations.map((location) => (
                  <Link
                    key={location.id}
                    href={`/locations/${generateSlug(location.name)}`}
                    className="group block"
                  >
                    <div className="bg-white rounded-xl border-2 border-[#D8D8D6] overflow-hidden hover:border-[#E6FB60] transition-colors">
                      {/* Hero Image or Placeholder */}
                      <div className="h-32 bg-[#4D4A46] relative overflow-hidden">
                        {location.heroImage ? (
                          <Image
                            src={location.heroImage}
                            alt={location.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 className="h-12 w-12 text-white/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4">
                          <h3 className="text-xl font-bold text-white drop-shadow-lg">{location.name}</h3>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[#4D4A46]/70 text-sm">
                            <MapPin className="h-4 w-4" />
                            <span>{location.city}, {location.county}</span>
                          </div>
                          <span className="text-xs bg-[#E6FB60] text-[#4D4A46] px-2 py-1 rounded-full font-medium">
                            {getTypeLabel(location.type)}
                          </span>
                        </div>
                        {location.numberOfStores && (
                          <p className="text-sm text-[#4D4A46]/60 mt-2">
                            {location.numberOfStores} stores
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-[#4D4A46] font-medium text-sm mt-3 group-hover:text-[#E6FB60] transition-colors">
                          View location details
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map View */}
        <div className="w-full max-w-6xl mx-auto">
          {loading ? (
            <div className="h-[600px] w-full bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">
              <p className="text-[#4D4A46]">Loading map...</p>
            </div>
          ) : (
            <V2LocationsMap locations={locations} />
          )}
        </div>
      </div>
    </section>
  )
}
