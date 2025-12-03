"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Location } from "@/types/location"
import { LocationDiscoveryStage } from "./location-discovery-stage"
import { AssistantWidget } from "./assistant-widget"
import { useRouter } from "next/navigation"

import { RegionalManagerWidget } from "@/components/regional-manager-widget"

interface LocationDiscoveryPageProps {
  location: Location
  regionalManager?: {
    name: string
    phone?: string
    email?: string
    imageSrc: string
  }
}

export function LocationDiscoveryPage({ location, regionalManager }: LocationDiscoveryPageProps) {
  const router = useRouter()

  const handleCompareClick = () => {
    // Navigate to dashboard2 with location selected and stage 3
    router.push(`/dashboard2?location=${location.id}&stage=3`)
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
              <LocationDiscoveryStage
                location={location}
                onCompareClick={handleCompareClick}
              />

              {/* Floating Assistant or RM Widget */}
              {regionalManager ? (
                <RegionalManagerWidget {...regionalManager} />
              ) : (
                <AssistantWidget />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

