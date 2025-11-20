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

export function LocationDiscoveryStage({ location, onCompareClick }: LocationDiscoveryStageProps) {
  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)

  const handleCompareClick = () => {
    // Update URL to include stage parameter
    const slug = generateSlug(location.name)
    router.push(`/dashboard2/${slug}?stage=3`, { scroll: false })
    onCompareClick()
  }

  return (
    <div className="space-y-6">
      {/* PDF Download Button */}
      <div className="flex justify-end">
        <PDFDownloadButton location={location} contentRef={contentRef} />
      </div>

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

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleCompareClick}
          size="lg"
          className="gap-2"
        >
          Compare with Others
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      </div>
    </div>
  )
}
