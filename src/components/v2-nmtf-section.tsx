import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export function V2NMTFSection() {
  return (
    <section id="nmtf" className="py-16 bg-[#F7F4F2]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#4D4A46]">
              Our Partnership with NMTF
            </h2>
            <p className="text-lg text-[#4D4A46] max-w-2xl mx-auto">
              Supporting traders across the UK through strategic partnership
            </p>
          </div>

          {/* Partnership Image */}
          <div className="flex justify-center mb-12">
            <div className="relative w-full max-w-2xl h-48 bg-white rounded-lg flex items-center justify-center p-8 border border-[#D8D8D6]">
              <div className="flex items-center gap-8 flex-wrap justify-center">
                <Image
                  src="/nmtf.png"
                  alt="NMTF Logo"
                  width={200}
                  height={100}
                  className="h-20 w-auto object-contain"
                />
                <div className="text-2xl font-bold text-[#4D4A46]">+</div>
                <Image
                  src="/flourishgrey.png"
                  alt="Flourish Logo"
                  width={200}
                  height={100}
                  className="h-20 w-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Who are NMTF */}
          <Card className="mb-8 bg-[#4D4A46] border-[#4D4A46]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#E6FB60]">Who are NMTF?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white text-base leading-relaxed font-medium">
                The National Market Traders Federation (NMTF) is the UK's leading trade association for market traders, 
                street traders, and small independent retailers. With over 100 years of history, NMTF represents and 
                supports thousands of traders across the country, providing advocacy, advice, and resources to help 
                independent businesses thrive.
              </p>
              <p className="text-white text-base leading-relaxed font-medium">
                NMTF champions the interests of market traders at local and national levels, working with councils, 
                government bodies, and industry partners to create better trading environments and opportunities for 
                independent retailers.
              </p>
            </CardContent>
          </Card>

          {/* Why Partner */}
          <Card className="mb-8 bg-[#4D4A46] border-[#4D4A46]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#E6FB60]">Why Have We Partnered with Them?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white text-base leading-relaxed font-medium">
                Flourish and NMTF share a common mission: to support independent traders and create thriving retail 
                environments. Our partnership brings together Flourish's expertise in retail space activation with 
                NMTF's deep understanding of trader needs and market dynamics.
              </p>
              <p className="text-white text-base font-semibold">
                Together, we're working to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-white ml-4 text-base font-medium">
                <li>Connect traders with premium retail spaces in shopping centres</li>
                <li>Provide comprehensive support and guidance throughout the trading journey</li>
                <li>Create sustainable opportunities for independent businesses to grow</li>
                <li>Build stronger relationships between traders, landlords, and communities</li>
              </ul>
            </CardContent>
          </Card>

          {/* What They Do for Traders */}
          <Card className="bg-[#4D4A46] border-[#4D4A46]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#E6FB60]">What Do They Do for Traders?</CardTitle>
              <CardDescription className="text-white text-base font-medium">
                NMTF provides comprehensive support and resources to help traders succeed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#E6FB60] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white mb-1 text-base">Legal & Regulatory Support</h4>
                    <p className="text-sm text-white leading-relaxed font-medium">
                      Expert advice on trading licenses, regulations, and compliance requirements
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#E6FB60] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white mb-1 text-base">Business Development</h4>
                    <p className="text-sm text-white leading-relaxed font-medium">
                      Training, workshops, and resources to help traders grow their businesses
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#E6FB60] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white mb-1 text-base">Insurance & Protection</h4>
                    <p className="text-sm text-white leading-relaxed font-medium">
                      Access to competitive insurance products and risk management advice
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#E6FB60] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white mb-1 text-base">Advocacy & Representation</h4>
                    <p className="text-sm text-white leading-relaxed font-medium">
                      A strong voice representing trader interests to councils and government
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#E6FB60] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white mb-1 text-base">Networking Opportunities</h4>
                    <p className="text-sm text-white leading-relaxed font-medium">
                      Connect with other traders, share experiences, and build business relationships
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#E6FB60] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white mb-1 text-base">Market Intelligence</h4>
                    <p className="text-sm text-white leading-relaxed font-medium">
                      Insights into market trends, consumer behavior, and trading opportunities
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}


