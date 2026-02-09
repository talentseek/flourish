"use client"

import { Target, TrendingUp, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Location } from "@/types/location"

interface LocationSEOSectionProps {
  location: Location
}

export function LocationSEOSection({ location }: LocationSEOSectionProps) {
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

  const hasSEOData = (location.seoKeywords && location.seoKeywords.length > 0) ||
    (location.topPages && location.topPages.length > 0)

  if (!hasSEOData) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* SEO Keywords */}
      {location.seoKeywords && location.seoKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Top SEO Keywords
            </CardTitle>
            <CardDescription>
              Search performance for key terms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {location.seoKeywords.slice(0, 10).map((keyword: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{keyword.keyword}</div>
                    <div className="text-sm text-muted-foreground">
                      Position: #{keyword.position} • Volume: {formatNumber(keyword.volume)}
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    #{keyword.position}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Pages */}
      {location.topPages && location.topPages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Pages
            </CardTitle>
            <CardDescription>
              Most visited pages on the website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {location.topPages.slice(0, 10).map((page: any, index: number) => {
                const isString = typeof page === 'string'
                const label = isString ? page : page.url
                const hasStats = !isString && page.traffic !== undefined

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate flex items-center gap-2">
                        {label}
                        {location.website && (
                          <a
                            href={isString ? location.website : `${location.website}${page.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {hasStats && (
                        <div className="text-sm text-muted-foreground">
                          {formatNumber(page.traffic)} visits • {page.percentage}% of total
                        </div>
                      )}
                    </div>
                    {hasStats && (
                      <Badge variant="secondary" className="ml-2">
                        {page.percentage}%
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

