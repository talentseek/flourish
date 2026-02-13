import { prisma } from "@/lib/db"
import { performGapAnalysis } from "@/lib/tenant-comparison"
import LandsecPortfolioClient from "./landsec-portfolio-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Landsec Portfolio Intelligence | Flourish",
    description: "Comprehensive intelligence reports for Landsec retail locations",
    robots: "noindex, nofollow",
}

// Known location IDs
const LOCATION_IDS = {
    stDavids: "cmks95l980005fajkx22y1ctx",
    clarksVillage: "cmid0jnny00fimtpupmc75o4u",
    xscapeMK: "cmksemajw000boqpn46fxb97w",
}

// Cardiff competitor IDs (for St David's gap analysis)
const CARDIFF_COMPETITOR_IDS = [
    "cmid0kz1o01sjmtpuytgzm9vg", // Queens Arcade
    "cmid0kwqu01q5mtpugw1xvtmg", // Mermaid Quay
    "cmid0kt2c01mcmtpusqr9c87o", // District Shopping Centre
]

export default async function LandsecPortfolioPage() {
    // Fetch all 3 locations with tenants
    const locations = await prisma.location.findMany({
        where: {
            id: { in: Object.values(LOCATION_IDS) },
        },
        include: {
            tenants: {
                orderBy: { name: "asc" },
            },
        },
    })

    // Fetch Cardiff competitors for gap analysis context
    const cardiffCompetitors = await prisma.location.findMany({
        where: {
            id: { in: CARDIFF_COMPETITOR_IDS },
        },
        include: {
            tenants: {
                orderBy: { name: "asc" },
            },
        },
    })

    // Run gap analysis for St David's vs Cardiff competitors
    let gapAnalysis = null
    try {
        gapAnalysis = await performGapAnalysis(
            LOCATION_IDS.stDavids,
            CARDIFF_COMPETITOR_IDS,
            true
        )
    } catch (e) {
        console.error("Gap analysis failed:", e)
    }

    // Serialise location data for client component
    const serialisedLocations = locations.map((loc) => ({
        id: loc.id,
        name: loc.name,
        city: loc.city ?? "",
        postcode: loc.postcode ?? "",
        type: String(loc.type ?? ""),
        street: loc.street,
        address: loc.address ?? "",
        phone: loc.phone,
        website: loc.website,
        owner: loc.owner,
        management: loc.management,
        openedYear: loc.openedYear,
        footfall: loc.footfall,
        numberOfStores: loc.numberOfStores ?? 0,
        numberOfFloors: loc.numberOfFloors,
        anchorTenants: loc.anchorTenants,
        totalFloorArea: loc.totalFloorArea,
        retailSpace: loc.retailSpace,
        parkingSpaces: loc.parkingSpaces,
        carParkPrice: loc.carParkPrice ? Number(loc.carParkPrice) : null,
        evCharging: loc.evCharging,
        evChargingSpaces: loc.evChargingSpaces,
        publicTransit: loc.publicTransit,
        googleRating: loc.googleRating ? String(loc.googleRating) : null,
        googleReviews: loc.googleReviews,
        instagram: loc.instagram,
        facebook: loc.facebook,
        youtube: loc.youtube,
        tiktok: loc.tiktok,
        twitter: loc.twitter,
        population: loc.population,
        medianAge: loc.medianAge,
        familiesPercent: loc.familiesPercent ? String(loc.familiesPercent) : null,
        seniorsPercent: loc.seniorsPercent ? String(loc.seniorsPercent) : null,
        avgHouseholdIncome: loc.avgHouseholdIncome ? String(loc.avgHouseholdIncome) : null,
        incomeVsNational: loc.incomeVsNational ? String(loc.incomeVsNational) : null,
        homeownership: loc.homeownership ? String(loc.homeownership) : null,
        homeownershipVsNational: loc.homeownershipVsNational ? String(loc.homeownershipVsNational) : null,
        carOwnership: loc.carOwnership ? String(loc.carOwnership) : null,
        carOwnershipVsNational: loc.carOwnershipVsNational ? String(loc.carOwnershipVsNational) : null,
        // CACI KPIs
        healthIndex: loc.healthIndex ? String(loc.healthIndex) : null,
        vacancy: loc.vacancy ? String(loc.vacancy) : null,
        vacancyGrowth: loc.vacancyGrowth ? String(loc.vacancyGrowth) : null,
        vacantUnits: loc.vacantUnits,
        averageTenancyLengthYears: loc.averageTenancyLengthYears ? String(loc.averageTenancyLengthYears) : null,
        percentMultiple: loc.percentMultiple ? String(loc.percentMultiple) : null,
        percentIndependent: loc.percentIndependent ? String(loc.percentIndependent) : null,
        tenants: loc.tenants.map((t) => ({
            name: t.name,
            category: t.category,
            isAnchorTenant: t.isAnchorTenant,
            floor: t.floor,
            unitNumber: t.unitNumber,
        })),
    }))

    // Serialise competitors
    const serialisedCompetitors = cardiffCompetitors.map((loc) => ({
        id: loc.id,
        name: loc.name,
        city: loc.city ?? "",
        type: String(loc.type ?? ""),
        postcode: loc.postcode ?? "",
        numberOfStores: loc.numberOfStores ?? 0,
        footfall: loc.footfall,
        googleRating: loc.googleRating ? String(loc.googleRating) : null,
        owner: loc.owner,
        tenantCount: loc.tenants.length,
        categories: (() => {
            const catMap = new Map<string, number>()
            loc.tenants.forEach((t) => {
                const cat = t.category || "Uncategorized"
                catMap.set(cat, (catMap.get(cat) || 0) + 1)
            })
            return Array.from(catMap.entries())
                .map(([category, count]) => ({ category, count }))
                .sort((a, b) => b.count - a.count)
        })(),
    }))

    // Serialise gap analysis
    const serialisedGapAnalysis = gapAnalysis
        ? {
            comparison: {
                target: gapAnalysis.comparison.target,
                competitors: gapAnalysis.comparison.competitors,
                gaps: gapAnalysis.comparison.gaps,
            },
            missingBrands: gapAnalysis.missingBrands.slice(0, 20),
            priorities: gapAnalysis.priorities,
            insights: gapAnalysis.insights,
        }
        : null

    // Determine order: St David's first, then Clarks, then Xscape
    const orderedIds = [LOCATION_IDS.stDavids, LOCATION_IDS.clarksVillage, LOCATION_IDS.xscapeMK]
    const orderedLocations = orderedIds
        .map((id) => serialisedLocations.find((l) => l.id === id))
        .filter(Boolean) as typeof serialisedLocations

    return (
        <LandsecPortfolioClient
            locations={orderedLocations}
            competitors={serialisedCompetitors}
            gapAnalysis={serialisedGapAnalysis}
        />
    )
}
