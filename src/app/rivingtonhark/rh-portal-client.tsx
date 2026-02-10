"use client"

import { useEffect, useRef, useState, useCallback, ReactElement, useMemo } from "react"
import dynamic from "next/dynamic"
import { Wrapper, Status } from "@googlemaps/react-wrapper"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DemoRequestModal } from "@/components/demo-request-modal"
import {
    MapPin,
    BarChart3,
    Target,
    X,
    Sparkles,
    CheckCircle2,
    Leaf,
    Heart,
    Briefcase,
    TreePine,
    Palette,
    Scale,
    Database,
    Zap,
    LineChart,
    Users,
    Play,
    ChevronUp,
    ChevronDown,
    Layers,
    ShieldCheck,
    ExternalLink,
    Lock,
    ArrowRight,
    Building2,
    Search,
    MessageSquare,
    SkipForward,
} from "lucide-react"

const RHRegionalPanel = dynamic(() => import("./rh-regional-panel"), { ssr: false })

// ─────────────────────────────────────────────────
// Design Tokens — WCAG AA validated contrast ratios
// ─────────────────────────────────────────────────
const COLORS = {
    bgBase: "#0F172A",       // 15.4:1 with textPrimary
    bgSurface: "#1E293B",    // 12.6:1 with textPrimary
    bgElevated: "#334155",   // 8.2:1 with textPrimary
    borderDefault: "#475569",
    textPrimary: "#F8FAFC",
    textSecondary: "#CBD5E1", // 10.3:1 on bgBase, 8.4:1 on bgSurface
    textMuted: "#94A3B8",     // 6.2:1 on bgBase, 5.0:1 on bgSurface
    accentCoral: "#E8458B",   // 5.1:1 on bgBase
    accentLime: "#E6FB60",    // 14.1:1 on bgBase
    statusLive: "#4ADE80",    // 10.8:1 on bgBase
    statusMatched: "#E8458B",
    statusComing: "#94A3B8",
} as const

// ─────────────────────────────────────────────────
// Project Types (shared with server component)
// ─────────────────────────────────────────────────
type ProjectStatus = "live" | "matched" | "coming_soon"

export interface RHProject {
    name: string
    city: string
    type: string
    category: "management" | "regeneration" | "strategic" | "mixed"
    status: ProjectStatus
    lat: number
    lng: number
    vacancy?: number | null
    parkingSpaces?: number | null
    stores?: number | null
    footfall?: number | null
    website?: string | null
    googleRating?: string | null
    googleReviews?: number | null
    phone?: string | null
    isFlourishManaged?: boolean
}

interface PalaceRegionalData {
    palace: {
        name: string
        city: string
        stores: number
        vacancy: number | null
        footfall: number | null
        googleRating: string | null
        googleReviews: number | null
        parkingSpaces: number | null
        tenantCategories: { category: string; count: number }[]
    }
    nearby: {
        name: string
        city: string
        lat: number
        lng: number
        type: string
        stores: number | null
    }[]
}

interface RHPortalProps {
    rhProjects: RHProject[]
    palaceRegionalData: PalaceRegionalData | null
}

// ── ESG Alignment Data ──
const esgCards = [
    {
        icon: Leaf,
        principle: "Efficient Use of Resources",
        capability:
            "Data-driven tenant curation eliminates guesswork — right brands in right spaces, first time.",
    },
    {
        icon: Heart,
        principle: "Promotion of Healthy Living",
        capability:
            "F&B and wellness gap analysis identifies health-oriented categories missing from your mix.",
    },
    {
        icon: Briefcase,
        principle: "Jobs & Skills",
        capability:
            "Network of 2,700+ independent traders ready to create local employment opportunities.",
    },
    {
        icon: TreePine,
        principle: "Protecting Biodiversity",
        capability:
            "Demographic and catchment data for green infrastructure and sustainable retail planning.",
    },
    {
        icon: Palette,
        principle: "Culturally Sensitive Design",
        capability:
            "Placemaking curation that respects local character through data-aware recommendations.",
    },
    {
        icon: Scale,
        principle: "Equality & Diversity",
        capability:
            "Demographic-aware analysis ensures decisions reflect the community, not assumptions.",
    },
]

// ─────────────────────────────────────────────────
// Map Component — Full-bleed, dark styled
// ─────────────────────────────────────────────────
const render = (status: Status): ReactElement => {
    if (status === Status.FAILURE)
        return (
            <div
                className="flex items-center justify-center h-full"
                style={{ background: COLORS.bgBase, color: "#EF4444" }}
            >
                Error loading map
            </div>
        )
    return (
        <div
            className="flex items-center justify-center h-full"
            style={{ background: COLORS.bgBase, color: COLORS.textMuted }}
        >
            <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Loading map…
            </div>
        </div>
    )
}

interface MapProps {
    selectedProject: string | null
    onProjectSelect: (name: string | null) => void
    drawerOpen: boolean
    rhProjects: RHProject[]
}

function PortfolioMap({ selectedProject, onProjectSelect, drawerOpen, rhProjects }: MapProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<google.maps.Map>()
    const markersRef = useRef<google.maps.Marker[]>([])
    const infoWindowRef = useRef<google.maps.InfoWindow>()

    useEffect(() => {
        if (ref.current && !map) {
            const newMap = new window.google.maps.Map(ref.current, {
                center: { lat: 53.0, lng: -2.0 },
                zoom: 6,
                disableDefaultUI: true,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.LEFT_CENTER,
                },
                styles: [
                    { elementType: "geometry", stylers: [{ color: COLORS.bgBase }] },
                    {
                        elementType: "labels.text.stroke",
                        stylers: [{ color: COLORS.bgBase }],
                    },
                    {
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#64748B" }],
                    },
                    {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [{ color: "#020617" }],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry",
                        stylers: [{ color: COLORS.bgSurface }],
                    },
                    {
                        featureType: "road",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }],
                    },
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }],
                    },
                    {
                        featureType: "administrative",
                        elementType: "geometry.stroke",
                        stylers: [{ color: COLORS.bgElevated }],
                    },
                    {
                        featureType: "administrative.country",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#64748B" }],
                    },
                ],
            })
            setMap(newMap)
            infoWindowRef.current = new window.google.maps.InfoWindow()
        }
    }, [ref, map])

    // Place markers
    useEffect(() => {
        if (!map) return

        markersRef.current.forEach((m) => m.setMap(null))
        markersRef.current = []

        rhProjects.forEach((project) => {
            const isSelected = selectedProject === project.name
            const isComingSoon = project.status === "coming_soon"
            const isLive = project.status === "live"

            const markerColor = isSelected
                ? COLORS.accentLime
                : isLive
                    ? COLORS.statusLive
                    : isComingSoon
                        ? COLORS.statusComing
                        : COLORS.accentCoral

            const size = isSelected ? 48 : 36
            const innerR = isSelected ? 14 : 10
            const outerR = isSelected ? 20 : 16
            const half = size / 2

            // Glow ring for non-coming-soon
            const glowRing = !isComingSoon
                ? `<circle cx="${half}" cy="${half}" r="${outerR}" fill="none" stroke="${markerColor}" stroke-width="2" opacity="0.3"/>`
                : ""

            const iconSvg = encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                    ${glowRing}
                    <circle cx="${half}" cy="${half}" r="${innerR}" fill="${markerColor}" stroke="${COLORS.bgBase}" stroke-width="2" opacity="${isComingSoon ? "0.4" : "1"}"/>
                </svg>`.trim()
            )

            const marker = new window.google.maps.Marker({
                position: { lat: project.lat, lng: project.lng },
                map,
                title: project.name,
                icon: {
                    url: `data:image/svg+xml;charset=UTF-8,${iconSvg}`,
                    scaledSize: new window.google.maps.Size(size, size),
                    anchor: new window.google.maps.Point(half, half),
                },
                animation: isSelected ? google.maps.Animation.BOUNCE : undefined,
            })

            marker.addListener("click", () => {
                onProjectSelect(project.name)
                infoWindowRef.current?.close()

                // Pan map to marker position, offset for drawer
                const pos = marker.getPosition()
                if (pos) {
                    map.panTo(pos)
                    // Offset left to account for drawer width (420px / 2 ~= 210px)
                    setTimeout(() => map.panBy(-210, 0), 100)
                }
            })

            markersRef.current.push(marker)
        })

        map.addListener("click", () => {
            infoWindowRef.current?.close()
            onProjectSelect(null)
        })
    }, [map, selectedProject, onProjectSelect])

    // When drawer opens/closes, re-center if a project is selected
    useEffect(() => {
        if (!map || !selectedProject) return
        const project = rhProjects.find((p) => p.name === selectedProject)
        if (project && drawerOpen) {
            map.panTo({ lat: project.lat, lng: project.lng })
            setTimeout(() => map.panBy(-210, 0), 100)
        }
    }, [map, drawerOpen, selectedProject])

    return <div ref={ref} className="w-full h-full" />
}

// ─────────────────────────────────────────────────
// KPI Cell Component
// ─────────────────────────────────────────────────
function KpiCell({
    label,
    value,
    valueColor,
}: {
    label: string
    value: string
    valueColor?: string
}) {
    return (
        <div
            className="rounded-lg p-3"
            style={{
                background: COLORS.bgSurface,
                border: `1px solid ${COLORS.borderDefault}`,
            }}
        >
            <div
                className="text-xs font-medium mb-1"
                style={{ color: COLORS.textMuted, fontFamily: "'Roboto Mono', monospace" }}
            >
                {label}
            </div>
            <div
                className="text-lg font-semibold"
                style={{
                    color: valueColor || COLORS.textPrimary,
                    fontFamily: "'Roboto Mono', monospace",
                }}
            >
                {value}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────
// Animated Counter Hook
// ─────────────────────────────────────────────────
function useAnimatedCounter(target: number, duration: number = 1500, active: boolean = true) {
    const [value, setValue] = useState(0)
    useEffect(() => {
        if (!active) { setValue(0); return }
        let start = 0
        const increment = target / (duration / 16)
        const timer = setInterval(() => {
            start += increment
            if (start >= target) { setValue(target); clearInterval(timer) }
            else setValue(Math.floor(start))
        }, 16)
        return () => clearInterval(timer)
    }, [target, duration, active])
    return value
}

// ─────────────────────────────────────────────────
// Narration Audio Hook
// ─────────────────────────────────────────────────
function useNarration(src: string | null) {
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        if (!src) {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
            return
        }

        const audio = new Audio(src)
        audio.volume = 0
        audioRef.current = audio

        // Fade in
        audio.play().catch(() => { })
        const fadeIn = setInterval(() => {
            if (audio.volume < 0.9) audio.volume = Math.min(1, audio.volume + 0.1)
            else clearInterval(fadeIn)
        }, 50)

        return () => {
            clearInterval(fadeIn)
            // Fade out
            const fadeOut = setInterval(() => {
                if (audio.volume > 0.1) audio.volume = Math.max(0, audio.volume - 0.15)
                else { clearInterval(fadeOut); audio.pause() }
            }, 40)
        }
    }, [src])
}

// Chapter audio mapping
const CHAPTER_AUDIO: Record<string, string> = {
    chapter1: "/chapter1.mp3",
    chapter2: "/chapter2.mp3",
    chapter3: "/chapter3.mp3",
}

// ─────────────────────────────────────────────────
// Chapter Screens Component
// ─────────────────────────────────────────────────
const MATCHED_CENTRES = [
    { name: "Palace Shopping", city: "Enfield", highlight: true },
    { name: "Eldon Square", city: "Newcastle" },
    { name: "St Johns", city: "Liverpool" },
    { name: "Royal Victoria Place", city: "Tunbridge Wells" },
    { name: "Castle Quarter", city: "Norwich" },
    { name: "Rochdale Riverside", city: "Rochdale" },
    { name: "Victoria Shopping Centre", city: "Southend" },
    { name: "Fareham Shopping Centre", city: "Fareham" },
]

function ChapterScreens({
    demoStep,
    setDemoStep,
    rhProjects,
    matchedCount,
    totalParking,
    totalStores,
    totalFootfall,
    chapterAnimated,
    setChapterAnimated,
}: {
    demoStep: DemoStep
    setDemoStep: (s: DemoStep) => void
    rhProjects: RHProject[]
    matchedCount: number
    totalParking: number
    totalStores: number
    totalFootfall: number
    chapterAnimated: boolean
    setChapterAnimated: (v: boolean) => void
}) {
    // Audio narration
    useNarration(CHAPTER_AUDIO[demoStep] || null)

    // Trigger entrance animation
    useEffect(() => {
        const t = setTimeout(() => setChapterAnimated(true), 100)
        return () => clearTimeout(t)
    }, [demoStep, setChapterAnimated])

    const animProjects = useAnimatedCounter(rhProjects.length, 1200, demoStep === "chapter1" && chapterAnimated)
    const animMatched = useAnimatedCounter(matchedCount, 1200, demoStep === "chapter1" && chapterAnimated)
    const animStores = useAnimatedCounter(totalStores, 1500, demoStep === "chapter1" && chapterAnimated)
    const animFootfall = useAnimatedCounter(Math.round(totalFootfall / 1000000), 1500, demoStep === "chapter1" && chapterAnimated)

    const currentChapter = demoStep === "chapter1" ? 1 : demoStep === "chapter2" ? 2 : 3
    const nextStep = (): DemoStep =>
        demoStep === "chapter1" ? "chapter2" : demoStep === "chapter2" ? "chapter3" : "guided"

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
            style={{ background: COLORS.bgBase }}
        >
            {/* Ambient glow */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(ellipse at 50% 40%, ${COLORS.accentCoral}08 0%, transparent 60%), radial-gradient(ellipse at 80% 60%, ${COLORS.accentLime}05 0%, transparent 50%)`,
                }}
            />
            {/* Grid lines */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(${COLORS.textMuted} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.textMuted} 1px, transparent 1px)`,
                    backgroundSize: "80px 80px",
                }}
            />

            <div
                className="relative z-10 flex flex-col items-center gap-8 max-w-5xl w-full px-8 transition-all duration-700"
                style={{
                    opacity: chapterAnimated ? 1 : 0,
                    transform: chapterAnimated ? "translateY(0)" : "translateY(30px)",
                }}
            >
                {/* Step indicator */}
                <div className="flex items-center gap-2">
                    {[1, 2, 3].map((n) => (
                        <div
                            key={n}
                            className="rounded-full transition-all duration-300"
                            style={{
                                width: n === currentChapter ? 24 : 8,
                                height: 8,
                                background: n === currentChapter ? COLORS.accentCoral : `${COLORS.textMuted}40`,
                            }}
                        />
                    ))}
                </div>

                {/* ═══ CHAPTER 1: Portfolio Overview ═══ */}
                {demoStep === "chapter1" && (
                    <div className="flex flex-col items-center gap-10 w-full">
                        <div className="text-center">
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                                style={{
                                    background: `${COLORS.accentCoral}15`,
                                    color: COLORS.accentCoral,
                                    border: `1px solid ${COLORS.accentCoral}30`,
                                }}
                            >
                                <Building2 className="w-3.5 h-3.5" />
                                Portfolio Overview
                            </div>
                            <h1
                                className="text-4xl md:text-5xl font-bold mb-4"
                                style={{ color: COLORS.textPrimary, fontFamily: "'Exo', sans-serif" }}
                            >
                                Your Portfolio, Illuminated
                            </h1>
                            <p
                                className="text-lg max-w-2xl mx-auto"
                                style={{ color: COLORS.textMuted }}
                            >
                                We&apos;ve mapped your entire portfolio into the Flourish intelligence engine.
                                Here&apos;s what we found.
                            </p>
                        </div>

                        {/* Animated stat counters */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
                            {[
                                { label: "Total Projects", value: animProjects, color: COLORS.accentLime },
                                { label: "Matched in DB", value: animMatched, color: COLORS.statusLive },
                                { label: "Total Stores", value: animStores.toLocaleString(), color: COLORS.textPrimary },
                                { label: "Annual Footfall", value: `${animFootfall}M`, color: COLORS.accentCoral },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-2xl p-5 text-center"
                                    style={{
                                        background: COLORS.bgSurface,
                                        border: `1px solid ${COLORS.borderDefault}`,
                                    }}
                                >
                                    <div
                                        className="text-3xl md:text-4xl font-bold mb-1"
                                        style={{
                                            color: stat.color,
                                            fontFamily: "'Roboto Mono', monospace",
                                        }}
                                    >
                                        {stat.value}
                                    </div>
                                    <div
                                        className="text-xs font-medium"
                                        style={{ color: COLORS.textMuted }}
                                    >
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Portfolio composition note */}
                        <p className="text-sm text-center" style={{ color: COLORS.textMuted }}>
                            <span style={{ color: COLORS.statusLive }}>8 prominent retail centres</span> already in our database •{" "}
                            <span style={{ color: COLORS.textSecondary }}>4 development schemes</span> •{" "}
                            <span style={{ color: COLORS.statusComing }}>1 closed centre</span> (Kennet Centre)
                        </p>
                    </div>
                )}

                {/* ═══ CHAPTER 2: Matched Centres ═══ */}
                {demoStep === "chapter2" && (
                    <div className="flex flex-col items-center gap-8 w-full">
                        <div className="text-center">
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                                style={{
                                    background: `${COLORS.statusLive}15`,
                                    color: COLORS.statusLive,
                                    border: `1px solid ${COLORS.statusLive}30`,
                                }}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Already Matched
                            </div>
                            <h1
                                className="text-4xl md:text-5xl font-bold mb-4"
                                style={{ color: COLORS.textPrimary, fontFamily: "'Exo', sans-serif" }}
                            >
                                8 Centres. Zero Onboarding.
                            </h1>
                            <p
                                className="text-lg max-w-2xl mx-auto"
                                style={{ color: COLORS.textMuted }}
                            >
                                These prominent centres are already enriched with tenant data, vacancy rates,
                                footfall metrics, and competitive intelligence.
                            </p>
                        </div>

                        {/* Centre grid with staggered animation */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl">
                            {MATCHED_CENTRES.map((centre, i) => (
                                <div
                                    key={centre.name}
                                    className="rounded-xl p-4 transition-all duration-500"
                                    style={{
                                        background: centre.highlight ? `${COLORS.statusLive}10` : COLORS.bgSurface,
                                        border: `1px solid ${centre.highlight ? COLORS.statusLive + "40" : COLORS.borderDefault}`,
                                        opacity: chapterAnimated ? 1 : 0,
                                        transform: chapterAnimated ? "translateY(0)" : "translateY(20px)",
                                        transitionDelay: `${i * 100}ms`,
                                    }}
                                >
                                    <div
                                        className="text-sm font-semibold mb-1"
                                        style={{ color: centre.highlight ? COLORS.statusLive : COLORS.textPrimary }}
                                    >
                                        {centre.name}
                                    </div>
                                    <div className="text-xs" style={{ color: COLORS.textMuted }}>
                                        {centre.city}
                                    </div>
                                    {centre.highlight && (
                                        <div
                                            className="text-[10px] font-semibold mt-2 px-2 py-0.5 rounded-full inline-block"
                                            style={{
                                                background: `${COLORS.statusLive}20`,
                                                color: COLORS.statusLive,
                                            }}
                                        >
                                            Live Proof of Concept
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══ CHAPTER 3: What This Unlocks ═══ */}
                {demoStep === "chapter3" && (
                    <div className="flex flex-col items-center gap-8 w-full">
                        <div className="text-center">
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                                style={{
                                    background: `${COLORS.accentLime}15`,
                                    color: COLORS.accentLime,
                                    border: `1px solid ${COLORS.accentLime}30`,
                                }}
                            >
                                <Zap className="w-3.5 h-3.5" />
                                Platform Capabilities
                            </div>
                            <h1
                                className="text-4xl md:text-5xl font-bold mb-4"
                                style={{ color: COLORS.textPrimary, fontFamily: "'Exo', sans-serif" }}
                            >
                                What This Unlocks
                            </h1>
                            <p
                                className="text-lg max-w-2xl mx-auto"
                                style={{ color: COLORS.textMuted }}
                            >
                                From intelligence to action — three capabilities that transform how you manage your portfolio.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl">
                            {[
                                {
                                    icon: <Search className="w-6 h-6" />,
                                    title: "Gap Analysis",
                                    description: "AI identifies missing tenant categories and recommends brands based on local competition and demographics.",
                                    color: COLORS.accentCoral,
                                    delay: 0,
                                },
                                {
                                    icon: <BarChart3 className="w-6 h-6" />,
                                    title: "Tenant Intelligence",
                                    description: "Real-time tenant tracking, vacancy monitoring, and competitive benchmarking across your entire portfolio.",
                                    color: COLORS.accentLime,
                                    delay: 150,
                                },
                                {
                                    icon: <MessageSquare className="w-6 h-6" />,
                                    title: "Regional Dashboard",
                                    description: "Your managers get their own intelligence hub with AI chat, location maps, and actionable insights.",
                                    color: COLORS.statusLive,
                                    delay: 300,
                                },
                            ].map((feature) => (
                                <div
                                    key={feature.title}
                                    className="rounded-2xl p-6 transition-all duration-600"
                                    style={{
                                        background: COLORS.bgSurface,
                                        border: `1px solid ${COLORS.borderDefault}`,
                                        opacity: chapterAnimated ? 1 : 0,
                                        transform: chapterAnimated ? "translateY(0)" : "translateY(30px)",
                                        transitionDelay: `${feature.delay}ms`,
                                    }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                        style={{
                                            background: `${feature.color}15`,
                                            color: feature.color,
                                        }}
                                    >
                                        {feature.icon}
                                    </div>
                                    <h3
                                        className="text-lg font-bold mb-2"
                                        style={{ color: COLORS.textPrimary, fontFamily: "'Exo', sans-serif" }}
                                    >
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed" style={{ color: COLORS.textMuted }}>
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { setDemoStep(nextStep()); setChapterAnimated(false) }}
                        className="flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                        style={{
                            background: COLORS.accentCoral,
                            color: "#fff",
                            fontFamily: "'Exo', sans-serif",
                            boxShadow: `0 0 30px ${COLORS.accentCoral}40`,
                        }}
                    >
                        {demoStep === "chapter3" ? "Explore the Portfolio" : "Continue"}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setDemoStep("explore")}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium cursor-pointer transition-colors hover:opacity-80"
                        style={{ color: COLORS.textMuted }}
                    >
                        <SkipForward className="w-3.5 h-3.5" />
                        Skip to Map
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────
const GATE_PASSWORD = "flourish2026"
const SESSION_KEY = "rh-portal-auth"

type DemoStep = "idle" | "video" | "chapter1" | "chapter2" | "chapter3" | "guided" | "explore"

export default function RHPortalClient({ rhProjects, palaceRegionalData }: RHPortalProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [demoStep, setDemoStep] = useState<DemoStep>("idle")
    const [passwordInput, setPasswordInput] = useState("")
    const [passwordError, setPasswordError] = useState(false)
    const [selectedProject, setSelectedProject] = useState<string | null>(null)
    const [showESG, setShowESG] = useState(false)
    const [showVideo, setShowVideo] = useState(false)
    const [statsCollapsed, setStatsCollapsed] = useState(false)
    const [showRegionalMode, setShowRegionalMode] = useState(false)
    const [guideStep, setGuideStep] = useState<number | null>(null)
    const [chapterAnimated, setChapterAnimated] = useState(false)

    // Check session on mount
    useEffect(() => {
        if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "true") {
            setIsAuthenticated(true)
            setDemoStep("explore")
        }
    }, [])

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordInput.toLowerCase() === GATE_PASSWORD.toLowerCase()) {
            sessionStorage.setItem(SESSION_KEY, "true")
            setIsAuthenticated(true)
            setDemoStep("video")
            setPasswordError(false)
        } else {
            setPasswordError(true)
        }
    }

    // Compute stats from prop data
    const matchedProjects = rhProjects.filter((p) => p.status !== "coming_soon")
    const totalParking = rhProjects.reduce((a, p) => a + (p.parkingSpaces || 0), 0)
    const totalFootfall = rhProjects.reduce((a, p) => a + (p.footfall || 0), 0)
    const totalStores = rhProjects.reduce((a, p) => a + (p.stores || 0), 0)

    const handleProjectSelect = useCallback((name: string | null) => {
        setSelectedProject(name)
    }, [])

    const activeProject = selectedProject
        ? rhProjects.find((p) => p.name === selectedProject)
        : null

    // Guide tour steps config
    const GUIDE_STEPS = useMemo(() => [
        {
            title: "Portfolio at a Glance",
            text: `Your portfolio: ${rhProjects.length} projects tracked, ${matchedProjects.length} matched in our database, ${totalStores.toLocaleString()} stores, and ${(totalFootfall / 1000000).toFixed(1)}M annual footfall.`,
            action: "stats",
        },
        {
            title: "Live Proof of Concept",
            text: "Let's look at Palace Shopping — one of 8 centres already enriched with full tenant data, vacancy rates, and competitive intelligence.",
            action: "zoom-palace",
        },
        {
            title: "Real-Time Intelligence",
            text: "Every matched centre has live data: vacancy rates, Google rating, footfall metrics, and a full tenant directory.",
            action: "open-drawer",
        },
        {
            title: "AI Gap Analysis",
            text: "Run Gap Analysis to find which brands are missing vs. the local competition. This is AI-powered and unique to each centre.",
            action: "highlight-gap",
        },
        {
            title: "Regional Dashboard",
            text: "Your regional managers get their own intelligence hub with an AI assistant, interactive maps, and actionable insights. Let's show you a live preview.",
            action: "regional-cta",
        },
    ], [rhProjects.length, matchedProjects.length, totalStores, totalFootfall])

    // Initialise guide when entering guided mode
    useEffect(() => {
        if (demoStep === "guided" && guideStep === null) {
            setGuideStep(0)
        }
    }, [demoStep, guideStep])

    // Guide step side-effects
    useEffect(() => {
        if (guideStep === null || demoStep !== "guided") return

        if (guideStep === 1) {
            // Auto-select Palace Shopping to zoom + open drawer
            setSelectedProject("Palace Shopping")
        }
        if (guideStep === 2) {
            // Keep Palace Shopping selected (drawer stays open)
            if (selectedProject !== "Palace Shopping") {
                setSelectedProject("Palace Shopping")
            }
        }
    }, [guideStep, demoStep])

    // Guide narration audio
    const guideAudioSrc = demoStep === "guided" && guideStep !== null
        ? `/g${guideStep + 1}.mp3`
        : null
    useNarration(guideAudioSrc)

    const advanceGuide = () => {
        if (guideStep === null) return
        if (guideStep < GUIDE_STEPS.length - 1) {
            setGuideStep(guideStep + 1)
        } else {
            // End guide
            setGuideStep(null)
            setDemoStep("explore")
        }
    }

    const skipGuide = () => {
        setGuideStep(null)
        setDemoStep("explore")
        setSelectedProject(null)
    }

    return (
        <>
            {/* Google Fonts */}
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link
                href="https://fonts.googleapis.com/css2?family=Exo:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;600&display=swap"
                rel="stylesheet"
            />

            {/* ═══════════════════════════════════════
                PASSWORD GATE
            ═══════════════════════════════════════ */}
            {!isAuthenticated && (
                <div
                    className="h-screen w-screen flex items-center justify-center relative overflow-hidden"
                    style={{ background: COLORS.bgBase }}
                >
                    {/* Subtle animated gradient background */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `radial-gradient(ellipse at 30% 50%, ${COLORS.accentCoral}08 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, ${COLORS.accentLime}05 0%, transparent 60%)`,
                        }}
                    />
                    {/* Grid lines subtle background */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `linear-gradient(${COLORS.textMuted} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.textMuted} 1px, transparent 1px)`,
                            backgroundSize: "60px 60px",
                        }}
                    />

                    <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full px-6">
                        {/* Dual branding */}
                        <div className="flex items-center gap-4">
                            <Image
                                src="/rivingtonhark-logo.png"
                                alt="RivingtonHark"
                                width={200}
                                height={50}
                                className="h-10 w-auto"
                            />
                            <div
                                className="h-8 w-px"
                                style={{ background: COLORS.borderDefault }}
                            />
                            <Image
                                src="/flourishlogonew.png"
                                alt="Flourish"
                                width={120}
                                height={40}
                                className="h-6 w-auto"
                            />
                        </div>

                        {/* Title */}
                        <div className="text-center">
                            <h1
                                className="text-2xl font-bold mb-2"
                                style={{ color: COLORS.textPrimary, fontFamily: "'Exo', sans-serif" }}
                            >
                                Portfolio Intelligence Portal
                            </h1>
                            <p
                                className="text-sm"
                                style={{ color: COLORS.textMuted }}
                            >
                                Enter your access code to continue
                            </p>
                        </div>

                        {/* Password form */}
                        <form onSubmit={handlePasswordSubmit} className="w-full space-y-4">
                            <div className="relative">
                                <Lock
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                                    style={{ color: COLORS.textMuted }}
                                />
                                <input
                                    type="password"
                                    value={passwordInput}
                                    onChange={(e) => {
                                        setPasswordInput(e.target.value)
                                        setPasswordError(false)
                                    }}
                                    placeholder="Access code"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all focus:ring-2"
                                    style={{
                                        background: COLORS.bgSurface,
                                        border: `1px solid ${passwordError ? "#ef4444" : COLORS.borderDefault}`,
                                        color: COLORS.textPrimary,
                                        fontFamily: "'Roboto Mono', monospace",
                                    }}
                                    autoFocus
                                />
                            </div>
                            {passwordError && (
                                <p className="text-xs text-center" style={{ color: "#ef4444" }}>
                                    Invalid access code. Please try again.
                                </p>
                            )}
                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:opacity-90"
                                style={{
                                    background: COLORS.accentCoral,
                                    color: "#fff",
                                    fontFamily: "'Exo', sans-serif",
                                }}
                            >
                                Enter Portal
                            </button>
                        </form>

                        {/* Footer */}
                        <p
                            className="text-xs"
                            style={{ color: COLORS.textMuted, opacity: 0.5 }}
                        >
                            Confidential — Authorised access only
                        </p>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════
                VIDEO INTRO OVERLAY
            ═══════════════════════════════════════ */}
            {isAuthenticated && demoStep === "video" && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    style={{ background: COLORS.bgBase }}
                >
                    {/* Subtle ambient glow */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `radial-gradient(ellipse at 50% 40%, ${COLORS.accentCoral}10 0%, transparent 70%)`,
                        }}
                    />

                    <div className="relative z-10 flex flex-col items-center gap-8 max-w-4xl w-full px-6">
                        {/* Dual branding */}
                        <div className="flex items-center gap-4">
                            <Image
                                src="/rivingtonhark-logo.png"
                                alt="RivingtonHark"
                                width={180}
                                height={45}
                                className="h-8 w-auto"
                            />
                            <div
                                className="h-6 w-px"
                                style={{ background: COLORS.borderDefault }}
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium" style={{ color: COLORS.textMuted }}>Powered by</span>
                                <Image
                                    src="/flourishlogonew.png"
                                    alt="Flourish"
                                    width={80}
                                    height={30}
                                    className="h-4 w-auto"
                                />
                            </div>
                        </div>

                        {/* Video embed */}
                        <div
                            className="w-full aspect-video rounded-2xl overflow-hidden"
                            style={{ border: `1px solid ${COLORS.borderDefault}` }}
                        >
                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/F3ztU22OjQs?autoplay=1"
                                title="Flourish — Transforming Retail Spaces"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>

                        {/* Continue button */}
                        <button
                            onClick={() => { setDemoStep("chapter1"); setChapterAnimated(false) }}
                            className="flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                            style={{
                                background: COLORS.accentCoral,
                                color: "#fff",
                                fontFamily: "'Exo', sans-serif",
                                boxShadow: `0 0 30px ${COLORS.accentCoral}40`,
                            }}
                        >
                            Continue
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════
                CHAPTER SCREENS
            ═══════════════════════════════════════ */}
            {isAuthenticated && (demoStep === "chapter1" || demoStep === "chapter2" || demoStep === "chapter3") && (
                <ChapterScreens
                    demoStep={demoStep}
                    setDemoStep={setDemoStep}
                    rhProjects={rhProjects}
                    matchedCount={matchedProjects.length}
                    totalParking={totalParking}
                    totalStores={totalStores}
                    totalFootfall={totalFootfall}
                    chapterAnimated={chapterAnimated}
                    setChapterAnimated={setChapterAnimated}
                />
            )}

            {/* ═══════════════════════════════════════
                MAIN PORTAL (only visible after chapters complete)
            ═══════════════════════════════════════ */}
            {isAuthenticated && (demoStep === "guided" || demoStep === "explore") && (
                <div
                    className="h-screen w-screen overflow-hidden relative"
                    style={{ background: COLORS.bgBase }}
                >
                    {/* ═══════════════════════════════════════
                    LAYER 0 — Full-Bleed Map  
                ═══════════════════════════════════════ */}
                    <div className="absolute inset-0 z-0">
                        <Wrapper
                            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
                            render={render}
                        >
                            <PortfolioMap
                                selectedProject={selectedProject}
                                onProjectSelect={handleProjectSelect}
                                drawerOpen={!!activeProject}
                                rhProjects={rhProjects}
                            />
                        </Wrapper>
                    </div>

                    {/* ═══════════════════════════════════════
                    LAYER 10 — Map Legend (bottom-left)
                ═══════════════════════════════════════ */}
                    <div
                        className="absolute bottom-20 left-4 z-10 rounded-xl px-4 py-3 backdrop-blur-xl"
                        style={{
                            background: `${COLORS.bgBase}E6`,
                            border: `1px solid ${COLORS.borderDefault}`,
                        }}
                    >
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ background: COLORS.statusLive }}
                                />
                                <span
                                    className="text-xs font-medium"
                                    style={{ color: COLORS.textSecondary }}
                                >
                                    In Flourish Database
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full opacity-50"
                                    style={{ background: COLORS.statusComing }}
                                />
                                <span
                                    className="text-xs font-medium"
                                    style={{ color: COLORS.textSecondary }}
                                >
                                    Development Scheme
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════
                    LAYER 20 — Floating Stats Strip (bottom-centre)
                ═══════════════════════════════════════ */}
                    <div
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 rounded-2xl backdrop-blur-xl transition-all duration-300 ease-out"
                        style={{
                            background: `${COLORS.bgBase}E6`,
                            border: `1px solid ${COLORS.borderDefault}`,
                        }}
                    >
                        {statsCollapsed ? (
                            <button
                                onClick={() => setStatsCollapsed(false)}
                                className="flex items-center gap-2 px-4 py-2 cursor-pointer"
                                style={{ color: COLORS.textMuted }}
                            >
                                <BarChart3 className="w-4 h-4" />
                                <ChevronUp className="w-4 h-4" />
                            </button>
                        ) : (
                            <div className="flex items-center gap-1 px-2 py-2">
                                <div className="flex items-center gap-6 px-4">
                                    <div className="text-center">
                                        <div
                                            className="text-xl font-bold"
                                            style={{
                                                color: COLORS.accentCoral,
                                                fontFamily: "'Roboto Mono', monospace",
                                            }}
                                        >
                                            {rhProjects.length}
                                        </div>
                                        <div
                                            className="text-[11px] font-medium"
                                            style={{ color: COLORS.textMuted }}
                                        >
                                            Projects
                                        </div>
                                    </div>
                                    <div
                                        className="h-8 w-px"
                                        style={{ background: COLORS.borderDefault }}
                                    />
                                    <div className="text-center">
                                        <div
                                            className="text-xl font-bold"
                                            style={{
                                                color: COLORS.accentLime,
                                                fontFamily: "'Roboto Mono', monospace",
                                            }}
                                        >
                                            {matchedProjects.length}
                                        </div>
                                        <div
                                            className="text-[11px] font-medium"
                                            style={{ color: COLORS.textMuted }}
                                        >
                                            Matched
                                        </div>
                                    </div>
                                    <div
                                        className="h-8 w-px"
                                        style={{ background: COLORS.borderDefault }}
                                    />
                                    <div className="text-center">
                                        <div
                                            className="text-xl font-bold"
                                            style={{
                                                color: COLORS.textPrimary,
                                                fontFamily: "'Roboto Mono', monospace",
                                            }}
                                        >
                                            {totalParking.toLocaleString()}
                                        </div>
                                        <div
                                            className="text-[11px] font-medium"
                                            style={{ color: COLORS.textMuted }}
                                        >
                                            Parking
                                        </div>
                                    </div>
                                    <div
                                        className="h-8 w-px"
                                        style={{ background: COLORS.borderDefault }}
                                    />
                                    <div className="text-center">
                                        <div
                                            className="text-xl font-bold"
                                            style={{
                                                color: COLORS.textPrimary,
                                                fontFamily: "'Roboto Mono', monospace",
                                            }}
                                        >
                                            {totalStores.toLocaleString()}
                                        </div>
                                        <div
                                            className="text-[11px] font-medium"
                                            style={{ color: COLORS.textMuted }}
                                        >
                                            Stores
                                        </div>
                                    </div>
                                    <div
                                        className="h-8 w-px"
                                        style={{ background: COLORS.borderDefault }}
                                    />
                                    <div className="text-center">
                                        <div
                                            className="text-xl font-bold"
                                            style={{
                                                color: COLORS.accentLime,
                                                fontFamily: "'Roboto Mono', monospace",
                                            }}
                                        >
                                            {totalFootfall >= 1000000
                                                ? `${(totalFootfall / 1000000).toFixed(1)}M`
                                                : totalFootfall.toLocaleString()}
                                        </div>
                                        <div
                                            className="text-[11px] font-medium"
                                            style={{ color: COLORS.textMuted }}
                                        >
                                            Annual Footfall
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setStatsCollapsed(true)}
                                    className="p-1 rounded-lg cursor-pointer transition-colors hover:bg-white/10"
                                    style={{ color: COLORS.textMuted }}
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ═══════════════════════════════════════
                    LAYER 30 — Floating Header
                ═══════════════════════════════════════ */}
                    <header
                        className="absolute top-4 left-4 right-4 z-30 rounded-2xl backdrop-blur-xl px-5 py-3 flex items-center justify-between"
                        style={{
                            background: `${COLORS.bgBase}CC`,
                            border: `1px solid ${COLORS.borderDefault}`,
                        }}
                    >
                        {/* Left — Logos */}
                        <div className="flex items-center gap-4">
                            <Image
                                src="/rivingtonhark-logo.png"
                                alt="RivingtonHark"
                                width={160}
                                height={40}
                                className="h-7 w-auto"
                            />
                            <div
                                className="h-6 w-px"
                                style={{ background: COLORS.borderDefault }}
                            />
                            <div className="flex items-center gap-2">
                                <span
                                    className="text-xs font-medium"
                                    style={{ color: COLORS.textMuted }}
                                >
                                    Powered by
                                </span>
                                <Image
                                    src="/flourishlogonew.png"
                                    alt="Flourish"
                                    width={80}
                                    height={30}
                                    className="h-4 w-auto"
                                />
                            </div>
                        </div>

                        {/* Right — Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowESG(true)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                                style={{
                                    color: COLORS.accentLime,
                                    background: `${COLORS.accentLime}15`,
                                    border: `1px solid ${COLORS.accentLime}30`,
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background = `${COLORS.accentLime}25`)
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = `${COLORS.accentLime}15`)
                                }
                            >
                                <Layers className="w-3.5 h-3.5" />
                                ESG
                            </button>
                            <button
                                onClick={() => setShowVideo(true)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                                style={{
                                    color: COLORS.textSecondary,
                                    background: `${COLORS.bgElevated}80`,
                                    border: `1px solid ${COLORS.borderDefault}`,
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background = COLORS.bgElevated)
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = `${COLORS.bgElevated}80`)
                                }
                            >
                                <Play className="w-3.5 h-3.5" />
                                Video
                            </button>
                            <DemoRequestModal
                                variant="rivingtonhark"
                                trigger={
                                    <Button
                                        size="sm"
                                        className="text-xs font-semibold cursor-pointer"
                                        style={{
                                            background: COLORS.accentCoral,
                                            color: "#FFFFFF",
                                        }}
                                    >
                                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                        Contact
                                    </Button>
                                }
                            />
                        </div>
                    </header>

                    {/* ═══════════════════════════════════════
                    LAYER 40 — Side Drawer (slides from right)
                ═══════════════════════════════════════ */}
                    <div
                        className={`absolute top-0 right-0 bottom-0 w-[420px] z-40 transition-transform duration-300 ease-out ${activeProject ? "translate-x-0" : "translate-x-full"
                            }`}
                        style={{
                            background: `${COLORS.bgBase}F2`,
                            backdropFilter: "blur(24px)",
                            WebkitBackdropFilter: "blur(24px)",
                            borderLeft: `1px solid ${COLORS.borderDefault}`,
                        }}
                    >
                        {activeProject && (
                            <div className="h-full overflow-y-auto">
                                {/* Drawer Header */}
                                <div
                                    className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
                                    style={{
                                        background: `${COLORS.bgBase}F2`,
                                        backdropFilter: "blur(24px)",
                                        borderBottom: `1px solid ${COLORS.borderDefault}`,
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <MapPin
                                            className="w-4 h-4"
                                            style={{ color: COLORS.accentCoral }}
                                        />
                                        <span
                                            className="text-xs font-semibold uppercase tracking-wider"
                                            style={{
                                                color: COLORS.textMuted,
                                                fontFamily: "'Roboto Mono', monospace",
                                            }}
                                        >
                                            Project Detail
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedProject(null)}
                                        className="p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-white/10"
                                        style={{ color: COLORS.textMuted }}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Project Info */}
                                <div className="px-6 py-6 space-y-6">
                                    {/* Name + Location */}
                                    <div>
                                        <h2
                                            className="text-2xl font-bold mb-1"
                                            style={{
                                                color: COLORS.textPrimary,
                                                fontFamily: "'Exo', sans-serif",
                                            }}
                                        >
                                            {activeProject.name}
                                        </h2>
                                        <p
                                            className="text-sm"
                                            style={{ color: COLORS.textSecondary }}
                                        >
                                            {activeProject.city} • {activeProject.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bAnd\b/g, "and")}
                                        </p>
                                    </div>

                                    {/* Status Badge */}
                                    <div>
                                        {activeProject.status === "live" ? (
                                            <span
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                                                style={{
                                                    background: `${COLORS.statusLive}20`,
                                                    color: COLORS.statusLive,
                                                    border: `1px solid ${COLORS.statusLive}40`,
                                                }}
                                            >
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                Active on Flourish
                                            </span>
                                        ) : activeProject.status === "matched" ? (
                                            <span
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                                                style={{
                                                    background: `${COLORS.accentCoral}20`,
                                                    color: COLORS.accentCoral,
                                                    border: `1px solid ${COLORS.accentCoral}40`,
                                                }}
                                            >
                                                <Database className="w-3.5 h-3.5" />
                                                Flourish Data Available
                                            </span>
                                        ) : (
                                            <span
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                                                style={{
                                                    background: `${COLORS.statusComing}15`,
                                                    color: COLORS.statusComing,
                                                    border: `1px solid ${COLORS.statusComing}30`,
                                                }}
                                            >
                                                <Zap className="w-3.5 h-3.5" />
                                                Data Enrichment Available
                                            </span>
                                        )}
                                    </div>

                                    {/* KPI Grid — only for matched/live */}
                                    {activeProject.status !== "coming_soon" && (
                                        <div className="grid grid-cols-2 gap-3">
                                            {activeProject.parkingSpaces && (
                                                <KpiCell
                                                    label="Parking"
                                                    value={activeProject.parkingSpaces.toLocaleString()}
                                                />
                                            )}
                                            {activeProject.stores && (
                                                <KpiCell
                                                    label="Stores"
                                                    value={activeProject.stores.toString()}
                                                />
                                            )}
                                            {activeProject.footfall && (
                                                <KpiCell
                                                    label="Footfall"
                                                    value={`${(activeProject.footfall / 1000000).toFixed(0)}M`}
                                                />
                                            )}
                                            {activeProject.googleRating && (
                                                <KpiCell
                                                    label="Google Rating"
                                                    value={`${activeProject.googleRating} ★`}
                                                    valueColor={Number(activeProject.googleRating) >= 4.0 ? COLORS.statusLive : COLORS.textPrimary}
                                                />
                                            )}
                                            {activeProject.googleReviews && (
                                                <KpiCell
                                                    label="Reviews"
                                                    value={activeProject.googleReviews.toLocaleString()}
                                                />
                                            )}
                                            {activeProject.phone && (
                                                <KpiCell
                                                    label="Phone"
                                                    value={activeProject.phone}
                                                />
                                            )}
                                        </div>
                                    )}

                                    {/* Coming Soon message */}
                                    {activeProject.status === "coming_soon" && (
                                        <div
                                            className="rounded-xl p-5 text-center space-y-3"
                                            style={{
                                                background: COLORS.bgSurface,
                                                border: `1px solid ${COLORS.borderDefault}`,
                                            }}
                                        >
                                            <Target
                                                className="w-8 h-8 mx-auto"
                                                style={{ color: COLORS.textMuted }}
                                            />
                                            <p
                                                className="text-sm font-medium"
                                                style={{ color: COLORS.textSecondary }}
                                            >
                                                This project isn&apos;t in the Flourish database yet.
                                            </p>
                                            <p
                                                className="text-xs"
                                                style={{ color: COLORS.textMuted }}
                                            >
                                                We can enrich this location with vacancy rates, tenant
                                                mix analysis, footfall data, and gap analysis within
                                                48 hours.
                                            </p>
                                        </div>
                                    )}

                                    {/* Divider */}
                                    <div
                                        className="w-full h-px"
                                        style={{ background: COLORS.borderDefault }}
                                    />

                                    {/* Action Buttons */}
                                    <div className="space-y-2">
                                        <button
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                                            style={{
                                                background: `${COLORS.accentCoral}15`,
                                                color: COLORS.accentCoral,
                                                border: `1px solid ${COLORS.accentCoral}30`,
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.background = `${COLORS.accentCoral}25`)
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.background = `${COLORS.accentCoral}15`)
                                            }
                                        >
                                            <LineChart className="w-4 h-4" />
                                            Run Gap Analysis
                                        </button>
                                        <button
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                                            style={{
                                                background: `${COLORS.bgElevated}80`,
                                                color: COLORS.textSecondary,
                                                border: `1px solid ${COLORS.borderDefault}`,
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.background = COLORS.bgElevated)
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.background = `${COLORS.bgElevated}80`)
                                            }
                                        >
                                            <Users className="w-4 h-4" />
                                            View Tenant Recommendations
                                        </button>
                                        {activeProject.website && (
                                            <a
                                                href={activeProject.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                                                style={{
                                                    background: `${COLORS.bgElevated}60`,
                                                    color: COLORS.textMuted,
                                                    border: `1px solid ${COLORS.borderDefault}`,
                                                }}
                                                onMouseEnter={(e) =>
                                                (e.currentTarget.style.background =
                                                    COLORS.bgElevated)
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.background = `${COLORS.bgElevated}60`)
                                                }
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Open Website
                                            </a>
                                        )}
                                    </div>

                                    {/* Palace Shopping special callout */}
                                    {activeProject.isFlourishManaged && (
                                        <div
                                            className="rounded-xl p-4 space-y-2"
                                            style={{
                                                background: `${COLORS.statusLive}10`,
                                                border: `1px solid ${COLORS.statusLive}30`,
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2
                                                    className="w-4 h-4"
                                                    style={{ color: COLORS.statusLive }}
                                                />
                                                <span
                                                    className="text-sm font-semibold"
                                                    style={{ color: COLORS.statusLive }}
                                                >
                                                    Already Managed on Flourish
                                                </span>
                                            </div>
                                            <p
                                                className="text-xs"
                                                style={{ color: COLORS.textMuted }}
                                            >
                                                Palace Shopping is a live Flourish location with active
                                                tenant tracking, gap analysis, and real-time
                                                intelligence. This is a working proof of concept for
                                                your entire portfolio.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ═══════════════════════════════════════
                    LAYER 50 — ESG Overlay
                ═══════════════════════════════════════ */}
                    {showESG && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center"
                            style={{
                                background: `${COLORS.bgBase}F2`,
                                backdropFilter: "blur(24px)",
                            }}
                        >
                            <button
                                onClick={() => setShowESG(false)}
                                className="absolute top-6 right-6 p-2 rounded-xl cursor-pointer transition-colors hover:bg-white/10"
                                style={{
                                    color: COLORS.textMuted,
                                    border: `1px solid ${COLORS.borderDefault}`,
                                }}
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="max-w-5xl w-full px-6">
                                <div className="text-center mb-10">
                                    <div
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
                                        style={{
                                            background: `${COLORS.accentLime}15`,
                                            color: COLORS.accentLime,
                                            border: `1px solid ${COLORS.accentLime}30`,
                                        }}
                                    >
                                        <Layers className="w-3.5 h-3.5" />
                                        ESG-Aligned Intelligence
                                    </div>
                                    <h2
                                        className="text-3xl md:text-4xl font-bold mb-3"
                                        style={{
                                            color: COLORS.textPrimary,
                                            fontFamily: "'Exo', sans-serif",
                                        }}
                                    >
                                        Your Values, Our Data
                                    </h2>
                                    <p
                                        className="max-w-2xl mx-auto text-sm"
                                        style={{ color: COLORS.textSecondary }}
                                    >
                                        RivingtonHark&apos;s commitment to People, Place, and
                                        Partnership is directly supported by Flourish&apos;s
                                        intelligent, data-driven approach.
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {esgCards.map((card, i) => (
                                        <div
                                            key={i}
                                            className="rounded-xl p-5 space-y-3 transition-colors"
                                            style={{
                                                background: COLORS.bgSurface,
                                                border: `1px solid ${COLORS.borderDefault}`,
                                            }}
                                        >
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                style={{
                                                    background: `${i % 2 === 0 ? COLORS.accentCoral : COLORS.accentLime}20`,
                                                }}
                                            >
                                                <card.icon
                                                    className="w-5 h-5"
                                                    style={{
                                                        color:
                                                            i % 2 === 0
                                                                ? COLORS.accentCoral
                                                                : COLORS.accentLime,
                                                    }}
                                                />
                                            </div>
                                            <h3
                                                className="text-base font-semibold"
                                                style={{
                                                    color: COLORS.textPrimary,
                                                    fontFamily: "'Exo', sans-serif",
                                                }}
                                            >
                                                {card.principle}
                                            </h3>
                                            <p
                                                className="text-sm leading-relaxed"
                                                style={{ color: COLORS.textSecondary }}
                                            >
                                                {card.capability}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Landsec trust signal */}
                                <div className="text-center mt-8">
                                    <p
                                        className="text-xs"
                                        style={{ color: COLORS.textMuted }}
                                    >
                                        Already trusted by organisations in your network — including{" "}
                                        <span style={{ color: COLORS.accentCoral }}>Landsec</span>, a
                                        mutual partner.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════
                    LAYER 50 — Video Modal
                ═══════════════════════════════════════ */}
                    {showVideo && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center p-8"
                            style={{ background: "rgba(0,0,0,0.85)" }}
                            onClick={() => setShowVideo(false)}
                        >
                            <div
                                className="relative max-w-4xl w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setShowVideo(false)}
                                    className="absolute -top-12 right-0 p-2 rounded-xl cursor-pointer transition-colors hover:bg-white/10"
                                    style={{ color: COLORS.textMuted }}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                                <div
                                    className="aspect-video rounded-2xl overflow-hidden"
                                    style={{
                                        border: `1px solid ${COLORS.borderDefault}`,
                                    }}
                                >
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src="https://www.youtube.com/embed/F3ztU22OjQs?autoplay=1"
                                        title="Flourish — Transforming Retail Spaces"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════
                    LAYER 60 — Guided Tour Overlay
                ═══════════════════════════════════════ */}
                    {demoStep === "guided" && guideStep !== null && (
                        <>
                            {/* Dimming overlay */}
                            <div
                                className="absolute inset-0 z-[55] pointer-events-none transition-opacity duration-500"
                                style={{
                                    background: `${COLORS.bgBase}80`,
                                    opacity: guideStep === 0 ? 0.6 : 0.3,
                                }}
                            />

                            {/* Guide card */}
                            <div
                                className="absolute bottom-24 right-6 z-[60] w-[380px] rounded-2xl p-6 transition-all duration-500"
                                style={{
                                    background: `${COLORS.bgBase}F5`,
                                    border: `1px solid ${COLORS.borderDefault}`,
                                    backdropFilter: "blur(20px)",
                                    boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${COLORS.borderDefault}`,
                                }}
                            >
                                {/* Step counter */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div
                                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                        style={{
                                            background: `${COLORS.accentCoral}20`,
                                            color: COLORS.accentCoral,
                                        }}
                                    >
                                        {guideStep + 1} of {GUIDE_STEPS.length}
                                    </div>
                                    {/* Step dots */}
                                    <div className="flex gap-1 ml-auto">
                                        {GUIDE_STEPS.map((_, i) => (
                                            <div
                                                key={i}
                                                className="rounded-full transition-all duration-300"
                                                style={{
                                                    width: i === guideStep ? 16 : 6,
                                                    height: 6,
                                                    background: i === guideStep ? COLORS.accentCoral : i < guideStep ? COLORS.statusLive : `${COLORS.textMuted}30`,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Content */}
                                <h3
                                    className="text-lg font-bold mb-2"
                                    style={{ color: COLORS.textPrimary, fontFamily: "'Exo', sans-serif" }}
                                >
                                    {GUIDE_STEPS[guideStep].title}
                                </h3>
                                <p
                                    className="text-sm leading-relaxed mb-5"
                                    style={{ color: COLORS.textMuted }}
                                >
                                    {GUIDE_STEPS[guideStep].text}
                                </p>

                                {/* Regional Mode CTA on last step */}
                                {guideStep === GUIDE_STEPS.length - 1 && (
                                    <button
                                        onClick={() => {
                                            setShowRegionalMode(true)
                                            setGuideStep(null)
                                            setDemoStep("explore")
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all hover:scale-[1.02] mb-3"
                                        style={{
                                            background: `linear-gradient(135deg, ${COLORS.accentCoral}, ${COLORS.statusLive})`,
                                            color: "#fff",
                                            fontFamily: "'Exo', sans-serif",
                                            boxShadow: `0 0 20px ${COLORS.accentCoral}30`,
                                            animation: "pulse 2s ease-in-out infinite",
                                        }}
                                    >
                                        <Layers className="w-4 h-4" />
                                        Enter Regional Mode
                                    </button>
                                )}

                                {/* Nav buttons */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={advanceGuide}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:opacity-90"
                                        style={{
                                            background: guideStep === GUIDE_STEPS.length - 1 ? COLORS.bgElevated : COLORS.accentCoral,
                                            color: "#fff",
                                            fontFamily: "'Exo', sans-serif",
                                        }}
                                    >
                                        {guideStep === GUIDE_STEPS.length - 1 ? "Finish Tour" : "Next"}
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={skipGuide}
                                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-colors hover:opacity-80"
                                        style={{ color: COLORS.textMuted }}
                                    >
                                        <SkipForward className="w-3 h-3" />
                                        Skip
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
            {/* ═══════════════════════════════════════
                REGIONAL MODE PANEL
            ═══════════════════════════════════════ */}
            {showRegionalMode && palaceRegionalData && (
                <RHRegionalPanel
                    palaceData={palaceRegionalData.palace}
                    nearbyLocations={palaceRegionalData.nearby}
                    onClose={() => setShowRegionalMode(false)}
                />
            )}
        </>
    )
}
