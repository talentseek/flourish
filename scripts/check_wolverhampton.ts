
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGETS = [
    // City Centre
    "Mander Centre",
    "Wulfrun Centre",
    "St Johns Retail Park",
    "Dudley Street",
    "Peel Centre",
    "Stafford Street",

    // Wednesfield
    "Bentley Bridge",
    "Wednesfield High Street",

    // Bilston
    "Bilston Market",
    "Bilston High Street",

    // Suburban
    "Tettenhall",
    "Upper Green",
    "Codsall",

    // Markets
    "Wolverhampton City Market"
]

async function main() {
    console.log('Checking Wolverhampton Coverage...')

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
