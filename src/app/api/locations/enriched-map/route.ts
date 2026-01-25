import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { calculateEnrichmentScore } from "@/lib/enrichment-scoring"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const locations = await prisma.location.findMany({
            select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
                type: true,
                isManaged: true,
                website: true,
                _count: {
                    select: { tenants: true }
                },
                // Fields needed for scoring:
                instagram: true,
                facebook: true,
                parkingSpaces: true,
                googleRating: true,
                population: true,
                openedYear: true,
                phone: true,
                totalFloorArea: true,
                numberOfStores: true,
            }
        })

        const data = locations.map(loc => {
            const { score, grade } = calculateEnrichmentScore(loc)
            return {
                id: loc.id,
                name: loc.name,
                lat: loc.latitude ? Number(loc.latitude) : null,
                lng: loc.longitude ? Number(loc.longitude) : null,
                type: loc.type,
                isManaged: loc.isManaged,
                score,
                grade,
                issues: {
                    noWebsite: !loc.website || loc.website.trim() === '',
                    noTenants: loc._count.tenants === 0,
                }
            }
        }).filter(loc => loc.lat !== null && loc.lng !== null)

        return NextResponse.json({ locations: data })
    } catch (error) {
        console.error("Failed to fetch enriched map data:", error)
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }
}
