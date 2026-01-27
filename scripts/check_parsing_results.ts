
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Verifying Address Parsing...')

    const targets = [
        { name: "Royal Priors Shopping Centre", expected: "Warwick Street" },
        { name: "Commercial Road Retail Park", expected: "Commercial Road" }
    ]

    for (const t of targets) {
        const loc = await prisma.location.findFirst({
            where: { name: { contains: t.name, mode: 'insensitive' } },
            select: { name: true, address: true, street: true }
        })

        console.log(`\nChecking "${t.name}"...`)
        if (loc) {
            console.log(`  Name: ${loc.name}`)
            console.log(`  Addr: ${loc.address}`)
            console.log(`  Street: "${loc.street}"`)

            if (loc.street === t.expected || (t.expected && loc.street?.includes(t.expected))) {
                console.log(`  ✅ SUCCESS: Matched expected street.`)
            } else {
                console.log(`  ❌ FAIL: Expected "${t.expected}" but got "${loc.street}"`)
            }
        } else {
            console.log(`  ❌ FAIL: Location not found.`)
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
