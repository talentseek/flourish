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
import { Facebook, Linkedin, Instagram } from "lucide-react"

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
        <footer className="border-t border-[#D8D8D6] bg-[#4D4A46] text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
              <p>© {new Date().getFullYear()} Flourish. All rights reserved.</p>
              
              {/* Social Media Icons */}
              <div className="flex items-center gap-4">
                <a 
                  href="https://www.facebook.com/p/This-is-Flourish-61555483902273/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="Facebook"
                >
                  <Facebook className="h-6 w-6 text-[#E6FB60]" />
                </a>
                <a 
                  href="https://www.linkedin.com/company/this-is-flourish" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-6 w-6 text-[#E6FB60]" />
                </a>
                <a 
                  href="https://www.instagram.com/this_is_flourish/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="Instagram"
                >
                  <Instagram className="h-6 w-6 text-[#E6FB60]" />
                </a>
              </div>
              
              <p>Made with ❤️ for retail property</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
    </>
  )
}

