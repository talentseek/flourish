
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGETS = [
    // Walsall Town
    "Crown Wharf Shopping Park",
    "Saddlers Shopping Centre",
    "Old Square Shopping Centre",
    "Victorian Arcade",

    // Outskirts
    "Reedswood Retail Park",
    "Broadwalk Retail Park",
    "Bescot Retail Park",

    // Aldridge
    "Aldridge Shopping Centre",
    "The Square",

    // Brownhills
    "Brownhills High Street",
    "Ravens Court",
    "Silver Court",

    // Bloxwich
    "Bloxwich High Street",

    // Willenhall
    "Willenhall Town Centre",
    "Market Place",

    // Darlaston
    "Darlaston Town Centre"
]

async function main() {
    console.log('Checking Walsall Coverage...')

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
