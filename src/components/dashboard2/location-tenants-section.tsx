"use client"

import { Building2, Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Location } from "@/types/location"

interface LocationTenantsSectionProps {
  location: Location
}

export function LocationTenantsSection({ location }: LocationTenantsSectionProps) {
  if (!location.tenants || location.tenants.length === 0) {
    return null
  }

  // Group tenants by category
  const tenantsByCategory = new Map<string, typeof location.tenants>()
  location.tenants.forEach(tenant => {
    const category = tenant.category || 'Other'
    if (!tenantsByCategory.has(category)) {
      tenantsByCategory.set(category, [])
    }
    tenantsByCategory.get(category)!.push(tenant)
  })

  const anchorTenants = location.tenants.filter(t => t.isAnchorTenant)
  const regularTenants = location.tenants.filter(t => !t.isAnchorTenant)

  // Check if numberOfStores is available and different from tenant count
  const hasStoreCount = location.numberOfStores !== undefined && location.numberOfStores !== null
  const storeCount = location.numberOfStores || 0
  const tenantCount = location.tenants.length
  const showStoreComparison = hasStoreCount && storeCount !== tenantCount

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Tenant Information
        </CardTitle>
        <CardDescription>
          {showStoreComparison ? (
            <>
              {tenantCount} imported tenant{tenantCount !== 1 ? 's' : ''} of {storeCount} total stores
              {anchorTenants.length > 0 && ` • ${anchorTenants.length} anchor tenant${anchorTenants.length !== 1 ? 's' : ''}`}
            </>
          ) : (
            <>
              {tenantCount} total tenant{tenantCount !== 1 ? 's' : ''}
              {anchorTenants.length > 0 && ` • ${anchorTenants.length} anchor tenant${anchorTenants.length !== 1 ? 's' : ''}`}
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className={`grid gap-4 ${showStoreComparison ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'}`}>
          {showStoreComparison && (
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold">{storeCount}</div>
              <div className="text-sm text-muted-foreground">Total Stores</div>
            </div>
          )}
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold">{tenantCount}</div>
            <div className="text-sm text-muted-foreground">
              {showStoreComparison ? 'Imported Tenants' : 'Total Tenants'}
            </div>
          </div>
          {anchorTenants.length > 0 && (
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold">{anchorTenants.length}</div>
              <div className="text-sm text-muted-foreground">Anchor Tenants</div>
            </div>
          )}
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold">{tenantsByCategory.size}</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </div>
        </div>

        {/* Category Breakdown */}
        {tenantsByCategory.size > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Category Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Array.from(tenantsByCategory.entries())
                .sort((a, b) => b[1].length - a[1].length)
                .map(([category, tenants]) => (
                  <div
                    key={category}
                    className="p-2 border rounded-lg text-center"
                  >
                    <div className="font-semibold">{tenants.length}</div>
                    <div className="text-xs text-muted-foreground truncate">{category}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Anchor Tenants */}
        {anchorTenants.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              Anchor Tenants
            </h4>
            <div className="flex flex-wrap gap-2">
              {anchorTenants.map((tenant) => (
                <Badge key={tenant.id} variant="default" className="text-sm">
                  {tenant.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sample Tenants List */}
        <div className="space-y-3">
          <h4 className="font-semibold">Sample Tenants</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {location.tenants.slice(0, 20).map((tenant) => (
              <div
                key={tenant.id}
                className="flex items-center justify-between p-2 border rounded-lg text-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{tenant.name}</div>
                  {tenant.category && (
                    <div className="text-xs text-muted-foreground">{tenant.category}</div>
                  )}
                </div>
                {tenant.isAnchorTenant && (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 ml-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
          {location.tenants.length > 20 && (
            <p className="text-sm text-muted-foreground text-center">
              + {location.tenants.length - 20} more tenants
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

