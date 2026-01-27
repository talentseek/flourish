
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Batch 1: High Priority / Specific User Request
const FIXES = [
    {
        name: "Banbury Gateway Shopping Park",
        postcode: "OX16 3ER",
        lat: 52.072,
        lng: -1.319,
        region: "South East",
        county: "Oxfordshire",
        town: "Banbury"
    },
    // Deduced from scan results:
    {
        name: "Banbury Gateway", // Potential duplicate, fixing just in case or might need merge later
        postcode: "OX16 3ER",
        lat: 52.072,
        lng: -1.319,
        region: "South East",
        county: "Oxfordshire",
        town: "Banbury"
    }
]

async function main() {
    console.log('Applying batch fixes for Zero Coordinate locations...')

    for (const fix of FIXES) {
        console.log(`Fixing ${fix.name}...`)

        // Find records that match name and have bad coords
        const records = await prisma.location.findMany({
            where: {
                name: { contains: fix.name, mode: 'insensitive' },
                OR: [{ latitude: 0 }, { longitude: 0 }]
            }
        })

        for (const record of records) {
            console.log(`-> Updating ID: ${record.id}`)
            await prisma.location.update({
                where: { id: record.id },
                data: {
                    latitude: fix.lat,
                    longitude: fix.lng,
                    postcode: fix.postcode,
                    region: fix.region,
                    county: fix.county,
                    town: fix.town
                }
            })
        }
    }
    console.log('Batch fix complete.')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
