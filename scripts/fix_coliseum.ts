
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Fixing Coliseum Shopping Park...')

    const targetName = "Coliseum Shopping Park"

    // Find the location
    const location = await prisma.location.findFirst({
        where: {
            name: {
                contains: targetName,
                mode: 'insensitive'
            }
        }
    })

    if (!location) {
        console.error('❌ Location not found.')
        return
    }

    // Update with correct data
    // Ellesmere Port, CH65 9HD
    // Lat: 53.264, Lng: -2.887
    const updated = await prisma.location.update({
        where: { id: location.id },
        data: {
            postcode: "CH65 9HD",
            latitude: 53.264,
            longitude: -2.887,
            region: "North West",
            county: "Cheshire",
            city: "Ellesmere Port",
            town: "Ellesmere Port"
        }
    })

    console.log('✅ Updated Location:')
    console.log(`- ID: ${updated.id}`)
    console.log(`- Name: ${updated.name}`)
    console.log(`- Postcode: ${updated.postcode}`)
    console.log(`- Latitude: ${updated.latitude}`)
    console.log(`- Longitude: ${updated.longitude}`)
    console.log(`- Region: ${updated.region}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
