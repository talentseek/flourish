"use client"

import { useState, useEffect, FormEvent, useRef } from "react"
import Image from "next/image"
import {
    X,
    ArrowRight,
    MessageSquare,
    BarChart3,
    MapPin,
    Send,
    Sparkles,
    Building2,
} from "lucide-react"

// Match portal design tokens
const COLORS = {
    bgBase: "#0F172A",
    bgSurface: "#1E293B",
    bgElevated: "#334155",
    borderDefault: "#475569",
    textPrimary: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",
    accentCoral: "#E8458B",
    accentLime: "#E6FB60",
    statusLive: "#4ADE80",
} as const

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
}

interface PalaceData {
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

interface NearbyLocation {
    name: string
    city: string
    lat: number
    lng: number
    type: string
    stores: number | null
}

export default function RHRegionalPanel({
    palaceData,
    nearbyLocations,
    onClose,
}: {
    palaceData: PalaceData
    nearbyLocations: NearbyLocation[]
    onClose: () => void
}) {
    const [activeTab, setActiveTab] = useState<"overview" | "chat">("overview")
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: `Hi! I'm your Flourish intelligence assistant for the Palace Exchange area. I have data on ${palaceData.stores} tenants at Palace Shopping and ${nearbyLocations.length} nearby retail locations within 5 miles.\n\nTry asking me about:\n• Tenant gaps vs. competitors\n• Local competition analysis\n• Footfall and vacancy trends\n• Brand recommendations`,
        },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [mapLoaded, setMapLoaded] = useState(false)
    const mapRef = useRef<HTMLDivElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    // Load Leaflet map
    useEffect(() => {
        if (!mapRef.current || mapLoaded) return

        const loadMap = async () => {
            const L = (await import("leaflet")).default

            // Load leaflet CSS via link element
            if (!document.querySelector('link[href*="leaflet"]')) {
                const link = document.createElement("link")
                link.rel = "stylesheet"
                link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                document.head.appendChild(link)
            }

            const map = L.map(mapRef.current!, {
                center: [51.6518, -0.0577],
                zoom: 12,
                zoomControl: false,
                attributionControl: false,
            })

            L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
                maxZoom: 18,
            }).addTo(map)

            // 5-mile radius circle
            L.circle([51.6518, -0.0577], {
                radius: 5 * 1609.34,
                color: COLORS.accentCoral,
                fillColor: COLORS.accentCoral,
                fillOpacity: 0.06,
                weight: 1.5,
                dashArray: "8, 6",
            }).addTo(map)

            // Palace Shopping marker (special)
            const palaceIcon = L.divIcon({
                html: `<div style="
                    width: 28px; height: 28px; border-radius: 50%;
                    background: ${COLORS.statusLive};
                    border: 3px solid #fff;
                    box-shadow: 0 0 12px ${COLORS.statusLive}80;
                    display: flex; align-items: center; justify-content: center;
                "><div style="width: 8px; height: 8px; border-radius: 50%; background: #fff;"></div></div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
                className: "",
            })
            L.marker([51.6518, -0.0577], { icon: palaceIcon })
                .addTo(map)
                .bindPopup(`<strong>Palace Shopping</strong><br/>Enfield — Live PoC`)

            // Nearby location markers
            nearbyLocations.forEach((loc) => {
                const icon = L.divIcon({
                    html: `<div style="
                        width: 18px; height: 18px; border-radius: 50%;
                        background: ${COLORS.accentCoral};
                        border: 2px solid ${COLORS.bgBase};
                        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    "></div>`,
                    iconSize: [18, 18],
                    iconAnchor: [9, 9],
                    className: "",
                })
                L.marker([loc.lat, loc.lng], { icon: icon })
                    .addTo(map)
                    .bindPopup(`<strong>${loc.name}</strong><br/>${loc.city} — ${loc.type}${loc.stores ? ` — ${loc.stores} stores` : ""}`)
            })

            setMapLoaded(true)
        }

        loadMap()
    }, [mapLoaded, nearbyLocations])

    // Chat handler
    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/rh-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages.filter(m => m.id !== "welcome"), userMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            })

            if (!response.ok) throw new Error("Failed to fetch")

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            let assistantContent = ""

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "",
            }
            setMessages((prev) => [...prev, assistantMessage])

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    assistantContent += decoder.decode(value, { stream: true })
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === assistantMessage.id
                                ? { ...m, content: assistantContent }
                                : m
                        )
                    )
                }
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "Sorry, I encountered an error. Please try again.",
                },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    // Tenant category donut chart (pure CSS)
    const maxCategories = 6
    const topCategories = palaceData.tenantCategories.slice(0, maxCategories)
    const totalTenants = palaceData.tenantCategories.reduce((a, c) => a + c.count, 0)
    const catColors = [COLORS.accentCoral, COLORS.statusLive, COLORS.accentLime, "#60A5FA", "#F472B6", "#A78BFA"]

    return (
        <div
            className="fixed inset-0 z-[200] flex"
            style={{ background: COLORS.bgBase }}
        >
            {/* Header */}
            <div
                className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4"
                style={{
                    background: `${COLORS.bgBase}F0`,
                    borderBottom: `1px solid ${COLORS.borderDefault}`,
                    backdropFilter: "blur(12px)",
                }}
            >
                <div className="flex items-center gap-4">
                    <Image
                        src="/rivingtonhark-logo.png"
                        alt="RivingtonHark"
                        width={160}
                        height={40}
                        className="h-7 w-auto"
                    />
                    <div className="h-5 w-px" style={{ background: COLORS.borderDefault }} />
                    <div>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ background: COLORS.statusLive, boxShadow: `0 0 6px ${COLORS.statusLive}` }}
                            />
                            <h1
                                className="text-sm font-bold"
                                style={{ color: COLORS.textPrimary, fontFamily: "'Exo', sans-serif" }}
                            >
                                Regional Intelligence — Palace Shopping & Exchange
                            </h1>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: COLORS.textMuted }}>
                            5-Mile Radius Analysis • {nearbyLocations.length} Nearby Locations
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-xl cursor-pointer transition-colors hover:bg-white/5"
                    style={{ color: COLORS.textMuted, border: `1px solid ${COLORS.borderDefault}` }}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Main content */}
            <div className="flex w-full pt-[72px]">
                {/* Left: Map */}
                <div className="flex-1 relative">
                    <div ref={mapRef} className="w-full h-full" />
                    {!mapLoaded && (
                        <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ background: COLORS.bgSurface }}
                        >
                            <div className="flex items-center gap-3" style={{ color: COLORS.textMuted }}>
                                <MapPin className="w-5 h-5 animate-pulse" />
                                <span className="text-sm">Loading map intelligence...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Tabs panel */}
                <div
                    className="w-[420px] flex flex-col"
                    style={{
                        background: COLORS.bgSurface,
                        borderLeft: `1px solid ${COLORS.borderDefault}`,
                    }}
                >
                    {/* Tab bar */}
                    <div
                        className="flex border-b"
                        style={{ borderColor: COLORS.borderDefault }}
                    >
                        {[
                            { key: "overview" as const, icon: <BarChart3 className="w-3.5 h-3.5" />, label: "Overview" },
                            { key: "chat" as const, icon: <MessageSquare className="w-3.5 h-3.5" />, label: "AI Chat" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold cursor-pointer transition-colors"
                                style={{
                                    color: activeTab === tab.key ? COLORS.accentCoral : COLORS.textMuted,
                                    borderBottom: activeTab === tab.key ? `2px solid ${COLORS.accentCoral}` : "2px solid transparent",
                                    background: activeTab === tab.key ? `${COLORS.accentCoral}08` : "transparent",
                                }}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 overflow-y-auto">
                        {activeTab === "overview" && (
                            <div className="p-5 space-y-5">
                                {/* Key stats grid */}
                                <div>
                                    <h3
                                        className="text-xs font-bold uppercase tracking-wider mb-3"
                                        style={{ color: COLORS.textMuted }}
                                    >
                                        Palace Shopping — Key Metrics
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        {[
                                            { label: "Stores", value: palaceData.stores.toString(), color: COLORS.textPrimary },
                                            { label: "Vacancy", value: palaceData.vacancy != null ? `${palaceData.vacancy}%` : "N/A", color: palaceData.vacancy && palaceData.vacancy > 10 ? COLORS.accentCoral : COLORS.statusLive },
                                            { label: "Footfall", value: palaceData.footfall ? `${(palaceData.footfall / 1000000).toFixed(1)}M` : "N/A", color: COLORS.accentLime },
                                            { label: "Google", value: palaceData.googleRating ? `${palaceData.googleRating}/5` : "N/A", color: COLORS.textPrimary },
                                            { label: "Reviews", value: palaceData.googleReviews?.toLocaleString() || "N/A", color: COLORS.textSecondary },
                                            { label: "Parking", value: palaceData.parkingSpaces?.toLocaleString() || "N/A", color: COLORS.textSecondary },
                                        ].map((s) => (
                                            <div
                                                key={s.label}
                                                className="rounded-xl p-3"
                                                style={{
                                                    background: COLORS.bgBase,
                                                    border: `1px solid ${COLORS.borderDefault}`,
                                                }}
                                            >
                                                <div
                                                    className="text-[10px] font-medium mb-1"
                                                    style={{ color: COLORS.textMuted, fontFamily: "'Roboto Mono', monospace" }}
                                                >
                                                    {s.label}
                                                </div>
                                                <div
                                                    className="text-lg font-bold"
                                                    style={{ color: s.color, fontFamily: "'Roboto Mono', monospace" }}
                                                >
                                                    {s.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Tenant category breakdown */}
                                <div>
                                    <h3
                                        className="text-xs font-bold uppercase tracking-wider mb-3"
                                        style={{ color: COLORS.textMuted }}
                                    >
                                        Tenant Categories
                                    </h3>
                                    <div className="space-y-2">
                                        {topCategories.map((cat, i) => (
                                            <div key={cat.category}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-2.5 h-2.5 rounded-full"
                                                            style={{ background: catColors[i] }}
                                                        />
                                                        <span className="text-xs font-medium" style={{ color: COLORS.textSecondary }}>
                                                            {cat.category}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className="text-xs font-bold"
                                                        style={{ color: COLORS.textMuted, fontFamily: "'Roboto Mono', monospace" }}
                                                    >
                                                        {cat.count} ({totalTenants > 0 ? Math.round((cat.count / totalTenants) * 100) : 0}%)
                                                    </span>
                                                </div>
                                                {/* Progress bar */}
                                                <div
                                                    className="h-1.5 rounded-full overflow-hidden"
                                                    style={{ background: `${COLORS.bgBase}` }}
                                                >
                                                    <div
                                                        className="h-full rounded-full transition-all duration-700"
                                                        style={{
                                                            width: `${totalTenants > 0 ? (cat.count / totalTenants) * 100 : 0}%`,
                                                            background: catColors[i],
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Nearby locations list */}
                                <div>
                                    <h3
                                        className="text-xs font-bold uppercase tracking-wider mb-3"
                                        style={{ color: COLORS.textMuted }}
                                    >
                                        Nearby Competitors ({nearbyLocations.length})
                                    </h3>
                                    <div className="space-y-1.5">
                                        {nearbyLocations.slice(0, 8).map((loc) => (
                                            <div
                                                key={loc.name}
                                                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                                                style={{
                                                    background: `${COLORS.bgBase}80`,
                                                    border: `1px solid ${COLORS.borderDefault}40`,
                                                }}
                                            >
                                                <div
                                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                                    style={{ background: COLORS.accentCoral }}
                                                />
                                                <div className="min-w-0">
                                                    <div className="text-xs font-medium truncate" style={{ color: COLORS.textSecondary }}>
                                                        {loc.name}
                                                    </div>
                                                    <div className="text-[10px]" style={{ color: COLORS.textMuted }}>
                                                        {loc.city} • {loc.type}
                                                        {loc.stores ? ` • ${loc.stores} stores` : ""}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "chat" && (
                            <div className="flex flex-col h-full">
                                {/* Messages */}
                                <div
                                    ref={scrollRef}
                                    className="flex-1 overflow-y-auto p-4 space-y-3"
                                >
                                    {messages.map((m) => (
                                        <div
                                            key={m.id}
                                            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`rounded-xl px-3.5 py-2.5 max-w-[85%] text-sm whitespace-pre-wrap leading-relaxed`}
                                                style={{
                                                    background:
                                                        m.role === "user"
                                                            ? COLORS.accentCoral
                                                            : COLORS.bgBase,
                                                    color:
                                                        m.role === "user"
                                                            ? "#fff"
                                                            : COLORS.textSecondary,
                                                    border:
                                                        m.role === "assistant"
                                                            ? `1px solid ${COLORS.borderDefault}`
                                                            : "none",
                                                }}
                                            >
                                                {m.content || (isLoading && m.role === "assistant" ? (
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: COLORS.accentCoral }} />
                                                        <span style={{ color: COLORS.textMuted }}>Thinking...</span>
                                                    </div>
                                                ) : "")}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Chat input */}
                                <form
                                    onSubmit={onSubmit}
                                    className="p-3 flex gap-2"
                                    style={{ borderTop: `1px solid ${COLORS.borderDefault}` }}
                                >
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask about tenants, gaps, competition..."
                                        disabled={isLoading}
                                        className="flex-1 px-3.5 py-2.5 rounded-xl text-sm outline-none"
                                        style={{
                                            background: COLORS.bgBase,
                                            border: `1px solid ${COLORS.borderDefault}`,
                                            color: COLORS.textPrimary,
                                            fontFamily: "'Roboto Mono', monospace",
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading || !input.trim()}
                                        className="px-3.5 py-2.5 rounded-xl cursor-pointer transition-all hover:opacity-90 disabled:opacity-40"
                                        style={{
                                            background: COLORS.accentCoral,
                                            color: "#fff",
                                        }}
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
