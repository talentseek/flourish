
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGETS = [
    // Brierley Hill / Merry Hill
    "Merry Hill Shopping Centre",
    "Merry Hill Retail Park",
    "The Waterfront",
    "Oak Retail Park",
    "The Boulevard", // Check for alias

    // Dudley Town
    "Churchill Shopping Centre",
    "Castle Gate Leisure Park",
    "Priory Park",

    // Stourbridge
    "Ryemarket Shopping Centre",
    "Victoria Passage",
    "Crown Centre",
    "Withymoor", // Sainsbury's

    // Halesowen
    "Cornbow Shopping Centre",
    "Peckingham Street",

    // Kingswinford / Gornal
    "Townsend Place",
    "Louise Street",
    "Broad Street"
]

async function main() {
    console.log('Checking Dudley Coverage...')

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
