export interface Location {
  id: string
  name: string
  type: 'SHOPPING_CENTRE' | 'RETAIL_PARK' | 'OUTLET_CENTRE' | 'HIGH_STREET'
  address: string
  city: string
  county: string
  postcode: string
  latitude: number
  longitude: number
  phone?: string
  website?: string
  numberOfStores?: number
  parkingSpaces?: number
  totalFloorArea?: number
  numberOfFloors?: number
  anchorTenants?: number
  openedYear?: number
  publicTransit?: string
  owner?: string
  management?: string
  openingHours?: any
  tenants: Tenant[]
  
  // Enhanced details
  footfall?: number
  retailers?: number
  carParkPrice?: number
  retailSpace?: number
  evCharging?: boolean
  evChargingSpaces?: number
  
  // CSV KPIs
  healthIndex?: number
  largestCategory?: string
  largestCategoryPercent?: number
  vacancy?: number
  vacancyGrowth?: number
  persistentVacancy?: number
  vacantUnits?: number
  vacantUnitGrowth?: number
  averageTenancyLengthYears?: number
  percentMultiple?: number
  percentIndependent?: number
  qualityOfferMass?: number
  qualityOfferPremium?: number
  qualityOfferValue?: number
  vacantFloorspace?: number
  vacantFloorspaceGrowth?: number
  floorspaceVacancy?: number
  floorspaceVacancyGrowth?: number
  floorspaceVacancyLeisure?: number
  floorspaceVacancyLeisureGrowth?: number
  floorspaceVacancyRetail?: number
  floorspaceVacancyRetailGrowth?: number
  floorspacePersistentVacancy?: number
  
  // Social media links
  instagram?: string
  facebook?: string
  youtube?: string
  tiktok?: string
  twitter?: string
  
  // Online reviews
  googleRating?: number
  googleReviews?: number
  googleVotes?: number
  facebookRating?: number
  facebookReviews?: number
  facebookVotes?: number
  
  // SEO data
  seoKeywords?: any[]
  topPages?: any[]
  
  // Demographics
  population?: number
  medianAge?: number
  familiesPercent?: number
  seniorsPercent?: number
  avgHouseholdIncome?: number
  incomeVsNational?: number
  homeownership?: number
  homeownershipVsNational?: number
  carOwnership?: number
  carOwnershipVsNational?: number
}

export interface Tenant {
  id: string
  name: string
  category: string
  subcategory?: string
  unitNumber?: string
  floor?: number
  isAnchorTenant: boolean
}
