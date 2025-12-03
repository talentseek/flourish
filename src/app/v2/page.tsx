import { V2Navigation } from "@/components/v2-navigation"
import { V2VideoHero } from "@/components/v2-video-hero"
import { V2LocationsSection } from "@/components/v2-locations-section"
import { V2NMTFSection } from "@/components/v2-nmtf-section"
import { V2LookingForSpaceSection } from "@/components/v2-looking-for-space-section"
import { V2JoinPortfolioSection } from "@/components/v2-join-portfolio-section"
import { V2TraderStoriesSection } from "@/components/v2-trader-stories-section"
import { V2TeamSection } from "@/components/v2-team-section"
import { V2VideoGallerySection } from "@/components/v2-video-gallery-section"
import { V2ContactSection } from "@/components/v2-contact-section"
import { V2Footer } from "@/components/v2-footer"

export default function V2HomePage() {
  return (
    <>
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

          {/* Video Gallery Section */}
          <V2VideoGallerySection />

          {/* Contact Us Section */}
          <V2ContactSection />

          {/* Footer */}
          {/* Footer */}
          <V2Footer />
        </main>
      </div>
    </>
  )
}

