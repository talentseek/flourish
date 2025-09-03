import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Queensgate coordinates: 52.5736, -0.2478
const QUEENSGATE_LAT = 52.5736
const QUEENSGATE_LON = -0.2478
const RADIUS_MILES = 50

// Specific coordinate mapping for precise matching (name + postcode)
const SPECIFIC_COORDINATE_MAP: Record<string, { lat: number; lon: number; name: string; postcode: string }> = {
  'Cambridge': { lat: 52.2053, lon: 0.1218, name: 'Cambridge', postcode: 'CB1' },
  'Northampton': { lat: 52.2405, lon: -0.9027, name: 'Northampton', postcode: 'NN1' },
  'Leicester': { lat: 52.6369, lon: -1.1398, name: 'Leicester', postcode: 'LE1' },
  'Rugby': { lat: 52.3709, lon: -1.2652, name: 'Rugby', postcode: 'CV21' },
  'Rushden': { lat: 52.2892, lon: -0.6014, name: 'Rushden', postcode: 'NN10' },
  'Daventry': { lat: 52.2604, lon: -1.1576, name: 'Daventry', postcode: 'NN11' },
  'Hampton': { lat: 52.5406, lon: -0.2622, name: 'Hampton', postcode: 'PE7' },
  'Bretton': { lat: 52.5907, lon: -0.2835, name: 'Bretton', postcode: 'PE3' },
  'Orton': { lat: 52.5430, lon: -0.3023, name: 'Orton', postcode: 'PE2' },
  'Walton': { lat: 52.5992, lon: -0.2645, name: 'Walton', postcode: 'PE4' },
  'Eye': { lat: 52.5999, lon: -0.2148, name: 'Eye', postcode: 'PE6' },
  'Maskew': { lat: 52.5941, lon: -0.2601, name: 'Maskew', postcode: 'PE3' },
  'Leamington': { lat: 52.2785, lon: -1.5489, name: 'Leamington', postcode: 'CV32' },
  'Warwick': { lat: 52.2785, lon: -1.5489, name: 'Warwick', postcode: 'CV34' },
  'Royal Leamington Spa': { lat: 52.2785, lon: -1.5489, name: 'Royal Leamington Spa', postcode: 'CV32' }
}

// Generic coordinate mapping for fallback (city/county only)
const GENERIC_COORDINATE_MAP: Record<string, { lat: number; lon: number }> = {
  'Cambridge': { lat: 52.2053, lon: 0.1218 },
  'Northampton': { lat: 52.2405, lon: -0.9027 },
  'Leicester': { lat: 52.6369, lon: -1.1398 },
  'Rugby': { lat: 52.3709, lon: -1.2652 },
  'Rushden': { lat: 52.2892, lon: -0.6014 },
  'Daventry': { lat: 52.2604, lon: -1.1576 },
  'Hampton': { lat: 52.5406, lon: -0.2622 },
  'Bretton': { lat: 52.5907, lon: -0.2835 },
  'Orton': { lat: 52.5430, lon: -0.3023 },
  'Walton': { lat: 52.5992, lon: -0.2645 },
  'Eye': { lat: 52.5999, lon: -0.2148 },
  'Maskew': { lat: 52.5941, lon: -0.2601 },
  'Leamington': { lat: 52.2785, lon: -1.5489 },
  'Warwick': { lat: 52.2785, lon: -1.5489 },
  'Royal Leamington Spa': { lat: 52.2785, lon: -1.5489 }
}

async function main() {
  try {
    console.log('🗺️  Starting geocoding for Queensgate catchment area...')
    
    // Get all properties without coordinates (latitude = 0) - ALL location types
    const propertiesWithoutCoords = await prisma.location.findMany({
      where: {
        latitude: 0
      },
      select: {
        id: true,
        name: true,
        type: true,
        city: true,
        county: true,
        address: true,
        postcode: true,
        latitude: true,
        longitude: true
      }
    })
    
    console.log(`📍 Found ${propertiesWithoutCoords.length} properties without coordinates`)
    
    let updated = 0
    let skipped = 0
    
    for (const property of propertiesWithoutCoords) {
      let lat = 0
      let lon = 0
      
      // First try specific matching (name + postcode)
      for (const [key, coords] of Object.entries(SPECIFIC_COORDINATE_MAP)) {
        if (property.name?.toLowerCase().includes(key.toLowerCase()) ||
            property.city?.toLowerCase().includes(key.toLowerCase()) ||
            property.county?.toLowerCase().includes(key.toLowerCase())) {
          // Additional postcode check for more accuracy
          if (property.postcode && coords.postcode && 
              property.postcode.startsWith(coords.postcode.substring(0, 2))) {
            lat = coords.lat
            lon = coords.lon
            break
          }
        }
      }
      
      // If no specific match, try generic matching (city/county only)
      if (lat === 0 && lon === 0) {
        for (const [cityName, coords] of Object.entries(GENERIC_COORDINATE_MAP)) {
          if (property.city?.toLowerCase().includes(cityName.toLowerCase()) ||
              property.county?.toLowerCase().includes(cityName.toLowerCase()) ||
              property.address?.toLowerCase().includes(cityName.toLowerCase())) {
            lat = coords.lat
            lon = coords.lon
            break
          }
        }
      }
      
      // If no coordinates found, skip
      if (lat === 0 && lon === 0) {
        skipped++
        continue
      }
      
      // Update the property with coordinates
      await prisma.location.update({
        where: { id: property.id },
        data: { 
          latitude: lat, 
          longitude: lon 
        }
      })
      
      console.log(`✅ Updated coordinates for: ${property.name} (${property.type}) - ${lat}, ${lon}`)
      updated++
    }
    
    console.log('\n📈 Geocoding Summary:')
    console.log(`   Updated: ${updated}`)
    console.log(`   Skipped: ${skipped}`)
    console.log(`   Total processed: ${propertiesWithoutCoords.length}`)
    
    // Show properties in Queensgate catchment - ALL location types
    const catchmentProperties = await prisma.location.findMany({
      where: {
        latitude: { not: 0 },
        longitude: { not: 0 }
      }
    })
    
    const inCatchment = catchmentProperties.filter(prop => {
      const distance = calculateDistance(
        QUEENSGATE_LAT, QUEENSGATE_LON,
        Number(prop.latitude), Number(prop.longitude)
      )
      return distance <= RADIUS_MILES
    })
    
    console.log(`\n🎯 Properties in ${RADIUS_MILES}-mile Queensgate catchment: ${inCatchment.length}`)
    
    // Group by type
    const byType = inCatchment.reduce((acc, prop) => {
      acc[prop.type] = (acc[prop.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('📊 Breakdown by type:')
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`)
    })
    
    // Show some examples of each type
    console.log('\n📍 Examples by type:')
    Object.entries(byType).forEach(([type, count]) => {
      const examples = inCatchment
        .filter(prop => prop.type === type)
        .slice(0, 3)
        .map(prop => prop.name)
      console.log(`   ${type}: ${examples.join(', ')}`)
    })
    
  } catch (error) {
    console.error('💥 Error during geocoding:', error)
  } finally {
    await prisma.$disconnect()
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

main()
