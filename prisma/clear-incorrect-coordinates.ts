import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🧹 Clearing all coordinates to start fresh...')
    
    // Reset all coordinates to 0
    const result = await prisma.location.updateMany({
      where: {
        OR: [
          { latitude: { not: 0 } },
          { longitude: { not: 0 } }
        ]
      },
      data: {
        latitude: 0,
        longitude: 0
      }
    })
    
    console.log(`✅ Reset coordinates for ${result.count} properties`)
    
    // Verify reset
    const propertiesWithCoords = await prisma.location.findMany({
      where: {
        OR: [
          { latitude: { not: 0 } },
          { longitude: { not: 0 } }
        ]
      }
    })
    
    console.log(`📍 Properties still with coordinates: ${propertiesWithCoords.length}`)
    
  } catch (error) {
    console.error('💥 Error clearing coordinates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
