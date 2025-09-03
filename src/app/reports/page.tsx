import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Download, 
  Calendar,
  Building2,
  Users,
  ArrowRight,
  Plus
} from "lucide-react"
import Link from "next/link"

export default async function ReportsPage() {
  const { userId } = auth()
  
  if (!userId) {
    redirect("/")
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                  <p className="text-muted-foreground">
                    View and download comprehensive gap analysis reports
                  </p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate New Report
                </Button>
              </div>

              {/* Available Reports */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Available Reports</h2>
                
                {/* Queensgate Report */}
                <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Queensgate Shopping Centre Report</CardTitle>
                          <CardDescription>
                            Comprehensive analysis - Peterborough, PE1 1NT
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2">Latest</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Key Metrics Preview */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">9.5M</div>
                          <p className="text-xs text-muted-foreground">Annual Footfall</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">94</div>
                          <p className="text-xs text-muted-foreground">Retailers</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">£2.4M</div>
                          <p className="text-xs text-muted-foreground">Revenue Opportunity</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">4.1★</div>
                          <p className="text-xs text-muted-foreground">Google Rating</p>
                        </div>
                      </div>

                      {/* Report Sections Preview */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Executive Summary</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Centre Profile</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Tenant Mix</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>Competitor Analysis</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Gap Analysis</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Team Profile</span>
                        </div>
                      </div>

                      {/* Report Details */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Generated: {new Date().toLocaleDateString('en-GB')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>12 sections</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>Flourish Team</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                          <Button size="sm" asChild>
                            <Link href="/reports/queensgate">
                              View Full Report
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Queensgate 50-Mile Catchment Analysis */}
                <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-full">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Queensgate 50-Mile Catchment Analysis</CardTitle>
                          <CardDescription>
                            Comprehensive analysis of 126+ properties in the catchment area
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2">New</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Key Metrics Preview */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">126</div>
                          <p className="text-xs text-muted-foreground">Properties</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">82</div>
                          <p className="text-xs text-muted-foreground">Retail Parks</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">41</div>
                          <p className="text-xs text-muted-foreground">Shopping Centres</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">3</div>
                          <p className="text-xs text-muted-foreground">High Streets</p>
                        </div>
                      </div>

                      {/* Report Features */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>CSV KPI Data</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Health Index</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Vacancy Rates</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>Category Mix</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Distance Analysis</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Property Types</span>
                        </div>
                      </div>

                      {/* Report Details */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Generated: {new Date().toLocaleDateString('en-GB')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>Live Data</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>2,648 Properties</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            CSV Export
                          </Button>
                          <Button size="sm" asChild>
                            <Link href="/reports/queensgate-50-mile">
                              View Analysis
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Empty State for Future Reports */}
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Additional Reports</h3>
                    <p className="text-muted-foreground mb-4">
                      Generate new reports to see them appear here
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate New Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
