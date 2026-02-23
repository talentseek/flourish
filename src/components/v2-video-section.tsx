import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

export function V2VideoSection() {
  return (
    <section id="video" className="py-16 bg-[#4D4A46]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-12 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Play className="h-8 w-8 text-[#E6FB60]" />
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              See Flourish in Action
            </h2>
          </div>
          <p className="text-xl text-white/80">
            Discover how our AI-powered platform is transforming retail property
            intelligence across the UK
          </p>
        </div>

        {/* Video Embed */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-[#D8D8D6] overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video bg-[#D8D8D6]">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/M_T7tZhIFGE"
                  title="Introducing Flourish AI — Retail Property Intelligence for the UK Market"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="p-6 md:p-8 text-center space-y-4">
                <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  From gap analysis to tenant matching, Flourish gives landlords
                  and operators the data-driven insights they need to make
                  smarter decisions — across 2,600+ UK retail destinations.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="text-lg px-8 bg-[#E6FB60] text-[#4D4A46] hover:bg-[#E6FB60]/90 border-0 font-semibold"
                >
                  <a href="#contact">Get in Touch</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
