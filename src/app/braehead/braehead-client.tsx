"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DemoRequestModal } from "@/components/demo-request-modal"
import {
    Lock, Building2, TrendingUp, Target, Sparkles, MapPin,
    BarChart3, Users, ArrowRight, CheckCircle2, Zap, LineChart,
    Play, Lightbulb, Eye, HeartHandshake, ShoppingBag, Star,
    Car, Calendar, Layers, ChevronDown, ChevronRight, Award,
    Globe, PieChart, ArrowUpRight,
} from "lucide-react"

// ─── Design Tokens ───────────────────────────────
const C = {
    bg: "#0A1628",
    bgAlt: "#0F2135",
    surface: "#132038",
    elevated: "#1C2D4A",
    border: "#2A3F5F",
    text: "#F1F5F9",
    textSoft: "#CBD5E1",
    textMuted: "#7C8DA5",
    lime: "#E6FB60",
    teal: "#06B6D4",
    tealDark: "#0E7490",
    green: "#4ADE80",
    amber: "#FBBF24",
    red: "#F87171",
    coral: "#E8458B",
} as const

const PASSWORD = "braehead2026"

// ─── Types ───────────────────────────────────────
interface Tenant {
    name: string
    category: string
    subcategory: string | null
    isAnchorTenant: boolean
    floor: number | null
    unitNumber: string | null
}

interface LocationData {
    id: string; name: string; town: string | null; city: string | null
    postcode: string; address: string | null; street: string | null
    type: string | null; website: string | null; phone: string | null
    parkingSpaces: number | null; numberOfStores: number | null
    footfall: number | null; googleRating: string | null
    googleReviews: number | null; vacancy: number | null
    openingHours: Record<string, string> | null
    numberOfFloors: number | null; anchorTenants: number | null
    openedYear: number | null; retailSpace: number | null
    totalFloorArea: number | null; carParkPrice: number | null
    evCharging: boolean | null; evChargingSpaces: number | null
    publicTransit: string | null; owner: string | null
    management: string | null; facebookRating: string | null
    facebookReviews: number | null; instagram: string | null
    facebook: string | null; largestCategory: string | null
    largestCategoryPercent: number | null
    population: number | null; medianAge: number | null
    avgHouseholdIncome: number | null; incomeVsNational: number | null
    familiesPercent: number | null; seniorsPercent: number | null
    homeownership: number | null; homeownershipVsNational: number | null
    carOwnership: number | null; carOwnershipVsNational: number | null
    heroImage: string | null; tenants: Tenant[]
}

interface Competitor {
    id: string; name: string; city: string
    stores: number | null; footfall: number | null
    googleRating: string | null; owner: string | null
}

interface GapData {
    comparison: {
        target: { locationName: string; totalTenants: number; categories: { category: string; count: number; percentage: number }[] }
        competitors: { totalLocations: number; totalTenants: number; averageTenantsPerLocation: number; categories: { category: string; count: number; percentage: number }[] }
        gaps: {
            missingCategories: { category: string; competitorPercentage: number; gapScore: number }[]
            overRepresented: { category: string; targetPercentage: number; competitorAverage: number; variance: number }[]
            underRepresented: { category: string; targetPercentage: number; competitorAverage: number; variance: number; gapScore: number }[]
        }
    }
    missingBrands: { name: string; category: string; presentInLocations: { locationName: string }[] }[]
    priorities: { category: string; priority: "high" | "medium" | "low"; score: number; gapType: string; gapSize: number; competitorCoverage: number; recommendation: string }[]
    insights: string[]
}

interface Props {
    location: LocationData
    competitors: Competitor[]
    gapAnalysis: GapData | null
}

// ─── Category Colours ────────────────────────────
const CAT_COLORS: Record<string, string> = {
    "Clothing & Footwear": "#06B6D4",
    "Health & Beauty": "#E8458B",
    "Cafes & Restaurants": "#4ADE80",
    "Jewellery & Watches": "#FBBF24",
    "Electrical & Technology": "#38BDF8",
    "Home & Garden": "#A78BFA",
    "Gifts & Stationery": "#F97316",
    "General Retail": "#94A3B8",
    "Services": "#64748B",
    "Leisure & Entertainment": "#818CF8",
    "Kids & Toys": "#F472B6",
    "Food & Grocery": "#2DD4BF",
    "Financial Services": "#78716C",
    "Department Stores": "#E6FB60",
}

// ─── Helpers ─────────────────────────────────────
function fmt(n: number | null | undefined): string {
    if (n == null) return "N/A"
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
    return n.toLocaleString()
}

function getCategoryBreakdown(tenants: Tenant[]) {
    const map = new Map<string, number>()
    tenants.forEach((t) => {
        const cat = t.category || "Other"
        map.set(cat, (map.get(cat) || 0) + 1)
    })
    return Array.from(map.entries())
        .map(([category, count]) => ({ category, count, pct: (count / tenants.length) * 100 }))
        .sort((a, b) => b.count - a.count)
}

// ─── Animated Counter ────────────────────────────
function useCounter(target: number, dur = 1400, active = true) {
    const [val, setVal] = useState(0)
    useEffect(() => {
        if (!active) { setVal(0); return }
        let cur = 0
        const inc = target / (dur / 16)
        const t = setInterval(() => {
            cur += inc
            if (cur >= target) { setVal(target); clearInterval(t) }
            else setVal(Math.floor(cur))
        }, 16)
        return () => clearInterval(t)
    }, [target, dur, active])
    return val
}

// ═══════════════════════════════════════════════════
// Password Gate
// ═══════════════════════════════════════════════════
function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
    const [pw, setPw] = useState("")
    const [error, setError] = useState(false)
    const [shake, setShake] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined" && sessionStorage.getItem("braehead-auth") === "true") {
            onUnlock()
        }
    }, [onUnlock])

    const submit = () => {
        if (pw.toLowerCase().trim() === PASSWORD) {
            sessionStorage.setItem("braehead-auth", "true")
            onUnlock()
        } else {
            setError(true)
            setShake(true)
            setTimeout(() => setShake(false), 500)
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center" style={{ background: C.bg }}>
            {/* Gradient orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${C.teal}, transparent)` }} />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-8" style={{ background: `radial-gradient(circle, ${C.lime}, transparent)` }} />
            </div>
            <div className={`relative z-10 w-full max-w-md px-6 transition-transform ${shake ? "animate-[shake_0.5s]" : ""}`}>
                {/* Dual branding */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <Image src="/flourishlogonew.png" alt="Flourish" width={100} height={36} className="h-8 w-auto" />
                    <div className="h-8 w-px" style={{ background: C.border }} />
                    <span className="text-lg font-bold" style={{ color: C.text }}>Braehead</span>
                </div>
                <h1 className="text-center text-2xl font-bold mb-2" style={{ color: C.text }}>Exclusive Showcase</h1>
                <p className="text-center text-sm mb-8" style={{ color: C.textMuted }}>Enter your access code to view the Braehead intelligence report</p>
                <div className="rounded-2xl p-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="flex items-center gap-3 mb-4">
                        <Lock className="w-5 h-5" style={{ color: C.teal }} />
                        <input
                            type="password"
                            placeholder="Access code"
                            value={pw}
                            onChange={(e) => { setPw(e.target.value); setError(false) }}
                            onKeyDown={(e) => e.key === "Enter" && submit()}
                            className="flex-1 bg-transparent border-none outline-none text-base"
                            style={{ color: C.text }}
                            autoFocus
                        />
                    </div>
                    <div className="h-px mb-4" style={{ background: C.border }} />
                    {error && <p className="text-sm mb-3" style={{ color: C.red }}>Invalid access code. Please try again.</p>}
                    <button
                        onClick={submit}
                        className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                        style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`, color: C.text }}
                    >
                        Access Report
                    </button>
                </div>
                <p className="text-center text-xs mt-6" style={{ color: C.textMuted }}>
                    Confidential — prepared exclusively for Braehead by Flourish
                </p>
            </div>
            <style>{`@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }`}</style>
        </div>
    )
}

// ═══════════════════════════════════════════════════
// Section Header
// ═══════════════════════════════════════════════════
function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
    return (
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${C.teal}20` }}>
                    <Icon className="w-5 h-5" style={{ color: C.teal }} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold" style={{ color: C.text }}>{title}</h2>
            </div>
            {subtitle && <p className="text-sm ml-[52px]" style={{ color: C.textMuted }}>{subtitle}</p>}
        </div>
    )
}

// ═══════════════════════════════════════════════════
// Stat Card
// ═══════════════════════════════════════════════════
function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color?: string }) {
    return (
        <div className="rounded-xl p-5 text-center transition-all hover:scale-[1.02]" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: color || C.textMuted }} />
            <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: color || C.text, fontFamily: "'Inter', sans-serif" }}>{value}</div>
            <div className="text-xs font-medium" style={{ color: C.textMuted }}>{label}</div>
        </div>
    )
}

// ═══════════════════════════════════════════════════
// Main Export
// ═══════════════════════════════════════════════════
export default function BraeheadClient({ location, competitors, gapAnalysis }: Props) {
    const [unlocked, setUnlocked] = useState(false)
    const [showAllTenants, setShowAllTenants] = useState(false)
    const [heroVisible, setHeroVisible] = useState(false)
    const [scrollProgress, setScrollProgress] = useState(0)
    const heroRef = useRef<HTMLDivElement>(null)

    // Check session on mount
    useEffect(() => {
        if (typeof window !== "undefined" && sessionStorage.getItem("braehead-auth") === "true") {
            setUnlocked(true)
        }
    }, [])

    // Animate hero on unlock
    useEffect(() => {
        if (unlocked) {
            const t = setTimeout(() => setHeroVisible(true), 150)
            return () => clearTimeout(t)
        }
    }, [unlocked])

    // Scroll progress
    useEffect(() => {
        if (!unlocked) return
        const onScroll = () => {
            const h = document.documentElement.scrollHeight - window.innerHeight
            setScrollProgress(h > 0 ? (window.scrollY / h) * 100 : 0)
        }
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [unlocked])

    const categories = getCategoryBreakdown(location.tenants)
    const anchors = location.tenants.filter((t) => t.isAnchorTenant)

    const animStores = useCounter(location.numberOfStores || 0, 1400, unlocked)
    const animFootfall = useCounter(Math.round((location.footfall || 0) / 1_000_000), 1400, unlocked)
    const animParking = useCounter(location.parkingSpaces || 0, 1400, unlocked)
    const animRating = useCounter(Math.round((parseFloat(location.googleRating || "0")) * 10), 1400, unlocked)

    if (!unlocked) {
        return <PasswordGate onUnlock={() => setUnlocked(true)} />
    }

    return (
        <div className="min-h-screen" style={{ background: C.bg, color: C.text, fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {/* Fonts */}
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

            {/* Scroll progress */}
            <div className="fixed top-0 left-0 z-[60] h-[3px]" style={{
                width: `${scrollProgress}%`,
                background: `linear-gradient(90deg, ${C.teal}, ${C.lime})`,
                transition: "width 0.1s linear",
                pointerEvents: "none",
            }} />

            {/* ─── Sticky Header ─── */}
            <header className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: `${C.bg}ee`, borderBottom: `1px solid ${C.border}` }}>
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Image src="/flourishlogonew.png" alt="Flourish" width={90} height={30} className="h-6 w-auto" />
                        <div className="h-6 w-px" style={{ background: C.border }} />
                        <span className="text-sm font-semibold" style={{ color: C.textSoft }}>
                            Braehead Intelligence Report
                        </span>
                    </div>
                    <DemoRequestModal
                        variant="braehead"
                        trigger={
                            <Button className="font-semibold text-sm" style={{ background: C.lime, color: C.bg }}>
                                Request Demo
                            </Button>
                        }
                    />
                </div>
            </header>

            {/* ═══ SECTION 1: HERO ═══ */}
            <section
                ref={heroRef}
                className="relative py-20 md:py-28 overflow-hidden transition-all duration-700"
                style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(30px)" }}
            >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, ${C.teal} 1px, transparent 0)`,
                    backgroundSize: "40px 40px",
                }} />
                <div className="absolute inset-0" style={{
                    background: `radial-gradient(ellipse at 30% 20%, ${C.teal}10 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, ${C.lime}05 0%, transparent 50%)`,
                }} />

                <div className="container mx-auto px-4 relative">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center space-y-6 mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm" style={{ background: `${C.teal}15`, color: C.teal, border: `1px solid ${C.teal}30` }}>
                                <Sparkles className="h-4 w-4" />
                                AI-Powered Retail Intelligence
                            </div>

                            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                                <span style={{ color: C.text }}>Unlocking </span>
                                <span style={{ color: C.teal }}>Hidden Potential</span>
                                <br />
                                <span style={{ color: C.text }}>at </span>
                                <span style={{ color: C.lime }}>Braehead</span>
                            </h1>

                            <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ color: C.textMuted }}>
                                Discover how Flourish&apos;s AI-powered gap analysis identifies untapped opportunities,
                                optimises tenant mix, and drives revenue growth for Scotland&apos;s premier shopping destination.
                            </p>
                        </div>

                        {/* Video Placeholder */}
                        <div className="max-w-4xl mx-auto">
                            <div className="aspect-video rounded-2xl overflow-hidden relative group cursor-pointer" style={{
                                background: `linear-gradient(135deg, ${C.surface}, ${C.elevated})`,
                                border: `2px solid ${C.border}`,
                                boxShadow: `0 25px 80px ${C.teal}15`,
                            }}>
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center transition-all group-hover:scale-110" style={{
                                        background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                                        boxShadow: `0 8px 32px ${C.teal}40`,
                                    }}>
                                        <Play className="w-8 h-8 ml-1" style={{ color: C.text }} />
                                    </div>
                                    <p className="text-sm font-medium" style={{ color: C.textMuted }}>
                                        Watch: How Flourish Transforms Retail Destinations
                                    </p>
                                </div>
                                {/* Decorative corner accents */}
                                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: `${C.teal}40` }} />
                                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: `${C.teal}40` }} />
                                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: `${C.teal}40` }} />
                                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: `${C.teal}40` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ SECTION 2: STATS BAR ═══ */}
            <section className="py-10 border-y" style={{ borderColor: C.border, background: `linear-gradient(90deg, ${C.teal}08, ${C.lime}05, ${C.teal}08)` }}>
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <StatCard icon={ShoppingBag} label="Active Retailers" value={`${animStores}+`} color={C.lime} />
                        <StatCard icon={Users} label="Annual Footfall" value={`${animFootfall}M`} color={C.teal} />
                        <StatCard icon={Layers} label="Floor Area" value="1.1M sqft" color={C.text} />
                        <StatCard icon={Car} label="Free Parking" value={fmt(animParking)} color={C.green} />
                        <StatCard icon={Star} label="Google Rating" value={`${(animRating / 10).toFixed(1)}★`} color={C.amber} />
                    </div>
                </div>
            </section>

            {/* ═══ SECTION 3: ABOUT BRAEHEAD ═══ */}
            <section className="py-16 md:py-20">
                <div className="max-w-6xl mx-auto px-4">
                    <SectionHeader icon={Building2} title="About Braehead" subtitle="Scotland's premier shopping and leisure destination" />
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="rounded-xl p-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <h4 className="text-sm font-semibold mb-4" style={{ color: C.teal }}>Property Overview</h4>
                            <div className="space-y-3">
                                {[
                                    ["Owner", location.owner || "N/A"],
                                    ["Management", location.management || "N/A"],
                                    ["Opened", location.openedYear ? String(location.openedYear) : "N/A"],
                                    ["Floors", location.numberOfFloors ? String(location.numberOfFloors) : "N/A"],
                                    ["Anchor Tenants", location.anchorTenants ? String(location.anchorTenants) : "N/A"],
                                    ["Parking Price", location.carParkPrice === 0 ? "Free" : location.carParkPrice ? `£${location.carParkPrice}/hr` : "N/A"],
                                    ["EV Charging", location.evCharging ? `Yes (${location.evChargingSpaces} spaces)` : "No"],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${C.border}40` }}>
                                        <span className="text-xs" style={{ color: C.textMuted }}>{label}</span>
                                        <span className="text-sm font-medium" style={{ color: C.textSoft }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="rounded-xl p-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                                <h4 className="text-sm font-semibold mb-4" style={{ color: C.teal }}>Digital Presence</h4>
                                <div className="space-y-3">
                                    {[
                                        ["Website", location.website?.replace("https://", "") || "N/A"],
                                        ["Google Reviews", location.googleReviews ? `${location.googleReviews.toLocaleString()} reviews` : "N/A"],
                                        ["Instagram", location.instagram ? "@braeheadcentre" : "N/A"],
                                        ["Facebook", location.facebook ? "Active" : "N/A"],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${C.border}40` }}>
                                            <span className="text-xs" style={{ color: C.textMuted }}>{label}</span>
                                            <span className="text-sm font-medium" style={{ color: C.textSoft }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {location.publicTransit && (
                                <div className="rounded-xl p-6" style={{ background: `${C.teal}08`, border: `1px solid ${C.teal}20` }}>
                                    <h4 className="text-sm font-semibold mb-2" style={{ color: C.teal }}>Public Transit</h4>
                                    <p className="text-sm leading-relaxed" style={{ color: C.textSoft }}>{location.publicTransit}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ SECTION 4: TENANT MIX ═══ */}
            <section className="py-16 md:py-20" style={{ background: C.bgAlt }}>
                <div className="max-w-6xl mx-auto px-4">
                    <SectionHeader icon={PieChart} title="Tenant Mix Analysis" subtitle={`${location.tenants.length} retailers across ${categories.length} categories`} />

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Category bars */}
                        <div className="lg:col-span-2 rounded-xl p-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <h4 className="text-sm font-semibold mb-5" style={{ color: C.teal }}>Category Breakdown</h4>
                            <div className="space-y-3">
                                {categories.map((cat) => (
                                    <div key={cat.category}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm" style={{ color: C.textSoft }}>{cat.category}</span>
                                            <span className="text-sm font-semibold" style={{ color: C.text }}>
                                                {cat.count} <span className="font-normal" style={{ color: C.textMuted }}>({cat.pct.toFixed(1)}%)</span>
                                            </span>
                                        </div>
                                        <div className="h-3 rounded-full overflow-hidden" style={{ background: C.elevated }}>
                                            <div
                                                className="h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${cat.pct}%`, background: CAT_COLORS[cat.category] || C.textMuted }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Anchor tenants */}
                        <div className="space-y-6">
                            <div className="rounded-xl p-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                                <h4 className="text-sm font-semibold mb-4" style={{ color: C.lime }}>Anchor Tenants</h4>
                                <div className="flex flex-wrap gap-2">
                                    {anchors.map((t) => (
                                        <span key={t.name} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: `${C.lime}12`, color: C.lime, border: `1px solid ${C.lime}25` }}>
                                            {t.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-xl p-6" style={{ background: `linear-gradient(135deg, ${C.teal}15, ${C.teal}05)`, border: `1px solid ${C.teal}25` }}>
                                <h4 className="text-sm font-semibold mb-2" style={{ color: C.teal }}>Dominant Category</h4>
                                <div className="text-xl font-bold mb-1" style={{ color: C.text }}>{location.largestCategory}</div>
                                <p className="text-xs" style={{ color: C.textMuted }}>
                                    {location.largestCategoryPercent ? `${(location.largestCategoryPercent * 100).toFixed(1)}%` : "—"} of total tenants
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Expandable full directory */}
                    <div className="mt-6">
                        <button
                            onClick={() => setShowAllTenants(!showAllTenants)}
                            className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                            style={{ color: C.teal }}
                        >
                            <ChevronDown className={`w-4 h-4 transition-transform ${showAllTenants ? "rotate-180" : ""}`} />
                            {showAllTenants ? "Hide" : "Show"} Full Tenant Directory ({location.tenants.length})
                        </button>
                        {showAllTenants && (
                            <div className="mt-4 rounded-xl p-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                                    {location.tenants.map((t) => (
                                        <div key={t.name} className="text-xs py-1.5 px-2 rounded hover:bg-white/5" style={{ color: C.textSoft }}>
                                            {t.name}
                                            <span className="ml-1 opacity-50">· {t.subcategory || t.category}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══ SECTION 5: GAP ANALYSIS ═══ */}
            {gapAnalysis && (
                <section className="py-16 md:py-20">
                    <div className="max-w-6xl mx-auto px-4">
                        <SectionHeader icon={Target} title="Gap Analysis" subtitle="AI-identified opportunities based on competitor benchmarking" />

                        {/* Competitor Overview */}
                        {competitors.length > 0 && (
                            <div className="mb-8 rounded-xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                                <div className="p-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <h4 className="text-sm font-semibold" style={{ color: C.teal }}>Competitive Landscape — Nearby Shopping Centres</h4>
                                </div>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                            <th className="text-left p-3 font-semibold" style={{ color: C.textMuted }}>Centre</th>
                                            <th className="text-left p-3 font-semibold" style={{ color: C.textMuted }}>Location</th>
                                            <th className="text-center p-3 font-semibold" style={{ color: C.textMuted }}>Stores</th>
                                            <th className="text-center p-3 font-semibold" style={{ color: C.textMuted }}>Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ borderBottom: `1px solid ${C.border}`, background: `${C.teal}10` }}>
                                            <td className="p-3 font-semibold" style={{ color: C.teal }}>{location.name}</td>
                                            <td className="p-3" style={{ color: C.textSoft }}>{location.town || location.city}</td>
                                            <td className="p-3 text-center font-bold" style={{ color: C.text }}>{location.numberOfStores}</td>
                                            <td className="p-3 text-center" style={{ color: C.amber }}>{location.googleRating}★</td>
                                        </tr>
                                        {competitors.map((comp) => (
                                            <tr key={comp.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                                <td className="p-3 font-medium" style={{ color: C.textSoft }}>{comp.name}</td>
                                                <td className="p-3" style={{ color: C.textMuted }}>{comp.city}</td>
                                                <td className="p-3 text-center" style={{ color: C.text }}>{comp.stores || "—"}</td>
                                                <td className="p-3 text-center" style={{ color: C.amber }}>{comp.googleRating || "—"}★</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {/* Key Insights */}
                            <div className="rounded-xl p-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                                <h4 className="text-sm font-semibold mb-4" style={{ color: C.lime }}>Key Insights</h4>
                                <ul className="space-y-3">
                                    {gapAnalysis.insights.map((insight, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: C.textSoft }}>
                                            <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.teal }} />
                                            {insight}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Priority Actions */}
                            <div className="rounded-xl p-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                                <h4 className="text-sm font-semibold mb-4" style={{ color: C.lime }}>Priority Actions</h4>
                                <div className="space-y-3">
                                    {gapAnalysis.priorities.slice(0, 6).map((p, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <span className="shrink-0 w-2 h-2 rounded-full mt-2" style={{
                                                background: p.priority === "high" ? C.red : p.priority === "medium" ? C.amber : C.green
                                            }} />
                                            <div className="flex-1">
                                                <span className="text-sm font-medium" style={{ color: C.text }}>{p.category}</span>
                                                <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>{p.recommendation}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Missing Brands */}
                        {gapAnalysis.missingBrands.length > 0 && (
                            <div className="rounded-xl p-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                                <h4 className="text-sm font-semibold mb-4" style={{ color: C.lime }}>Notable Missing Brands</h4>
                                <p className="text-xs mb-4" style={{ color: C.textMuted }}>Brands found at nearby competitors but not currently at Braehead</p>
                                <div className="flex flex-wrap gap-2">
                                    {gapAnalysis.missingBrands.slice(0, 20).map((b) => (
                                        <span key={b.name} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: C.elevated, color: C.textSoft, border: `1px solid ${C.border}` }}>
                                            {b.name} <span style={{ color: C.textMuted }}>· {b.category}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ═══ SECTION 6: HOW FLOURISH DRIVES VALUE ═══ */}
            <section className="py-16 md:py-20" style={{ background: C.bgAlt }}>
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: C.text }}>
                            How Flourish Drives Value
                        </h2>
                        <p className="text-lg max-w-2xl mx-auto" style={{ color: C.textMuted }}>
                            Our AI-powered platform transforms data into actionable intelligence for Braehead.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Target,
                                title: "AI Gap Analysis",
                                desc: "Our algorithms benchmark Braehead against every competing centre within a 10-mile radius, identifying missing categories, under-represented brands, and untapped revenue streams.",
                                color: C.teal,
                            },
                            {
                                icon: Users,
                                title: "Tenant Matching",
                                desc: "We maintain a curated network of 2,700+ vetted tenants — from independent traders to national brands — ready to fill identified gaps with the right fit for your centre.",
                                color: C.lime,
                            },
                            {
                                icon: TrendingUp,
                                title: "Revenue Growth",
                                desc: "Our partners see an average 30% increase in net income through data-driven tenant curation, reducing vacancy and optimising the retail mix for maximum footfall conversion.",
                                color: C.green,
                            },
                        ].map((item) => (
                            <Card key={item.title} className="border-0 text-center p-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: `${item.color}15` }}>
                                    <item.icon className="h-8 w-8" style={{ color: item.color }} />
                                </div>
                                <h3 className="text-xl font-bold mb-3" style={{ color: C.text }}>{item.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>{item.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ SECTION 7: WHY PARTNER ═══ */}
            <section className="py-16 md:py-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: C.text }}>
                            Why Partner with Flourish?
                        </h2>
                        <p className="text-lg max-w-3xl mx-auto" style={{ color: C.textMuted }}>
                            We don&apos;t just identify opportunities — we help you activate them.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-5xl mx-auto">
                        <div className="rounded-xl p-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl" style={{ background: `${C.lime}15` }}>
                                    <Lightbulb className="h-6 w-6" style={{ color: C.lime }} />
                                </div>
                                <h3 className="text-xl font-bold" style={{ color: C.lime }}>Beyond Analytics</h3>
                            </div>
                            <p className="text-sm leading-relaxed mb-3" style={{ color: C.textSoft }}>
                                Our AI-powered gap analysis is just the beginning. We connect you with a curated network
                                of vetted tenants — from independent traders to national brands — ready to fill your spaces.
                            </p>
                            <p className="text-xs" style={{ color: C.textMuted }}>
                                Data without action is just numbers. We combine intelligent insights with hands-on occupancy management.
                            </p>
                        </div>

                        <div className="rounded-xl p-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl" style={{ background: `${C.teal}15` }}>
                                    <Eye className="h-6 w-6" style={{ color: C.teal }} />
                                </div>
                                <h3 className="text-xl font-bold" style={{ color: C.teal }}>Transparent Model</h3>
                            </div>
                            <p className="text-sm leading-relaxed mb-3" style={{ color: C.textSoft }}>
                                Our unique letting and occupancy model focuses on delivering sustainable business
                                through insight, management, and ongoing support.
                            </p>
                            <p className="text-xs" style={{ color: C.textMuted }}>
                                No hidden fees, no surprises. We work as an extension of your leasing team,
                                aligned with your goals for occupancy and revenue growth.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {[
                            { icon: TrendingUp, title: "Proven Track Record", desc: "30% average increase in net income through innovative space activation and tenant curation.", color: C.lime },
                            { icon: Users, title: "On-the-Ground Team", desc: "Expert team with backgrounds in retail, visual merchandising, finance, and placemaking.", color: C.teal },
                            { icon: HeartHandshake, title: "End-to-End Support", desc: "From compliance (PAT testing, RAMS, insurance) to visual merchandising — we handle the details.", color: C.lime },
                        ].map((item) => (
                            <div key={item.title} className="text-center p-6">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${item.color}15` }}>
                                    <item.icon className="h-7 w-7" style={{ color: item.color }} />
                                </div>
                                <h3 className="text-lg font-bold mb-2" style={{ color: C.text }}>{item.title}</h3>
                                <p className="text-sm" style={{ color: C.textMuted }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Testimonial */}
                    <div className="mt-12 max-w-3xl mx-auto text-center">
                        <div className="rounded-2xl p-8" style={{ background: `linear-gradient(135deg, ${C.surface}, ${C.elevated})`, border: `1px solid ${C.border}` }}>
                            <p className="text-xl italic mb-4" style={{ color: C.textSoft }}>
                                &quot;Flourish transformed our vacant spaces into thriving retail destinations.
                                Their approach is professional, innovative, and results-driven.&quot;
                            </p>
                            <p className="text-sm" style={{ color: C.textMuted }}>— Shopping Centre Owner, Major UK Portfolio</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ SECTION 8: CTA ═══ */}
            <section className="py-20" style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})` }}>
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: C.text }}>
                        Ready to Unlock Braehead&apos;s Full Potential?
                    </h2>
                    <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: `${C.text}cc` }}>
                        Let&apos;s discuss how Flourish can help Frasers Group drive occupancy, diversify the tenant mix,
                        and maximise revenue at Braehead Shopping Centre.
                    </p>
                    <DemoRequestModal
                        variant="braehead"
                        trigger={
                            <Button size="lg" className="font-semibold gap-2 text-base px-8" style={{ background: C.lime, color: C.bg }}>
                                <CheckCircle2 className="h-5 w-5" />
                                Schedule a Demo
                            </Button>
                        }
                    />
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="py-8" style={{ background: C.bg, borderTop: `1px solid ${C.border}` }}>
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Image src="/flourishlogonew.png" alt="Flourish" width={80} height={30} className="h-5 w-auto" />
                            <span style={{ color: C.textMuted }}>×</span>
                            <span className="font-semibold text-sm" style={{ color: C.textSoft }}>Braehead Shopping Centre</span>
                        </div>
                        <p className="text-sm" style={{ color: C.textMuted }}>
                            © {new Date().getFullYear()} Flourish AI. Personalised showcase for Braehead.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
