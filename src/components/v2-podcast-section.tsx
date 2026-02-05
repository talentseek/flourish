import { Card, CardContent } from "@/components/ui/card"
import { Headphones, Quote } from "lucide-react"

export function V2PodcastSection() {
    return (
        <section id="podcast" className="py-16 bg-[#F7F4F2]">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center space-y-4 mb-12 max-w-3xl mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Headphones className="h-8 w-8 text-[#4D4A46]" />
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#4D4A46]">
                            Flourish Podcast
                        </h2>
                    </div>
                    <p className="text-xl text-[#4D4A46]">
                        Conversations that power the heart of retail
                    </p>
                </div>

                {/* Featured Episode */}
                <div className="max-w-4xl mx-auto">
                    <Card className="border-[#D8D8D6] overflow-hidden">
                        <CardContent className="p-0">
                            <div className="aspect-video bg-[#D8D8D6]">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src="https://www.youtube.com/embed/5JmkMOS0UzE"
                                    title="Empowering the Heart of Retail: Michelle Clark Interviews Tania Murphy of the NMTF"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="flex items-start gap-4">
                                    <Quote className="h-6 w-6 text-[#E6FB60] flex-shrink-0 mt-1" />
                                    <div className="space-y-4">
                                        <h3 className="text-xl md:text-2xl font-bold text-[#4D4A46]">
                                            Empowering the Heart of Retail
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Michelle Clark, Flourish&apos;s Sales Director, sits down with Tania Murphy of
                                            the NMTF (National Market Traders Federation) to explore how the Federation
                                            supports over 25,000 market and street traders across the UK—from budding
                                            entrepreneurs to seasoned retailers.
                                        </p>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <span className="px-3 py-1 bg-[#E6FB60] text-[#4D4A46] text-sm font-medium rounded-full">
                                                #MarketTraders
                                            </span>
                                            <span className="px-3 py-1 bg-[#E6FB60] text-[#4D4A46] text-sm font-medium rounded-full">
                                                #IndependentRetail
                                            </span>
                                            <span className="px-3 py-1 bg-[#E6FB60] text-[#4D4A46] text-sm font-medium rounded-full">
                                                #NMTF
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Coming Soon Teaser */}
                <p className="text-center text-muted-foreground mt-8">
                    More episodes coming soon...
                </p>
            </div>
        </section>
    )
}
