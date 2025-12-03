import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
  Users,
  Lightbulb,
  MapPin,
  Eye,
  Play,
  Quote
} from "lucide-react"
import Link from "next/link"

export function V2JoinPortfolioSection() {
  return (
    <section id="join-portfolio" className="py-16 bg-[#F7F4F2]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#4D4A46]">
            Join Our Portfolio
          </h2>
          <p className="text-xl text-[#4D4A46]">
            Partner with us and activate your space. We work with property owners and developers
            to maximize the potential of retail spaces.
          </p>
        </div>

        {/* Track Record & Expertise */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-[#D8D8D6] bg-[#4D4A46] border-[#4D4A46]">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-8 w-8 text-[#E6FB60]" />
                <CardTitle className="text-2xl text-[#E6FB60]">Unmatched Track Record</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white font-medium">
                We have an unmatched track record of occupancy rates and revenue generation. Our
                partners see an average <strong className="text-white">30% increase in net income</strong>
                through our innovative approach to space activation.
              </p>
              <p className="text-white font-medium">
                Our transparent letting and occupancy model focuses on delivering sustainable business
                via insight, management, and support.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#D8D8D6] bg-[#4D4A46] border-[#4D4A46]">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-8 w-8 text-[#E6FB60]" />
                <CardTitle className="text-2xl text-[#E6FB60]">Team Expertise</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white font-medium">
                We are a team of experts with a background in retail. We understand the challenges
                of vacant space and have the experience to turn opportunities into thriving businesses.
              </p>
              <p className="text-white font-medium">
                From sales and visual merchandising to finance and placemaking, our team brings
                comprehensive expertise to every project.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Differentiators */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="border-[#D8D8D6] bg-[#4D4A46] border-[#4D4A46]">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Lightbulb className="h-6 w-6 text-[#E6FB60]" />
                <CardTitle className="text-xl text-[#E6FB60]">Problem Solvers</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white font-medium">
                We provide innovative solutions for landlords and operators, turning challenges
                into opportunities.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#D8D8D6] bg-[#4D4A46] border-[#4D4A46]">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="h-6 w-6 text-[#E6FB60]" />
                <CardTitle className="text-xl text-[#E6FB60]">Site Knowledge</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white font-medium">
                We know our sites and spend time understanding the space and building relationships
                locally.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#D8D8D6] bg-[#4D4A46] border-[#4D4A46]">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Eye className="h-6 w-6 text-[#E6FB60]" />
                <CardTitle className="text-xl text-[#E6FB60]">Transparent Model</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white font-medium">
                Our transparent letting and occupancy model focuses on delivering sustainable business
                via insight, management and support.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Client Testimonials */}
        <div className="mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-[#4D4A46] mb-8 text-center">
            Client Testimonials
          </h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="border-[#D8D8D6] bg-[#4D4A46] border-[#4D4A46]">
              <CardHeader>
                <Quote className="h-8 w-8 text-[#E6FB60] mb-2" />
                <CardTitle className="text-xl text-[#E6FB60]">Shopping Centre Owner</CardTitle>
                <CardDescription className="text-white">Major UK Shopping Centre</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white italic font-medium">
                  &quot;Flourish transformed our vacant spaces into thriving retail destinations. Their
                  approach is professional, innovative, and results-driven. We&apos;ve seen a significant
                  increase in footfall and revenue.&quot;
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#D8D8D6] bg-[#4D4A46] border-[#4D4A46]">
              <CardHeader>
                <Quote className="h-8 w-8 text-[#E6FB60] mb-2" />
                <CardTitle className="text-xl text-[#E6FB60]">Property Management Company</CardTitle>
                <CardDescription className="text-white">Retail Portfolio Manager</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white italic font-medium">
                  &quot;Working with Flourish has been a game-changer. They understand retail, they
                  understand our spaces, and they deliver results. The team&apos;s expertise and
                  hands-on approach make all the difference.&quot;
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Centre Walk Around Videos */}
        <div className="mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-[#4D4A46] mb-8 text-center">
            Centre Walk Around Videos
          </h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="border-[#D8D8D6] overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-[#D8D8D6]">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/M-ALomLEtBk"
                    title="Centre walk around video 1"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#D8D8D6] overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-[#D8D8D6]">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/g_4aestzo08"
                    title="Centre walk around video 2"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-[#4D4A46] py-12 rounded-lg text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Maximize Your Space?
          </h3>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            Let&apos;s discuss how we can help activate your retail spaces and drive sustainable growth.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#E6FB60] text-[#4D4A46] hover:bg-[#E6FB60]/90 font-semibold"
          >
            <Link href="#contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}


