import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import { getCategoryByKey } from "@/lib/business-categories"

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || ""

const PLACES_FIELD_MASK = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.rating",
    "places.userRatingCount",
    "places.websiteUri",
    "places.nationalPhoneNumber",
    "places.businessStatus",
    "places.types",
].join(",")

interface PlaceResult {
    id: string
    displayName?: { text: string }
    formattedAddress?: string
    location?: { latitude: number; longitude: number }
    rating?: number
    userRatingCount?: number
    websiteUri?: string
    nationalPhoneNumber?: string
    businessStatus?: string
    types?: string[]
}

interface DiscoveredLead {
    businessName: string
    address: string | null
    phone: string | null
    website: string | null
    googleRating: number | null
    googleReviews: number | null
    placeId: string
    latitude: number | null
    longitude: number | null
    distanceMiles: number
    score: number
}

// ─── Google Places API calls ────────────────────────────────

async function placesTextSearch(
    query: string,
    centreLat: number,
    centreLng: number,
    radiusMeters: number,
    maxResults = 20
): Promise<PlaceResult[]> {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
            "X-Goog-FieldMask": PLACES_FIELD_MASK,
        },
        body: JSON.stringify({
            textQuery: query,
            maxResultCount: maxResults,
            locationBias: {
                circle: {
                    center: { latitude: centreLat, longitude: centreLng },
                    radius: radiusMeters,
                },
            },
        }),
    })

    if (!res.ok) {
        console.error(`[Discovery] Text search failed (${res.status}):`, await res.text())
        return []
    }

    const data = (await res.json()) as { places?: PlaceResult[] }
    return data.places || []
}

async function placesNearbySearch(
    types: string[],
    centreLat: number,
    centreLng: number,
    radiusMeters: number,
    maxResults = 20
): Promise<PlaceResult[]> {
    const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
            "X-Goog-FieldMask": PLACES_FIELD_MASK,
        },
        body: JSON.stringify({
            includedTypes: types,
            maxResultCount: maxResults,
            locationRestriction: {
                circle: {
                    center: { latitude: centreLat, longitude: centreLng },
                    radius: radiusMeters,
                },
            },
            rankPreference: "DISTANCE",
        }),
    })

    if (!res.ok) {
        console.error(`[Discovery] Nearby search failed (${res.status}):`, await res.text())
        return []
    }

    const data = (await res.json()) as { places?: PlaceResult[] }
    return data.places || []
}

// ─── Geocode postcode (postcodes.io — free, UK-specific) ────

async function geocodePostcode(
    postcode: string
): Promise<{ lat: number; lng: number } | null> {
    const cleaned = postcode.replace(/\s+/g, "").toUpperCase()
    const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(cleaned)}`
    try {
        const res = await fetch(url)
        if (!res.ok) return null

        const data = (await res.json()) as {
            status: number
            result?: { latitude: number; longitude: number }
        }
        if (data.status !== 200 || !data.result) return null
        return { lat: data.result.latitude, lng: data.result.longitude }
    } catch {
        return null
    }
}

// ─── Distance calculation ───────────────────────────────────

function haversineDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const R = 3959 // miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Junk Name Filter ───────────────────────────────────────

const CHAIN_BLOCKLIST = [
    "sainsbury", "tesco", "asda", "morrisons", "aldi", "lidl",
    "marks and spencer", "marks & spencer", "m&s ", "waitrose",
    "co-op ", "costco", "amazon", "argos", "poundland", "wilko",
    "home bargains", "b&m ", "b&q", "homebase",
]

function isValidLeadName(name: string): boolean {
    if (!name || name.length < 3) return false
    const lower = name.toLowerCase()
    if (CHAIN_BLOCKLIST.some(c => lower.includes(c))) return false
    // Filter out generic single-word names that are too vague
    if (name.length < 4 && !name.includes(" ")) return false
    return true
}

// ─── Scoring ────────────────────────────────────────────────

function scoreLead(
    place: PlaceResult,
    distanceMiles: number
): number {
    let score = 0

    if (place.websiteUri) score += 20
    if (place.rating && place.rating >= 4.0) score += 15
    if (place.userRatingCount && place.userRatingCount >= 50) score += 10
    if (distanceMiles <= 3) score += 15
    else if (distanceMiles <= 5) score += 10
    else if (distanceMiles <= 8) score += 5
    if (place.nationalPhoneNumber) score += 5
    if (place.businessStatus === "OPERATIONAL") score += 10

    const name = place.displayName?.text?.toLowerCase() || ""
    const luxuryKeywords = ["luxury", "bespoke", "premium", "boutique", "artisan"]
    if (luxuryKeywords.some((kw) => name.includes(kw))) score += 15

    return score
}

// ─── Concentric ring search strategy ────────────────────────

function generateSearchCentres(
    lat: number,
    lng: number
): Array<{ label: string; lat: number; lng: number; radius: number }> {
    const offset = 0.045 // ~3 miles
    return [
        { label: "Centre 5km", lat, lng, radius: 5000 },
        { label: "Centre 10km", lat, lng, radius: 10000 },
        { label: "Centre 20km", lat, lng, radius: 20000 },
        { label: "Centre 40km", lat, lng, radius: 40000 },
        { label: "North 15km", lat: lat + offset, lng, radius: 15000 },
        { label: "South 15km", lat: lat - offset, lng, radius: 15000 },
        { label: "East 15km", lat, lng: lng + offset, radius: 15000 },
        { label: "West 15km", lat, lng: lng - offset, radius: 15000 },
    ]
}

// ─── Main handler ───────────────────────────────────────────

export async function POST(req: NextRequest) {
    // Auth check
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    })
    if (!dbUser || (dbUser.role !== "REGIONAL_MANAGER" && dbUser.role !== "ADMIN")) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { category, postcode, radiusMiles, lat, lng } = await req.json()

    if (!category || !postcode || !radiusMiles) {
        return NextResponse.json(
            { error: "category, postcode, and radiusMiles are required" },
            { status: 400 }
        )
    }

    const categoryConfig = getCategoryByKey(category)
    if (!categoryConfig) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    // Use provided coordinates or geocode the postcode
    let centre: { lat: number; lng: number } | null = null
    if (typeof lat === "number" && typeof lng === "number") {
        centre = { lat, lng }
    } else {
        centre = await geocodePostcode(postcode)
    }
    if (!centre) {
        return NextResponse.json(
            { error: "Could not geocode postcode. Please check and try again." },
            { status: 400 }
        )
    }

    const radiusMeters = radiusMiles * 1609.34

    try {
        // Strategy 1: Concentric ring nearby searches
        const searchCentres = generateSearchCentres(centre.lat, centre.lng)
        // Filter rings to only those within the user's requested radius
        const relevantCentres = searchCentres.filter((c) => c.radius <= radiusMeters * 1.2)

        // Determine Google Places types from category
        // Use the first query word as a type hint for nearby search
        const nearbyTypes = categoryConfig.queries.slice(0, 1)

        const nearbyPromises = relevantCentres.map((c) =>
            placesNearbySearch(nearbyTypes, c.lat, c.lng, Math.min(c.radius, radiusMeters))
        )

        // Strategy 2: Text searches with category queries
        const textPromises = categoryConfig.queries.map((query) =>
            placesTextSearch(
                `${query} near ${postcode}`,
                centre.lat,
                centre.lng,
                radiusMeters
            )
        )

        // Run all searches in parallel
        const allResults = await Promise.all([...nearbyPromises, ...textPromises])
        const flatResults = allResults.flat()

        // Deduplicate by Place ID
        const seen = new Set<string>()
        const unique: PlaceResult[] = []
        for (const place of flatResults) {
            if (!place.id || seen.has(place.id)) continue
            seen.add(place.id)
            unique.push(place)
        }

        // Score and filter
        const MIN_SCORE = 15
        const leads: DiscoveredLead[] = []

        for (const place of unique) {
            const placeLat = place.location?.latitude
            const placeLng = place.location?.longitude
            if (!placeLat || !placeLng) continue

            const distanceMiles = haversineDistance(
                centre.lat, centre.lng,
                placeLat, placeLng
            )

            // Filter by requested radius
            if (distanceMiles > radiusMiles * 1.1) continue

            const score = scoreLead(place, distanceMiles)
            if (score < MIN_SCORE) continue

            // Skip non-operational businesses
            if (place.businessStatus && place.businessStatus !== "OPERATIONAL") continue

            // Skip junk/chain business names
            const bizName = place.displayName?.text || ""
            if (!isValidLeadName(bizName)) continue

            leads.push({
                businessName: place.displayName?.text || "Unknown",
                address: place.formattedAddress || null,
                phone: place.nationalPhoneNumber || null,
                website: place.websiteUri || null,
                googleRating: place.rating || null,
                googleReviews: place.userRatingCount || null,
                placeId: place.id,
                latitude: placeLat,
                longitude: placeLng,
                distanceMiles: Math.round(distanceMiles * 10) / 10,
                score,
            })
        }

        // Sort by score descending, then distance ascending
        leads.sort((a, b) => b.score - a.score || a.distanceMiles - b.distanceMiles)

        // Cap at 100 results
        const capped = leads.slice(0, 100)

        return NextResponse.json({
            success: true,
            centre: { lat: centre.lat, lng: centre.lng },
            totalFound: unique.length,
            totalQualified: capped.length,
            leads: capped,
        })
    } catch (err) {
        console.error("[Discovery] Error:", err)
        return NextResponse.json(
            { error: "Discovery failed. Please try again." },
            { status: 500 }
        )
    }
}
