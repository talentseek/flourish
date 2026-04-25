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

                {/* Latest Episode — Chris Wade */}
                <div className="max-w-4xl mx-auto">
                    <Card className="border-[#D8D8D6] overflow-hidden">
                        <CardContent className="p-0">
                            <div className="aspect-video bg-[#D8D8D6]">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src="https://www.youtube.com/embed/x9cRpzS76PE"
                                    title="Placemaking, Human Connections &amp; The 2026 Destination — Paul Clifford &amp; Chris Wade"
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
                                            Placemaking, Human Connections &amp; The 2026 Destination
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Paul Clifford sits down with place-making expert Chris Wade for an
                                            insightful look into what truly makes destinations thrive in 2026.
                                            They explore why prioritising emotional and social connections is
                                            outperforming traditional commercial models, and how aligning retail
                                            spaces with human needs is essential for long-term success. A must-listen
                                            for anyone involved in the evolution of physical retail.
                                        </p>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <span className="px-3 py-1 bg-[#E6FB60] text-[#4D4A46] text-sm font-medium rounded-full">
                                                #Placemaking
                                            </span>
                                            <span className="px-3 py-1 bg-[#E6FB60] text-[#4D4A46] text-sm font-medium rounded-full">
                                                #PhysicalRetail
                                            </span>
                                            <span className="px-3 py-1 bg-[#E6FB60] text-[#4D4A46] text-sm font-medium rounded-full">
                                                #CommunityBuilding
                                            </span>
                                            <span className="px-3 py-1 bg-[#E6FB60] text-[#4D4A46] text-sm font-medium rounded-full">
                                                #RetailFuture
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Previous Episode — Caroline Main */}
                <div className="max-w-4xl mx-auto mt-8">
                    <Card className="border-[#D8D8D6] overflow-hidden">
                        <CardContent className="p-0">
                            <div className="aspect-video bg-[#D8D8D6]">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src="https://www.youtube.com/embed/E-HZvzIxGHg"
                                    title="Leadership, Resilience &amp; The Property Game: Caroline Main on Navigating Change"
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
                                            Leadership, Resilience &amp; The Property Game
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Paul Clifford is joined by property industry leader Caroline Main for an
                                            open conversation about building a high-performance career without losing
                                            your peace of mind. From breaking into property to leading in a
                                            male-dominated environment, they explore mental resilience, authentic
                                            leadership, and how the post-pandemic shift continues to shape the way
                                            we work.
                                        </p>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <span className="px-3 py-1 bg-[#E6FB60] text-[#4D4A46] text-sm font-medium rounded-full">
                                                #PropertyIndustry
                                            </span>
                                            <span className="px-3 py-1 bg-[#E6FB60] text-[#4D4A46] text-sm font-medium rounded-full">
                                                #Leadership
                                            </span>
                                            <span className="px-3 py-1 bg-[#E6FB60] text-[#4D4A46] text-sm font-medium rounded-full">
                                                #MentalResilience
                                            </span>
                                            <span className="px-3 py-1 bg-[#E6FB60] text-[#4D4A46] text-sm font-medium rounded-full">
                                                #WomenInProperty
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Previous Episode — Mark Robinson */}
                <div className="max-w-4xl mx-auto mt-8">
                    <Card className="border-[#D8D8D6] overflow-hidden">
                        <CardContent className="p-0">
                            <div className="aspect-video bg-[#D8D8D6]">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src="https://www.youtube.com/embed/UyaK6vUQQ7g"
                                    title="Leadership, High Streets &amp; the Future of Retail — Paul Clifford &amp; Mark Robinson"
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
                                            Leadership, High Streets &amp; the Future of Retail
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Paul Clifford sits down with Mark Robinson for an open and insightful
                                            conversation about leadership, the evolution of the high street, and the
                                            realities of building sustainable businesses in today&apos;s retail landscape.
                                            Together, they explore the challenges facing town centres, the importance of
                                            innovation and collaboration, and why people — not just property — remain at the
                                            heart of successful destinations.
                                        </p>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <span className="px-3 py-1 bg-[#E6FB60] text-[#4D4A46] text-sm font-medium rounded-full">
                                                #Leadership
                                            </span>
                                            <span className="px-3 py-1 bg-[#E6FB60] text-[#4D4A46] text-sm font-medium rounded-full">
                                                #HighStreet
                                            </span>
                                            <span className="px-3 py-1 bg-[#E6FB60] text-[#4D4A46] text-sm font-medium rounded-full">
                                                #Placemaking
                                            </span>
                                            <span className="px-3 py-1 bg-[#E6FB60] text-[#4D4A46] text-sm font-medium rounded-full">
                                                #RetailFuture
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Previous Episode — NMTF */}
                <div className="max-w-4xl mx-auto mt-8">
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
