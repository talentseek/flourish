
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGETS = [
    // City Centre
    "West Orchards",
    "Lower Precinct",
    "Cathedral Lanes",
    "Coventry Market",
    "Upper Precinct",
    "City Arcade",
    "Fargo Village", // Creative Quarter

    // Major Retail Parks
    "Arena Shopping Park",
    "Central Six",
    "Gallagher Retail Park",
    "Alvis Retail Park",
    "Airport Retail Park",
    "Warwickshire Shopping Park", // Binley

    // Suburban & University
    "Cannon Park Shopping Centre",
    "Cross Point Business Park",
    "Jubilee Crescent",
    "Riley Square"
]

async function main() {
    console.log('Checking Coventry Coverage...')

    const results = {
        found: [] as string[],
        missing: [] as string[]
    }

    for (const t of TARGETS) {
        const count = await prisma.location.count({
            where: {
                name: {
                    contains: t,
                    mode: 'insensitive'
                }
            }
        })

        if (count > 0) {
            results.found.push(`${t} (${count})`)
        } else {
            results.missing.push(t)
        }
    }

    console.log('\n✅ FOUND IN DB:')
    results.found.forEach(f => console.log(`- ${f}`))

    console.log('\n❌ MISSING:')
    results.missing.forEach(m => console.log(`- ${m}`))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
