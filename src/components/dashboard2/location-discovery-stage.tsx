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
import { LocationParkingCard, LocationPropertyCard, LocationOwnershipCard } from "./location-compact-cards"
import { PDFDownloadButton } from "./pdf-download-button"
import { generateSlug } from "@/lib/slug-utils"
import { useRouter } from "next/navigation"
import { DemoRequestModal } from "@/components/demo-request-modal"

interface LocationDiscoveryStageProps {
  location: Location
  onCompareClick: () => void
  isPublic?: boolean
}

export function LocationDiscoveryStage({ location, onCompareClick, isPublic = false }: LocationDiscoveryStageProps) {
  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)

  const handleCompareClick = () => {
    onCompareClick()  // Call the parent's handler to advance to Compare stage
  }


  return (
    <div className="space-y-6">
      {/* Content Container with ref for PDF generation */}
      <div id="location-content" ref={contentRef} className="space-y-6">
        {/* Hero Section with Website Prominence */}
        <LocationHeroSection location={location} />

        {/* Key Metrics */}
        <LocationMetricsGrid location={location} />

        {/* Operational Cards Row - 3 columns on desktop */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Parking Card */}
          <LocationParkingCard location={location} />

          {/* Property Details Card */}
          <LocationPropertyCard location={location} />

          {/* Ownership Card */}
          <LocationOwnershipCard location={location} />
        </div>

        {/* Main Content Grid - Balanced 2 columns */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Reviews */}
            <LocationReviewsSection location={location} />

            {/* Demographics */}
            <LocationDemographicsSection location={location} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Commercial Performance */}
            <LocationCommercialKPIs location={location} />

            {/* SEO Data */}
            <LocationSEOSection location={location} />
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
          {isPublic ? (
            <DemoRequestModal
              trigger={
                <Button
                  size="lg"
                  className="gap-2 bg-[#E6FB60] text-[#4D4A46] hover:bg-[#E6FB60]/90 font-semibold"
                >
                  Request Access
                  <ArrowRight className="h-4 w-4" />
                </Button>
              }
            />
          ) : (
            <Button
              onClick={handleCompareClick}
              size="lg"
              className="gap-2 bg-[#E6FB60] text-[#4D4A46] hover:bg-[#E6FB60]/90 font-semibold"
            >
              Get Full Analytics and Comparison
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
