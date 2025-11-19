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
      value: location.numberOfStores ? formatNumber(location.numberOfStores) : "N/A",
      icon: Building2,
    },
    {
      label: "Footfall",
      value: location.footfall ? formatNumber(location.footfall) : "N/A",
      icon: Users,
    },
    {
      label: "Health Index",
      value: location.healthIndex !== undefined && location.healthIndex !== null 
        ? location.healthIndex.toFixed(1) 
        : "N/A",
      icon: TrendingUp,
    },
    {
      label: "Largest Category",
      value: location.largestCategory || "N/A",
      icon: Tag,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-bold tracking-tight">{location.name}</h1>
            <Badge variant={location.type === 'SHOPPING_CENTRE' ? "default" : "secondary"}>
              {getTypeLabel(location.type)}
            </Badge>
            {location.openedYear && (
              <Badge variant="outline">
                Est. {location.openedYear}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
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

      {/* Social Media Links */}
      {(location.instagram || location.facebook || location.youtube || location.tiktok || location.twitter) && (
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

