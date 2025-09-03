import { PrismaClient, LocationType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.tenant.deleteMany()
  await prisma.location.deleteMany()
  await prisma.category.deleteMany()

  console.log('🗑️ Cleared existing data')

  // Create locations data with enhanced Queensgate details
  const locations = [
    // Peterborough Area - Shopping Centres
    {
      name: "Queensgate Shopping Centre",
      type: LocationType.SHOPPING_CENTRE,
      address: "Queensgate Centre, Long Causeway, Peterborough PE1 1NT",
      city: "Peterborough",
      county: "Cambridgeshire",
      postcode: "PE1 1NT",
      latitude: 52.5739945664255,
      longitude: -0.24454680547662228,
      phone: "01733 311666",
      website: "https://queensgate-shopping.co.uk/",
      numberOfStores: 102,
      parkingSpaces: 2300,
      totalFloorArea: 804000,
      numberOfFloors: 4,
      anchorTenants: 2,
      openedYear: 1982,
      publicTransit: "Queensgate bus station, Peterborough railway station",
      
      // Enhanced details
      footfall: 9500000,
      retailers: 94,
      carParkPrice: 2.80,
      retailSpace: 835000,
      evCharging: true,
      evChargingSpaces: 15,
      
      // Social media links
      instagram: "https://www.instagram.com/queensgate_pb/",
      facebook: "https://www.facebook.com/queensgate",
      youtube: "https://www.youtube.com/@queensgatepeterborough223/",
      tiktok: "https://www.tiktok.com/@queensgate_pb",
      
      // Online reviews
      googleRating: 4.1,
      googleReviews: 14089,
      googleVotes: 14089,
      facebookRating: 4.0,
      facebookReviews: 2991,
      facebookVotes: 2991,
      
      // SEO data
      seoKeywords: [
        { keyword: "queensgate", position: 2, volume: 2400 },
        { keyword: "odeon peterborough", position: 3, volume: 9300 },
        { keyword: "queensgate parking", position: 1, volume: 900 },
        { keyword: "queensgate peterborough", position: 1, volume: 1300 },
        { keyword: "queensgate shopping centre", position: 1, volume: 1000 }
      ],
      topPages: [
        { url: "https://queensgate-shopping.co.uk/", traffic: 3300, percentage: 26.00 },
        { url: "https://queensgate-shopping.co.uk/store/odeon-cinema/", traffic: 1700, percentage: 13.00 },
        { url: "https://queensgate-shopping.co.uk/parking/", traffic: 1300, percentage: 11.00 },
        { url: "https://queensgate-shopping.co.uk/boxing-day-opening-hours/", traffic: 1000, percentage: 8.00 },
        { url: "https://www.queensgate-shopping.co.uk/vacancies/", traffic: 341, percentage: 3.00 }
      ],
      
      // Demographics
      population: 960000,
      medianAge: 36,
      familiesPercent: 21.1,
      seniorsPercent: 0,
      avgHouseholdIncome: 29400.00,
      incomeVsNational: 5100.00,
      homeownership: 60.0,
      homeownershipVsNational: 5.0,
      carOwnership: 80.0,
      carOwnershipVsNational: 3.0
    },
    {
      name: "Serpentine Green Shopping Centre",
      type: LocationType.SHOPPING_CENTRE,
      address: "Hampton, Peterborough PE7 8BE",
      city: "Peterborough",
      county: "Cambridgeshire",
      postcode: "PE7 8BE",
      latitude: 52.5489,
      longitude: -0.2512,
      phone: "01733 234567",
      website: "https://serpentinegreen.co.uk/",
      numberOfStores: 45,
      parkingSpaces: 1200,
      totalFloorArea: 350000,
      numberOfFloors: 2,
      anchorTenants: 1,
      openedYear: 1995,
      publicTransit: "Bus routes 1, 2, 3"
    },
    {
      name: "Bretton Centre",
      type: LocationType.SHOPPING_CENTRE,
      address: "Bretton, Peterborough PE3 8YJ",
      city: "Peterborough",
      county: "Cambridgeshire",
      postcode: "PE3 8YJ",
      latitude: 52.5891,
      longitude: -0.2801,
      phone: "01733 345678",
      website: "https://brettoncentre.co.uk/",
      numberOfStores: 35,
      parkingSpaces: 800,
      totalFloorArea: 250000,
      numberOfFloors: 2,
      anchorTenants: 1,
      openedYear: 1988,
      publicTransit: "Bus routes 4, 5, 6"
    },
    {
      name: "Fengate Retail Park",
      type: LocationType.RETAIL_PARK,
      address: "Fengate, Peterborough PE1 5XJ",
      city: "Peterborough",
      county: "Cambridgeshire",
      postcode: "PE1 5XJ",
      latitude: 52.5689,
      longitude: -0.2201,
      phone: "01733 456789",
      website: "https://fengateretailpark.co.uk/",
      numberOfStores: 25,
      parkingSpaces: 600,
      totalFloorArea: 180000,
      numberOfFloors: 1,
      anchorTenants: 3,
      openedYear: 1990,
      publicTransit: "Bus routes 7, 8"
    },
    {
      name: "Orton Southgate Shopping Centre",
      type: LocationType.SHOPPING_CENTRE,
      address: "Orton Southgate, Peterborough PE2 6UP",
      city: "Peterborough",
      county: "Cambridgeshire",
      postcode: "PE2 6UP",
      latitude: 52.5456,
      longitude: -0.2987,
      phone: "01733 567890",
      website: "https://ortonsouthgate.co.uk/",
      numberOfStores: 30,
      parkingSpaces: 500,
      totalFloorArea: 150000,
      numberOfFloors: 1,
      anchorTenants: 1,
      openedYear: 1992,
      publicTransit: "Bus routes 9, 10"
    },
    {
      name: "Werrington Centre",
      type: LocationType.SHOPPING_CENTRE,
      address: "Werrington, Peterborough PE4 6SX",
      city: "Peterborough",
      county: "Cambridgeshire",
      postcode: "PE4 6SX",
      latitude: 52.6123,
      longitude: -0.2678,
      phone: "01733 678901",
      website: "https://werringtoncentre.co.uk/",
      numberOfStores: 20,
      parkingSpaces: 300,
      totalFloorArea: 100000,
      numberOfFloors: 1,
      anchorTenants: 1,
      openedYear: 1985,
      publicTransit: "Bus routes 11, 12"
    },
    {
      name: "Stanground Retail Park",
      type: LocationType.RETAIL_PARK,
      address: "Stanground, Peterborough PE2 8GP",
      city: "Peterborough",
      county: "Cambridgeshire",
      postcode: "PE2 8GP",
      latitude: 52.5234,
      longitude: -0.2345,
      phone: "01733 789012",
      website: "https://stangroundretailpark.co.uk/",
      numberOfStores: 15,
      parkingSpaces: 250,
      totalFloorArea: 80000,
      numberOfFloors: 1,
      anchorTenants: 2,
      openedYear: 1998,
      publicTransit: "Bus routes 13, 14"
    },
    // Wider Area - Shopping Centres
    {
      name: "Rushden Lakes",
      type: LocationType.SHOPPING_CENTRE,
      address: "Rushden, Northamptonshire NN10 6FH",
      city: "Rushden",
      county: "Northamptonshire",
      postcode: "NN10 6FH",
      latitude: 52.2987,
      longitude: -0.6012,
      phone: "01933 890123",
      website: "https://rushdenlakes.com/",
      numberOfStores: 60,
      parkingSpaces: 1500,
      totalFloorArea: 400000,
      numberOfFloors: 2,
      anchorTenants: 2,
      openedYear: 2017,
      publicTransit: "Bus routes from Northampton and Wellingborough"
    },
    {
      name: "Meadowhall",
      type: LocationType.SHOPPING_CENTRE,
      address: "Sheffield, South Yorkshire S9 1EP",
      city: "Sheffield",
      county: "South Yorkshire",
      postcode: "S9 1EP",
      latitude: 53.4123,
      longitude: -1.4123,
      phone: "0114 256 1234",
      website: "https://meadowhall.co.uk/",
      numberOfStores: 280,
      parkingSpaces: 12000,
      totalFloorArea: 1400000,
      numberOfFloors: 2,
      anchorTenants: 4,
      openedYear: 1990,
      publicTransit: "Meadowhall Interchange, tram and bus connections"
    },
    {
      name: "Westfield London",
      type: LocationType.SHOPPING_CENTRE,
      address: "Shepherd's Bush, London W12 7GF",
      city: "London",
      county: "Greater London",
      postcode: "W12 7GF",
      latitude: 51.5056,
      longitude: -0.2223,
      phone: "020 3371 2300",
      website: "https://uk.westfield.com/london/",
      numberOfStores: 450,
      parkingSpaces: 5000,
      totalFloorArea: 2400000,
      numberOfFloors: 3,
      anchorTenants: 5,
      openedYear: 2008,
      publicTransit: "Shepherd's Bush Central, Overground and bus connections"
    },
    {
      name: "Bluewater",
      type: LocationType.SHOPPING_CENTRE,
      address: "Greenhithe, Kent DA9 9ST",
      city: "Greenhithe",
      county: "Kent",
      postcode: "DA9 9ST",
      latitude: 51.4456,
      longitude: 0.2789,
      phone: "01322 475475",
      website: "https://bluewater.co.uk/",
      numberOfStores: 330,
      parkingSpaces: 13000,
      totalFloorArea: 1800000,
      numberOfFloors: 2,
      anchorTenants: 3,
      openedYear: 1999,
      publicTransit: "Greenhithe station, shuttle bus service"
    },
    {
      name: "Trafford Centre",
      type: LocationType.SHOPPING_CENTRE,
      address: "Manchester, Greater Manchester M17 8AA",
      city: "Manchester",
      county: "Greater Manchester",
      postcode: "M17 8AA",
      latitude: 53.4678,
      longitude: -2.3456,
      phone: "0161 749 1717",
      website: "https://traffordcentre.co.uk/",
      numberOfStores: 290,
      parkingSpaces: 10000,
      totalFloorArea: 1900000,
      numberOfFloors: 2,
      anchorTenants: 4,
      openedYear: 1998,
      publicTransit: "Metrolink tram, bus connections"
    },
    {
      name: "Lakeside",
      type: LocationType.SHOPPING_CENTRE,
      address: "Thurrock, Essex RM20 2ZP",
      city: "Thurrock",
      county: "Essex",
      postcode: "RM20 2ZP",
      latitude: 51.4789,
      longitude: 0.2678,
      phone: "01708 869000",
      website: "https://lakeside.co.uk/",
      numberOfStores: 320,
      parkingSpaces: 11000,
      totalFloorArea: 1600000,
      numberOfFloors: 2,
      anchorTenants: 3,
      openedYear: 1990,
      publicTransit: "Chafford Hundred station, bus connections"
    }
  ]

  // Insert locations
  const createdLocations = await Promise.all(
    locations.map(location =>
      prisma.location.create({
        data: location
      })
    )
  )

  console.log(`📍 Created ${createdLocations.length} locations`)

  // Create some basic categories
  const categories = [
    "Fashion & Apparel",
    "Food & Beverage",
    "Electronics & Technology",
    "Home & Garden",
    "Beauty & Personal Care",
    "Sports & Leisure",
    "Books & Stationery",
    "Jewelry & Accessories",
    "Health & Pharmacy",
    "Entertainment",
    "Automotive",
    "Financial Services",
    "Travel & Tourism",
    "Education & Training",
    "Professional Services",
    "Gifts & Souvenirs",
    "Pet Supplies",
    "Music & Media",
    "Art & Crafts",
    "Specialty Retail"
  ]

  const createdCategories = await Promise.all(
    categories.map(category =>
      prisma.category.create({
        data: { name: category }
      })
    )
  )

  console.log(`🏷️ Created ${createdCategories.length} categories`)

  // Add some sample tenants for Queensgate
  const queensgateLocation = createdLocations.find(loc => loc.name === "Queensgate Shopping Centre")
  
  if (queensgateLocation) {
    const sampleTenants = [
      { name: "Next", category: "Fashion & Apparel", subcategory: "Clothing", unitNumber: "Unit 1", floor: 1, isAnchorTenant: true },
      { name: "H&M", category: "Fashion & Apparel", subcategory: "Clothing", unitNumber: "Unit 2", floor: 1, isAnchorTenant: false },
      { name: "Boots", category: "Health & Pharmacy", subcategory: "Pharmacy", unitNumber: "Unit 3", floor: 1, isAnchorTenant: false },
      { name: "Costa Coffee", category: "Food & Beverage", subcategory: "Coffee Shop", unitNumber: "Unit 4", floor: 1, isAnchorTenant: false },
      { name: "Wagamama", category: "Food & Beverage", subcategory: "Restaurant", unitNumber: "Unit 5", floor: 2, isAnchorTenant: false },
      { name: "Apple Store", category: "Electronics & Technology", subcategory: "Mobile Phones", unitNumber: "Unit 6", floor: 1, isAnchorTenant: true },
      { name: "JD Sports", category: "Sports & Leisure", subcategory: "Sports Clothing", unitNumber: "Unit 7", floor: 1, isAnchorTenant: false },
      { name: "Superdrug", category: "Beauty & Personal Care", subcategory: "Beauty", unitNumber: "Unit 8", floor: 1, isAnchorTenant: false },
      { name: "Nando's", category: "Food & Beverage", subcategory: "Restaurant", unitNumber: "Unit 9", floor: 2, isAnchorTenant: false },
      { name: "Claire's", category: "Fashion & Apparel", subcategory: "Accessories", unitNumber: "Unit 10", floor: 1, isAnchorTenant: false }
    ]

    await Promise.all(
      sampleTenants.map(tenant =>
        prisma.tenant.create({
          data: {
            ...tenant,
            locationId: queensgateLocation.id
          }
        })
      )
    )
    console.log(`🏪 Added ${sampleTenants.length} sample tenants to Queensgate`)
  }

  console.log('✅ Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
