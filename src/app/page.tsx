"use client"

import { useEffect } from "react"
import { V2Navigation } from "@/components/v2-navigation"
import { V2VideoHero } from "@/components/v2-video-hero"
import { V2LocationsSection } from "@/components/v2-locations-section"
import { V2NMTFSection } from "@/components/v2-nmtf-section"
import { V2LookingForSpaceSection } from "@/components/v2-looking-for-space-section"
import { V2JoinPortfolioSection } from "@/components/v2-join-portfolio-section"
import { V2TraderStoriesSection } from "@/components/v2-trader-stories-section"
import { V2TeamSection } from "@/components/v2-team-section"
import { V2PodcastSection } from "@/components/v2-podcast-section"
// import { V2VideoGallerySection } from "@/components/v2-video-gallery-section" // TEMPORARILY DISABLED FOR LAUNCH
import { V2ContactSection } from "@/components/v2-contact-section"
import { V2Footer } from "@/components/v2-footer"
import "./v2-styles.css"

export default function HomePage() {
  useEffect(() => {
    // Add class to HTML element for V2 page styling
    const html = document.documentElement
    const body = document.body

    // Force light mode on the homepage for consistent rendering
    html.classList.remove('dark')
    html.classList.add('light')

    html.classList.add('v2-page-active')
    body.classList.add('v2-page-active')

    return () => {
      // Restore when leaving page
      html.classList.remove('v2-page-active')
      body.classList.remove('v2-page-active')
      html.classList.remove('light')
    }
  }, [])

  return (
    <div className="v2-page">
      <div className="relative">
        <V2Navigation />
        <main className="min-h-screen scroll-smooth relative">
          {/* Hero Section with Video - Fixed positioned */}
          <V2VideoHero />

          {/* Spacer to account for fixed hero section */}
          <div className="h-screen w-full" aria-hidden="true" />

          {/* Locations Section */}
          <V2LocationsSection />

          {/* NMTF Section */}
          <V2NMTFSection />

          {/* Looking For Space Section */}
          <V2LookingForSpaceSection />

          {/* Join our portfolio Section */}
          <V2JoinPortfolioSection />

          {/* Trader Stories Section */}
          <V2TraderStoriesSection />

          {/* Team/About Us Section */}
          <V2TeamSection />

          {/* Video Gallery Section - TEMPORARILY DISABLED FOR LAUNCH */}
          {/* <V2VideoGallerySection /> */}

          {/* Podcast Section */}
          <V2PodcastSection />

          {/* Contact Us Section */}
          <V2ContactSection />

          {/* Footer */}
          <V2Footer />
        </main>
      </div>
    </div>
  )
}
