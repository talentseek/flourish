import { V2Navigation } from "@/components/v2-navigation"
import { V2VideoHero } from "@/components/v2-video-hero"
import { V2Gallery } from "@/components/v2-gallery"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function V2HomePage() {
  return (
    <>
      <V2Navigation />
      <main className="min-h-screen scroll-smooth">
        {/* Hero Section with Video */}
        <V2VideoHero />

        {/* Gallery Section */}
        <V2Gallery />

        {/* Locations Section */}
        <section id="locations" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-2 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Locations</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover our portfolio of retail destinations
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>Location {i}</CardTitle>
                    <CardDescription>Retail destination information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Details about this location will be displayed here.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Looking For Space Section */}
        <section id="looking-for-space" className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Looking For Space?</h2>
              <p className="text-lg text-muted-foreground">
                Are you a new trader looking for the perfect retail space? We have opportunities available across our portfolio.
              </p>
              <Button asChild size="lg" className="mt-4">
                <Link href="#contact">Get Started</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Join our portfolio Section */}
        <section id="join-portfolio" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Join Our Portfolio</h2>
              <p className="text-lg text-muted-foreground">
                Partner with us and activate your space. We work with property owners and developers to maximize the potential of retail spaces.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg">
                  <Link href="#contact">Partner With Us</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#contact">Activate Your Space</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trader Stories Section */}
        <section id="trader-stories" className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-2 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Trader Stories</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Success stories from our partners
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>Trader Story {i}</CardTitle>
                    <CardDescription>Success story headline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      This is where trader success stories will be featured. Real testimonials and case studies from our partners.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team/About Us Section */}
        <section id="team" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-2 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Team / About Us</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Learn more about our team and mission
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>About Flourish</CardTitle>
                  <CardDescription>Our mission and values</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Flourish is dedicated to transforming retail spaces into thriving destinations. We work with property owners, developers, and traders to create vibrant retail environments.
                  </p>
                  <Separator />
                  <p className="text-muted-foreground">
                    Our team brings together expertise in retail property management, market analysis, and tenant relations to deliver exceptional results.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Video Gallery Section */}
        <section id="video-gallery" className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-2 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Video Gallery</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Watch our featured videos
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <p className="text-muted-foreground">Video {i} placeholder</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section id="contact" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Contact Us</h2>
              <p className="text-lg text-muted-foreground">
                Get in touch with our team to learn more about our services
              </p>
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                  <CardDescription>We&apos;d love to hear from you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Contact form and details will be added here.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="mailto:info@flourish.com">Send us an email</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-background">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} Flourish. All rights reserved.</p>
              <p>Made with ❤️ for retail property</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}

