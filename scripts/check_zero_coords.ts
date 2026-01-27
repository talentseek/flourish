
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Scanning for Zero Coordinate Locations...')

    const locations = await prisma.location.findMany({
        where: {
            OR: [
                { latitude: 0 },
                { longitude: 0 },
                // Depending on schema, these might be optional (null) or default to 0.
                // We handle nulls just in case, though 0 is the primary "bad" value for float.
            ]
        },
        select: {
            id: true,
            name: true,
            postcode: true,
            town: true,
            county: true
        }
    })

    if (locations.length === 0) {
        console.log('✅ No locations with zero coordinates found.')
    } else {
        console.log(`⚠️  Found ${locations.length} locations with invalid coordinates:`)
        locations.forEach(loc => {
            console.log(`- ${loc.name} (${loc.postcode || 'No Postcode'}) [${loc.town}, ${loc.county}]`)
        })
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
