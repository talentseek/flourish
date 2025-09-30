import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export const runtime = 'nodejs';

function toList(input: string | string[] | undefined): string[] {
  if (!input) return []
  if (Array.isArray(input)) return input
  return input.split(",").filter(Boolean)
}

export default async function RunReportPage({ params, searchParams }: { params: { targetId: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
  const targetId = params.targetId
  const nearbyIds = toList(searchParams.nearby)
  const radiusMiles = Number(Array.isArray(searchParams.radius) ? searchParams.radius[0] : searchParams.radius) || 10

  const target = await prisma.location.findUnique({ where: { id: targetId } })
  if (!target) return notFound()

  const nearby = nearbyIds.length > 0
    ? await prisma.location.findMany({ where: { id: { in: nearbyIds } } })
    : []

  // Compact analytics across selected locations
  const tenants = nearbyIds.length > 0
    ? await prisma.tenant.findMany({
        where: { locationId: { in: nearbyIds } },
        select: { locationId: true, isAnchorTenant: true, category: true, categoryRef: { select: { name: true } } },
      })
    : []

  const importedStores = tenants.length
  let anchors = 0
  const byCategory = new Map<string, number>()
  const importedByLocation = new Map<string, number>()
  for (const t of tenants) {
    if (t.isAnchorTenant) anchors += 1
    const cat = (t.categoryRef?.name || t.category || "Uncategorized").trim()
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + 1)
    importedByLocation.set(t.locationId, (importedByLocation.get(t.locationId) ?? 0) + 1)
  }
  const categoriesSorted = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10)

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Report Run</h1>
                  <p className="text-muted-foreground">Target: {target.name} • Radius: {radiusMiles} miles</p>
                </div>
                <Link href="/reports" className="text-sm underline">Back to Reports</Link>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Included Locations</CardTitle>
                  <CardDescription>
                    {nearby.length} locations selected for analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {nearby.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No locations selected.</div>
                  ) : (
                    <div className="space-y-2">
                      {nearby.map((l: any) => {
                        const importedCount = importedByLocation.get(l.id) ?? 0
                        const published = l.numberOfStores || 0
                        const note = importedCount !== published ? ` • imported ${importedCount}/${published}` : ""
                        return (
                          <div key={l.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <div className="font-medium">{l.name}</div>
                              <div className="text-xs text-muted-foreground">{l.type} • {l.city}, {l.county}</div>
                            </div>
                            <div className="text-xs text-muted-foreground">{published} stores{note}</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compact Analytics Summary</CardTitle>
                  <CardDescription>Based on selected locations</CardDescription>
                </CardHeader>
                <CardContent>
                  {nearby.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No selection.</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{nearby.length}</div>
                          <div className="text-xs text-muted-foreground">Locations</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{importedStores.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Stores</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{anchors}</div>
                          <div className="text-xs text-muted-foreground">Anchors</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{byCategory.size}</div>
                          <div className="text-xs text-muted-foreground">Categories</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-2">Top Categories</div>
                        {categoriesSorted.length === 0 ? (
                          <div className="text-sm text-muted-foreground">No category data.</div>
                        ) : (
                          <div className="grid md:grid-cols-2 gap-2">
                            {categoriesSorted.map(([name, count]) => (
                              <div key={name} className="flex items-center justify-between p-2 border rounded">
                                <div className="text-sm">{name}</div>
                                <div className="text-xs text-muted-foreground">{count}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">All metrics are based on imported stores (tenants).</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />

              <Card>
                <CardHeader className="text-center">
                  <CardTitle>Next Steps</CardTitle>
                  <CardDescription>Continue to the Queensgate report</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button asChild size="lg">
                    <Link href="/reports/queensgate">View Queensgate Report</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


