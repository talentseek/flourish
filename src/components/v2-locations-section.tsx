"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

import { V2LocationsMap } from "@/components/v2-locations-map"

// Minimal location type matching API response
interface LocationSearchResult {
  id: string
  name: string
  city: string
  county: string
  type: 'SHOPPING_CENTRE' | 'RETAIL_PARK' | 'OUTLET_CENTRE' | 'HIGH_STREET'
  numberOfStores?: number
  latitude: number
  longitude: number
}

export function V2LocationsSection() {
  const [locations, setLocations] = useState<LocationSearchResult[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <section id="locations" className="py-16 bg-[#F7F4F2]">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#4D4A46]">Our Locations</h2>
          <p className="text-lg text-[#4D4A46] max-w-2xl mx-auto">
            Discover our portfolio of retail destinations across the UK
          </p>
        </div>

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

