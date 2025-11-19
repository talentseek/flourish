"use client"

import { Building2, Users, BarChart3, Car, TrendingUp, Tag } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Location } from "@/types/location"

interface LocationMetricsGridProps {
  location: Location
}

export function LocationMetricsGrid({ location }: LocationMetricsGridProps) {
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

  const metrics = [
    {
      label: "Stores",
      value: location.numberOfStores,
      formatted: location.numberOfStores ? formatNumber(location.numberOfStores) : "N/A",
      icon: Building2,
      description: "Number of retail units",
    },
    {
      label: "Annual Footfall",
      value: location.footfall,
      formatted: location.footfall ? formatNumber(location.footfall) : "N/A",
      icon: Users,
      description: "Visitors per year",
    },
    {
      label: "Retail Space",
      value: location.retailSpace,
      formatted: location.retailSpace ? formatNumber(location.retailSpace) + " sq ft" : "N/A",
      icon: BarChart3,
      description: "Total retail floorspace",
    },
    {
      label: "Parking Spaces",
      value: location.parkingSpaces,
      formatted: location.parkingSpaces ? formatNumber(location.parkingSpaces) : "N/A",
      icon: Car,
      description: "Available parking",
    },
    {
      label: "Health Index",
      value: location.healthIndex,
      formatted: location.healthIndex ? location.healthIndex.toFixed(1) : "N/A",
      icon: TrendingUp,
      description: "Commercial health score",
    },
    {
      label: "Largest Category",
      value: location.largestCategory,
      formatted: location.largestCategory || "N/A",
      icon: Tag,
      description: location.largestCategoryPercent 
        ? `${location.largestCategoryPercent.toFixed(1)}% of stores`
        : "Primary tenant category",
    },
  ].filter(metric => metric.value !== undefined && metric.value !== null)

  if (metrics.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Metrics</CardTitle>
        <CardDescription>Overview of location performance and characteristics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div
                key={metric.label}
                className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    {metric.label}
                  </div>
                  <div className="text-2xl font-bold">
                    {metric.formatted}
                  </div>
                  {metric.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {metric.description}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

