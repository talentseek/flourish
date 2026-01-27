
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Analyzing Address Data Quality...')

    // 1. Sample raw addresses
    const samples = await prisma.location.findMany({
        take: 20,
        select: {
            name: true,
            address: true,
            city: true,
            county: true,
            postcode: true
        }
    })

    console.log('\n--- Sample Records (First 20) ---')
    samples.forEach(s => {
        console.log(`[${s.name.padEnd(30)}]`)
        console.log(`  Adj: ${s.address}`)
        console.log(`  Cit: ${s.city}`)
        console.log(`  Cty: ${s.county} | PC: ${s.postcode}`)
    })

    // 2. Count distinct counties to check for inconsistency
    const counties = await prisma.location.groupBy({
        by: ['county'],
        _count: { county: true },
        orderBy: { _count: { county: 'desc' } }
    })

    console.log('\n--- County Distribution (Top 20) ---')
    counties.slice(0, 20).forEach(c => {
        console.log(`${c.county}: ${c._count.county}`)
    })

    // 3. Count distinct cities
    const cities = await prisma.location.groupBy({
        by: ['city'],
        _count: { city: true },
        orderBy: { _count: { city: 'desc' } }
    })

    console.log('\n--- City Distribution (Top 20) ---')
    cities.slice(0, 20).forEach(c => {
        console.log(`${c.city}: ${c._count.city}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
