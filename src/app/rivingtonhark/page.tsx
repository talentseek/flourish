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

    return <RHPortalClient rhProjects={allProjects} />
}
