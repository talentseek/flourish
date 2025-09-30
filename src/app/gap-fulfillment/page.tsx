import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Target } from "lucide-react"
import { Location } from "@/types/location"
import { GapsClient } from "@/components/gap-fulfillment-client"

export const runtime = 'nodejs'

function serializeLocation(l: any): Location {
  return {
    id: l.id,
    name: l.name,
    type: l.type,
    address: l.address,
    city: l.city,
    county: l.county,
    postcode: l.postcode,
    latitude: Number(l.latitude),
    longitude: Number(l.longitude),
    tenants: [],
    numberOfStores: l.numberOfStores ?? undefined,
  } as any
}

export default async function GapFulfillmentPage() {
  const { userId } = auth()
  if (!userId) redirect("/")

  const locations = await prisma.location.findMany({
    select: { id: true, name: true, type: true, address: true, city: true, county: true, postcode: true, latitude: true, longitude: true, numberOfStores: true },
    orderBy: { name: 'asc' }
  })

  const serialized = locations.map(serializeLocation)

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Gap Fulfillment (Simulation)
                  </CardTitle>
                  <CardDescription>
                    Select a shopping centre to view proposed gaps and choose an action to fulfill them
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <GapsClient locations={serialized as any} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

