
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGETS = [
    // Solihull Town
    "Touchwood",
    "Mell Square",
    "High Street",
    "Mill Lane",

    // Shirley
    "Parkgate Shopping Centre",
    "Sears Retail Park",
    "Stratford Road",

    // Monkspath
    "Solihull Retail Park",
    "Chalford Way", // Alias

    // NEC / Bickenhill
    "Resorts World",

    // North Solihull
    "Chelmsley Wood Shopping Centre",

    // Villages
    "Knowle High Street",
    "St John's Way",
    "Forest Court",
    "Dorridge"
]

async function main() {
    console.log('Checking Solihull Coverage...')

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
