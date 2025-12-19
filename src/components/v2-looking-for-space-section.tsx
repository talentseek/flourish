"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MapPin,
  Calendar,
  Users2,
  Users,
  TrendingUp,
  FileCheck,
  Search,
  Settings,
  ShoppingBag,
  CheckCircle2,
  Play,
  ChevronDown
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function V2LookingForSpaceSection() {
  const [activeStep, setActiveStep] = useState(1)

  return (
    <section id="looking-for-space" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#4D4A46]">
            Your business deserves to be seen.
          </h2>
          <p className="text-xl text-[#4D4A46]">
            We connect local traders and national brands with high-footfall shopping centres across the UK.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button
              asChild
              size="lg"
              className="bg-[#E6FB60] text-[#4D4A46] hover:bg-[#E6FB60]/90 font-semibold"
            >
              <Link href="#contact">Apply for a Space</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-[#4D4A46] bg-[#4D4A46] text-white hover:bg-[#4D4A46]/90 font-semibold"
            >
              <Link href="#contact">Register Your Interest</Link>
            </Button>
          </div>
        </div>

        {/* The Opportunity */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-[#4D4A46] mb-4">
              The Opportunity
            </h3>
            <p className="text-lg text-[#4D4A46] max-w-3xl mx-auto">
              Flourish offers flexible retail spaces within some of the UK&apos;s busiest shopping centres —
              from kiosks and pop-ups to promotional stands and seasonal setups.
            </p>
            <p className="text-lg text-[#4D4A46] max-w-3xl mx-auto mt-4">
              We make it simple for businesses of all sizes to access high-quality locations and reach
              thousands of shoppers every week.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MapPin, title: "Prime locations across the UK", desc: "Access to high-footfall shopping centres nationwide" },
              { icon: Calendar, title: "Flexible terms", desc: "From one day to long-term stays — we work around your needs" },
              { icon: Users2, title: "Guidance every step of the way", desc: "Expert support from application to opening day" },
              { icon: TrendingUp, title: "Opportunities to scale", desc: "Grow your presence across multiple centres" },
              { icon: Users, title: "Community of like-minded traders", desc: "Join a network of successful independent businesses" },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <Card key={index} className="border-[#D8D8D6] bg-[#4D4A46] border-[#4D4A46]">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#E6FB60]/20 rounded-lg">
                        <Icon className="h-6 w-6 text-[#E6FB60]" />
                      </div>
                      <CardTitle className="text-xl text-[#E6FB60]">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white font-medium">{item.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16 bg-[#F7F4F2] py-12 rounded-lg">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-[#4D4A46] mb-4">
              How It Works
            </h3>
          </div>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { num: 1, icon: FileCheck, title: "Apply", desc: "Tell us about your business using our quick form" },
              { num: 2, icon: Search, title: "Match", desc: "We'll find locations that suit your brand, audience, and budget" },
              { num: 3, icon: Settings, title: "Set Up", desc: "We'll guide you through paperwork, compliance, and onboarding" },
              { num: 4, icon: ShoppingBag, title: "Start Trading", desc: "You're open for business! We'll stay in touch to help you succeed" },
            ].map((step) => {
              const Icon = step.icon
              return (
                <div key={step.num} className="text-center">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 bg-[#E6FB60] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-[#4D4A46]" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#4D4A46] text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {step.num}
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-[#4D4A46] mb-2">{step.title}</h4>
                  <p className="text-[#4D4A46] font-medium">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* How We Help You Flourish */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-[#4D4A46] mb-4">
              How We Help You Flourish
            </h3>
            <p className="text-lg text-[#4D4A46] max-w-3xl mx-auto">
              Our team are on the ground across the UK — visiting sites, meeting traders, and ensuring
              you have everything you need to succeed.
            </p>
            <p className="text-lg text-[#4D4A46] max-w-3xl mx-auto mt-4">
              From paperwork and compliance to marketing and customer insights, we&apos;re here to help you
              every step of the way.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: FileCheck, title: "Compliance guidance", desc: "PAT testing, RAMS, insurance — we'll help you get everything in order" },
              { icon: TrendingUp, title: "Visual merchandising advice", desc: "Expert tips to make your stand look its best and attract customers" },
              { icon: Users, title: "Help connecting to local audiences", desc: "Marketing support and insights to reach shoppers in your area" },
              { icon: MapPin, title: "Access to premium space", desc: "Locations usually reserved for major brands, now accessible to you" },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <Card key={index} className="border-[#4D4A46] bg-[#4D4A46]">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#E6FB60]/20 rounded-lg">
                        <Icon className="h-6 w-6 text-[#E6FB60]" />
                      </div>
                      <CardTitle className="text-xl text-[#E6FB60]">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white font-medium">{item.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-[#4D4A46] mb-4">
              Success Stories / Trader Testimonials
            </h3>
          </div>

          <Card className="max-w-3xl mx-auto mb-8 border-[#D8D8D6] bg-[#4D4A46] border-[#4D4A46]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#E6FB60]">Spud Haven</CardTitle>
              <CardDescription className="text-white">One Stop Shopping Centre, Perry Barr</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-white italic mb-4 font-medium">
                &quot;Working with Callum and This Is Flourish has been one of the best decisions we&apos;ve made.&quot;
              </p>
              <p className="text-white font-medium mb-4">
                From the moment we partnered with Callum and the team at This Is Flourish, the experience has been outstanding. Callum has made every stage of the process effortless, demonstrating a level of professionalism, responsiveness, and genuine care that is rare to find.
              </p>
              <p className="text-white font-medium mb-4">
                Working with Flourish has been transformational for our business. Their expertise, creativity, and hands-on approach have not only streamlined our operations but also contributed to a noticeable increase in performance and growth. Since joining forces with them, business has been thriving, and we&apos;re already exploring opportunities to expand into additional venues together.
              </p>
              <p className="text-white/80 text-sm mt-4">
                — Rukhsana, Spud Haven
              </p>
            </CardContent>
          </Card>

          {/* Video Montage Placeholder */}
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-[#F7F4F2] rounded-lg overflow-hidden border border-[#D8D8D6]">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/uzZaZZJIt-c"
                title="Trader video montage"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* Ready to Start */}
        <div className="bg-[#E6FB60] py-12 rounded-lg text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-[#4D4A46] mb-4">
            Ready to Start?
          </h3>
          <p className="text-lg text-[#4D4A46] mb-6 max-w-2xl mx-auto">
            Whether you&apos;re launching your first pop-up or expanding your brand nationwide, Flourish
            helps you find the perfect space to grow.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#4D4A46] text-white hover:bg-[#4D4A46]/90 font-semibold"
          >
            <Link href="#contact">Register Your Interest →</Link>
          </Button>
          <p className="text-sm text-[#4D4A46]/80 mt-4">
            A member of our team will be in touch to explore opportunities near you.
          </p>
        </div>

        {/* FAQs */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-[#4D4A46] mb-8 text-center">
            Frequently Asked Questions
          </h3>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="documents">
              <AccordionTrigger className="text-left text-[#4D4A46]">
                What documents do I need to start trading?
              </AccordionTrigger>
              <AccordionContent className="text-[#4D4A46]">
                You&apos;ll typically need public liability insurance, PAT testing certificates for electrical
                equipment, and risk assessment documentation (RAMS). Our team will guide you through all
                required documentation and can help you obtain what you need.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="kiosk">
              <AccordionTrigger className="text-left text-[#4D4A46]">
                Do I need my own kiosk or can I rent one?
              </AccordionTrigger>
              <AccordionContent className="text-[#4D4A46]">
                Both options are available depending on the location. Some spaces come with existing kiosks
                or units, while others allow you to bring your own. We&apos;ll discuss your specific needs
                during the matching process and find the best solution for your business.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cost">
              <AccordionTrigger className="text-left text-[#4D4A46]">
                How much does it cost to trade?
              </AccordionTrigger>
              <AccordionContent className="text-[#4D4A46]">
                Costs vary depending on the location, space size, and duration of your stay. We work with
                you to find options that fit your budget. There are no rate cards — we understand each
                space and opportunity individually to make it work for both you and the landlord.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="move">
              <AccordionTrigger className="text-left text-[#4D4A46]">
                Can I move between centres?
              </AccordionTrigger>
              <AccordionContent className="text-[#4D4A46]">
                Absolutely! Many of our traders operate across multiple locations. We can help you scale
                your presence and move between centres as your business grows. Our flexible terms make it
                easy to expand your reach.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  )
}

