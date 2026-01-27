
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGETS = [
    // West Bromwich
    "New Square Shopping Centre",
    "Queens Square Shopping Centre",
    "Kings Square Shopping Centre",
    "Astle Retail Park",

    // Wednesbury
    "Gallagher Shopping Park",
    "Axletree Way",
    "Union Street",

    // Oldbury
    "Oldbury Green Retail Park",
    "Birchley Island Retail Park",

    // Smethwick
    "Windmills Shopping Park",
    "Bearwood Road",

    // Great Bridge
    "Great Bridge Retail Park",

    // Rowley Regis
    "Blackheath Town Centre"
]

async function main() {
    console.log('Checking Sandwell Coverage...')

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
