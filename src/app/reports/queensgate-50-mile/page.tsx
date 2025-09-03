import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building2, Store, MapPin, Users } from "lucide-react"

// Queensgate coordinates: 52.5736, -0.2478
const QUEENSGATE_LAT = 52.5736
const QUEENSGATE_LON = -0.2478
const RADIUS_MILES = 50

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function getPropertyTypeIcon(type: string) {
  switch (type) {
    case 'SHOPPING_CENTRE':
      return <Building2 className="h-4 w-4" />
    case 'RETAIL_PARK':
      return <Store className="h-4 w-4" />
    case 'OUTLET_CENTRE':
      return <Users className="h-4 w-4" />
    case 'HIGH_STREET':
      return <MapPin className="h-4 w-4" />
    default:
      return <Building2 className="h-4 w-4" />
  }
}

function getPropertyTypeColor(type: string) {
  switch (type) {
    case 'SHOPPING_CENTRE':
      return "bg-blue-100 text-blue-800"
    case 'RETAIL_PARK':
      return "bg-green-100 text-green-800"
    case 'OUTLET_CENTRE':
      return "bg-purple-100 text-purple-800"
    case 'HIGH_STREET':
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default async function Queensgate50MileReport() {
  // Get all properties with coordinates
  const allProperties = await prisma.location.findMany({
    where: {
      latitude: { not: 0 },
      longitude: { not: 0 }
    },
    include: {
      tenants: true
    }
  })

  // Filter to Queensgate catchment area
  const catchmentProperties = allProperties.filter(prop => {
    const distance = calculateDistance(
      QUEENSGATE_LAT, QUEENSGATE_LON,
      Number(prop.latitude), Number(prop.longitude)
    )
    return distance <= RADIUS_MILES
  })

  // Group by property type
  const byType = catchmentProperties.reduce((acc, prop) => {
    if (!acc[prop.type]) acc[prop.type] = []
    acc[prop.type].push(prop)
    return acc
  }, {} as Record<string, typeof catchmentProperties>)

  // Calculate summary statistics
  const totalProperties = catchmentProperties.length
  const totalTenants = catchmentProperties.reduce((sum, prop) => sum + prop.tenants.length, 0)
  const avgHealthIndex = catchmentProperties.reduce((sum, prop) => 
    sum + (prop.healthIndex ? Number(prop.healthIndex) : 0), 0) / totalProperties
  const avgVacancy = catchmentProperties.reduce((sum, prop) => 
    sum + (prop.vacancy ? Number(prop.vacancy) : 0), 0) / totalProperties

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Queensgate 50-Mile Catchment Analysis</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive analysis of retail properties within 50 miles of Queensgate Shopping Centre, Peterborough
        </p>
        <div className="flex justify-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            📍 Queensgate: 52.5736°N, 0.2478°W
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            🎯 Radius: 50 miles
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            📊 {totalProperties} Properties
          </Badge>
        </div>
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Catchment Summary</CardTitle>
          <CardDescription>Key metrics for the 50-mile catchment area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalProperties}</div>
              <p className="text-sm text-muted-foreground">Total Properties</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{totalTenants}</div>
              <p className="text-sm text-muted-foreground">Total Tenants</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{avgHealthIndex.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Avg Health Index</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{(avgVacancy * 100).toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Avg Vacancy Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>🏗️ Property Type Distribution</CardTitle>
          <CardDescription>Breakdown of properties by type in the catchment area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(byType).map(([type, properties]) => (
              <div key={type} className="text-center p-4 border rounded-lg">
                <div className="flex justify-center mb-2">
                  {getPropertyTypeIcon(type)}
                </div>
                <div className="text-2xl font-bold text-foreground">{properties.length}</div>
                <p className="text-sm text-muted-foreground capitalize">
                  {type.replace('_', ' ').toLowerCase()}s
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Properties by Type */}
      {Object.entries(byType).map(([type, properties]) => (
        <Card key={type}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getPropertyTypeIcon(type)}
              {type.replace('_', ' ')}s ({properties.length})
            </CardTitle>
            <CardDescription>
              Detailed view of all {type.toLowerCase().replace('_', ' ')}s in the catchment area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {properties.map((property) => {
                const distance = calculateDistance(
                  QUEENSGATE_LAT, QUEENSGATE_LON,
                  Number(property.latitude), Number(property.longitude)
                )
                
                return (
                  <div key={property.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{property.name}</h3>
                        <p className="text-sm text-muted-foreground">{property.address}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{property.city}, {property.county}</span>
                          <span>•</span>
                          <span>{distance.toFixed(1)} miles from Queensgate</span>
                        </div>
                      </div>
                      <Badge className={getPropertyTypeColor(type)}>
                        {type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {/* CSV KPI Data */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {property.healthIndex && (
                        <div>
                          <span className="font-medium">Health Index:</span>
                          <span className="ml-2 text-green-600">{Number(property.healthIndex).toFixed(2)}</span>
                        </div>
                      )}
                      {property.largestCategory && (
                        <div>
                          <span className="font-medium">Largest Category:</span>
                          <span className="ml-2">{property.largestCategory}</span>
                        </div>
                      )}
                      {property.largestCategoryPercent && (
                        <div>
                          <span className="font-medium">Category %:</span>
                          <span className="ml-2">{(Number(property.largestCategoryPercent) * 100).toFixed(1)}%</span>
                        </div>
                      )}
                      {property.vacancy && (
                        <div>
                          <span className="font-medium">Vacancy:</span>
                          <span className="ml-2 text-red-600">{(Number(property.vacancy) * 100).toFixed(1)}%</span>
                        </div>
                      )}
                      {property.numberOfStores && (
                        <div>
                          <span className="font-medium">Units:</span>
                          <span className="ml-2">{property.numberOfStores}</span>
                        </div>
                      )}
                      {property.totalFloorArea && (
                        <div>
                          <span className="font-medium">Floor Area:</span>
                          <span className="ml-2">{property.totalFloorArea.toLocaleString()} sqft</span>
                        </div>
                      )}
                      {property.tenants.length > 0 && (
                        <div>
                          <span className="font-medium">Tenants:</span>
                          <span className="ml-2">{property.tenants.length}</span>
                        </div>
                      )}
                      {property.qualityOfferMass && (
                        <div>
                          <span className="font-medium">Mass Market %:</span>
                          <span className="ml-2">{(Number(property.qualityOfferMass) * 100).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Methodology */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Methodology</CardTitle>
          <CardDescription>How this analysis was conducted</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Data Sources</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>UK Retail Properties Comprehensive List (2,648 properties)</li>
              <li>Queensgate Shopping Centre coordinates: 52.5736°N, 0.2478°W</li>
              <li>50-mile radius calculation using Haversine formula</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Analysis Scope</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Properties with valid coordinates in the catchment area</li>
              <li>CSV KPI data including health index, vacancy rates, and category mix</li>
              <li>Property type classification (Shopping Centres, Retail Parks, Outlet Centres, High Streets)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
