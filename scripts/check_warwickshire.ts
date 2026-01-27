
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGETS = [
    // Leamington (Verified)
    "Royal Priors",
    "Leamington Shopping Park",
    "Regent Court",

    // Stratford
    "Maybird",
    "Bell Court",
    "Rosebird",

    // Rugby
    "Elliott's Field",
    "Rugby Central",
    "Junction One",
    "Technology Retail Park",

    // Nuneaton
    "Ropewalk",
    "Abbeygate",
    "Bermuda Park",
    "Newtown Retail Park",

    // Coventry/Border
    "Warwickshire Shopping Park",
    "Arena Shopping Park",

    // Kenilworth
    "Talisman",

    // Villages
    "Hatton Shopping Village",
    "Hoar Park"
]

async function main() {
    console.log('Checking Warwickshire Coverage...')

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
