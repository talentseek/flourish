"use client"

import { useState, useEffect } from "react"
import { Search, Check, Sparkles, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface Location {
  id: string
  name: string
  city: string
  county: string
  type: string
}

export function SearchBox() {
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [showPreRegister, setShowPreRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Fetch locations from the API
    const loadLocations = async () => {
      try {
        const res = await fetch('/api/locations')
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        const data = await res.json()
        console.log('Loaded locations:', data.locations?.length || 0)
        setLocations(data.locations || [])
      } catch (err) {
        console.error('Failed to load locations:', err)
        toast.error('Failed to load locations. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }
    loadLocations()
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
      setShowPreRegister(true)
    }
  }

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    setSearchTerm(location.name)
    setShowDropdown(false)
  }

  const handlePreRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success("Thanks for your interest!", {
      description: `We'll contact you at ${email} when Flourish launches. You're on the waitlist!`
    })
    
    setSubmitting(false)
    setShowPreRegister(false)
    setEmail("")
    setCompanyName("")
    setSelectedLocation(null)
    setSearchTerm("")
  }

  return (
    <>
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

      {/* Pre-Registration Dialog */}
      <Dialog open={showPreRegister} onOpenChange={setShowPreRegister}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Pre-Register for Early Access
            </DialogTitle>
            <DialogDescription>
              {selectedLocation && (
                <span className="block mt-2">
                  Interested in analyzing <span className="font-semibold text-foreground">{selectedLocation.name}</span>? 
                  Join our waitlist and be the first to access Flourish AI when we launch.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePreRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name (Optional)</Label>
              <Input
                id="company"
                type="text"
                placeholder="Your company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-xs text-muted-foreground">
                By pre-registering, you&apos;ll receive early access to Flourish AI, exclusive beta features,
                and special launch pricing.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreRegister(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!email || submitting}
                className="flex-1"
              >
                {submitting ? "Submitting..." : "Join Waitlist"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
