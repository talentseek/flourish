import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// UK Postcode to coordinates mapping for the Queensgate catchment area
// Coordinates are approximate for postcode areas
const POSTCODE_COORDINATES: Record<string, { lat: number; lon: number }> = {
  // Peterborough area (PE)
  'PE1': { lat: 52.5736, lon: -0.2478 }, // Peterborough City Centre
  'PE2': { lat: 52.5430, lon: -0.3023 }, // Orton
  'PE3': { lat: 52.5907, lon: -0.2835 }, // Bretton
  'PE4': { lat: 52.5992, lon: -0.2645 }, // Walton
  'PE6': { lat: 52.5999, lon: -0.2148 }, // Eye
  'PE7': { lat: 52.5406, lon: -0.2622 }, // Hampton
  'PE9': { lat: 52.6583, lon: -0.4800 }, // Stamford
  'PE10': { lat: 52.7708, lon: -0.3778 }, // Bourne
  'PE11': { lat: 52.7875, lon: -0.0250 }, // Spalding
  'PE12': { lat: 52.7458, lon: 0.0167 }, // Holbeach
  'PE13': { lat: 52.6125, lon: 0.1875 }, // Wisbech
  'PE14': { lat: 52.6125, lon: 0.1875 }, // Wisbech
  'PE15': { lat: 52.6125, lon: 0.1875 }, // Wisbech
  'PE19': { lat: 52.2000, lon: -0.2667 }, // St Neots
  'PE21': { lat: 52.9750, lon: -0.0250 }, // Boston
  'PE25': { lat: 53.1375, lon: 0.3375 }, // Skegness
  'PE29': { lat: 52.2000, lon: -0.2667 }, // St Neots
  'PE30': { lat: 52.7500, lon: 0.4000 }, // King's Lynn
  
  // Cambridge area (CB)
  'CB1': { lat: 52.2053, lon: 0.1218 }, // Cambridge City
  'CB2': { lat: 52.2053, lon: 0.1218 }, // Cambridge
  'CB3': { lat: 52.2053, lon: 0.1218 }, // Cambridge
  'CB4': { lat: 52.2053, lon: 0.1218 }, // Cambridge
  'CB5': { lat: 52.2053, lon: 0.1218 }, // Cambridge
  'CB6': { lat: 52.2053, lon: 0.1218 }, // Cambridge
  'CB7': { lat: 52.2053, lon: 0.1218 }, // Cambridge
  'CB8': { lat: 52.2053, lon: 0.1218 }, // Cambridge
  'CB9': { lat: 52.2053, lon: 0.1218 }, // Cambridge
  'CB10': { lat: 52.0000, lon: 0.2500 }, // Saffron Walden
  'CB11': { lat: 52.0000, lon: 0.2500 }, // Saffron Walden
  
  // Northampton area (NN)
  'NN1': { lat: 52.2405, lon: -0.9027 }, // Northampton
  'NN2': { lat: 52.2405, lon: -0.9027 }, // Northampton
  'NN3': { lat: 52.2405, lon: -0.9027 }, // Northampton
  'NN4': { lat: 52.2405, lon: -0.9027 }, // Northampton
  'NN5': { lat: 52.2405, lon: -0.9027 }, // Northampton
  'NN6': { lat: 52.2405, lon: -0.9027 }, // Northampton
  'NN7': { lat: 52.2405, lon: -0.9027 }, // Northampton
  'NN8': { lat: 52.2405, lon: -0.9027 }, // Northampton
  'NN9': { lat: 52.2405, lon: -0.9027 }, // Northampton
  'NN10': { lat: 52.2892, lon: -0.6014 }, // Rushden
  'NN11': { lat: 52.2604, lon: -1.1576 }, // Daventry
  'NN12': { lat: 52.2604, lon: -1.1576 }, // Daventry
  'NN13': { lat: 52.2604, lon: -1.1576 }, // Daventry
  'NN14': { lat: 52.3958, lon: -0.7236 }, // Kettering
  'NN15': { lat: 52.3958, lon: -0.7236 }, // Kettering
  'NN16': { lat: 52.3958, lon: -0.7236 }, // Kettering
  'NN17': { lat: 52.4937, lon: -0.6889 }, // Corby
  'NN18': { lat: 52.4937, lon: -0.6889 }, // Corby
  'NN29': { lat: 52.2405, lon: -0.9027 }, // Northampton
  
  // Leicester area (LE)
  'LE1': { lat: 52.6369, lon: -1.1398 }, // Leicester City
  'LE2': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE3': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE4': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE5': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE6': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE7': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE8': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE9': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE10': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE11': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE12': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE13': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE14': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE15': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE16': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE17': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE18': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE19': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE21': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE55': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE65': { lat: 52.6369, lon: -1.1398 }, // Leicester
  'LE67': { lat: 52.6369, lon: -1.1398 }, // Leicester
  
  // Rugby area (CV)
  'CV1': { lat: 52.3709, lon: -1.2652 }, // Rugby
  'CV2': { lat: 52.3709, lon: -1.2652 }, // Rugby
  'CV3': { lat: 52.3709, lon: -1.2652 }, // Rugby
  'CV4': { lat: 52.3709, lon: -1.2652 }, // Rugby
  'CV5': { lat: 52.3709, lon: -1.2652 }, // Rugby
  'CV6': { lat: 52.3709, lon: -1.2652 }, // Rugby
  'CV7': { lat: 52.3709, lon: -1.2652 }, // Rugby
  'CV8': { lat: 52.3709, lon: -1.2652 }, // Rugby
  'CV9': { lat: 52.3709, lon: -1.2652 }, // Rugby
  'CV10': { lat: 52.3709, lon: -1.2652 }, // Rugby
  'CV11': { lat: 52.3709, lon: -1.2652 }, // Rugby
  'CV12': { lat: 52.3709, lon: -1.2652 }, // Rugby
  'CV13': { lat: 52.3709, lon: -1.2652 }, // Rugby
  'CV21': { lat: 52.3709, lon: -1.2652 }, // Rugby
  'CV22': { lat: 52.3709, lon: -1.2652 }, // Rugby
  'CV23': { lat: 52.3709, lon: -1.2652 }, // Rugby
  'CV31': { lat: 52.2785, lon: -1.5489 }, // Leamington
  'CV32': { lat: 52.2785, lon: -1.5489 }, // Leamington
  'CV33': { lat: 52.2785, lon: -1.5489 }, // Leamington
  'CV34': { lat: 52.2785, lon: -1.5489 }, // Warwick
  'CV35': { lat: 52.2785, lon: -1.5489 }, // Warwick
  'CV36': { lat: 52.2785, lon: -1.5489 }, // Warwick
  'CV37': { lat: 52.2785, lon: -1.5489 }, // Warwick
  
  // Milton Keynes area (MK)
  'MK40': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK41': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK42': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK43': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK44': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK45': { lat: 52.0406, lon: -0.7594 }, // Bedford
  'MK46': { lat: 52.0406, lon: -0.7594 }, // Bedford
  
  // Bedford area (MK)
  'MK1': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK2': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK3': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK4': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK5': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK6': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK7': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK8': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK9': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK10': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK11': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK12': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK13': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK14': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK15': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK16': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK17': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK18': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK19': { lat: 52.1355, lon: -0.4676 }, // Bedford
  'MK77': { lat: 52.1355, lon: -0.4676 }, // Bedford
}

async function main() {
  try {
    console.log('🗺️  Starting postcode-based geocoding...')
    
    // Get all properties without coordinates (latitude = 0)
    const propertiesWithoutCoords = await prisma.location.findMany({
      where: {
        latitude: 0
      },
      select: {
        id: true,
        name: true,
        type: true,
        postcode: true,
        city: true,
        county: true,
        address: true
      }
    })
    
    console.log(`📍 Found ${propertiesWithoutCoords.length} properties without coordinates`)
    
    let updated = 0
    let skipped = 0
    let noPostcode = 0
    
    for (const property of propertiesWithoutCoords) {
      // Extract postcode from address if not in postcode field
      let postcode = property.postcode
      if (!postcode && property.address) {
        const postcodeMatch = property.address.match(/[A-Z]{1,2}[0-9]{1,2}[A-Z]? [0-9][A-Z]{2}/)
        if (postcodeMatch) {
          postcode = postcodeMatch[0]
        }
      }
      
      if (!postcode) {
        noPostcode++
        skipped++
        continue
      }
      
      // Get the postcode area (first part before space)
      const postcodeArea = postcode.split(' ')[0]
      
      // Look up coordinates by postcode area
      const coords = POSTCODE_COORDINATES[postcodeArea]
      
      if (!coords) {
        skipped++
        continue
      }
      
      // Update the property with coordinates
      await prisma.location.update({
        where: { id: property.id },
        data: { 
          latitude: coords.lat, 
          longitude: coords.lon 
        }
      })
      
      console.log(`✅ Updated coordinates for: ${property.name} (${property.type}) - ${postcode} -> ${coords.lat}, ${coords.lon}`)
      updated++
    }
    
    console.log('\n📈 Postcode Geocoding Summary:')
    console.log(`   Updated: ${updated}`)
    console.log(`   Skipped (no postcode): ${noPostcode}`)
    console.log(`   Skipped (no coordinates): ${skipped - noPostcode}`)
    console.log(`   Total processed: ${propertiesWithoutCoords.length}`)
    
    // Show properties in Queensgate catchment
    const catchmentProperties = await prisma.location.findMany({
      where: {
        latitude: { not: 0 },
        longitude: { not: 0 }
      }
    })
    
    const QUEENSGATE_LAT = 52.5736
    const QUEENSGATE_LON = -0.2478
    const RADIUS_MILES = 50
    
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
    
  } catch (error) {
    console.error('💥 Error during postcode geocoding:', error)
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
