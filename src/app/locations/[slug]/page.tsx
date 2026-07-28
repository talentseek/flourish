import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { generateSlug, findLocationBySlug } from "@/lib/slug-utils"
import { PublicLocationPage } from "@/components/public-location-page"

export const runtime = 'nodejs';

interface SlugPageProps {
  params: {
    slug: string
  }
}

// Map of Regional Manager names to their image paths
const rmImages: Record<string, string> = {
  "Amanda Bishop": "/amandanew.webp",
  "Callum Clifford": "/callumnew.webp",
  "Paula Muers": "/paulanew.webp",
  "Giorgia Shepherd": "/giorgianew.webp",
  "Jemma Mills": "/jemmanew.webp",
  "Michelle Clark": "/michellenew.webp",
  "Sharon O'Rourke": "/sharonnew.webp",
  "Paul": "/paulnew.webp",
  "Suki": "/sukinew.webp"
}

// Map of Regional Manager names to their phone numbers
const rmPhones: Record<string, string> = {
  "Amanda Bishop": "07341 917362",
  "Callum Clifford": "07768 573282",
  "Paula Muers": "07464 226938",
  "Giorgia Shepherd": "07920 017850",
  "Michelle Clark": "07768 573282",
  "Sharon O'Rourke": "07768 573282",
}

export default async function LocationPage({ params }: SlugPageProps) {
  // No authentication required - this is a public route

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

  // Find Regional Manager from the database (single source of truth)
  let regionalManager = undefined
  if (location.regionalManager) {
    const rmName = location.regionalManager
    const imageSrc = rmImages[rmName] || rmImages[rmName.split(' ')[0]]

    if (imageSrc) {
      // Look up the user's email from the database
      const rmUser = await prisma.user.findFirst({
        where: { name: rmName },
        select: { email: true }
      })

      regionalManager = {
        name: rmName,
        email: rmUser?.email || undefined,
        phone: rmPhones[rmName] || undefined,
        imageSrc
      }
    }
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
    heroImage: location.heroImage ?? undefined,
    footfall: location.footfall ?? undefined,
    retailers: location.retailers ?? undefined,
    carParkPrice: location.carParkPrice != null ? Number(location.carParkPrice) : undefined,
    retailSpace: location.retailSpace ?? undefined,
    evCharging: location.evCharging ?? undefined,
    evChargingSpaces: location.evChargingSpaces ?? undefined,
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

  return <PublicLocationPage location={serializedLocation} regionalManager={regionalManager} />
}


