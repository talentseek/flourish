"use client"

import { TrendingUp, Tag, Building2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Location } from "@/types/location"

interface LocationCommercialKPIsProps {
  location: Location
}

export function LocationCommercialKPIs({ location }: LocationCommercialKPIsProps) {
  const hasData = location.healthIndex || location.largestCategory ||
    location.percentMultiple !== undefined || location.percentIndependent !== undefined

  if (!hasData) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commercial Performance</CardTitle>
        <CardDescription>Key performance indicators and tenant mix</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Health Index */}
        {location.healthIndex !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Health Index</span>
              </div>
              <span className="text-2xl font-bold">{location.healthIndex.toFixed(1)}</span>
            </div>
            <Progress value={(location.healthIndex / 10) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Commercial health score (0-10 scale)
            </p>
          </div>
        )}

        {/* Largest Category */}
        {location.largestCategory && (
          <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Largest Category</span>
            </div>
            <div className="text-xl font-bold">{location.largestCategory}</div>
            {location.largestCategoryPercent !== undefined && (
              <>
                <Progress value={location.largestCategoryPercent * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {(location.largestCategoryPercent * 100).toFixed(1)}% of total stores
                </p>
              </>
            )}
          </div>
        )}

        {/* Tenant Mix */}
        {(location.percentMultiple !== undefined || location.percentIndependent !== undefined) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Tenant Mix</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {location.percentMultiple !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Multiple Retailers</span>
                    <span className="font-semibold">{(location.percentMultiple * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={location.percentMultiple * 100} className="h-2" />
                </div>
              )}
              {location.percentIndependent !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Independent Retailers</span>
                    <span className="font-semibold">{(location.percentIndependent * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={location.percentIndependent * 100} className="h-2" />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

