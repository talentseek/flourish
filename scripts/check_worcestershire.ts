
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGETS = [
    // Worcester City
    "Crowngate Shopping Centre",
    "Friary Walk", // Part of Crowngate
    "Chapel Walk", // Part of Crowngate
    "Cathedral Square",
    "St Martin’s Quarter",
    "Elgar Retail Park",
    "Blackpole Retail Park",
    "Shrub Hill Retail Park",
    "Tybridge Retail Park",

    // Redditch
    "Kingfisher Shopping Centre",
    "Trafford Retail Park",
    "Abbey Retail Park",

    // Kidderminster
    "Weavers Wharf",
    "Crossley Retail Park",
    "Swan Centre",
    "Spennells Valley",

    // Evesham
    "The Valley", // Evesham Country Park
    "Riverside Shopping Centre",
    "Four Pools Retail Park",

    // Malvern
    "Malvern Shopping Park",
    "Great Malvern Town Centre",

    // Bromsgrove & Droitwich
    "Bromsgrove Retail Park",
    "St Andrews Square",
    "Roman Way Retail Park"
]

async function main() {
    console.log('Checking Worcestershire Coverage...')

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
