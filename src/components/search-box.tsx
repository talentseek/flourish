"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Location {
  id: string
  name: string
  city: string
  county: string
  type: string
}

export function SearchBox() {
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    // Fetch locations from the API
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => {
        setLocations(data.locations || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load locations:', err)
        setLoading(false)
      })
  }, [])

  const filteredLocations = locations.filter(location => {
    const searchLower = searchTerm.toLowerCase()
    return (
      location.name.toLowerCase().includes(searchLower) ||
      location.city.toLowerCase().includes(searchLower) ||
      location.county.toLowerCase().includes(searchLower)
    )
  })

  const handleAnalyze = () => {
    if (selectedLocation) {
      router.push(`/gap-analysis?selected=${selectedLocation.id}`)
    }
  }

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    setSearchTerm(location.name)
    setShowDropdown(false)
  }

  return (
    <div className="flex flex-col items-center space-y-4 max-w-2xl mx-auto">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10" />
        <Input
          type="text"
          placeholder={loading ? "Loading locations..." : "Enter shopping centre name..."}
          className={cn(
            "pl-10 h-14 text-lg",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setShowDropdown(true)
            setSelectedLocation(null)
          }}
          onFocus={() => setShowDropdown(true)}
          disabled={loading}
        />
        
        {showDropdown && searchTerm && filteredLocations.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-[400px] overflow-hidden">
            <ScrollArea className="h-full max-h-[400px]">
              <div className="p-2">
                {filteredLocations.slice(0, 50).map((location) => (
                  <div
                    key={location.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-accent",
                      selectedLocation?.id === location.id && "bg-accent"
                    )}
                    onClick={() => handleLocationSelect(location)}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        selectedLocation?.id === location.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{location.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {location.city}, {location.county}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {showDropdown && searchTerm && filteredLocations.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 p-4 text-center text-sm text-muted-foreground">
            No location found.
          </div>
        )}
      </div>
      <Button 
        size="lg" 
        className="h-12 px-8 text-lg"
        onClick={handleAnalyze}
        disabled={!selectedLocation || loading}
      >
        {selectedLocation ? `Analyze ${selectedLocation.name}` : 'Start AI Analysis'}
      </Button>
    </div>
  )
}
