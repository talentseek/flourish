"use client"

import { useState, useEffect, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import Image from "next/image"
import {
    MapPin, Building2, Users, BarChart3, Star, Car, Zap, ShoppingBag,
    Target, TrendingUp, ArrowUp, ArrowDown, ChevronRight, ChevronDown,
    Download, Lock, Eye, Award, Globe, Phone, Calendar, Layers,
    Home, Baby, Train, FileText, Database, ExternalLink, PieChart
} from "lucide-react"

// ─── Design Tokens ───────────────────────────────
const C = {
    bg: "#0B1628",
    surface: "#132038",
    elevated: "#1C2D4A",
    border: "#2A3F5F",
    navy: "#002855",
    blue: "#00A3E0",
    lime: "#E6FB60",
    coral: "#E8458B",
    text: "#F1F5F9",
    textSoft: "#CBD5E1",
    textMuted: "#7C8DA5",
    green: "#4ADE80",
    amber: "#FBBF24",
    red: "#F87171",
} as const

const PASSWORD = "landsec2026"

// ─── Types ───────────────────────────────────────
interface Tenant {
    name: string
    category: string
    isAnchorTenant: boolean
    floor: number | null
    unitNumber: string | null
}

interface LocationData {
    id: string; name: string; city: string; postcode: string; type: string
    street: string | null; address: string | null; phone: string | null
    website: string | null; owner: string | null; management: string | null
    openedYear: number | null; footfall: number | null; numberOfStores: number
    numberOfFloors: number | null; anchorTenants: number | null
    totalFloorArea: number | null; retailSpace: number | null
    parkingSpaces: number | null; carParkPrice: number | null
    evCharging: boolean | null; evChargingSpaces: number | null
    publicTransit: string | null; googleRating: string | null
    googleReviews: number | null; instagram: string | null
    facebook: string | null; youtube: string | null; tiktok: string | null
    twitter: string | null; population: number | null; medianAge: number | null
    familiesPercent: string | null; seniorsPercent: string | null
    avgHouseholdIncome: string | null; incomeVsNational: string | null
    homeownership: string | null; homeownershipVsNational: string | null
    carOwnership: string | null; carOwnershipVsNational: string | null
    healthIndex: string | null; vacancy: string | null
    vacancyGrowth: string | null; vacantUnits: number | null
    averageTenancyLengthYears: string | null; percentMultiple: string | null
    percentIndependent: string | null; tenants: Tenant[]
}

interface Competitor {
    id: string; name: string; city: string; type: string; postcode: string
    numberOfStores: number; footfall: number | null; googleRating: string | null
    owner: string | null; tenantCount: number
    categories: { category: string; count: number }[]
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
    locations: LocationData[]
    competitors: Competitor[]
    gapAnalysis: GapData | null
}

// ─── Centre map files ────────────────────────────
const CENTRE_MAPS: Record<string, { pdf: string; label: string }> = {
    "cmks95l980005fajkx22y1ctx": { pdf: "/maps/st-davids-cardiff-centre-map.pdf", label: "St David's Centre Map" },
    "cmid0jnny00fimtpupmc75o4u": { pdf: "/maps/clarks-village-centre-map.pdf", label: "Clarks Village Centre Map" },
    "cmksemajw000boqpn46fxb97w": { pdf: "/maps/xscape-milton-keynes-centre-map.pdf", label: "Xscape MK Centre Map" },
}

// Location hero images from Landsec CDN
const HERO_IMAGES: Record<string, string> = {
    "cmks95l980005fajkx22y1ctx": "https://content.landsec.com/media/lbobbt51/shopping-mall-arched-ceilings-glass-railings-pull-and-bear-apple-logo.webp",
    "cmid0jnny00fimtpupmc75o4u": "https://content.landsec.com/media/cdcbj4bc/clarks-village-sunny-urban-plaza-people-relaxing-greenery-chimney.webp",
    "cmksemajw000boqpn46fxb97w": "https://content.landsec.com/media/harau5en/xscape-mk-aerial-view-modern-glass-building-curved-roof.webp",
}

// Category colours for tenant mix
const CAT_COLORS: Record<string, string> = {
    "Fashion & Clothing": "#00A3E0",
    "Food & Beverage": "#4ADE80",
    "Health & Beauty": "#E8458B",
    "Jewellery & Accessories": "#FBBF24",
    "Homeware & Lifestyle": "#A78BFA",
    "Electronics & Technology": "#38BDF8",
    "Services": "#94A3B8",
    "Sports & Outdoors": "#F97316",
    "Kids & Toys": "#F472B6",
    "Leisure": "#818CF8",
    "Department Store": "#2DD4BF",
}

// ─── Helpers ─────────────────────────────────────
function fmt(n: number | null | undefined): string {
    if (n == null) return "N/A"
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
    return n.toLocaleString()
}

function pct(v: string | null): string {
    if (!v) return "N/A"
    const n = parseFloat(v)
    return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`
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
function useCounter(target: number, dur = 1200, active = true) {
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
// Metric Card
// ═══════════════════════════════════════════════════
function MetricCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) {
    return (
        <div className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: color || C.textMuted }} />
                <span className="text-xs font-medium" style={{ color: C.textMuted }}>{label}</span>
            </div>
            <div className="text-xl font-bold" style={{ color: color || C.text, fontFamily: "'Inter', sans-serif" }}>{value}</div>
        </div>
    )
}

// ═══════════════════════════════════════════════════
// Demographic Bar
// ═══════════════════════════════════════════════════
function DemoBar({ label, value, vs, icon: Icon, max = 100 }: { label: string; value: string | null; vs: string | null; icon: any; max?: number }) {
    const num = value ? parseFloat(value) : 0
    const vsNum = vs ? parseFloat(vs) : 0
    const width = Math.min((num / max) * 100, 100)
    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: C.textMuted }} />
                    <span className="text-sm font-medium" style={{ color: C.textSoft }}>{label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: C.text }}>{value ? `${num}%` : "N/A"}</span>
                    {vs && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{
                            background: vsNum > 0 ? `${C.green}20` : vsNum < 0 ? `${C.red}20` : `${C.textMuted}20`,
                            color: vsNum > 0 ? C.green : vsNum < 0 ? C.red : C.textMuted,
                        }}>
                            {vsNum > 0 ? "+" : ""}{vsNum.toFixed(1)}% vs UK
                        </span>
                    )}
                </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: `${C.border}` }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${width}%`, background: `linear-gradient(90deg, ${C.blue}, ${C.lime})` }} />
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════
// Password Gate
// ═══════════════════════════════════════════════════
function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
    const [pw, setPw] = useState("")
    const [error, setError] = useState(false)
    const [shake, setShake] = useState(false)

    const submit = () => {
        if (pw.toLowerCase().trim() === PASSWORD) {
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
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${C.blue}, transparent)` }} />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${C.coral}, transparent)` }} />
            </div>
            <div className={`relative z-10 w-full max-w-md px-6 transition-transform ${shake ? "animate-[shake_0.5s]" : ""}`}>
                {/* Dual branding */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <Image src="/landsec-logo.png" alt="Landsec" width={50} height={50} className="rounded" />
                    <div className="h-8 w-px" style={{ background: `${C.border}` }} />
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: C.textSoft }}>Powered by</span>
                        <Image src="/flourishlogonew.png" alt="Flourish" width={80} height={30} className="h-6 w-auto" />
                    </div>
                </div>
                <h1 className="text-center text-2xl font-bold mb-2" style={{ color: C.text }}>Portfolio Intelligence</h1>
                <p className="text-center text-sm mb-8" style={{ color: C.textMuted }}>Enter your access code to view confidential reports</p>
                <div className="rounded-2xl p-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="flex items-center gap-3 mb-4">
                        <Lock className="w-5 h-5" style={{ color: C.blue }} />
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
                        style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.navy})`, color: C.text }}
                    >
                        Access Reports
                    </button>
                </div>
                <p className="text-center text-xs mt-6" style={{ color: C.textMuted }}>
                    Confidential — prepared exclusively for Landsec by Flourish
                </p>
            </div>
            <style>{`@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }`}</style>
        </div>
    )
}

// ═══════════════════════════════════════════════════
// Location Report Section
// ═══════════════════════════════════════════════════
function LocationReport({
    loc,
    competitors,
    gapAnalysis,
    isFirst,
}: {
    loc: LocationData
    competitors: Competitor[]
    gapAnalysis: GapData | null
    isFirst: boolean
}) {
    const [showAllTenants, setShowAllTenants] = useState(false)
    const categories = getCategoryBreakdown(loc.tenants)
    const anchors = loc.tenants.filter((t) => t.isAnchorTenant)
    const map = CENTRE_MAPS[loc.id]
    const heroImg = HERO_IMAGES[loc.id]
    const reportDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

    // Location-specific recommendations
    const recommendations = getRecommendations(loc)

    return (
        <section id={`report-${loc.id}`} className="scroll-mt-20">
            {/* ─── Hero Banner ─── */}
            <div className="relative rounded-2xl overflow-hidden mb-8 h-64 md:h-80">
                {heroImg && (
                    <Image src={heroImg} alt={loc.name} fill className="object-cover" unoptimized />
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,22,40,0.95) 0%, rgba(11,22,40,0.3) 100%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: `${C.blue}30`, color: C.blue }}>{loc.type?.replace("_", " ")}</span>
                        <span className="text-xs" style={{ color: C.textMuted }}>Report Date: {reportDate}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-1" style={{ color: C.text }}>{loc.name}</h2>
                    <p className="text-sm" style={{ color: C.textSoft }}>{loc.street ? `${loc.street}, ` : ""}{loc.city} {loc.postcode}</p>
                </div>
            </div>

            {/* ─── 1. Executive Summary KPIs ─── */}
            <div className="mb-8">
                <SectionHeader icon={BarChart3} title="Executive Summary" num={1} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <MetricCard icon={Users} label="Annual Footfall" value={fmt(loc.footfall)} color={C.blue} />
                    <MetricCard icon={ShoppingBag} label="Active Retailers" value={String(loc.numberOfStores)} color={C.lime} />
                    <MetricCard icon={Star} label="Google Rating" value={loc.googleRating ? `${loc.googleRating}★` : "N/A"} color={C.amber} />
                    <MetricCard icon={Layers} label="Total Floor Area" value={loc.totalFloorArea ? `${(loc.totalFloorArea).toLocaleString()} sqft` : "N/A"} color={C.text} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MetricCard icon={Car} label="Parking Spaces" value={fmt(loc.parkingSpaces)} />
                    <MetricCard icon={Zap} label="EV Charging" value={loc.evCharging ? `${loc.evChargingSpaces} spaces` : "No"} color={loc.evCharging ? C.green : C.textMuted} />
                    <MetricCard icon={Calendar} label="Opened" value={loc.openedYear ? String(loc.openedYear) : "N/A"} />
                    <MetricCard icon={Building2} label="Owner" value={loc.owner || "N/A"} />
                </div>
            </div>

            {/* ─── 2. Centre Profile ─── */}
            <div className="mb-8">
                <SectionHeader icon={Building2} title="Centre Profile" num={2} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                        <h4 className="text-sm font-semibold mb-4" style={{ color: C.blue }}>Property Details</h4>
                        <ProfileRow label="Management" value={loc.management || "N/A"} />
                        <ProfileRow label="Phone" value={loc.phone || "N/A"} />
                        <ProfileRow label="Floors" value={loc.numberOfFloors ? String(loc.numberOfFloors) : "N/A"} />
                        <ProfileRow label="Retail Space" value={loc.retailSpace ? `${loc.retailSpace.toLocaleString()} sqft` : "N/A"} />
                        <ProfileRow label="Parking Price" value={loc.carParkPrice ? `£${loc.carParkPrice.toFixed(2)}/hr` : "N/A"} />
                        <ProfileRow label="Public Transit" value={loc.publicTransit || "N/A"} />
                    </div>
                    <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                        <h4 className="text-sm font-semibold mb-4" style={{ color: C.blue }}>Digital Presence</h4>
                        <ProfileRow label="Website" value={loc.website ? loc.website.replace("https://", "").replace(/\/$/, "") : "N/A"} href={loc.website || undefined} />
                        <ProfileRow label="Google Reviews" value={loc.googleReviews ? loc.googleReviews.toLocaleString() : "N/A"} />
                        <ProfileRow label="Instagram" value={loc.instagram ? "View" : "N/A"} href={loc.instagram || undefined} />
                        <ProfileRow label="Facebook" value={loc.facebook ? "View" : "N/A"} href={loc.facebook || undefined} />
                        <ProfileRow label="TikTok" value={loc.tiktok ? "View" : "N/A"} href={loc.tiktok || undefined} />
                        <ProfileRow label="YouTube" value={loc.youtube ? "View" : "N/A"} href={loc.youtube || undefined} />
                    </div>
                </div>
            </div>

            {/* ─── 3. Centre Map ─── */}
            {map && (
                <div className="mb-8">
                    <SectionHeader icon={MapPin} title="Centre Map" num={3} />
                    <div className="rounded-xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                        <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
                            <h4 className="text-sm font-semibold" style={{ color: C.text }}>{map.label}</h4>
                            <a href={map.pdf} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 hover:opacity-80" style={{ color: C.blue }}>
                                Open Full Size <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <div className="w-full" style={{ height: "600px" }}>
                            <object data={map.pdf} type="application/pdf" width="100%" height="100%">
                                <iframe src={map.pdf} width="100%" height="100%" style={{ border: "none" }}>
                                    <p className="p-4 text-sm" style={{ color: C.textMuted }}>
                                        Your browser does not support embedded PDFs.{" "}
                                        <a href={map.pdf} style={{ color: C.blue }}>Download the map</a>.
                                    </p>
                                </iframe>
                            </object>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── 4. Tenant Mix ─── */}
            <div className="mb-8">
                <SectionHeader icon={PieChart} title="Tenant Mix Analysis" num={4} />
                <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    {/* Category bars */}
                    <div className="space-y-3 mb-6">
                        {categories.map((cat) => (
                            <div key={cat.category}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm" style={{ color: C.textSoft }}>{cat.category}</span>
                                    <span className="text-sm font-semibold" style={{ color: C.text }}>{cat.count} ({cat.pct.toFixed(1)}%)</span>
                                </div>
                                <div className="h-3 rounded-full overflow-hidden" style={{ background: C.elevated }}>
                                    <div className="h-full rounded-full" style={{ width: `${cat.pct}%`, background: CAT_COLORS[cat.category] || C.textMuted, transition: "width 0.8s ease" }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Anchor tenants */}
                    {anchors.length > 0 && (
                        <>
                            <h4 className="text-sm font-semibold mb-3" style={{ color: C.blue }}>Anchor Tenants</h4>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {anchors.map((t) => (
                                    <span key={t.name} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: `${C.lime}15`, color: C.lime, border: `1px solid ${C.lime}30` }}>
                                        {t.name}
                                    </span>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Full tenant directory */}
                    <button
                        onClick={() => setShowAllTenants(!showAllTenants)}
                        className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                        style={{ color: C.blue }}
                    >
                        <ChevronDown className={`w-4 h-4 transition-transform ${showAllTenants ? "rotate-180" : ""}`} />
                        {showAllTenants ? "Hide" : "Show"} Full Tenant Directory ({loc.tenants.length})
                    </button>
                    {showAllTenants && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-1">
                            {loc.tenants.map((t) => (
                                <div key={t.name} className="text-xs py-1 px-2 rounded" style={{ color: C.textSoft }}>
                                    {t.name}
                                    <span className="ml-1 opacity-50">· {t.category}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── 5. Demographics ─── */}
            <div className="mb-8">
                <SectionHeader icon={Users} title="Catchment Demographics" num={5} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                        <h4 className="text-sm font-semibold mb-4" style={{ color: C.blue }}>Population & Age</h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <div className="text-xs" style={{ color: C.textMuted }}>Catchment Population</div>
                                <div className="text-2xl font-bold" style={{ color: C.text }}>{loc.population ? loc.population.toLocaleString() : "N/A"}</div>
                            </div>
                            <div>
                                <div className="text-xs" style={{ color: C.textMuted }}>Median Age</div>
                                <div className="text-2xl font-bold" style={{ color: C.text }}>{loc.medianAge || "N/A"}</div>
                            </div>
                        </div>
                        <DemoBar label="Families with Children" value={loc.familiesPercent} vs={null} icon={Baby} max={50} />
                        <DemoBar label="Seniors (65+)" value={loc.seniorsPercent} vs={null} icon={Users} max={30} />
                    </div>
                    <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                        <h4 className="text-sm font-semibold mb-4" style={{ color: C.blue }}>Socioeconomic</h4>
                        <div className="mb-4">
                            <div className="text-xs" style={{ color: C.textMuted }}>Avg Household Income</div>
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold" style={{ color: C.text }}>
                                    £{loc.avgHouseholdIncome ? parseInt(loc.avgHouseholdIncome).toLocaleString() : "N/A"}
                                </div>
                                {loc.incomeVsNational && (
                                    <span className="text-xs px-1.5 py-0.5 rounded" style={{
                                        background: parseFloat(loc.incomeVsNational) > 0 ? `${C.green}20` : `${C.red}20`,
                                        color: parseFloat(loc.incomeVsNational) > 0 ? C.green : C.red,
                                    }}>
                                        {pct(loc.incomeVsNational)} vs UK avg
                                    </span>
                                )}
                            </div>
                        </div>
                        <DemoBar label="Homeownership" value={loc.homeownership} vs={loc.homeownershipVsNational} icon={Home} />
                        <DemoBar label="Car Ownership" value={loc.carOwnership} vs={loc.carOwnershipVsNational} icon={Car} />
                    </div>
                </div>
            </div>

            {/* ─── 6. CACI KPIs (if available) ─── */}
            {loc.healthIndex && (
                <div className="mb-8">
                    <SectionHeader icon={TrendingUp} title="CACI Retail Footprint KPIs" num={6} />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <MetricCard icon={Award} label="Health Index" value={loc.healthIndex} color={C.green} />
                        <MetricCard icon={Target} label="Vacancy Rate" value={loc.vacancy ? `${(parseFloat(loc.vacancy) * 100).toFixed(1)}%` : "N/A"} color={C.amber} />
                        <MetricCard icon={Calendar} label="Avg Tenancy Length" value={loc.averageTenancyLengthYears ? `${parseFloat(loc.averageTenancyLengthYears).toFixed(1)} yrs` : "N/A"} />
                        <MetricCard icon={Building2} label="Multiple Retailers" value={loc.percentMultiple ? `${(parseFloat(loc.percentMultiple) * 100).toFixed(0)}%` : "N/A"} />
                    </div>
                </div>
            )}

            {/* ─── 7. Competitor Landscape (St David's only) ─── */}
            {isFirst && competitors.length > 0 && (
                <div className="mb-8">
                    <SectionHeader icon={Target} title="Competitor Landscape — 5 Mile Radius" num={loc.healthIndex ? 7 : 6} />
                    <div className="rounded-xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <th className="text-left p-3 font-semibold" style={{ color: C.textMuted }}>Centre</th>
                                    <th className="text-left p-3 font-semibold" style={{ color: C.textMuted }}>Type</th>
                                    <th className="text-center p-3 font-semibold" style={{ color: C.textMuted }}>Stores</th>
                                    <th className="text-center p-3 font-semibold" style={{ color: C.textMuted }}>Rating</th>
                                    <th className="text-left p-3 font-semibold" style={{ color: C.textMuted }}>Top Category</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* St David's row */}
                                <tr style={{ borderBottom: `1px solid ${C.border}`, background: `${C.blue}10` }}>
                                    <td className="p-3 font-semibold" style={{ color: C.blue }}>{loc.name}</td>
                                    <td className="p-3" style={{ color: C.textSoft }}>Shopping Centre</td>
                                    <td className="p-3 text-center font-bold" style={{ color: C.text }}>{loc.numberOfStores}</td>
                                    <td className="p-3 text-center" style={{ color: C.amber }}>{loc.googleRating}★</td>
                                    <td className="p-3" style={{ color: C.textSoft }}>{categories[0]?.category} ({categories[0]?.count})</td>
                                </tr>
                                {competitors.map((comp) => (
                                    <tr key={comp.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                        <td className="p-3 font-medium" style={{ color: C.textSoft }}>{comp.name}</td>
                                        <td className="p-3" style={{ color: C.textMuted }}>{comp.type?.replace("_", " ")}</td>
                                        <td className="p-3 text-center" style={{ color: C.text }}>{comp.tenantCount}</td>
                                        <td className="p-3 text-center" style={{ color: C.amber }}>{comp.googleRating || "—"}★</td>
                                        <td className="p-3" style={{ color: C.textMuted }}>{comp.categories[0]?.category || "—"} ({comp.categories[0]?.count || 0})</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ─── 8. Gap Analysis (St David's only) ─── */}
            {isFirst && gapAnalysis && (
                <div className="mb-8">
                    <SectionHeader icon={Eye} title="Gap Analysis" num={loc.healthIndex ? 8 : 7} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Insights */}
                        <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <h4 className="text-sm font-semibold mb-3" style={{ color: C.lime }}>Key Insights</h4>
                            <ul className="space-y-2">
                                {gapAnalysis.insights.map((insight, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: C.textSoft }}>
                                        <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.blue }} />
                                        {insight}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Priorities */}
                        <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <h4 className="text-sm font-semibold mb-3" style={{ color: C.lime }}>Priority Actions</h4>
                            <div className="space-y-3">
                                {gapAnalysis.priorities.slice(0, 5).map((p, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="shrink-0 w-2 h-2 rounded-full" style={{
                                            background: p.priority === "high" ? C.red : p.priority === "medium" ? C.amber : C.green
                                        }} />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium" style={{ color: C.text }}>{p.category}</span>
                                            <p className="text-xs" style={{ color: C.textMuted }}>{p.recommendation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Missing brands */}
                    {gapAnalysis.missingBrands.length > 0 && (
                        <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <h4 className="text-sm font-semibold mb-3" style={{ color: C.lime }}>Notable Missing Brands</h4>
                            <div className="flex flex-wrap gap-2">
                                {gapAnalysis.missingBrands.slice(0, 15).map((b) => (
                                    <span key={b.name} className="px-2.5 py-1 rounded text-xs" style={{ background: C.elevated, color: C.textSoft, border: `1px solid ${C.border}` }}>
                                        {b.name} <span style={{ color: C.textMuted }}>· {b.category}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ─── 9. Strategic Recommendations ─── */}
            <div className="mb-8">
                <SectionHeader icon={Award} title="Strategic Recommendations" num={isFirst && gapAnalysis ? (loc.healthIndex ? 9 : 8) : (loc.healthIndex ? 7 : 6)} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendations.map((rec, i) => (
                        <div key={i} className="rounded-xl p-5" style={{
                            background: C.surface,
                            border: `1px solid ${C.border}`,
                            borderLeft: `4px solid ${rec.color}`,
                        }}>
                            <div className="text-xs font-semibold mb-2" style={{ color: rec.color }}>{rec.priority}</div>
                            <h4 className="text-sm font-bold mb-2" style={{ color: C.text }}>{rec.title}</h4>
                            <p className="text-xs leading-relaxed" style={{ color: C.textMuted }}>{rec.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div className="h-px my-12" style={{ background: `linear-gradient(90deg, transparent, ${C.border}, transparent)` }} />
        </section>
    )
}

// ═══════════════════════════════════════════════════
// Section Header
// ═══════════════════════════════════════════════════
function SectionHeader({ icon: Icon, title, num }: { icon: any; title: string; num: number }) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.blue}20` }}>
                <Icon className="w-4 h-4" style={{ color: C.blue }} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: C.text }}>{num}. {title}</h3>
        </div>
    )
}

// ═══════════════════════════════════════════════════
// Profile Row
// ═══════════════════════════════════════════════════
function ProfileRow({ label, value, href }: { label: string; value: string; href?: string }) {
    return (
        <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${C.border}40` }}>
            <span className="text-xs" style={{ color: C.textMuted }}>{label}</span>
            {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-xs font-medium flex items-center gap-1 hover:opacity-80" style={{ color: C.blue }}>
                    {value} <ExternalLink className="w-3 h-3" />
                </a>
            ) : (
                <span className="text-xs font-medium text-right max-w-[200px] truncate" style={{ color: C.textSoft }}>{value}</span>
            )}
        </div>
    )
}

// ═══════════════════════════════════════════════════
// Recommendations per location
// ═══════════════════════════════════════════════════
function getRecommendations(loc: LocationData) {
    const id = loc.id
    if (id === "cmks95l980005fajkx22y1ctx") {
        // St David's
        return [
            { priority: "HIGH PRIORITY", title: "Leverage Zero Local Competition", description: "With Queens Arcade under demolition and no meaningful retail competitors within 5 miles, St David's should aggressively pursue premium and international brands to solidify its position as Cardiff's undisputed retail destination.", color: C.red },
            { priority: "MEDIUM PRIORITY", title: "Expand Experiential Retail", description: "The centre's 36M annual footfall and young catchment (median age 34) make it ideal for experiential concepts — pop-up spaces, immersive dining, and tech-forward retail that drive dwell time.", color: C.amber },
            { priority: "LONG-TERM", title: "Capture F&B Growth from Mermaid Quay", description: "Mermaid Quay's 85% F&B mix proves Cardiff Bay demand. St David's should develop its dining quarter to capture evening/weekend spend that currently flows to the waterfront.", color: C.blue },
        ]
    }
    if (id === "cmid0jnny00fimtpupmc75o4u") {
        // Clarks Village
        return [
            { priority: "HIGH PRIORITY", title: "Strengthen Premium Outlet Positioning", description: "With 88% multiple retailers, a health index of 54, and an 8.8-year average tenancy, Clarks Village should target premium brands looking for outlet exposure — the affluent Somerset catchment (homeownership 65.3%, above UK avg) supports premium pricing.", color: C.red },
            { priority: "MEDIUM PRIORITY", title: "Reduce Vacancy Strategically", description: "Current vacancy rate of 8.8% (down from 10.7%) shows positive momentum. Target the 8 vacant units with experiential retail and independent food operators to diversify from pure outlet retail.", color: C.amber },
            { priority: "LONG-TERM", title: "Develop Family Destination Appeal", description: "With 29% families with children in the catchment and an existing adventure play park, expand family-oriented tenants — kids' fashion outlets, family dining, and seasonal events to boost weekend footfall.", color: C.blue },
        ]
    }
    // Xscape MK
    return [
        { priority: "HIGH PRIORITY", title: "Maximise Leisure-Retail Synergy", description: "With Snozone, Cineworld, and iFly anchoring 8M annual footfall, Xscape should curate retail tenants that complement leisure — athleisure brands, adventure gear, and post-activity dining concepts.", color: C.red },
        { priority: "MEDIUM PRIORITY", title: "Target Family Spend", description: "Milton Keynes has the highest family concentration (35.3%) and car ownership (84.3%) of all three locations. Expand family entertainment and casual dining to capture weekend family outings.", color: C.amber },
        { priority: "LONG-TERM", title: "Value-Conscious Positioning", description: "With £0.80/hr parking (cheapest in portfolio) and household incomes 12.8% below UK average, position as a value-led entertainment destination. Consider discount dining brands and value fashion to match catchment economics.", color: C.blue },
    ]
}

// ═══════════════════════════════════════════════════
// Main Export
// ═══════════════════════════════════════════════════
export default function LandsecPortfolioClient({ locations, competitors, gapAnalysis }: Props) {
    const [unlocked, setUnlocked] = useState(false)
    const [activeTab, setActiveTab] = useState(0)
    const [scrollProgress, setScrollProgress] = useState(0)
    const contentRef = useRef<HTMLDivElement>(null)
    const handlePrint = useReactToPrint({
        contentRef,
        documentTitle: "Landsec Portfolio Report",
    })

    // Scroll progress bar & auto-tab update
    useEffect(() => {
        if (!unlocked) return
        const onScroll = () => {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)

            // Auto-update active tab based on scroll position
            locations.forEach((loc, i) => {
                const el = document.getElementById(`report-${loc.id}`)
                if (el) {
                    const rect = el.getBoundingClientRect()
                    if (rect.top <= 200 && rect.bottom > 200) {
                        setActiveTab(i)
                    }
                }
            })
        }
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [unlocked, locations])

    if (!unlocked) {
        return <PasswordGate onUnlock={() => setUnlocked(true)} />
    }

    const totalStores = locations.reduce((s, l) => s + l.numberOfStores, 0)
    const totalFootfall = locations.reduce((s, l) => s + (l.footfall || 0), 0)
    const totalArea = locations.reduce((s, l) => s + (l.totalFloorArea || 0), 0)

    return (
        <div className="min-h-screen" style={{ background: C.bg, color: C.text, fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {/* Inter font */}
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

            {/* Scroll progress bar */}
            <div className="fixed top-0 left-0 z-[60] h-[3px] print:hidden" style={{
                width: `${scrollProgress}%`,
                background: `linear-gradient(90deg, ${C.blue}, ${C.lime})`,
                transition: "width 0.1s linear",
                pointerEvents: "none",
            }} />

            {/* ─── Top bar ─── */}
            <header className="sticky top-0 z-50 backdrop-blur-xl print:hidden" style={{ background: `${C.bg}ee`, borderBottom: `1px solid ${C.border}` }}>
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Image src="/landsec-logo.png" alt="Landsec" width={40} height={40} className="rounded" />
                        <div className="h-6 w-px" style={{ background: `${C.border}` }} />
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold" style={{ color: C.textSoft }}>Powered by</span>
                            <Image src="/flourishlogonew.png" alt="Flourish" width={70} height={25} className="h-5 w-auto" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-1 rounded-xl p-1" style={{ background: C.surface }}>
                            {locations.map((loc, i) => (
                                <button
                                    key={loc.id}
                                    onClick={() => {
                                        setActiveTab(i)
                                        document.getElementById(`report-${loc.id}`)?.scrollIntoView({ behavior: "smooth" })
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                    style={{
                                        background: activeTab === i ? C.blue : "transparent",
                                        color: activeTab === i ? C.text : C.textMuted,
                                    }}
                                >
                                    {loc.name.split(" ")[0]}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => handlePrint()}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all hover:opacity-90"
                            style={{ background: `${C.lime}`, color: C.navy }}
                        >
                            <Download className="w-3.5 h-3.5" />
                            Download Report
                        </button>
                    </div>
                </div>
            </header>

            <main ref={contentRef} className="max-w-7xl mx-auto px-4 py-8">
                {/* ─── Portfolio Hub ─── */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4" style={{ background: `${C.blue}15`, color: C.blue, border: `1px solid ${C.blue}30` }}>
                        <Globe className="w-3.5 h-3.5" />
                        Portfolio Intelligence Report
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight" style={{ color: C.text }}>Landsec Retail Portfolio</h1>
                    <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: C.textMuted }}>
                        Comprehensive analysis of {locations.length} key locations — powered by Flourish data intelligence
                    </p>

                    {/* Aggregate stats */}
                    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
                        <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}`, backdropFilter: "blur(12px)" }}>
                            <div className="text-3xl md:text-4xl font-extrabold" style={{ color: C.lime }}>{totalStores}</div>
                            <div className="text-xs mt-1" style={{ color: C.textMuted }}>Total Retailers</div>
                        </div>
                        <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}`, backdropFilter: "blur(12px)" }}>
                            <div className="text-3xl md:text-4xl font-extrabold" style={{ color: C.blue }}>{fmt(totalFootfall)}</div>
                            <div className="text-xs mt-1" style={{ color: C.textMuted }}>Combined Footfall</div>
                        </div>
                        <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}`, backdropFilter: "blur(12px)" }}>
                            <div className="text-3xl md:text-4xl font-extrabold" style={{ color: C.coral }}>{fmt(totalArea)}</div>
                            <div className="text-xs mt-1" style={{ color: C.textMuted }}>Total Floor Area (sqft)</div>
                        </div>
                    </div>

                    {/* Location cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {locations.map((loc, i) => {
                            const heroImg = HERO_IMAGES[loc.id]
                            return (
                                <button
                                    key={loc.id}
                                    onClick={() => {
                                        setActiveTab(i)
                                        document.getElementById(`report-${loc.id}`)?.scrollIntoView({ behavior: "smooth" })
                                    }}
                                    className="group rounded-2xl overflow-hidden text-left transition-all hover:scale-[1.02]"
                                    style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: activeTab === i ? `0 0 0 2px ${C.blue}` : "none" }}
                                >
                                    <div className="relative h-44 overflow-hidden">
                                        {heroImg && <Image src={heroImg} alt={loc.name} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />}
                                        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,22,40,0.9), transparent)" }} />
                                        <div className="absolute bottom-3 left-4">
                                            <h3 className="text-lg font-bold" style={{ color: C.text }}>{loc.name}</h3>
                                            <p className="text-xs" style={{ color: C.textMuted }}>{loc.city} · {loc.postcode}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 grid grid-cols-3 gap-2">
                                        <div className="text-center">
                                            <div className="text-lg font-bold" style={{ color: C.lime }}>{loc.numberOfStores}</div>
                                            <div className="text-[10px]" style={{ color: C.textMuted }}>Stores</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold" style={{ color: C.blue }}>{fmt(loc.footfall)}</div>
                                            <div className="text-[10px]" style={{ color: C.textMuted }}>Footfall</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold" style={{ color: C.amber }}>{loc.googleRating}★</div>
                                            <div className="text-[10px]" style={{ color: C.textMuted }}>Rating</div>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {/* ─── Comparison Strip ─── */}
                    <div className="rounded-xl overflow-hidden mb-12" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                        <div className="p-3" style={{ background: `${C.blue}10`, borderBottom: `1px solid ${C.border}` }}>
                            <h4 className="text-xs font-semibold tracking-wider uppercase" style={{ color: C.blue }}>Portfolio Comparison</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                        <th className="text-left p-3 font-semibold text-xs" style={{ color: C.textMuted }}>Metric</th>
                                        {locations.map((loc) => (
                                            <th key={loc.id} className="text-center p-3 font-semibold text-xs" style={{ color: C.textSoft }}>{loc.name}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { label: "Annual Footfall", values: locations.map((l) => fmt(l.footfall)) },
                                        { label: "Active Stores", values: locations.map((l) => String(l.numberOfStores)) },
                                        { label: "Google Rating", values: locations.map((l) => l.googleRating ? `${l.googleRating}★` : "N/A") },
                                        { label: "Floor Area (sqft)", values: locations.map((l) => l.totalFloorArea ? l.totalFloorArea.toLocaleString() : "N/A") },
                                        { label: "Parking Spaces", values: locations.map((l) => fmt(l.parkingSpaces)) },
                                        { label: "Parking Price", values: locations.map((l) => l.carParkPrice ? `£${l.carParkPrice.toFixed(2)}/hr` : "N/A") },
                                        { label: "Median Age", values: locations.map((l) => l.medianAge ? String(l.medianAge) : "N/A") },
                                        { label: "Avg Income", values: locations.map((l) => l.avgHouseholdIncome ? `£${parseInt(l.avgHouseholdIncome).toLocaleString()}` : "N/A") },
                                        { label: "Car Ownership", values: locations.map((l) => l.carOwnership ? `${parseFloat(l.carOwnership)}%` : "N/A") },
                                    ].map((row) => (
                                        <tr key={row.label} style={{ borderBottom: `1px solid ${C.border}40` }}>
                                            <td className="p-3 text-xs font-medium" style={{ color: C.textMuted }}>{row.label}</td>
                                            {row.values.map((v, j) => (
                                                <td key={j} className="p-3 text-center text-xs font-semibold" style={{ color: C.text }}>{v}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ─── Individual Reports ─── */}
                {locations.map((loc, i) => (
                    <LocationReport
                        key={loc.id}
                        loc={loc}
                        competitors={i === 0 ? competitors : []}
                        gapAnalysis={i === 0 ? gapAnalysis : null}
                        isFirst={i === 0}
                    />
                ))}

                {/* ─── Data Sources ─── */}
                <section className="mb-16">
                    <SectionHeader icon={Database} title="Data Sources & Methodology" num={10} />
                    <div className="rounded-xl p-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-semibold mb-3" style={{ color: C.blue }}>Primary Sources</h4>
                                <ul className="space-y-2">
                                    {[
                                        { src: "ONS Census 2021", desc: "Population, age, homeownership, car ownership — local authority level" },
                                        { src: "CACI Retail Footprint", desc: "Health index, vacancy rates, tenancy length, retailer composition (Clarks Village)" },
                                        { src: "Google Places API", desc: "Ratings, review counts, real-time business data" },
                                        { src: "Landsec Official Sitemaps", desc: "Tenant directories scraped from official centre websites" },
                                        { src: "Centre Map PDFs", desc: "Downloaded from content.landsec.com CMS" },
                                    ].map((s) => (
                                        <li key={s.src} className="flex items-start gap-2 text-xs" style={{ color: C.textSoft }}>
                                            <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" style={{ color: C.blue }} />
                                            <span><strong>{s.src}:</strong> {s.desc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold mb-3" style={{ color: C.blue }}>Methodology</h4>
                                <ul className="space-y-2">
                                    {[
                                        "Tenant data sourced directly from Landsec official sitemaps — not estimated",
                                        "Categories aligned to CACI taxonomy for cross-centre comparability",
                                        "Demographics use local authority level ONS data for catchment estimation",
                                        "Vs-national benchmarks calculated against UK FYE 2024 median (£36,700 disposable income)",
                                        "Gap analysis compares St David's against 3 competitors within 5 miles of Cardiff city centre",
                                        "All financial and occupancy data sourced from public CACI datasets where available",
                                    ].map((m, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs" style={{ color: C.textSoft }}>
                                            <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" style={{ color: C.lime }} />
                                            {m}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                            <p className="text-[11px] text-center" style={{ color: C.textMuted }}>
                                Report generated {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · Powered by Flourish Data Intelligence Platform · Confidential — prepared exclusively for Landsec
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Print styles */}
            <style>{`
                @media print {
                    body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print\\:hidden { display: none !important; }
                    header, [class*="sticky"] { position: relative !important; }
                    * { break-inside: avoid; }
                    section { page-break-before: auto; }
                    h2 { page-break-after: avoid; }
                }
            `}</style>
        </div>
    )
}

