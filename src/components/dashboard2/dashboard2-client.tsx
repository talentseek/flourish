"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Location } from "@/types/location"
import { LocationSearchStage } from "./location-search-stage"
import { LocationDiscoveryStage } from "./location-discovery-stage"
import { ComparisonSetupStage } from "./comparison-setup-stage"
import { ReportGenerationStage } from "./report-generation-stage"
import { StageNavigation } from "./stage-navigation"
import { AssistantWidget } from "./assistant-widget"
import { DashboardMetrics } from "./dashboard-metrics"
import { GapAnalysis } from "@/lib/tenant-comparison"
import { generateSlug } from "@/lib/slug-utils"

interface Dashboard2ClientProps {
  locations: Location[]
  metrics: {
    totalLocations: number
    totalStores: number
    analysesCompleted: number
  }
}

export function Dashboard2Client({ locations, metrics }: Dashboard2ClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4>(1)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [searchRadius, setSearchRadius] = useState(5)
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([])
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null)

  // Handle URL parameters for initial state
  useEffect(() => {
    const locationId = searchParams?.get('location')
    const stageParam = searchParams?.get('stage')
    
    if (locationId) {
      const location = locations.find(loc => loc.id === locationId)
      if (location) {
        setSelectedLocation(location)
        if (stageParam) {
          const stage = parseInt(stageParam) as 1 | 2 | 3 | 4
          if (stage >= 1 && stage <= 4) {
            setCurrentStage(stage)
          } else {
            setCurrentStage(2)
          }
        } else {
          setCurrentStage(2)
        }
      }
    }
  }, [searchParams, locations])

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    setCurrentStage(2)
    // Update URL with slug
    const slug = generateSlug(location.name)
    router.push(`/dashboard2/${slug}`, { scroll: false })
  }

  const handleCompareClick = () => {
    setCurrentStage(3)
  }

  const handleGenerateReport = () => {
    setCurrentStage(4)
  }

  const handleBack = () => {
    if (currentStage > 1) {
      setCurrentStage((prev) => (prev - 1) as 1 | 2 | 3 | 4)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
              <StageNavigation 
                currentStage={currentStage} 
                onBack={handleBack}
                canGoBack={currentStage > 1}
              />
              
              {currentStage === 1 && (
                <DashboardMetrics 
                  totalLocations={metrics.totalLocations}
                  totalStores={metrics.totalStores}
                  analysesCompleted={metrics.analysesCompleted}
                />
              )}
              
              <div className="relative min-h-[60vh]">
                <div
                  key={currentStage}
                  className="transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-bottom-4"
                >
                  {currentStage === 1 && (
                    <LocationSearchStage 
                      locations={locations}
                      onLocationSelect={handleLocationSelect}
                    />
                  )}
                  
                  {currentStage === 2 && selectedLocation && (
                    <LocationDiscoveryStage 
                      location={selectedLocation}
                      onCompareClick={handleCompareClick}
                    />
                  )}
                  
                  {currentStage === 3 && selectedLocation && (
                    <ComparisonSetupStage 
                      targetLocation={selectedLocation}
                      allLocations={locations}
                      radius={searchRadius}
                      onRadiusChange={setSearchRadius}
                      selectedCompetitors={selectedCompetitors}
                      onCompetitorsChange={setSelectedCompetitors}
                      onGenerateReport={handleGenerateReport}
                    />
                  )}
                  
                  {currentStage === 4 && selectedLocation && (
                    <ReportGenerationStage 
                      targetLocation={selectedLocation}
                      competitorIds={selectedCompetitors}
                      gapAnalysis={gapAnalysis}
                      onGapAnalysisChange={setGapAnalysis}
                    />
                  )}
                </div>
              </div>

              {/* Floating Assistant - Minimizable */}
              <AssistantWidget />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

