
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const region = "West Midlands"
    console.log(`Analyzing Retail Locations in Region: ${region}...`)

    // 1. Total Count for Region
    const total = await prisma.location.count({
        where: { region: region }
    })

    // 2. Breakdown by Type
    const breakdown = await prisma.location.groupBy({
        by: ['type'],
        where: { region: region },
        _count: { type: true }
    })

    console.log(`\nTotal Locations: ${total}`)
    console.log('\n--- Breakdown by Type ---')
    breakdown.forEach(b => {
        console.log(`${b.type}: ${b._count.type}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
