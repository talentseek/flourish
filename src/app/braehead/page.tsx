import { prisma } from "@/lib/db"
import { performGapAnalysis } from "@/lib/tenant-comparison"
import BraeheadClient from "./braehead-client"

const BRAEHEAD_ID = "cmid0kq8y01jkmtpuda2z6obv"
const BRAEHEAD_LAT = 55.8694
const BRAEHEAD_LNG = -4.3469
const RADIUS_MILES = 10
const RADIUS_KM = RADIUS_MILES * 1.60934
const LAT_OFF = RADIUS_KM / 111
const LNG_OFF = RADIUS_KM / (111 * Math.cos((BRAEHEAD_LAT * Math.PI) / 180))

export default async function BraeheadPage() {
    // ── Fetch Braehead location + tenants ──
    const location = await prisma.location.findUnique({
        where: { id: BRAEHEAD_ID },
        select: {
            id: true,
            name: true,
            town: true,
            city: true,
            postcode: true,
            address: true,
            street: true,
            type: true,
            website: true,
            phone: true,
            parkingSpaces: true,
            numberOfStores: true,
            footfall: true,
            googleRating: true,
            googleReviews: true,
            vacancy: true,
            openingHours: true,
            numberOfFloors: true,
            anchorTenants: true,
            openedYear: true,
            retailSpace: true,
            totalFloorArea: true,
            carParkPrice: true,
            evCharging: true,
            evChargingSpaces: true,
            publicTransit: true,
            owner: true,
            management: true,
            facebookRating: true,
            facebookReviews: true,
            instagram: true,
            facebook: true,
            largestCategory: true,
            largestCategoryPercent: true,
            population: true,
            medianAge: true,
            avgHouseholdIncome: true,
            incomeVsNational: true,
            familiesPercent: true,
            seniorsPercent: true,
            homeownership: true,
            homeownershipVsNational: true,
            carOwnership: true,
            carOwnershipVsNational: true,
            heroImage: true,
            tenants: {
                select: {
                    name: true,
                    category: true,
                    subcategory: true,
                    isAnchorTenant: true,
                    floor: true,
                    unitNumber: true,
                },
                orderBy: { category: "asc" },
            },
        },
    })

    if (!location) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Location not found</div>
    }

    // ── Find nearby competing shopping centres ──
    const competitors = await prisma.location.findMany({
        where: {
            id: { not: BRAEHEAD_ID },
            type: "SHOPPING_CENTRE",
            latitude: { gte: BRAEHEAD_LAT - LAT_OFF, lte: BRAEHEAD_LAT + LAT_OFF },
            longitude: { gte: BRAEHEAD_LNG - LNG_OFF, lte: BRAEHEAD_LNG + LNG_OFF },
        },
        select: {
            id: true,
            name: true,
            town: true,
            latitude: true,
            longitude: true,
            type: true,
            numberOfStores: true,
            footfall: true,
            googleRating: true,
            owner: true,
            _count: { select: { tenants: true } },
        },
        take: 8,
    })

    // ── Run gap analysis ──
    const competitorIds = competitors.map((c) => c.id)
    let gapAnalysis = null
    try {
        if (competitorIds.length > 0) {
            gapAnalysis = await performGapAnalysis(BRAEHEAD_ID, competitorIds, true)
        }
    } catch (e) {
        console.error("Braehead gap analysis failed:", e)
    }

    // ── Serialise Decimal fields ──
    const serialisedLocation = {
        ...location,
        googleRating: location.googleRating?.toString() ?? null,
        facebookRating: location.facebookRating?.toString() ?? null,
        carParkPrice: location.carParkPrice ? Number(location.carParkPrice) : null,
        vacancy: location.vacancy ? Number(location.vacancy) : null,
        largestCategoryPercent: location.largestCategoryPercent ? Number(location.largestCategoryPercent) : null,
        avgHouseholdIncome: location.avgHouseholdIncome ? Number(location.avgHouseholdIncome) : null,
        incomeVsNational: location.incomeVsNational ? Number(location.incomeVsNational) : null,
        familiesPercent: location.familiesPercent ? Number(location.familiesPercent) : null,
        seniorsPercent: location.seniorsPercent ? Number(location.seniorsPercent) : null,
        homeownership: location.homeownership ? Number(location.homeownership) : null,
        homeownershipVsNational: location.homeownershipVsNational ? Number(location.homeownershipVsNational) : null,
        carOwnership: location.carOwnership ? Number(location.carOwnership) : null,
        carOwnershipVsNational: location.carOwnershipVsNational ? Number(location.carOwnershipVsNational) : null,
        openingHours: location.openingHours as Record<string, string> | null,
    }

    const serialisedCompetitors = competitors.map((c) => ({
        id: c.id,
        name: c.name,
        city: c.town || "",
        stores: c.numberOfStores || c._count.tenants,
        footfall: c.footfall,
        googleRating: c.googleRating?.toString() ?? null,
        owner: c.owner,
    }))

    return (
        <BraeheadClient
            location={serialisedLocation}
            competitors={serialisedCompetitors}
            gapAnalysis={gapAnalysis}
        />
    )
}
