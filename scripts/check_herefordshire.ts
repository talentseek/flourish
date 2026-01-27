
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGETS = [
    // Hereford City
    "Old Market",
    "Maylord", // Maylord Orchards
    "High Town",

    // Hereford Retail Parks
    "Spur Retail Park",
    "Salmon Retail Park",
    "Brook Retail Park",
    "Hereford Retail Park",
    "Holmer Road Retail Park",

    // Ross-on-Wye
    "Labels Shopping",
    "Ross Town Centre",

    // Ledbury
    "Hop Pocket Shopping Village",
    "Ledbury Town Centre",

    // Leominster
    "Drapers Lane",
    "Southern Avenue",

    // Destination
    "Oakchurch Farm Shop"
]

async function main() {
    console.log('Checking Herefordshire Coverage...')

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
