import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Dashboard2Client } from "@/components/dashboard2/dashboard2-client"

export const runtime = 'nodejs';

export default async function Dashboard2Page() {
  const { userId } = auth()

  if (!userId) {
    redirect("/")
  }

  // Fetch metrics and locations in parallel
  const [locations, totalLocations, storesAggregate] = await Promise.all([
    prisma.location.findMany({
      include: {
        tenants: true
      },
      orderBy: {
        name: 'asc'
      }
    }),
    prisma.location.count(),
    prisma.location.aggregate({
      _sum: { numberOfStores: true },
    }),
  ])

  const totalStores = (storesAggregate._sum.numberOfStores ?? 0)
  const analysesCompleted = 24 // Mock value for now

  // Convert Decimal objects to numbers and nulls to undefined for client serialization
  const serializedLocations = locations.map((location: any) => ({
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
    vacancy: location.vacancy != null ? Number(location.vacancy) : undefined,
    vacancyGrowth: location.vacancyGrowth != null ? Number(location.vacancyGrowth) : undefined,
    persistentVacancy: location.persistentVacancy != null ? Number(location.persistentVacancy) : undefined,
    vacantUnits: location.vacantUnits ?? undefined,
    vacantUnitGrowth: location.vacantUnitGrowth ?? undefined,
    averageTenancyLengthYears: location.averageTenancyLengthYears != null ? Number(location.averageTenancyLengthYears) : undefined,
    percentMultiple: location.percentMultiple != null ? Number(location.percentMultiple) : undefined,
    percentIndependent: location.percentIndependent != null ? Number(location.percentIndependent) : undefined,
    qualityOfferMass: location.qualityOfferMass != null ? Number(location.qualityOfferMass) : undefined,
    qualityOfferPremium: location.qualityOfferPremium != null ? Number(location.qualityOfferPremium) : undefined,
    qualityOfferValue: location.qualityOfferValue != null ? Number(location.qualityOfferValue) : undefined,
    vacantFloorspace: location.vacantFloorspace ?? undefined,
    vacantFloorspaceGrowth: location.vacantFloorspaceGrowth != null ? Number(location.vacantFloorspaceGrowth) : undefined,
    floorspaceVacancy: location.floorspaceVacancy != null ? Number(location.floorspaceVacancy) : undefined,
    floorspaceVacancyGrowth: location.floorspaceVacancyGrowth != null ? Number(location.floorspaceVacancyGrowth) : undefined,
    floorspaceVacancyLeisure: location.floorspaceVacancyLeisure != null ? Number(location.floorspaceVacancyLeisure) : undefined,
    floorspaceVacancyLeisureGrowth: location.floorspaceVacancyLeisureGrowth != null ? Number(location.floorspaceVacancyLeisureGrowth) : undefined,
    floorspaceVacancyRetail: location.floorspaceVacancyRetail != null ? Number(location.floorspaceVacancyRetail) : undefined,
    floorspaceVacancyRetailGrowth: location.floorspaceVacancyRetailGrowth != null ? Number(location.floorspaceVacancyRetailGrowth) : undefined,
    floorspacePersistentVacancy: location.floorspacePersistentVacancy != null ? Number(location.floorspacePersistentVacancy) : undefined,
    tenants: location.tenants.map((tenant: any) => ({
      id: tenant.id,
      name: tenant.name,
      category: tenant.category,
      subcategory: tenant.subcategory ?? undefined,
      unitNumber: tenant.unitNumber ?? undefined,
      floor: tenant.floor ?? undefined,
      isAnchorTenant: tenant.isAnchorTenant,
    })),
  }))

  return (
    <Dashboard2Client
      locations={serializedLocations}
      metrics={{
        totalLocations,
        totalStores,
        analysesCompleted
      }}
    />
  )
}

