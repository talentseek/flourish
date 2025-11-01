"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { MissingBrand } from "@/lib/tenant-comparison"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface MissingBrandsSectionProps {
  missingBrands: MissingBrand[]
  targetLocationName: string
}

export function MissingBrandsSection({ missingBrands, targetLocationName }: MissingBrandsSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (missingBrands.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Missing Brands</CardTitle>
          <CardDescription>
            Tenant brands present in competitors but not in {targetLocationName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No missing brands identified. All competitor brands are already present.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group brands by category
  const brandsByCategory = new Map<string, MissingBrand[]>()
  missingBrands.forEach(brand => {
    const category = brand.category
    if (!brandsByCategory.has(category)) {
      brandsByCategory.set(category, [])
    }
    brandsByCategory.get(category)!.push(brand)
  })

  // Sort categories by number of brands
  const sortedCategories = Array.from(brandsByCategory.entries())
    .sort((a, b) => b[1].length - a[1].length)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Missing Brands</CardTitle>
        <CardDescription>
          {missingBrands.length} tenant brands found in competitors but not in {targetLocationName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between mb-4">
              <span>{isOpen ? 'Hide' : 'Show'} Missing Brands by Category</span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-4">
              {sortedCategories.map(([category, brands]) => (
                <div key={category} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{category}</h4>
                    <Badge variant="secondary">{brands.length} brands</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {brands.map((brand, idx) => (
                      <div
                        key={idx}
                        className="p-3 border rounded-md hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{brand.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Found in {brand.presentInLocations.length} location{brand.presentInLocations.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        {brand.presentInLocations.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {brand.presentInLocations.slice(0, 2).map((loc, locIdx) => (
                              <div key={locIdx} className="text-xs text-muted-foreground">
                                • {loc.locationName}
                              </div>
                            ))}
                            {brand.presentInLocations.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{brand.presentInLocations.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Summary */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Summary</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Missing</p>
              <p className="font-semibold text-lg">{missingBrands.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Categories</p>
              <p className="font-semibold text-lg">{sortedCategories.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Most Common Category</p>
              <p className="font-semibold">{sortedCategories[0]?.[0] || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Top Missing Brand</p>
              <p className="font-semibold">{missingBrands[0]?.name || '—'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

