import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export const runtime = 'nodejs';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Target, 
  Building2, 
  TrendingUp, 
  Users, 
  MapPin, 
  FileText,
  ArrowRight,
  Search,
  BarChart3
} from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/db"

export default async function DashboardPage() {
  const { userId } = auth()
  
  if (!userId) {
    redirect("/")
  }

  // Live metrics
  const [totalLocations, storesAggregate] = await Promise.all([
    prisma.location.count(),
    prisma.location.aggregate({
      _sum: { numberOfStores: true },
    }),
  ])
  const totalStores = (storesAggregate._sum.numberOfStores ?? 0)

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                  <p className="text-muted-foreground">
                    Welcome to Flourish - AI-powered shopping centre analysis
                  </p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalLocations.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Shopping centres, retail parks, outlet centres & high streets
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalStores.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Across all locations
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Analyses Completed</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">
                      This month
                    </p>
                  </CardContent>
                </Card>

                {/* Revenue Opportunities card removed until calculation is available */}
              </div>

              {/* Quick Actions */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Gap Analysis
                    </CardTitle>
                    <CardDescription>
                      Analyze tenant gaps and identify opportunities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Compare all location types to identify missing tenant categories and revenue opportunities.
                    </p>
                    <Button asChild className="w-full">
                      <Link href="/gap-analysis">
                        Start Analysis
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Location Search
                    </CardTitle>
                    <CardDescription>
                      Find and explore shopping centres
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Search through our database of UK retail properties.
                    </p>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/gap-analysis">
                        Browse Locations
                        <MapPin className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Reports
                    </CardTitle>
                    <CardDescription>
                      Generate detailed analysis reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Access comprehensive reports and insights from your gap analyses.
                    </p>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/reports">
                        View Reports
                        <BarChart3 className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest gap analysis activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Target className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Queensgate Analysis</p>
                          <p className="text-sm text-muted-foreground">
                            Compared with 8 nearby locations
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">2 hours ago</p>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Target className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Meadowhall Analysis</p>
                          <p className="text-sm text-muted-foreground">
                            Compared with 12 nearby locations
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">1 day ago</p>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Target className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Bluewater Analysis</p>
                          <p className="text-sm text-muted-foreground">
                            Compared with 6 nearby locations
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">3 days ago</p>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
