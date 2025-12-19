"use client"

import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Location } from "@/types/location"
import { LocationHeroSection } from "./location-hero-section"
import { LocationMetricsGrid } from "./location-metrics-grid"
import { LocationSocialLinks } from "./location-social-links"
import { LocationReviewsSection } from "./location-reviews-section"
import { LocationCommercialKPIs } from "./location-commercial-kpis"
import { LocationDemographicsSection } from "./location-demographics-section"
import { LocationSEOSection } from "./location-seo-section"
import { LocationTenantsSection } from "./location-tenants-section"
import { LocationOperationalSection } from "./location-operational-section"
import { PDFDownloadButton } from "./pdf-download-button"
import { generateSlug } from "@/lib/slug-utils"
import { useRouter } from "next/navigation"

interface LocationDiscoveryStageProps {
  location: Location
  onCompareClick: () => void
}

import { useState } from "react"
import { PreReservationDialog } from "@/components/pre-reservation-dialog"

// ... imports

export function LocationDiscoveryStage({ location, onCompareClick }: LocationDiscoveryStageProps) {
  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)
  const [showPreReservation, setShowPreReservation] = useState(false)

  const handleCompareClick = () => {
    setShowPreReservation(true)
  }


  return (
    <div className="space-y-6">
      {/* Content Container with ref for PDF generation */}
      <div id="location-content" ref={contentRef} className="space-y-6">
        {/* Hero Section with Website Prominence */}
        <LocationHeroSection location={location} />

        {/* Key Metrics */}
        <LocationMetricsGrid location={location} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Commercial Performance */}
            <LocationCommercialKPIs location={location} />

            {/* Reviews */}
            <LocationReviewsSection location={location} />

            {/* SEO Data */}
            <LocationSEOSection location={location} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Operational Details */}
            <LocationOperationalSection location={location} />

            {/* Demographics */}
            <LocationDemographicsSection location={location} />
          </div>
        </div>

        {/* Full Width Sections */}
        <LocationTenantsSection location={location} />

        {/* Action Section */}
        <div className="bg-[#4D4A46] rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold text-[#E6FB60] mb-3">Ready to explore opportunities?</h3>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Flourish provides comprehensive retail intelligence for shopping centres across the UK.
            Access footfall data, demographics, competitor analysis, and connect directly with our regional team.
          </p>
          <Button
            onClick={handleCompareClick}
            size="lg"
            className="gap-2 bg-[#E6FB60] text-[#4D4A46] hover:bg-[#E6FB60]/90 font-semibold"
          >
            Get Full Analytics and Comparison
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <PreReservationDialog
        open={showPreReservation}
        onOpenChange={setShowPreReservation}
      />
    </div>
  )
}
