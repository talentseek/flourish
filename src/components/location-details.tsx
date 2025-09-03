"use client"

import { useState } from "react"
import { 
  MapPin, 
  Phone, 
  Globe, 
  Car, 
  Users, 
  Star, 
  TrendingUp, 
  Instagram, 
  Facebook, 
  Youtube, 
  ExternalLink,
  Zap,
  Building2,
  Calendar,
  Bus,
  PoundSterling,
  Target,
  BarChart3,
  Users2,
  Home,
  Car as CarIcon
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

import { Location } from "@/types/location"

interface LocationDetailsProps {
  location: Location
  onClose?: () => void
}

export function LocationDetails({ location, onClose }: LocationDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-muted-foreground'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}/5</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{location.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <MapPin className="h-4 w-4" />
            {location.address}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={location.type === 'SHOPPING_CENTRE' ? "default" : "outline"}>
              {location.type === 'SHOPPING_CENTRE' ? "Shopping Centre" : "Retail Park"}
            </Badge>
            {location.openedYear && (
              <Badge variant="secondary">
                Est. {location.openedYear}
              </Badge>
            )}
          </div>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Contact & Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Contact & Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {location.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{location.phone}</span>
              </div>
            )}
            {location.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={location.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  Visit Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
          
          {/* Social Media Links */}
          {(location.instagram || location.facebook || location.youtube || location.tiktok) && (
            <div>
              <h4 className="font-semibold mb-2">Social Media</h4>
              <div className="flex gap-2">
                {location.instagram && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={location.instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-4 w-4 mr-1" />
                      Instagram
                    </a>
                  </Button>
                )}
                {location.facebook && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={location.facebook} target="_blank" rel="noopener noreferrer">
                      <Facebook className="h-4 w-4 mr-1" />
                      Facebook
                    </a>
                  </Button>
                )}
                {location.youtube && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={location.youtube} target="_blank" rel="noopener noreferrer">
                      <Youtube className="h-4 w-4 mr-1" />
                      YouTube
                    </a>
                  </Button>
                )}
                {location.tiktok && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={location.tiktok} target="_blank" rel="noopener noreferrer">
                      <span className="mr-1">🎵</span>
                      TikTok
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {location.footfall && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Annual Footfall</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(location.footfall)}</div>
                  <p className="text-xs text-muted-foreground">visitors per year</p>
                </CardContent>
              </Card>
            )}
            
            {location.retailers && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Retailers</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{location.retailers}</div>
                  <p className="text-xs text-muted-foreground">active stores</p>
                </CardContent>
              </Card>
            )}
            
            {location.retailSpace && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Retail Space</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(location.retailSpace)}</div>
                  <p className="text-xs text-muted-foreground">sq ft</p>
                </CardContent>
              </Card>
            )}
            
            {location.parkingSpaces && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Parking</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(location.parkingSpaces)}</div>
                  <p className="text-xs text-muted-foreground">spaces</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Parking & Transport */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Parking & Transport
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {location.carParkPrice && (
                  <div className="flex items-center gap-2">
                    <PoundSterling className="h-4 w-4 text-muted-foreground" />
                    <span>0-2 hours: {formatCurrency(location.carParkPrice)}</span>
                  </div>
                )}
                {location.evCharging && (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span>EV Charging: {location.evChargingSpaces} spaces</span>
                  </div>
                )}
                {location.publicTransit && (
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-muted-foreground" />
                    <span>{location.publicTransit}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* SEO Performance */}
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
                  {location.seoKeywords.map((keyword: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{keyword.keyword}</div>
                        <div className="text-sm text-muted-foreground">
                          Position: #{keyword.position} • Volume: {formatNumber(keyword.volume)}
                        </div>
                      </div>
                      <Badge variant="outline">#{keyword.position}</Badge>
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
                  {location.topPages.map((page: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{page.url}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatNumber(page.traffic)} visits • {page.percentage}% of total
                        </div>
                      </div>
                      <Badge variant="secondary">{page.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          {/* Online Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {location.googleRating && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Google Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderStars(location.googleRating)}
                  <div className="text-2xl font-bold">
                    {location.googleReviews?.toLocaleString()} reviews
                  </div>
                  <Progress value={location.googleRating * 20} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    Based on {location.googleVotes?.toLocaleString()} votes
                  </p>
                </CardContent>
              </Card>
            )}

            {location.facebookRating && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Facebook className="h-5 w-5" />
                    Facebook Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderStars(location.facebookRating)}
                  <div className="text-2xl font-bold">
                    {location.facebookReviews?.toLocaleString()} reviews
                  </div>
                  <Progress value={location.facebookRating * 20} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    Based on {location.facebookVotes?.toLocaleString()} votes
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          {/* Demographics */}
          {location.population && (
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
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatNumber(location.population)}</div>
                    <p className="text-sm text-muted-foreground">Population</p>
                  </div>
                  
                  {location.medianAge && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">{location.medianAge}</div>
                      <p className="text-sm text-muted-foreground">Median Age</p>
                    </div>
                  )}
                  
                  {location.avgHouseholdIncome && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatCurrency(location.avgHouseholdIncome)}</div>
                      <p className="text-sm text-muted-foreground">Avg. Household Income</p>
                      {location.incomeVsNational && (
                        <p className="text-xs text-muted-foreground">
                          {location.incomeVsNational > 0 ? '+' : ''}{formatCurrency(location.incomeVsNational)} vs national avg
                        </p>
                      )}
                    </div>
                  )}
                  
                  {location.familiesPercent && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">{location.familiesPercent}%</div>
                      <p className="text-sm text-muted-foreground">Families (couples w/ children)</p>
                    </div>
                  )}
                  
                  {location.homeownership && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">{location.homeownership}%</div>
                      <p className="text-sm text-muted-foreground">Homeownership</p>
                      {location.homeownershipVsNational && (
                        <p className="text-xs text-muted-foreground">
                          {location.homeownershipVsNational > 0 ? '+' : ''}{location.homeownershipVsNational}% vs national avg
                        </p>
                      )}
                    </div>
                  )}
                  
                  {location.carOwnership && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">{location.carOwnership}%</div>
                      <p className="text-sm text-muted-foreground">Car Ownership</p>
                      {location.carOwnershipVsNational && (
                        <p className="text-xs text-muted-foreground">
                          {location.carOwnershipVsNational > 0 ? '+' : ''}{location.carOwnershipVsNational}% vs national avg
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
