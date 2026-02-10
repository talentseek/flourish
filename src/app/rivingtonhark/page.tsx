import { prisma } from "@/lib/db"
import RHPortalClient from "./rh-portal-client"
import type { RHProject } from "./rh-portal-client"

// ── RivingtonHark location IDs in Flourish DB ──
const RH_LOCATION_IDS = [
    "cmicxw4mg000z13hxqr5gzivf", // Palace Shopping, Enfield
    "cmid0l0qs01ucmtpuj6aeqmxy", // St Johns, Liverpool
    "cmid0kti401msmtpuxbhb3zhp", // Eldon Square, Newcastle
    "cmid0kzl901t4mtpum4y8pkqm", // Royal Victoria Place, Tunbridge Wells
    "cmid0kzgj01szmtpud9bcmqgi", // Rochdale Riverside
    "cmid0kr9y01knmtpujxouxlzh", // Castle Quarter, Norwich
    "cmid0l59001z0mtpue2t7m0l6", // Victoria Shopping Centre, Southend
    "cmid0kwe101prmtpup1tpoyu9", // Fareham Shopping Centre
]

// Development / closed schemes — static entries
const DEVELOPMENT_SCHEMES: RHProject[] = [
    {
        name: "Kennet Centre",
        city: "Newbury",
        type: "Redevelopment",
        category: "regeneration",
        status: "coming_soon",
        lat: 51.4015,
        lng: -1.3240,
    },
    {
        name: "Heart of the City",
        city: "Sheffield",
        type: "Mixed Use",
        category: "mixed",
        status: "coming_soon",
        lat: 53.3811,
        lng: -1.4701,
    },
    {
        name: "Swansea Central North",
        city: "Swansea",
        type: "Regeneration",
        category: "regeneration",
        status: "coming_soon",
        lat: 51.6215,
        lng: -3.9432,
    },
    {
        name: "Smithfield Riverside",
        city: "Shrewsbury",
        type: "Regeneration",
        category: "regeneration",
        status: "coming_soon",
        lat: 52.7070,
        lng: -2.7547,
    },
    {
        name: "Copr Bay",
        city: "Swansea",
        type: "Regeneration",
        category: "regeneration",
        status: "coming_soon",
        lat: 51.6170,
        lng: -3.9396,
    },
]

export default async function RivingtonHarkPage() {
    const locations = await prisma.location.findMany({
        where: { id: { in: RH_LOCATION_IDS } },
        select: {
            id: true,
            name: true,
            town: true,
            postcode: true,
            latitude: true,
            longitude: true,
            type: true,
            website: true,
            phone: true,
            parkingSpaces: true,
            numberOfStores: true,
            footfall: true,
            googleRating: true,
            googleReviews: true,
            vacancy: true,
        },
    })

    // ── Palace Shopping data for Regional Mode Panel ──
    const PALACE_ID = "cmicxw4mg000z13hxqr5gzivf"
    const PALACE_LAT = 51.6518
    const PALACE_LNG = -0.0577
    const RADIUS_KM = 5 * 1.60934
    const LAT_OFF = RADIUS_KM / 111
    const LNG_OFF = RADIUS_KM / (111 * Math.cos((PALACE_LAT * Math.PI) / 180))

    const palaceLocation = await prisma.location.findUnique({
        where: { id: PALACE_ID },
        select: {
            name: true,
            town: true,
            numberOfStores: true,
            vacancy: true,
            footfall: true,
            googleRating: true,
            googleReviews: true,
            parkingSpaces: true,
            tenants: { select: { category: true } },
        },
    })

    const nearbyLocations = await prisma.location.findMany({
        where: {
            id: { not: PALACE_ID },
            latitude: { gte: PALACE_LAT - LAT_OFF, lte: PALACE_LAT + LAT_OFF },
            longitude: { gte: PALACE_LNG - LNG_OFF, lte: PALACE_LNG + LNG_OFF },
        },
        select: {
            name: true,
            town: true,
            latitude: true,
            longitude: true,
            type: true,
            numberOfStores: true,
        },
    })

    // Group tenants by category
    const tenantCategoryMap: Record<string, number> = {}
    palaceLocation?.tenants.forEach((t) => {
        const cat = t.category || "Uncategorised"
        tenantCategoryMap[cat] = (tenantCategoryMap[cat] || 0) + 1
    })
    const tenantCategories = Object.entries(tenantCategoryMap)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)

    const palaceRegionalData = palaceLocation ? {
        palace: {
            name: palaceLocation.name,
            city: palaceLocation.town || "Enfield",
            stores: palaceLocation.numberOfStores || 0,
            vacancy: palaceLocation.vacancy ? Number(palaceLocation.vacancy) : null,
            footfall: palaceLocation.footfall,
            googleRating: palaceLocation.googleRating?.toString() || null,
            googleReviews: palaceLocation.googleReviews,
            parkingSpaces: palaceLocation.parkingSpaces,
            tenantCategories,
        },
        nearby: nearbyLocations.map((n) => ({
            name: n.name,
            city: n.town || "",
            lat: Number(n.latitude || 0),
            lng: Number(n.longitude || 0),
            type: n.type || "Retail",
            stores: n.numberOfStores,
        })),
    } : null

    // Map DB rows → RHProject shape for the client component
    const dbProjects: RHProject[] = locations.map((loc) => ({
        name: loc.name,
        city: loc.town || "",
        type: loc.type || "Shopping Centre",
        category: "management" as const,
        status: "live" as const,
        lat: loc.latitude ? Number(loc.latitude) : 0,
        lng: loc.longitude ? Number(loc.longitude) : 0,
        vacancy: loc.vacancy ? Number(loc.vacancy) : null,
        parkingSpaces: loc.parkingSpaces,
        stores: loc.numberOfStores,
        footfall: loc.footfall,
        website: loc.website,
        googleRating: loc.googleRating ? loc.googleRating.toString() : null,
        googleReviews: loc.googleReviews,
        phone: loc.phone,
    }))

    // Combine live DB data + static development schemes
    const allProjects = [...dbProjects, ...DEVELOPMENT_SCHEMES]

    return (
        <RHPortalClient
            rhProjects={allProjects}
            palaceRegionalData={palaceRegionalData}
        />
    )
}

