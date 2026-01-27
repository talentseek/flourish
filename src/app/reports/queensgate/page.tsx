import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { FlourishLogo } from "@/components/flourish-logo"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Building2,
  Target,
  Users,
  MapPin,
  Star,
  BarChart3,
  Globe,
  Car,
  Zap,
  ShoppingBag,
  PieChart,
  ArrowUp,
  ArrowDown,
  Eye,
  DollarSign,
  Award,
  Phone,
  Mail,
  Linkedin,
  Twitter,
  ArrowLeft,
  ChevronRight
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { GoogleMaps } from "@/components/google-maps"
import { PrintButtons } from "@/components/print-buttons"

function toRadians(degrees: number) { return (degrees * Math.PI) / 180 }
function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default async function QueensgateReportPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/")
  }

  // Map data: target is Queensgate; show nearby within 25 miles
  // Prefer exact postcode match for Queensgate to avoid wrong cities
  let target = await prisma.location.findFirst({
    where: { postcode: { equals: "PE1 1NT", mode: "insensitive" } },
    include: { tenants: true }
  })
  if (!target) {
    target = await prisma.location.findFirst({
      where: { name: { contains: "Queensgate", mode: "insensitive" } },
      include: { tenants: true }
    })
  }
  let selectedCentre: any = null
  let nearbyCentres: any[] = []
  const radiusMiles = 10
  if (target) {
    // Known Queensgate coordinates (PE1 1NT) fallback
    const fallbackLat = 52.5739945664255
    const fallbackLon = -0.24454680547662228
    const latOk = typeof target.latitude === 'object' || typeof target.latitude === 'number'
    const lonOk = typeof target.longitude === 'object' || typeof target.longitude === 'number'
    const tLat = latOk ? Number(target.latitude as any) : fallbackLat
    const tLon = lonOk ? Number(target.longitude as any) : fallbackLon

    selectedCentre = {
      id: target.id,
      name: target.name,
      type: target.type,
      address: target.address,
      city: target.city,
      county: target.county,
      postcode: target.postcode,
      latitude: (tLat === 0 || !Number.isFinite(tLat)) ? fallbackLat : tLat,
      longitude: (tLon === 0 || !Number.isFinite(tLon)) ? fallbackLon : tLon,
      tenants: target.tenants.map(t => ({ id: t.id, name: t.name, category: t.category, isAnchorTenant: t.isAnchorTenant }))
    }
    const all = await prisma.location.findMany()
    const lat = selectedCentre.latitude
    const lon = selectedCentre.longitude
    const seen = new Set<string>()
    nearbyCentres = all
      .filter(l => l.id !== target.id && l.latitude != null && l.longitude != null)
      .map(l => ({
        id: l.id,
        name: l.name,
        type: l.type,
        address: l.address,
        city: l.city,
        county: l.county,
        postcode: l.postcode,
        numberOfStores: l.numberOfStores || 0,
        latitude: Number(l.latitude as any),
        longitude: Number(l.longitude as any),
      }))
      .map(l => ({ ...l, distance: haversineMiles(lat, lon, l.latitude, l.longitude) }))
      .filter(l => l.distance <= radiusMiles)
      .filter(l => {
        const key = l.name.trim().toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .sort((a, b) => a.distance - b.distance)
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header */}
              <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/reports">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Reports
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Queensgate Shopping Centre Report</h1>
                    <p className="text-muted-foreground">
                      Comprehensive Analysis - Peterborough, PE1 1NT
                    </p>
                  </div>
                </div>
                <PrintButtons />
              </div>

              {/* Map Overview */}
              {selectedCentre && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Map Overview (within {radiusMiles} miles)
                    </CardTitle>
                    <CardDescription>
                      {selectedCentre.name} and nearby locations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GoogleMaps selectedCentre={selectedCentre} distance={radiusMiles} nearbyCentres={nearbyCentres as any} className="h-80" />
                  </CardContent>
                </Card>
              )}

              {/* Table of Contents */}
              <Card className="bg-accent/50">
                <CardHeader>
                  <CardTitle className="text-lg">Table of Contents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    <Link href="#executive-summary" className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors">
                      <ChevronRight className="h-4 w-4" />
                      <span>1. Executive Summary</span>
                    </Link>
                    <Link href="#centre-profile" className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors">
                      <ChevronRight className="h-4 w-4" />
                      <span>2. Centre Profile</span>
                    </Link>
                    <Link href="#tenant-mix" className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors">
                      <ChevronRight className="h-4 w-4" />
                      <span>3. Tenant Mix Analysis</span>
                    </Link>
                    <Link href="#competitors" className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors">
                      <ChevronRight className="h-4 w-4" />
                      <span>4. Competitor Landscape</span>
                    </Link>
                    <Link href="#gap-analysis" className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors">
                      <ChevronRight className="h-4 w-4" />
                      <span>5. Gap Analysis & Opportunities</span>
                    </Link>
                    <Link href="#demographics" className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors">
                      <ChevronRight className="h-4 w-4" />
                      <span>6. Customer & Catchment Demographics</span>
                    </Link>
                    <Link href="#sentiment" className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors">
                      <ChevronRight className="h-4 w-4" />
                      <span>7. Customer Sentiment & Reviews</span>
                    </Link>
                    <Link href="#digital" className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors">
                      <ChevronRight className="h-4 w-4" />
                      <span>8. Digital & SEO Insights</span>
                    </Link>
                    <Link href="#financial" className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors">
                      <ChevronRight className="h-4 w-4" />
                      <span>9. Financial Opportunity Forecast</span>
                    </Link>
                    <Link href="#recommendations" className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors">
                      <ChevronRight className="h-4 w-4" />
                      <span>10. Strategic Recommendations</span>
                    </Link>
                    <Link href="#roadmap" className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors">
                      <ChevronRight className="h-4 w-4" />
                      <span>11. Implementation Roadmap</span>
                    </Link>
                    <Link href="#team" className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors">
                      <ChevronRight className="h-4 w-4" />
                      <span>12. The Flourish Team</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* 1. Executive Summary */}
              <section id="executive-summary">
                <Card>
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <FlourishLogo />
                      <span className="text-2xl font-bold">×</span>
                      <div className="text-center">
                        <h2 className="text-xl font-bold">Queensgate Shopping Centre</h2>
                        <p className="text-sm text-muted-foreground">Peterborough, PE1 1NT</p>
                      </div>
                    </div>
                    <CardTitle className="text-2xl">Executive Summary</CardTitle>
                    <CardDescription>
                      Report Date: {new Date().toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-primary">9.5M</div>
                          <p className="text-sm text-muted-foreground">Annual Footfall</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-primary">94</div>
                          <p className="text-sm text-muted-foreground">Retailers</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-primary">£2.4M</div>
                          <p className="text-sm text-muted-foreground">Revenue Opportunity</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-primary">4.1★</div>
                          <p className="text-sm text-muted-foreground">Google Rating</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Executive Summary Text */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Overview</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Queensgate Shopping Centre demonstrates strong performance with 9.5 million annual visitors
                        and a solid tenant mix. However, analysis reveals significant opportunities for revenue
                        growth through strategic tenant mix optimization. The centre&apos;s prime location in Peterborough,
                        combined with strong anchor tenants and excellent accessibility, positions it well for
                        expansion and enhancement.
                      </p>

                      <h3 className="text-lg font-semibold">Key Findings</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <ArrowUp className="h-4 w-4 text-green-500" />
                          <span>Footfall up 12% year-over-year, indicating strong recovery post-pandemic</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowDown className="h-4 w-4 text-red-500" />
                          <span>F&B category under-represented vs competitors by 7 stores</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowUp className="h-4 w-4 text-green-500" />
                          <span>Strong digital presence with 4.1★ rating and 14,089 reviews</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          <span>£2.4M revenue opportunity identified through gap analysis</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>Excellent parking facilities with 2,300 spaces and EV charging</span>
                        </li>
                      </ul>

                      <h3 className="text-lg font-semibold">Strategic Recommendations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-l-4 border-l-red-500">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">High Priority</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              Expand F&B offerings, particularly fast-casual dining options. Target 7 additional
                              food service establishments to match competitor density.
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-orange-500">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Medium Priority</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              Enhance entertainment and leisure offerings. Consider adding family entertainment
                              and experiential retail concepts.
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Long-term</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              Develop luxury and premium retail segments. Explore partnerships with high-end
                              brands to diversify tenant mix.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* 2. Centre Profile */}
              <section id="centre-profile">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Building2 className="h-6 w-6" />
                      2. Centre Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Details */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Basic Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <span className="font-medium">Address:</span>
                              <p className="text-sm text-muted-foreground">Queensgate Centre, Long Causeway, Peterborough PE1 1NT</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <span className="font-medium">Opened:</span>
                              <p className="text-sm text-muted-foreground">1982 (41 years of operation)</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <BarChart3 className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <span className="font-medium">Retail Space:</span>
                              <p className="text-sm text-muted-foreground">835,000 sq ft (77,500 sq m)</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <span className="font-medium">Retailers:</span>
                              <p className="text-sm text-muted-foreground">94 active tenants</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Car className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <span className="font-medium">Parking:</span>
                              <p className="text-sm text-muted-foreground">2,300 spaces (£2.80 for 0-2 hours)</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Zap className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <span className="font-medium">EV Charging:</span>
                              <p className="text-sm text-muted-foreground">15 spaces available</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <span className="font-medium">Footfall:</span>
                              <p className="text-sm text-muted-foreground">9.5M annually (26,000 daily average)</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Star className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <span className="font-medium">Rating:</span>
                              <p className="text-sm text-muted-foreground">4.1/5 (14,089 reviews)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Digital Presence */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Digital & Social Presence</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Website Performance</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span>Monthly Traffic:</span>
                              <span className="font-medium">3,300 visits</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Top Page:</span>
                              <span className="font-medium">Homepage (26%)</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>SEO Keywords:</span>
                              <span className="font-medium">5 ranked terms</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Website:</span>
                              <span className="font-medium">queensgate-shopping.co.uk</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3">Social Media</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span>Instagram:</span>
                              <span className="font-medium">@queensgate_pb</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Facebook:</span>
                              <span className="font-medium">4.0★ (2,991 reviews)</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>YouTube:</span>
                              <span className="font-medium">@queensgatepeterborough223</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>TikTok:</span>
                              <span className="font-medium">@queensgate_pb</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Performance Metrics */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-500">+12%</div>
                            <p className="text-sm text-muted-foreground">Footfall YoY Growth</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-500">96%</div>
                            <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-500">£1.2M</div>
                            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* 3. Tenant Mix */}
              <section id="tenant-mix">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <PieChart className="h-6 w-6" />
                      3. Tenant Mix Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Category Breakdown */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-500">35%</div>
                            <p className="text-sm text-muted-foreground">Fashion & Apparel</p>
                            <p className="text-xs text-muted-foreground">33 stores</p>
                            <div className="mt-2">
                              <Progress value={35} className="h-2" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-500">25%</div>
                            <p className="text-sm text-muted-foreground">Food & Beverage</p>
                            <p className="text-xs text-muted-foreground">24 stores</p>
                            <div className="mt-2">
                              <Progress value={25} className="h-2" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-500">20%</div>
                            <p className="text-sm text-muted-foreground">Health & Beauty</p>
                            <p className="text-xs text-muted-foreground">19 stores</p>
                            <div className="mt-2">
                              <Progress value={20} className="h-2" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-500">20%</div>
                            <p className="text-sm text-muted-foreground">Other Categories</p>
                            <p className="text-xs text-muted-foreground">18 stores</p>
                            <div className="mt-2">
                              <Progress value={20} className="h-2" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    {/* Anchor Tenants */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Anchor Tenants</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-full">
                                <ShoppingBag className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Next</p>
                                <p className="text-sm text-muted-foreground">Fashion & Apparel</p>
                                <p className="text-xs text-muted-foreground">Anchor Store</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-full">
                                <ShoppingBag className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Apple Store</p>
                                <p className="text-sm text-muted-foreground">Electronics</p>
                                <p className="text-xs text-muted-foreground">Premium Brand</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-full">
                                <ShoppingBag className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Boots</p>
                                <p className="text-sm text-muted-foreground">Health & Beauty</p>
                                <p className="text-xs text-muted-foreground">Pharmacy Chain</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* 4. Competitor Landscape */}
              <section id="competitors">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <BarChart3 className="h-6 w-6" />
                      4. Competitor Landscape
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Comparison Table */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Competitor Comparison</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Centre</th>
                              <th className="text-left p-2">Retailers</th>
                              <th className="text-left p-2">Footfall</th>
                              <th className="text-left p-2">Space (sq ft)</th>
                              <th className="text-left p-2">Rating</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b bg-accent/50">
                              <td className="p-2 font-medium">Queensgate</td>
                              <td className="p-2">94</td>
                              <td className="p-2">9.5M</td>
                              <td className="p-2">835,000</td>
                              <td className="p-2">4.1★</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-2">Meadowhall</td>
                              <td className="p-2">280</td>
                              <td className="p-2">25M</td>
                              <td className="p-2">1,400,000</td>
                              <td className="p-2">4.3★</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-2">Bluewater</td>
                              <td className="p-2">330</td>
                              <td className="p-2">27M</td>
                              <td className="p-2">1,800,000</td>
                              <td className="p-2">4.2★</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-2">Serpentine Green</td>
                              <td className="p-2">45</td>
                              <td className="p-2">2.1M</td>
                              <td className="p-2">350,000</td>
                              <td className="p-2">3.8★</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <Separator />

                    {/* Competitor Profiles */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Competitor Profiles</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Meadowhall</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">
                              Large regional shopping centre with extensive fashion and entertainment offerings.
                            </p>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">Fashion Heavy</Badge>
                              <Badge variant="outline" className="text-xs">Entertainment</Badge>
                              <Badge variant="outline" className="text-xs">Premium</Badge>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Bluewater</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">
                              Luxury-focused centre with high-end brands and premium dining options.
                            </p>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">Luxury</Badge>
                              <Badge variant="outline" className="text-xs">Premium F&B</Badge>
                              <Badge variant="outline" className="text-xs">High-end</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* 5. Gap Analysis & Opportunities */}
              <section id="gap-analysis">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Target className="h-6 w-6" />
                      5. Gap Analysis & Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Priority Gaps */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Priority Gaps</h3>
                      <div className="space-y-4">
                        <Card className="border-l-4 border-l-red-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">Fast Food & Takeaway</h4>
                                <p className="text-sm text-muted-foreground">
                                  Gap: 7 stores vs competitor average
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-red-500">£293K</div>
                                <p className="text-sm text-muted-foreground">Revenue potential</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-orange-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">Entertainment & Leisure</h4>
                                <p className="text-sm text-muted-foreground">
                                  Gap: 4 stores vs competitor average
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-orange-500">£156K</div>
                                <p className="text-sm text-muted-foreground">Revenue potential</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">Specialty Retail</h4>
                                <p className="text-sm text-muted-foreground">
                                  Gap: 3 stores vs competitor average
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-blue-500">£89K</div>
                                <p className="text-sm text-muted-foreground">Revenue potential</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    {/* Revenue Opportunity */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Total Revenue Opportunity</h3>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-2">£2.4M</div>
                        <p className="text-muted-foreground">
                          Potential annual revenue from filling identified gaps
                        </p>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">High Priority</span>
                          <span className="text-sm font-medium">£1.2M</span>
                        </div>
                        <Progress value={50} className="mb-4" />
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Medium Priority</span>
                          <span className="text-sm font-medium">£800K</span>
                        </div>
                        <Progress value={33} className="mb-4" />
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Low Priority</span>
                          <span className="text-sm font-medium">£400K</span>
                        </div>
                        <Progress value={17} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* 6. Customer & Catchment Demographics */}
              <section id="demographics">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Users className="h-6 w-6" />
                      6. Customer & Catchment Demographics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Population Overview */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Population & Reach</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-primary">960K</div>
                            <p className="text-sm text-muted-foreground">Catchment Population</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-primary">36</div>
                            <p className="text-sm text-muted-foreground">Median Age</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-primary">21.1%</div>
                            <p className="text-sm text-muted-foreground">Families with Children</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    {/* Income & Ownership */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Income & Ownership</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Household Income</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span>Average Income:</span>
                              <span className="font-medium">£29,400</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>vs National Average:</span>
                              <span className="font-medium text-green-500">+£5,100</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3">Home & Car Ownership</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span>Homeownership:</span>
                              <span className="font-medium">60%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Car Ownership:</span>
                              <span className="font-medium">80%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* 7. Customer Sentiment & Reviews */}
              <section id="sentiment">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Star className="h-6 w-6" />
                      7. Customer Sentiment & Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Online Ratings */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Online Ratings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-yellow-500 mb-2">4.1★</div>
                            <p className="text-sm text-muted-foreground">Google Reviews</p>
                            <p className="text-xs text-muted-foreground">14,089 reviews</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-blue-500 mb-2">4.0★</div>
                            <p className="text-sm text-muted-foreground">Facebook Reviews</p>
                            <p className="text-xs text-muted-foreground">2,991 reviews</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    {/* Review Themes */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Review Themes</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2 text-green-600">Strengths</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Clean facilities and modern design</li>
                            <li>• Strong anchor stores and brand selection</li>
                            <li>• Excellent parking facilities</li>
                            <li>• Good dining options</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 text-red-600">Areas for Improvement</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Parking costs could be lower</li>
                            <li>• More variety in store selection</li>
                            <li>• Additional entertainment options</li>
                            <li>• Better signage and navigation</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* 8. Digital & SEO Insights */}
              <section id="digital">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Globe className="h-6 w-6" />
                      8. Digital & SEO Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Top Keywords */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Top SEO Keywords</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">queensgate</span>
                            <p className="text-sm text-muted-foreground">Position: 2 | Volume: 2,400</p>
                          </div>
                          <Badge variant="secondary">High Volume</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">odeon peterborough</span>
                            <p className="text-sm text-muted-foreground">Position: 3 | Volume: 9,300</p>
                          </div>
                          <Badge variant="outline">Medium Volume</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">queensgate parking</span>
                            <p className="text-sm text-muted-foreground">Position: 1 | Volume: 900</p>
                          </div>
                          <Badge variant="secondary">High Volume</Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Top Pages */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Top Landing Pages</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">Homepage</span>
                            <p className="text-sm text-muted-foreground">3,300 visits (26% of traffic)</p>
                          </div>
                          <Badge variant="secondary">Primary</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">Odeon Cinema</span>
                            <p className="text-sm text-muted-foreground">1,700 visits (13% of traffic)</p>
                          </div>
                          <Badge variant="outline">Secondary</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">Parking Information</span>
                            <p className="text-sm text-muted-foreground">1,300 visits (11% of traffic)</p>
                          </div>
                          <Badge variant="outline">Secondary</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* 9. Financial Opportunity Forecast */}
              <section id="financial">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <DollarSign className="h-6 w-6" />
                      9. Financial Opportunity Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Revenue per Unit */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Estimated Revenue per Unit</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-500">£42K</div>
                            <p className="text-sm text-muted-foreground">Fast Food & Takeaway</p>
                            <p className="text-xs text-muted-foreground">Annual per unit</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-500">£39K</div>
                            <p className="text-sm text-muted-foreground">Entertainment & Leisure</p>
                            <p className="text-xs text-muted-foreground">Annual per unit</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-500">£30K</div>
                            <p className="text-sm text-muted-foreground">Specialty Retail</p>
                            <p className="text-xs text-muted-foreground">Annual per unit</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    {/* Total Opportunity */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Total Additional Revenue Potential</h3>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-2">£2.4M</div>
                        <p className="text-muted-foreground">
                          From filling high/medium/low priority gaps
                        </p>
                      </div>
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">High Priority (7 units)</span>
                          <span className="text-sm font-medium">£1.2M</span>
                        </div>
                        <Progress value={50} className="mb-4" />
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Medium Priority (4 units)</span>
                          <span className="text-sm font-medium">£800K</span>
                        </div>
                        <Progress value={33} className="mb-4" />
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Low Priority (3 units)</span>
                          <span className="text-sm font-medium">£400K</span>
                        </div>
                        <Progress value={17} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* 10. Strategic Recommendations */}
              <section id="recommendations">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Target className="h-6 w-6" />
                      10. Strategic Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Tenant Mix Strategy */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Tenant Mix Strategy</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Target Categories</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              <li>• Fast-casual dining chains</li>
                              <li>• Family entertainment venues</li>
                              <li>• Specialty retail concepts</li>
                              <li>• Health & wellness brands</li>
                            </ul>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Priority Order</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ol className="space-y-2 text-sm text-muted-foreground">
                              <li>1. Fast Food & Takeaway (7 units)</li>
                              <li>2. Entertainment & Leisure (4 units)</li>
                              <li>3. Specialty Retail (3 units)</li>
                              <li>4. Health & Beauty expansion</li>
                            </ol>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    {/* Digital Strategy */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Digital Strategy</h3>
                      <div className="space-y-4">
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">SEO Optimization</h4>
                            <p className="text-sm text-muted-foreground">
                              Focus on local search terms, improve content for high-volume keywords,
                              and enhance mobile user experience.
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">Social Media Engagement</h4>
                            <p className="text-sm text-muted-foreground">
                              Increase Instagram and TikTok presence, create engaging content
                              showcasing new tenants and events.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* 11. Implementation Roadmap */}
              <section id="roadmap">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Calendar className="h-6 w-6" />
                      11. Implementation Roadmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Quick Wins */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Quick Wins (0-3 months)</h3>
                      <div className="space-y-3">
                        <Card className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <h4 className="font-medium">Digital Presence Enhancement</h4>
                            <p className="text-sm text-muted-foreground">
                              Optimize website SEO, improve social media content, and enhance online listings.
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <h4 className="font-medium">Pop-up Retail Spaces</h4>
                            <p className="text-sm text-muted-foreground">
                              Launch temporary retail concepts to test market demand and generate immediate revenue.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    {/* Mid-term */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Mid-Term (3-12 months)</h3>
                      <div className="space-y-3">
                        <Card className="border-l-4 border-l-orange-500">
                          <CardContent className="p-4">
                            <h4 className="font-medium">F&B Expansion</h4>
                            <p className="text-sm text-muted-foreground">
                              Secure 3-4 fast-casual dining establishments and enhance food court offerings.
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-orange-500">
                          <CardContent className="p-4">
                            <h4 className="font-medium">Entertainment Integration</h4>
                            <p className="text-sm text-muted-foreground">
                              Add family entertainment options and experiential retail concepts.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    {/* Long-term */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Long-Term (&gt;12 months)</h3>
                      <div className="space-y-3">
                        <Card className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <h4 className="font-medium">Premium Brand Integration</h4>
                            <p className="text-sm text-muted-foreground">
                              Attract luxury and premium retail brands to diversify tenant mix.
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <h4 className="font-medium">Technology Integration</h4>
                            <p className="text-sm text-muted-foreground">
                              Implement smart retail technologies and enhance digital customer experience.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* 12. Our Team - Space to Trade */}
              <section id="team">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Users className="h-6 w-6" />
                      Our Team
                    </CardTitle>
                    <CardDescription>
                      Highly experienced across sales, visual merchandising, finance and shopping centre management
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Paul Clifford */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Image src="/paulnew.webp" alt="Paul Clifford" width={72} height={72} className="rounded-full object-cover team-member-image" />
                            <div>
                              <h4 className="font-semibold">Paul Clifford</h4>
                              <p className="text-xs text-muted-foreground mb-2">Founder & Director</p>
                              <p className="text-sm text-muted-foreground">
                                Paul has over 20 years retail and property management experience. Paul has worked in some of the UK&apos;s largest retailers including Boots, DSG and IKEA and managed shopping centres in Slough, Kings Lynn, Epsom and East London. The knowledge acquired throughout this career, gives Paul unparalleled expertise in the field of mall commercialisation.
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">paul@thisisflourish.co.uk</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Michelle Clark */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Image src="/michellenew.webp" alt="Michelle Clark" width={72} height={72} className="rounded-full object-cover team-member-image" />
                            <div>
                              <h4 className="font-semibold">Michelle Clark</h4>
                              <p className="text-xs text-muted-foreground mb-2">Sales Director</p>
                              <p className="text-sm text-muted-foreground">
                                Michelle has been in the placemaking industry for nearly 8 years and has a passion for working with small businesses. Michelle has a strong understanding of the property industry and in particular the fast pace of the shopping centre world. Michelle also has a number of small businesses herself and are still performing well today.
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">michelle@thisisflourish.co.uk</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Jemma Mills */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Image src="/jemmanew.webp" alt="Jemma Mills" width={72} height={72} className="rounded-full object-cover team-member-image" />
                            <div>
                              <h4 className="font-semibold">Jemma Mills</h4>
                              <p className="text-xs text-muted-foreground mb-2">Regional Manager</p>
                              <p className="text-sm text-muted-foreground">
                                Jemma has a wealth of experience within retail, having worked with major companies such as W H Smith and Welcome Break for 12 years. She is passionate about assisting her traders and landlords and utilises her extensive knowledge to grow the business and continue the rapport.
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">jemma@thisisflourish.co.uk</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Amanda Bishop */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Image src="/amandanew.webp" alt="Amanda Bishop" width={72} height={72} className="rounded-full object-cover team-member-image" />
                            <div>
                              <h4 className="font-semibold">Amanda Bishop</h4>
                              <p className="text-xs text-muted-foreground mb-2">Regional Manager</p>
                              <p className="text-sm text-muted-foreground">
                                Amanda has worked in Sales and Marketing for most of her working life and has extensive knowledge and experience in business development, account and staff management. Amanda is adept at creating new business to deliver revenue growth across multiple territories.
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">amanda@thisisflourish.co.uk</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Callum Clifford */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Image src="/callumnew.webp" alt="Callum Clifford" width={72} height={72} className="rounded-full object-cover team-member-image" />
                            <div>
                              <h4 className="font-semibold">Callum Clifford</h4>
                              <p className="text-xs text-muted-foreground mb-2">Regional Manager</p>
                              <p className="text-sm text-muted-foreground">
                                Callum is a results driven regional manager based in the south, with extensive experience in sales, marketing, and IT, as well as a background in starting and running a business. Using this experience, Callum helps traders and landlords grow by offering exceptional service and support.
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">callum@thisisflourish.co.uk</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Giorgia Shepherd */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Image src="/giorgianew.webp" alt="Giorgia Shepherd" width={72} height={72} className="rounded-full object-cover team-member-image" />
                            <div>
                              <h4 className="font-semibold">Giorgia Shepherd</h4>
                              <p className="text-xs text-muted-foreground mb-2">Regional Manager</p>
                              <p className="text-sm text-muted-foreground">
                                Giorgia is a passionate and enthusiastic regional manager based in the vibrant South East, with a wealth of experience in the hospitality industry. The dynamic and fast-paced environment of retail has always ignited Giorgia&apos;s enthusiasm, allowing her to thrive and develop her leadership qualities.
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">giorgia@thisisflourish.co.uk</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Paula Muers */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Image src="/paulanew.webp" alt="Paula Muers" width={72} height={72} className="rounded-full object-cover team-member-image" />
                            <div>
                              <h4 className="font-semibold">Paula Muers</h4>
                              <p className="text-xs text-muted-foreground mb-2">Regional Manager</p>
                              <p className="text-sm text-muted-foreground">
                                Paula has extensive experience of working within sales, marketing and business development. Working with B2B and B2C blue chip companies, including Coke Cola, Gillette, Nestle, 20th Century Fox, Unilever and Asda. Paula is passionate about what she does and has also run her own small business.
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">paula@thisisflourish.co.uk</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Daanyaal Tahir */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Image src="/daanyaalnew.webp" alt="Daanyaal Tahir" width={72} height={72} className="rounded-full object-cover team-member-image" />
                            <div>
                              <h4 className="font-semibold">Daanyaal Tahir</h4>
                              <p className="text-xs text-muted-foreground mb-2">Accounts & Team Administration</p>
                              <p className="text-sm text-muted-foreground">
                                Dan is the newest addition to our team, bringing a fresh perspective and a proactive approach to supporting our accounts. He plays a key role in managing day-to-day operations and overseeing team administration, ensuring everything runs like a well-oiled machine.
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">dan@thisisflourish.co.uk</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Sharon O'Rourke */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Image src="/sharonnew.webp" alt="Sharon O'Rourke" width={72} height={72} className="rounded-full object-cover team-member-image" />
                            <div>
                              <h4 className="font-semibold">Sharon O&apos;Rourke</h4>
                              <p className="text-xs text-muted-foreground mb-2">Regional Manager Scotland</p>
                              <p className="text-sm text-muted-foreground">
                                11 years ago, Sharon started her own marketing and events business which is still going strong today managing a large portfolio of clients including numerous shopping centres in Glasgow and the West and a Business Improvement District in the leafy suburb of Giffnock.
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">sharon@thisisflourish.co.uk</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Suki Sall */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Image src="/sukinew.webp" alt="Suki Sall" width={72} height={72} className="rounded-full object-cover team-member-image" />
                            <div>
                              <h4 className="font-semibold">Suki Sall</h4>
                              <p className="text-xs text-muted-foreground mb-2">Head of Accounts</p>
                              <p className="text-sm text-muted-foreground">
                                Suki is a Chartered Accountant with 5 years experience of accounts preparation, audit and assurance. Suki is responsible for the financial management of all aspects of the company including preparation of management and statutory accounts, taxation, cash-flows, budgets and financial planning.
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">accounts@thisisflourish.co.uk</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </section>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
