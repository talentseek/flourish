"use client"

import { useEffect, useRef, useState, ReactElement } from "react"
import { Wrapper, Status } from "@googlemaps/react-wrapper"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Building2,
    TrendingUp,
    Target,
    Sparkles,
    MapPin,
    BarChart3,
    Users,
    PoundSterling,
    ArrowRight,
    CheckCircle2,
    Zap,
    LineChart
} from "lucide-react"

// LandSec brand colors
const LANDSEC_NAVY = "#002855"
const LANDSEC_LIGHT = "#00A3E0"
const FLOURISH_LIME = "#E6FB60"

// Property data with coordinates
const landsecProperties = [
    {
        name: "Bentley Bridge Leisure Park",
        location: "Wolverhampton",
        size: "98,911 sqft",
        ownership: "100%",
        value: "£15m - £20.99m",
        image: "https://content.landsec.com/media/vj3oakls/bentley-bridge-kfc-storefront-parking-lot-cinema.webp",
        lat: 52.5973,
        lng: -2.1345,
        type: "Leisure Park"
    },
    {
        name: "Brighton Marina",
        location: "Brighton",
        size: "449,119 sqft",
        ownership: "100%",
        value: "£30m - £39.99m",
        image: "https://content.landsec.com/media/h0wbhobt/brighton-marina.webp",
        lat: 50.8145,
        lng: -0.0940,
        type: "Leisure Park"
    },
    {
        name: "Cambridge Leisure Park",
        location: "Cambridge",
        size: "184,210 sqft",
        ownership: "100%",
        value: "£40m+",
        image: "https://content.landsec.com/media/unrfmnfi/cambridge-leisure-five-guys-summer.webp",
        lat: 52.1985,
        lng: 0.1343,
        type: "Leisure Park"
    },
    {
        name: "Cardigan Fields",
        location: "Leeds",
        size: "202,850 sqft",
        ownership: "100%",
        value: "£30m - £39.99m",
        image: "https://content.landsec.com/media/beheg5si/cardigan-fields-aerial-view-shopping-center-cars-trees.webp",
        lat: 53.8076,
        lng: -1.5685,
        type: "Retail Park"
    },
    {
        name: "Castle Quarter",
        location: "Oxford",
        size: "125,156 sqft",
        ownership: "50%",
        value: "£10m - £15m",
        image: "https://content.landsec.com/media/srae5wco/castle-quarter.webp",
        lat: 51.7520,
        lng: -1.2612,
        type: "Retail"
    },
    {
        name: "East Kent Leisure Park",
        location: "Kent",
        size: "100,074 sqft",
        ownership: "100%",
        value: "£15m - £20.99m",
        image: "https://content.landsec.com/media/ewxgr02p/east-kent.webp",
        lat: 51.2787,
        lng: 1.0765,
        type: "Leisure Park"
    },
    {
        name: "Eureka Leisure Park",
        location: "Ashford",
        size: "137,009 sqft",
        ownership: "100%",
        value: "£21m - £29.99m",
        image: "https://content.landsec.com/media/qjjhngny/cineworld-imax-cinema-eureka-leisure-may-2025.webp",
        lat: 51.1352,
        lng: 0.8789,
        type: "Leisure Park"
    },
    {
        name: "Fountain Park",
        location: "Edinburgh",
        size: "234,532 sqft",
        ownership: "100%",
        value: "£21m - £29.99m",
        image: "https://content.landsec.com/media/fvrk11f0/placeholder-property.png",
        lat: 55.9412,
        lng: -3.2275,
        type: "Leisure Park"
    },
    {
        name: "Kingsmead Centre",
        location: "Bath",
        size: "132,522 sqft",
        ownership: "100%",
        value: "£21m - £29.99m",
        image: "https://content.landsec.com/media/fvrk11f0/placeholder-property.png",
        lat: 51.3819,
        lng: -2.3631,
        type: "Shopping Centre"
    },
    {
        name: "Monico",
        location: "London W1",
        size: "45,358 sqft",
        ownership: "100%",
        value: "£100m - £149.99m",
        image: "https://content.landsec.com/media/fvrk11f0/placeholder-property.png",
        lat: 51.5094,
        lng: -0.1351,
        type: "Retail"
    },
    {
        name: "Parrswood Leisure Park",
        location: "Manchester",
        size: "234,482 sqft",
        ownership: "100%",
        value: "£30m - £39.99m",
        image: "https://content.landsec.com/media/o0rdl0hh/parrs-wood.webp",
        lat: 53.4169,
        lng: -2.2054,
        type: "Leisure Park"
    },
    {
        name: "Ravenside Retail Park",
        location: "Chesterfield",
        size: "133,244 sqft",
        ownership: "100%",
        value: "£15m - £50m",
        image: "https://content.landsec.com/media/fvrk11f0/placeholder-property.png",
        lat: 53.2281,
        lng: -1.4178,
        type: "Retail Park"
    },
    {
        name: "Riverside Leisure Park",
        location: "Norwich",
        size: "202,104 sqft",
        ownership: "100%",
        value: "£30m - £39.99m",
        image: "https://content.landsec.com/media/yuib1fgm/riverside-pedestrian-street-bella-italia-sunny-day.webp",
        lat: 52.6269,
        lng: 1.3087,
        type: "Leisure Park"
    },
    {
        name: "Tower Park Leisure Park",
        location: "Poole",
        size: "199,297 sqft",
        ownership: "100%",
        value: "£21m - £29.99m",
        image: "https://content.landsec.com/media/fvrk11f0/placeholder-property.png",
        lat: 50.7423,
        lng: -1.9368,
        type: "Leisure Park"
    },
    {
        name: "West India Quay",
        location: "London E14",
        size: "149,491 sqft",
        ownership: "50%",
        value: "£15m - £20.99m",
        image: "https://content.landsec.com/media/diuoyekl/west-india-quay-dome-boats-arched-buildings.webp",
        lat: 51.5073,
        lng: -0.0248,
        type: "Mixed Use"
    },
    {
        name: "Westwood Cross",
        location: "Thanet",
        size: "486,405 sqft",
        ownership: "100%",
        value: "£50m - £99.99m",
        image: "https://content.landsec.com/media/ukiga0oi/westwood-cross-shopping-center-december-2024.webp",
        lat: 51.3548,
        lng: 1.3766,
        type: "Shopping Centre"
    },
    {
        name: "Xscape Milton Keynes",
        location: "Milton Keynes",
        size: "422,759 sqft",
        ownership: "100%",
        value: "£50m - £99.99m",
        image: "https://content.landsec.com/media/harau5en/xscape-mk-aerial-view-modern-glass-building-curved-roof.webp",
        lat: 52.0416,
        lng: -0.7590,
        type: "Leisure Park"
    },
    {
        name: "Xscape Yorkshire",
        location: "Castleford",
        size: "366,450 sqft",
        ownership: "100%",
        value: "£40m+",
        image: "https://content.landsec.com/media/fvrk11f0/placeholder-property.png",
        lat: 53.7256,
        lng: -1.3561,
        type: "Leisure Park"
    },
    {
        name: "Braintree Village",
        location: "Essex",
        size: "201,974 sqft",
        ownership: "100%",
        value: "£100m - £149.99m",
        image: "https://content.landsec.com/media/rs3chmvz/braintree-village-sunny-path-white-building-outdoor-seating-greenery.webp",
        lat: 51.8781,
        lng: 0.5461,
        type: "Retail Outlet"
    },
    {
        name: "Clarks Village",
        location: "Somerset",
        size: "203,235 sqft",
        ownership: "100%",
        value: "£100m - £149.99m",
        image: "https://content.landsec.com/media/cdcbj4bc/clarks-village-sunny-urban-plaza-people-relaxing-greenery-chimney.webp",
        lat: 51.2086,
        lng: -2.7128,
        type: "Retail Outlet"
    },
    {
        name: "Gunwharf Quays",
        location: "Portsmouth",
        size: "539,957 sqft",
        ownership: "100%",
        value: "£200m+",
        image: "https://content.landsec.com/media/r5df4re3/gunwharf_quays-v4-200dpi.webp",
        lat: 50.7977,
        lng: -1.1085,
        type: "Retail Outlet"
    }
]

// Calculate portfolio stats
const totalSqft = landsecProperties.reduce((acc, p) => {
    const num = parseInt(p.size.replace(/[^0-9]/g, ''))
    return acc + (isNaN(num) ? 0 : num)
}, 0)

const render = (status: Status): ReactElement => {
    if (status === Status.FAILURE) return <div className="p-4 text-red-500">Error loading map</div>
    return <div className="p-4 text-white">Loading map...</div>
}

interface MapComponentProps {
    selectedProperty: string | null
    onPropertySelect: (name: string | null) => void
}

function LandSecMap({ selectedProperty, onPropertySelect }: MapComponentProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<google.maps.Map>()
    const markersRef = useRef<google.maps.Marker[]>([])
    const infoWindowRef = useRef<google.maps.InfoWindow>()

    useEffect(() => {
        if (ref.current && !map) {
            const newMap = new window.google.maps.Map(ref.current, {
                center: { lat: 52.5, lng: -1.5 },
                zoom: 6,
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#8b8b8b" }] },
                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
                    { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a4a" }] },
                    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
                ],
            })
            setMap(newMap)
            infoWindowRef.current = new window.google.maps.InfoWindow()
        }
    }, [ref, map])

    useEffect(() => {
        if (map) {
            // Clear existing markers
            markersRef.current.forEach(m => m.setMap(null))
            markersRef.current = []

            landsecProperties.forEach((property) => {
                const isSelected = selectedProperty === property.name

                // Create custom marker with LandSec branding
                const markerColor = isSelected ? FLOURISH_LIME : LANDSEC_LIGHT
                const iconSvg = encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="${markerColor}" stroke="${LANDSEC_NAVY}" stroke-width="2"/>
            <text x="18" y="23" font-family="Arial" font-size="14" font-weight="bold" fill="${LANDSEC_NAVY}" text-anchor="middle">£</text>
          </svg>
        `.trim())

                const marker = new window.google.maps.Marker({
                    position: { lat: property.lat, lng: property.lng },
                    map,
                    title: property.name,
                    icon: {
                        url: `data:image/svg+xml;charset=UTF-8,${iconSvg}`,
                        scaledSize: new window.google.maps.Size(isSelected ? 44 : 36, isSelected ? 44 : 36),
                        anchor: new window.google.maps.Point(isSelected ? 22 : 18, isSelected ? 22 : 18),
                    },
                    animation: isSelected ? google.maps.Animation.BOUNCE : undefined,
                })

                marker.addListener("click", () => {
                    onPropertySelect(property.name)

                    const content = `
            <div style="padding: 12px; font-family: system-ui; max-width: 280px;">
              <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 700; color: ${LANDSEC_NAVY};">${property.name}</h3>
              <p style="margin: 0 0 4px; font-size: 13px; color: #666;">${property.location} • ${property.type}</p>
              <p style="margin: 0 0 8px; font-size: 13px; color: #666;">${property.size} • ${property.ownership} ownership</p>
              <div style="background: linear-gradient(135deg, ${LANDSEC_NAVY}, ${LANDSEC_LIGHT}); padding: 8px 12px; border-radius: 6px; margin-top: 8px;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: white;">Value: ${property.value}</p>
              </div>
              <div style="margin-top: 12px; padding: 8px; background: #f0fdf4; border-radius: 6px; border-left: 3px solid ${FLOURISH_LIME};">
                <p style="margin: 0; font-size: 12px; color: #166534;"><strong>Flourish Opportunity:</strong> AI-detected gap analysis available</p>
              </div>
            </div>
          `

                    infoWindowRef.current?.setContent(content)
                    infoWindowRef.current?.open(map, marker)
                })

                markersRef.current.push(marker)
            })

            map.addListener("click", () => {
                infoWindowRef.current?.close()
                onPropertySelect(null)
            })
        }
    }, [map, selectedProperty, onPropertySelect])

    return <div ref={ref} className="w-full h-full rounded-2xl" />
}

export default function LandSecDemoPage() {
    const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'all' | 'leisure' | 'retail' | 'outlet'>('all')

    const filteredProperties = landsecProperties.filter(p => {
        if (activeTab === 'all') return true
        if (activeTab === 'leisure') return p.type.includes('Leisure')
        if (activeTab === 'retail') return p.type.includes('Retail') && !p.type.includes('Outlet')
        if (activeTab === 'outlet') return p.type.includes('Outlet')
        return true
    })

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#001832] via-[#002855] to-[#003366]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#002855]/95 backdrop-blur border-b border-white/10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Image
                            src="https://content.landsec.com/media/t5lnuchl/logo-b-90x90.png"
                            alt="Landsec"
                            width={50}
                            height={50}
                            className="rounded"
                        />
                        <div className="h-8 w-px bg-white/20" />
                        <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">Powered by</span>
                            <Image
                                src="/flourishlogonew.png"
                                alt="Flourish"
                                width={80}
                                height={30}
                                className="h-6 w-auto"
                            />
                        </div>
                    </div>
                    <Button
                        className="bg-[#E6FB60] text-[#002855] hover:bg-[#E6FB60]/90 font-semibold"
                        asChild
                    >
                        <Link href="/#contact">Request Demo</Link>
                    </Button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, ${LANDSEC_LIGHT} 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                <div className="container mx-auto px-4 relative">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-white/80">
                            <Sparkles className="h-4 w-4 text-[#E6FB60]" />
                            AI-Powered Portfolio Analytics
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                            Unlock <span className="text-[#E6FB60]">Hidden Value</span> in Your{" "}
                            <span className="text-[#00A3E0]">Retail Portfolio</span>
                        </h1>

                        <p className="text-xl text-white/70 max-w-2xl mx-auto">
                            Flourish&apos;s AI identifies tenant gaps, optimizes mix, and drives revenue growth across your
                            {" "}<strong className="text-white">{landsecProperties.length} properties</strong> and{" "}
                            <strong className="text-white">{(totalSqft / 1000000).toFixed(1)}M+ sqft</strong> portfolio.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            <Button size="lg" className="bg-[#E6FB60] text-[#002855] hover:bg-[#E6FB60]/90 font-semibold gap-2">
                                <Target className="h-5 w-5" />
                                Start Gap Analysis
                            </Button>
                            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                                <BarChart3 className="h-5 w-5" />
                                View Portfolio Insights
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="py-8 bg-gradient-to-r from-[#00A3E0]/20 to-[#E6FB60]/20 border-y border-white/10">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-[#E6FB60]">{landsecProperties.length}</div>
                            <div className="text-sm text-white/60">Properties</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-[#00A3E0]">{(totalSqft / 1000000).toFixed(1)}M+</div>
                            <div className="text-sm text-white/60">Square Feet</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-[#E6FB60]">£2.4M</div>
                            <div className="text-sm text-white/60">Avg. Revenue Opportunity</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-[#00A3E0]">15%</div>
                            <div className="text-sm text-white/60">Vacancy Reduction Target</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Map Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Your Portfolio at a Glance
                        </h2>
                        <p className="text-white/60 max-w-2xl mx-auto">
                            Interactive map showing all Landsec retail and leisure properties.
                            Click any location to see Flourish AI opportunity analysis.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Map */}
                        <div className="lg:col-span-2 h-[600px] rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                            <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""} render={render}>
                                <LandSecMap
                                    selectedProperty={selectedProperty}
                                    onPropertySelect={setSelectedProperty}
                                />
                            </Wrapper>
                        </div>

                        {/* Side Panel */}
                        <div className="space-y-4">
                            <Card className="bg-white/5 border-white/10 text-white">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Target className="h-5 w-5 text-[#E6FB60]" />
                                        Gap Analysis Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                        <span className="text-sm">F&B Opportunities</span>
                                        <span className="font-bold text-green-400">12 gaps</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                        <span className="text-sm">Leisure Expansion</span>
                                        <span className="font-bold text-blue-400">8 gaps</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                        <span className="text-sm">Premium Brands</span>
                                        <span className="font-bold text-purple-400">15 gaps</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                        <span className="text-sm">Value Retail</span>
                                        <span className="font-bold text-orange-400">6 gaps</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-[#E6FB60]/20 to-[#E6FB60]/5 border-[#E6FB60]/30 text-white">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-[#E6FB60]" />
                                        Revenue Potential
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold text-[#E6FB60] mb-2">£50M+</div>
                                    <p className="text-sm text-white/60">
                                        Estimated additional annual revenue through AI-optimized tenant mix across your portfolio.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/5 border-white/10 text-white">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-[#00A3E0]" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button className="w-full justify-start gap-2 bg-white/10 hover:bg-white/20 text-white">
                                        <LineChart className="h-4 w-4" />
                                        Run Full Portfolio Analysis
                                    </Button>
                                    <Button className="w-full justify-start gap-2 bg-white/10 hover:bg-white/20 text-white">
                                        <Users className="h-4 w-4" />
                                        View Tenant Recommendations
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Property Grid */}
            <section className="py-16 bg-[#001832]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Property Portfolio
                        </h2>
                        <p className="text-white/60 max-w-2xl mx-auto mb-8">
                            Explore each property and discover AI-identified opportunities for growth.
                        </p>

                        {/* Filter Tabs */}
                        <div className="flex justify-center gap-2 flex-wrap">
                            {(['all', 'leisure', 'retail', 'outlet'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab
                                            ? 'bg-[#E6FB60] text-[#002855]'
                                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                                        }`}
                                >
                                    {tab === 'all' ? 'All Properties' :
                                        tab === 'leisure' ? 'Leisure Parks' :
                                            tab === 'retail' ? 'Retail' : 'Outlets'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProperties.map((property, index) => (
                            <Card
                                key={index}
                                className={`bg-white/5 border-white/10 overflow-hidden hover:border-[#E6FB60]/50 transition-all cursor-pointer group ${selectedProperty === property.name ? 'ring-2 ring-[#E6FB60]' : ''
                                    }`}
                                onClick={() => setSelectedProperty(property.name)}
                            >
                                <div className="aspect-video relative overflow-hidden">
                                    <Image
                                        src={property.image}
                                        alt={property.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-[#00A3E0]/80 text-white">
                                            {property.type}
                                        </span>
                                    </div>
                                </div>
                                <CardContent className="p-4 text-white">
                                    <h3 className="font-bold mb-1 group-hover:text-[#E6FB60] transition-colors">
                                        {property.name}
                                    </h3>
                                    <p className="text-sm text-white/60 flex items-center gap-1 mb-3">
                                        <MapPin className="h-3 w-3" />
                                        {property.location}
                                    </p>
                                    <div className="flex justify-between text-xs text-white/50">
                                        <span>{property.size}</span>
                                        <span>{property.ownership} owned</span>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-[#E6FB60]">{property.value}</span>
                                            <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-[#E6FB60] group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* How Flourish Helps */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            How Flourish Drives Value
                        </h2>
                        <p className="text-white/60 max-w-2xl mx-auto">
                            Our AI-powered platform analyzes your portfolio to identify opportunities,
                            optimize tenant mix, and maximize revenue potential.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/10 text-white text-center p-6">
                            <div className="w-16 h-16 rounded-2xl bg-[#E6FB60]/20 flex items-center justify-center mx-auto mb-4">
                                <Target className="h-8 w-8 text-[#E6FB60]" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Gap Analysis</h3>
                            <p className="text-white/60 text-sm">
                                AI identifies missing tenant categories and brands specific to each location&apos;s demographics and catchment.
                            </p>
                        </Card>

                        <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/10 text-white text-center p-6">
                            <div className="w-16 h-16 rounded-2xl bg-[#00A3E0]/20 flex items-center justify-center mx-auto mb-4">
                                <BarChart3 className="h-8 w-8 text-[#00A3E0]" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Portfolio Analytics</h3>
                            <p className="text-white/60 text-sm">
                                Real-time dashboards showing vacancy rates, tenant health, footfall trends, and competitive positioning.
                            </p>
                        </Card>

                        <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/10 text-white text-center p-6">
                            <div className="w-16 h-16 rounded-2xl bg-[#E6FB60]/20 flex items-center justify-center mx-auto mb-4">
                                <PoundSterling className="h-8 w-8 text-[#E6FB60]" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Revenue Growth</h3>
                            <p className="text-white/60 text-sm">
                                Our clients see an average 15% increase in rental income through optimized tenant mix and reduced vacancy.
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-[#E6FB60] to-[#b8d94a]">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#002855] mb-4">
                        Ready to Transform Your Portfolio?
                    </h2>
                    <p className="text-[#002855]/70 max-w-2xl mx-auto mb-8">
                        Let&apos;s discuss how Flourish can help Landsec unlock hidden value across your retail and leisure assets.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button size="lg" className="bg-[#002855] text-white hover:bg-[#002855]/90 font-semibold gap-2">
                            <CheckCircle2 className="h-5 w-5" />
                            Schedule a Demo
                        </Button>
                        <Button size="lg" variant="outline" className="border-[#002855] text-[#002855] hover:bg-[#002855]/10 font-semibold">
                            Download Portfolio Report
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 bg-[#001832] border-t border-white/10">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Image
                                src="https://content.landsec.com/media/t5lnuchl/logo-b-90x90.png"
                                alt="Landsec"
                                width={40}
                                height={40}
                                className="rounded"
                            />
                            <span className="text-white/40">×</span>
                            <Image
                                src="/flourishlogonew.png"
                                alt="Flourish"
                                width={80}
                                height={30}
                                className="h-5 w-auto"
                            />
                        </div>
                        <p className="text-sm text-white/40">
                            © 2025 Flourish AI. Personalised demo for Landsec.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
