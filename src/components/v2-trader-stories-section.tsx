import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Quote, TrendingUp } from "lucide-react"
import Image from "next/image"

export function V2TraderStoriesSection() {
  return (
    <section id="trader-stories" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#4D4A46]">
            Trader Stories
          </h2>
          <p className="text-xl text-[#4D4A46]">
            Real stories from traders who've flourished with us
          </p>
        </div>

        {/* Key Message */}
        <div className="bg-[#E6FB60] py-8 px-6 rounded-lg mb-16 max-w-4xl mx-auto">
          <p className="text-lg md:text-xl text-[#4D4A46] text-center font-medium">
            No rate cards, we understand the space and the opportunity to help make it work for 
            both the client and the trader. Every business deserves the opportunity to showcase 
            their product to others — let us help you make that dream a reality.
          </p>
        </div>

        {/* Featured Testimonials with Videos */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-[#D8D8D6] overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video bg-[#F7F4F2] flex items-center justify-center border-b border-[#D8D8D6]">
                <div className="text-center">
                  <Play className="h-12 w-12 text-[#E6FB60] mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Trader video testimonial 1</p>
                </div>
              </div>
              <div className="p-6">
                <Quote className="h-6 w-6 text-[#E6FB60] mb-2" />
                <p className="text-muted-foreground italic mb-4">
                  "Flourish helped us find the perfect space and we were trading within a week. 
                  The support throughout was incredible."
                </p>
                <p className="font-semibold text-[#E6FB60]">— Independent Trader</p>
                <p className="text-sm text-muted-foreground">Shopping Centre Location</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D8D8D6] overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video bg-[#F7F4F2] flex items-center justify-center border-b border-[#D8D8D6]">
                <div className="text-center">
                  <Play className="h-12 w-12 text-[#E6FB60] mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Trader video testimonial 2</p>
                </div>
              </div>
              <div className="p-6">
                <Quote className="h-6 w-6 text-[#E6FB60] mb-2" />
                <p className="text-muted-foreground italic mb-4">
                  "The flexibility and understanding Flourish showed made all the difference. 
                  They really care about making it work for everyone."
                </p>
                <p className="font-semibold text-[#E6FB60]">— Local Business Owner</p>
                <p className="text-sm text-muted-foreground">Multiple Centre Operator</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Retention Data */}
        <div className="mb-16 bg-[#F7F4F2] py-12 rounded-lg">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <TrendingUp className="h-12 w-12 text-[#E6FB60]" />
              <h3 className="text-3xl md:text-4xl font-bold text-[#4D4A46]">
                Trader Retention
              </h3>
            </div>
            <div className="bg-white p-8 rounded-lg border border-[#D8D8D6] max-w-2xl mx-auto">
              <p className="text-2xl md:text-3xl font-bold text-[#4D4A46] mb-4">
                80% More Likely to Rebook
              </p>
              <p className="text-lg text-[#4D4A46] font-medium">
                Traders who book with us for the 4th time are 80% more likely to rebook, 
                demonstrating the value and satisfaction of our partnership approach.
              </p>
              <div className="mt-6 pt-6 border-t border-[#D8D8D6]">
                <p className="text-sm text-[#4D4A46] font-medium">
                  This retention rate reflects our commitment to understanding each trader's 
                  unique needs and creating sustainable, long-term opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Standalone Testimonials */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="border-[#D8D8D6]">
            <CardHeader>
              <Quote className="h-6 w-6 text-[#E6FB60] mb-2" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground italic mb-4">
                "The team at Flourish made everything so simple. From finding the right space 
                to helping with compliance, they were there every step of the way."
              </p>
              <p className="font-semibold text-[#E6FB60]">— Sarah M.</p>
              <p className="text-sm text-muted-foreground">Pop-up Retailer</p>
            </CardContent>
          </Card>

          <Card className="border-[#D8D8D6]">
            <CardHeader>
              <Quote className="h-6 w-6 text-[#E6FB60] mb-2" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground italic mb-4">
                "We've expanded to three locations thanks to Flourish. Their understanding of 
                our business and the spaces available is unmatched."
              </p>
              <p className="font-semibold text-[#E6FB60]">— James T.</p>
              <p className="text-sm text-muted-foreground">Multi-location Trader</p>
            </CardContent>
          </Card>

          <Card className="border-[#D8D8D6]">
            <CardHeader>
              <Quote className="h-6 w-6 text-[#E6FB60] mb-2" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground italic mb-4">
                "Starting out was daunting, but Flourish made it feel achievable. The support 
                and guidance we received was invaluable."
              </p>
              <p className="font-semibold text-[#E6FB60]">— Emma L.</p>
              <p className="text-sm text-muted-foreground">First-time Trader</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}


