
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Diagnosing Coliseum Shopping Park...')

    const location = await prisma.location.findFirst({
        where: {
            name: {
                contains: "Coliseum Shopping Park",
                mode: 'insensitive'
            }
        }
    })

    if (!location) {
        console.log('❌ Location not found.')
    } else {
        console.log('✅ Found Location:')
        console.log(`- ID: ${location.id}`)
        console.log(`- Name: ${location.name}`)
        console.log(`- Postcode: ${location.postcode}`)
        console.log(`- Latitude: ${location.latitude}`)
        console.log(`- Longitude: ${location.longitude}`)
        console.log(`- Region: ${location.region}`)
        console.log(`- County: ${location.county}`)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
