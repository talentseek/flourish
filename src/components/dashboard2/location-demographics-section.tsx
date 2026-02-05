"use client"

import { Users2, Home, Car, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Location } from "@/types/location"

interface LocationDemographicsSectionProps {
  location: Location
}

export function LocationDemographicsSection({ location }: LocationDemographicsSectionProps) {
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

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'N/A'
    }
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const hasDemographics = location.population || location.medianAge ||
    location.avgHouseholdIncome || location.homeownership ||
    location.carOwnership || location.familiesPercent ||
    location.seniorsPercent

  if (!hasDemographics) {
    return null
  }

  const ComparisonBadge = ({ value, isCurrency = false }: { value: number | undefined | null, isCurrency?: boolean }) => {
    if (value === undefined || value === null || isNaN(value)) return null

    const isPositive = value > 0
    const Icon = isPositive ? TrendingUp : TrendingDown
    const displayValue = isCurrency
      ? `${isPositive ? '+' : ''}${formatCurrency(value)}`
      : `${isPositive ? '+' : ''}${value.toFixed(1)}%`

    return (
      <Badge
        variant="outline"
        className={`gap-1 ${isPositive ? 'border-green-500/50 text-green-700' : 'border-orange-500/50 text-orange-700'}`}
      >
        <Icon className="h-3 w-3" />
        {displayValue} vs national
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users2 className="h-5 w-5" />
          Catchment Demographics
        </CardTitle>
        <CardDescription>
          Population and household data for the surrounding area
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {location.population && (
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold">{formatNumber(location.population)}</div>
              <p className="text-sm text-muted-foreground mt-1">Population</p>
            </div>
          )}

          {location.medianAge && (
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold">{location.medianAge}</div>
              <p className="text-sm text-muted-foreground mt-1">Median Age</p>
            </div>
          )}

          {location.avgHouseholdIncome !== undefined && (
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{formatCurrency(location.avgHouseholdIncome)}</div>
              <p className="text-sm text-muted-foreground mt-1">Avg. Household Income</p>
              {location.incomeVsNational !== undefined && (
                <div className="mt-2">
                  <ComparisonBadge value={location.incomeVsNational} isCurrency />
                </div>
              )}
            </div>
          )}

          {location.familiesPercent !== undefined && (
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold">{location.familiesPercent.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground mt-1">Families</p>
              <p className="text-xs text-muted-foreground">(couples w/ children)</p>
            </div>
          )}

          {location.seniorsPercent !== undefined && (
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold">{location.seniorsPercent.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground mt-1">Seniors</p>
            </div>
          )}

          {location.homeownership !== undefined && (
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold">{location.homeownership.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground mt-1">Homeownership</p>
              {location.homeownershipVsNational !== undefined && (
                <div className="mt-2">
                  <ComparisonBadge value={location.homeownershipVsNational} />
                </div>
              )}
            </div>
          )}

          {location.carOwnership !== undefined && (
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Car className="h-5 w-5 text-muted-foreground" />
                <div className="text-3xl font-bold">{location.carOwnership.toFixed(1)}%</div>
              </div>
              <p className="text-sm text-muted-foreground">Car Ownership</p>
              {location.carOwnershipVsNational !== undefined && (
                <div className="mt-2">
                  <ComparisonBadge value={location.carOwnershipVsNational} />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

