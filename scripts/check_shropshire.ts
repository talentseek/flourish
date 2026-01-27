
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGETS = [
    // Telford
    "Telford Centre",
    "Telford Forge",
    "Wrekin Retail Park",
    "Telford Bridge Retail Park",
    "Southwater",

    // Shrewsbury
    "Darwin Shopping Centre", // "The Darwin"
    "Meole Brace Retail Park",
    "Harlescott Retail Park",
    "Sundorne Retail Park",
    "Arrowpoint Retail Park",
    "The Parade Shops",

    // Oswestry
    "Island Green Retail Park",
    "Penda Retail Park",
    "Powis Hall Market",

    // Bridgnorth
    "Central Court Shopping Centre",
    "Bridgnorth Retail Park",

    // Whitchurch / Drayton
    "St Mary's Arcade",
    "Waymills",
    "Market Drayton Retail",

    // Villages
    "Ludlow Food Centre",
    "Apley Farm Shop",
    "British Ironwork Centre"
]

async function main() {
    console.log('Checking Shropshire Coverage...')

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
