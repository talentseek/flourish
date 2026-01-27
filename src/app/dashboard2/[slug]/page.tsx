import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { generateSlug, findLocationBySlug } from "@/lib/slug-utils"
import { LocationDiscoveryPage } from "@/components/dashboard2/location-discovery-page"

export const runtime = 'nodejs';

interface SlugPageProps {
  params: {
    slug: string
  }
}

export default async function SlugPage({ params }: SlugPageProps) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/")
  }

  // Fetch all locations
  const locations = await prisma.location.findMany({
    include: {
      tenants: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  // Find location by slug
  const locationMatch = findLocationBySlug(
    locations.map(loc => ({ id: loc.id, name: loc.name })),
    params.slug
  )

  if (!locationMatch) {
    notFound()
  }

  // Find the full location data
  const location = locations.find(loc => loc.id === locationMatch.id)

  if (!location) {
    notFound()
  }

  // Serialize location data (same as dashboard2/page.tsx)
  const serializedLocation = {
    id: location.id,
    name: location.name,
    type: location.type,
    address: location.address,
    city: location.city,
    county: location.county,
    postcode: location.postcode,
    latitude: Number(location.latitude),
    longitude: Number(location.longitude),
    phone: location.phone ?? undefined,
    website: location.website ?? undefined,
    openingHours: location.openingHours ?? undefined,
    parkingSpaces: location.parkingSpaces ?? undefined,
    totalFloorArea: location.totalFloorArea ?? undefined,
    numberOfStores: location.numberOfStores ?? undefined,
    numberOfFloors: location.numberOfFloors ?? undefined,
    anchorTenants: location.anchorTenants ?? undefined,
    publicTransit: location.publicTransit ?? undefined,
    owner: location.owner ?? undefined,
    management: location.management ?? undefined,
    openedYear: location.openedYear ?? undefined,
    footfall: location.footfall ?? undefined,
    retailers: location.retailers ?? undefined,
    carParkPrice: location.carParkPrice != null ? Number(location.carParkPrice) : undefined,
    retailSpace: location.retailSpace ?? undefined,
    evCharging: location.evCharging ?? undefined,
    evChargingSpaces: location.evChargingSpaces ?? undefined,
    heroImage: location.heroImage ?? undefined,
    instagram: location.instagram ?? undefined,
    facebook: location.facebook ?? undefined,
    youtube: location.youtube ?? undefined,
    tiktok: location.tiktok ?? undefined,
    twitter: location.twitter ?? undefined,
    googleRating: location.googleRating != null ? Number(location.googleRating) : undefined,
    googleReviews: location.googleReviews ?? undefined,
    googleVotes: location.googleVotes ?? undefined,
    facebookRating: location.facebookRating != null ? Number(location.facebookRating) : undefined,
    facebookReviews: location.facebookReviews ?? undefined,
    facebookVotes: location.facebookVotes ?? undefined,
    seoKeywords: Array.isArray(location.seoKeywords) ? (location.seoKeywords as any[]) : undefined,
    topPages: Array.isArray(location.topPages) ? (location.topPages as any[]) : undefined,
    population: location.population ?? undefined,
    medianAge: location.medianAge ?? undefined,
    familiesPercent: location.familiesPercent != null ? Number(location.familiesPercent) : undefined,
    seniorsPercent: location.seniorsPercent != null ? Number(location.seniorsPercent) : undefined,
    avgHouseholdIncome: location.avgHouseholdIncome != null ? Number(location.avgHouseholdIncome) : undefined,
    incomeVsNational: location.incomeVsNational != null ? Number(location.incomeVsNational) : undefined,
    homeownership: location.homeownership != null ? Number(location.homeownership) : undefined,
    homeownershipVsNational: location.homeownershipVsNational != null ? Number(location.homeownershipVsNational) : undefined,
    carOwnership: location.carOwnership != null ? Number(location.carOwnership) : undefined,
    carOwnershipVsNational: location.carOwnershipVsNational != null ? Number(location.carOwnershipVsNational) : undefined,
    // CSV KPI fields
    healthIndex: location.healthIndex != null ? Number(location.healthIndex) : undefined,
    largestCategory: location.largestCategory ?? undefined,
    largestCategoryPercent: location.largestCategoryPercent != null ? Number(location.largestCategoryPercent) : undefined,
    percentMultiple: location.percentMultiple != null ? Number(location.percentMultiple) : undefined,
    percentIndependent: location.percentIndependent != null ? Number(location.percentIndependent) : undefined,
    tenants: location.tenants.map((tenant: any) => ({
      id: tenant.id,
      name: tenant.name,
      category: tenant.category,
      subcategory: tenant.subcategory ?? undefined,
      unitNumber: tenant.unitNumber ?? undefined,
      floor: tenant.floor ?? undefined,
      isAnchorTenant: tenant.isAnchorTenant,
    })),
  }

  return <LocationDiscoveryPage location={serializedLocation} />
}

