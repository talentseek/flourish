"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Sparkles,
    Target,
    Search,
    Mail,
    Send,
    CheckCircle2,
    Building2,
    Globe,
    MapPin,
    TrendingUp,
    AlertCircle,
    Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

// Flourish brand colors
const FLOURISH_LIME = "#E6FB60"
const DARK_BG = "#0a0a0a"

// Kent Local Jewellery Businesses
const localBusinesses = [
    {
        name: "Opal Margate",
        location: "Margate, Kent",
        description: "Contemporary studio specializing in handmade fine silver and gold jewellery",
        type: "local"
    },
    {
        name: "Ashley's Jewellery",
        location: "Broadstairs, Kent",
        description: "Established independent jeweller with classic and modern pieces",
        type: "local"
    },
    {
        name: "Ami Blastock Jewellery",
        location: "Broadstairs, Kent",
        description: "Designer-maker creating handcrafted fine jewellery",
        type: "local"
    },
    {
        name: "Cuttings the Jewellers",
        location: "Margate & Ramsgate",
        description: "Family-run since 1880, quality jewellery and luxury watches",
        type: "local"
    },
    {
        name: "Ortwin Thyssen Jewellery",
        location: "Canterbury, Kent",
        description: "Award-winning contemporary goldsmithing",
        type: "local"
    },
    {
        name: "Hadfields",
        location: "Canterbury, Kent",
        description: "Family-owned boutique with traditional and modern designs",
        type: "local"
    }
]

// UK Online Retailers
const onlineRetailers = [
    {
        name: "Wild Fawn Jewellery",
        location: "London, UK",
        website: "wildfawnjewellery.com",
        description: "B Corp certified, ethically handmade sustainable jewellery",
        type: "online"
    },
    {
        name: "Anuka Jewellery",
        location: "UK",
        website: "anuka-jewellery.com",
        description: "Honest jewellery with full traceability",
        type: "online"
    },
    {
        name: "Edge of Ember",
        location: "London, UK",
        website: "edgeofember.com",
        description: "Woman-led sustainable luxury brand",
        type: "online"
    },
    {
        name: "Maya Magal",
        location: "London, UK",
        website: "mayamagal.co.uk",
        description: "Modern mixed-metal designs for everyday luxury",
        type: "online"
    },
    {
        name: "Otiumberg",
        location: "London, UK",
        website: "otiumberg.com",
        description: "Sister-founded responsible luxury brand",
        type: "online"
    },
    {
        name: "Daphine",
        location: "London, UK",
        website: "daphine.com",
        description: "Bold vintage-inspired statement pieces",
        type: "online"
    }
]

type Phase = 'idle' | 'analyzing' | 'discovering-local' | 'discovering-online' | 'generating' | 'sending' | 'complete'

interface BusinessCardProps {
    business: typeof localBusinesses[0] | typeof onlineRetailers[0]
    index: number
    isVisible: boolean
    isSent: boolean
    isSending: boolean
}

function BusinessCard({ business, index, isVisible, isSent, isSending }: BusinessCardProps) {
    const isOnline = 'website' in business

    return (
        <div
            className={cn(
                "transform transition-all duration-500 ease-out",
                isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
            )}
            style={{ transitionDelay: `${index * 100}ms` }}
        >
            <Card className={cn(
                "bg-white/5 border-white/10 text-white overflow-hidden",
                isSending && "ring-2 ring-[#E6FB60] animate-pulse",
                isSent && "ring-2 ring-green-500"
            )}>
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {isOnline ? (
                                    <Globe className="h-4 w-4 text-[#00A3E0] flex-shrink-0" />
                                ) : (
                                    <MapPin className="h-4 w-4 text-[#E6FB60] flex-shrink-0" />
                                )}
                                <h4 className="font-semibold text-sm truncate">{business.name}</h4>
                            </div>
                            <p className="text-xs text-white/50 mb-1">{business.location}</p>
                            <p className="text-xs text-white/70 line-clamp-2">{business.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                            {isSent ? (
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                                </div>
                            ) : isSending ? (
                                <div className="w-8 h-8 rounded-full bg-[#E6FB60]/20 flex items-center justify-center">
                                    <Loader2 className="h-5 w-5 text-[#E6FB60] animate-spin" />
                                </div>
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <Mail className="h-4 w-4 text-white/40" />
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function TypewriterText({ text, isActive, speed = 30 }: { text: string; isActive: boolean; speed?: number }) {
    const [displayedText, setDisplayedText] = useState("")
    const indexRef = useRef(0)

    useEffect(() => {
        if (!isActive) {
            setDisplayedText("")
            indexRef.current = 0
            return
        }

        const interval = setInterval(() => {
            if (indexRef.current < text.length) {
                setDisplayedText(text.slice(0, indexRef.current + 1))
                indexRef.current++
            } else {
                clearInterval(interval)
            }
        }, speed)

        return () => clearInterval(interval)
    }, [isActive, text, speed])

    return (
        <span>
            {displayedText}
            {isActive && indexRef.current < text.length && (
                <span className="animate-pulse">|</span>
            )}
        </span>
    )
}

export default function OutreachWestwoodPage() {
    const [phase, setPhase] = useState<Phase>('idle')
    const [visibleLocalCount, setVisibleLocalCount] = useState(0)
    const [visibleOnlineCount, setVisibleOnlineCount] = useState(0)
    const [sendingIndex, setSendingIndex] = useState(-1)
    const [sentIndices, setSentIndices] = useState<number[]>([])
    const [emailGenerated, setEmailGenerated] = useState(false)

    const allBusinesses = [...localBusinesses, ...onlineRetailers]

    // Auto-start simulation on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            startSimulation()
        }, 1500)
        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const startSimulation = async () => {
        // Phase 1: Analyzing
        setPhase('analyzing')
        await delay(2500)

        // Phase 2: Discovering Local
        setPhase('discovering-local')
        for (let i = 1; i <= localBusinesses.length; i++) {
            await delay(500)
            setVisibleLocalCount(i)
        }
        await delay(800)

        // Phase 3: Discovering Online
        setPhase('discovering-online')
        for (let i = 1; i <= onlineRetailers.length; i++) {
            await delay(500)
            setVisibleOnlineCount(i)
        }
        await delay(1000)

        // Phase 4: Generating Email
        setPhase('generating')
        setEmailGenerated(true)
        await delay(4000)

        // Phase 5: Sending
        setPhase('sending')
        for (let i = 0; i < allBusinesses.length; i++) {
            setSendingIndex(i)
            await delay(400)
            setSentIndices(prev => [...prev, i])
            await delay(200)
        }
        setSendingIndex(-1)
        await delay(500)

        // Complete
        setPhase('complete')
    }

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const emailTemplate = `Subject: Retail Opportunity at Westwood Cross, Thanet

Hi [Business Name] Team,

Flourish has identified Westwood Cross Shopping Centre in Thanet as an ideal expansion opportunity for your brand.

Our AI analysis shows:
• 486,405 sqft premium retail space  
• High footfall from local and tourist traffic
• Underserved Jewellery & Accessories sector
• Strong demographic match for your customer profile

We'd love to discuss how [Business Name] could thrive in this prime retail location. Would you be available for a brief call this week?

Best regards,
The Flourish Team
hello@thisisflourish.com`

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Image
                            src="/flourishlogonew.png"
                            alt="Flourish"
                            width={100}
                            height={30}
                            className="h-7 w-auto"
                        />
                        <div className="h-8 w-px bg-white/20" />
                        <span className="text-white/60 text-sm">Outreach Simulator</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            phase === 'complete' ? "bg-green-500" :
                                phase !== 'idle' ? "bg-[#E6FB60] animate-pulse" : "bg-white/30"
                        )} />
                        <span className="text-white/60">
                            {phase === 'idle' && 'Ready'}
                            {phase === 'analyzing' && 'Analyzing...'}
                            {phase === 'discovering-local' && 'Finding Local Prospects...'}
                            {phase === 'discovering-online' && 'Finding Online Retailers...'}
                            {phase === 'generating' && 'Generating Outreach...'}
                            {phase === 'sending' && 'Sending Messages...'}
                            {phase === 'complete' && 'Complete'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Location Context */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#E6FB60]/20 to-[#E6FB60]/5 flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-[#E6FB60]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Westwood Cross Shopping Centre</h1>
                            <p className="text-white/60">Thanet, Kent • 486,405 sqft • 100% Landsec ownership</p>
                        </div>
                    </div>
                </div>

                {/* Gap Analysis Card */}
                <Card className={cn(
                    "bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20 mb-8 transition-all duration-500",
                    phase !== 'idle' && "ring-2 ring-[#E6FB60]/50"
                )}>
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-400" />
                            Gap Analysis: High Priority Sector
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Jewellery & Accessories</h3>
                                <p className="text-white/60 text-sm">8.1% of competitor stores are in this category</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-orange-400">11.4</div>
                                <div className="text-xs text-white/50">Priority Score</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                            <div>
                                <div className="text-sm text-white/50">Gap Type</div>
                                <div className="text-white font-medium">Missing</div>
                            </div>
                            <div>
                                <div className="text-sm text-white/50">Competitor Coverage</div>
                                <div className="text-white font-medium">233%</div>
                            </div>
                            <div>
                                <div className="text-sm text-white/50">Status</div>
                                <div className={cn(
                                    "font-medium",
                                    phase === 'complete' ? "text-green-400" : "text-orange-400"
                                )}>
                                    {phase === 'complete' ? 'Outreach Sent' : 'Action Required'}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Simulation Grid */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: Business Discovery */}
                    <div className="space-y-6">
                        {/* Local Businesses */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="h-5 w-5 text-[#E6FB60]" />
                                <h2 className="text-lg font-semibold text-white">Local Kent Businesses</h2>
                                {phase !== 'idle' && (
                                    <span className="text-sm text-white/50">
                                        ({visibleLocalCount}/{localBusinesses.length})
                                    </span>
                                )}
                            </div>
                            <div className="space-y-3">
                                {localBusinesses.map((business, index) => (
                                    <BusinessCard
                                        key={business.name}
                                        business={business}
                                        index={index}
                                        isVisible={index < visibleLocalCount}
                                        isSending={sendingIndex === index}
                                        isSent={sentIndices.includes(index)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Online Retailers */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Globe className="h-5 w-5 text-[#00A3E0]" />
                                <h2 className="text-lg font-semibold text-white">UK Online Retailers</h2>
                                {(phase === 'discovering-online' || visibleOnlineCount > 0) && (
                                    <span className="text-sm text-white/50">
                                        ({visibleOnlineCount}/{onlineRetailers.length})
                                    </span>
                                )}
                            </div>
                            <div className="space-y-3">
                                {onlineRetailers.map((business, index) => (
                                    <BusinessCard
                                        key={business.name}
                                        business={business}
                                        index={index}
                                        isVisible={index < visibleOnlineCount}
                                        isSending={sendingIndex === localBusinesses.length + index}
                                        isSent={sentIndices.includes(localBusinesses.length + index)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Email Preview */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Mail className="h-5 w-5 text-[#E6FB60]" />
                            <h2 className="text-lg font-semibold text-white">Outreach Preview</h2>
                        </div>
                        <Card className="bg-white/5 border-white/10 text-white">
                            <CardContent className="p-6">
                                {phase === 'generating' || phase === 'sending' || phase === 'complete' ? (
                                    <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono leading-relaxed">
                                        <TypewriterText
                                            text={emailTemplate}
                                            isActive={emailGenerated}
                                            speed={15}
                                        />
                                    </pre>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-white/40">
                                        <Mail className="h-12 w-12 mb-4 opacity-50" />
                                        <p className="text-sm">Email preview will appear here</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Progress Summary */}
                        {phase !== 'idle' && (
                            <Card className="bg-gradient-to-br from-[#E6FB60]/10 to-[#E6FB60]/5 border-[#E6FB60]/20 mt-6">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-white">Outreach Progress</h3>
                                        <span className="text-[#E6FB60] font-bold">
                                            {sentIndices.length}/{allBusinesses.length}
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                                        <div
                                            className="bg-[#E6FB60] h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${(sentIndices.length / allBusinesses.length) * 100}%` }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-[#E6FB60]" />
                                            <span className="text-white/60">Local:</span>
                                            <span className="text-white font-medium">
                                                {Math.min(sentIndices.filter(i => i < localBusinesses.length).length, localBusinesses.length)}/{localBusinesses.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-[#00A3E0]" />
                                            <span className="text-white/60">Online:</span>
                                            <span className="text-white font-medium">
                                                {sentIndices.filter(i => i >= localBusinesses.length).length}/{onlineRetailers.length}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Completion Message */}
                        {phase === 'complete' && (
                            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 mt-6">
                                <CardContent className="p-6 text-center">
                                    <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">Outreach Complete!</h3>
                                    <p className="text-white/60 text-sm">
                                        {allBusinesses.length} personalized emails sent to prospective tenants
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
