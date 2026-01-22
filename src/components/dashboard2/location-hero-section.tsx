"use client"

import { Globe, ExternalLink, MapPin, Building2, Users, TrendingUp, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Location } from "@/types/location"
import { LocationSocialLinks } from "./location-social-links"
import { GoogleMaps } from "@/components/google-maps"

interface LocationHeroSectionProps {
  location: Location
}

// Helper to compute most common category from tenants
function getMostCommonCategory(tenants: { category: string }[]): string {
  if (!tenants || tenants.length === 0) return "N/A"

  const counts: Record<string, number> = {}
  tenants.forEach(t => {
    const cat = t.category || "Other"
    counts[cat] = (counts[cat] || 0) + 1
  })

  let maxCat = "Other"
  let maxCount = 0
  Object.entries(counts).forEach(([cat, count]) => {
    if (count > maxCount) {
      maxCount = count
      maxCat = cat
    }
  })

  return maxCat
}

export function LocationHeroSection({ location }: LocationHeroSectionProps) {
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

  const quickStats = [
    {
      label: "Stores",
      value: location.numberOfStores ? formatNumber(location.numberOfStores) :
        (location.tenants?.length ? formatNumber(location.tenants.length) : "N/A"),
      icon: Building2,
    },
    {
      label: "Footfall",
      value: location.footfall ? formatNumber(location.footfall) : "N/A",
      icon: Users,
    },
    {
      label: "Retail Space",
      value: location.retailSpace ? formatNumber(location.retailSpace) + " sqft" : "N/A",
      icon: Tag,
    },
    {
      label: "Largest Category",
      value: location.largestCategory ||
        (location.tenants?.length ? getMostCommonCategory(location.tenants) : "N/A"),
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Hero Image Section */}
      {location.heroImage && (
        <div className="relative h-[400px] md:h-[500px] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${location.heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12 text-white">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-4xl font-bold tracking-tight drop-shadow-lg">{location.name}</h1>
              <Badge variant={location.type === 'SHOPPING_CENTRE' ? "default" : "secondary"} className="bg-[#E6FB60] text-[#4D4A46]">
                {getTypeLabel(location.type)}
              </Badge>
              {location.openedYear && (
                <Badge variant="outline" className="border-white/50 text-white">
                  Est. {location.openedYear}
                </Badge>
              )}
            </div>
            <p className="flex items-center gap-2 text-white/90 drop-shadow mb-3">
              <MapPin className="h-4 w-4" />
              {location.address}, {location.city}, {location.county}
            </p>
            {/* Social Media Links - Inside Hero */}
            {(location.instagram || location.facebook || location.youtube || location.tiktok || location.twitter) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-white/70">Social Media:</span>
                {location.instagram && (
                  <a href={location.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium hover:opacity-90">
                    Instagram
                  </a>
                )}
                {location.facebook && (
                  <a href={location.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:opacity-90">
                    Facebook
                  </a>
                )}
                {location.twitter && (
                  <a href={location.twitter} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded bg-sky-500 text-white text-xs font-medium hover:opacity-90">
                    Twitter
                  </a>
                )}
                {location.youtube && (
                  <a href={location.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-600 text-white text-xs font-medium hover:opacity-90">
                    YouTube
                  </a>
                )}
                {location.tiktok && (
                  <a href={location.tiktok} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded bg-black text-white text-xs font-medium hover:opacity-90">
                    TikTok
                  </a>
                )}
              </div>
            )}
          </div>
          {/* Website Button - Prominent */}
          {location.website && (
            <div className="absolute top-4 right-4">
              <Button
                size="lg"
                className="gap-2 bg-[#E6FB60] text-[#4D4A46] hover:bg-[#E6FB60]/90 shadow-lg"
                asChild
              >
                <a
                  href={location.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="h-5 w-5" />
                  Visit Website
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Header Section (shown only if no hero image) */}
      {!location.heroImage && (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl font-bold tracking-tight text-[#4D4A46]">{location.name}</h1>
              <Badge variant={location.type === 'SHOPPING_CENTRE' ? "default" : "secondary"}>
                {getTypeLabel(location.type)}
              </Badge>
              {location.openedYear && (
                <Badge variant="outline">
                  Est. {location.openedYear}
                </Badge>
              )}
            </div>
            <p className="text-[#4D4A46] flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {location.address}, {location.city}, {location.county}
            </p>
          </div>

          {/* Website Button - Prominent */}
          {location.website && (
            <Button
              size="lg"
              className="gap-2"
              asChild
            >
              <a
                href={location.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe className="h-5 w-5" />
                Visit Website
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      )}

      {/* Social Media Links (only when no hero image - hero has its own) */}
      {!location.heroImage && (location.instagram || location.facebook || location.youtube || location.tiktok || location.twitter) && (
        <LocationSocialLinks location={location} />
      )}

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 p-4 border rounded-lg bg-card"
            >
              <div className="p-2 bg-muted rounded-lg">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <div className="text-xl font-bold truncate">{stat.value}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Small Symbolic Map */}
      <div className="h-[300px] rounded-lg overflow-hidden border">
        <GoogleMaps
          selectedCentre={location}
          distance={5}
          nearbyCentres={[]}
          className="h-full"
        />
      </div>
    </div>
  )
}

