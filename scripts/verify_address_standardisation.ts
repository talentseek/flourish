
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Verifying Address Standardization...')

    // 1. Check Region Distribution
    const regions = await prisma.location.groupBy({
        by: ['region'],
        _count: { region: true },
        orderBy: { _count: { region: 'desc' } }
    })

    console.log('\n--- Regional Breakdown ---')
    regions.forEach(r => {
        console.log(`${r.region || 'NULL'}: ${r._count.region}`)
    })

    // 2. Check Country Distribution
    const countries = await prisma.location.groupBy({
        by: ['country'],
        _count: { country: true },
        orderBy: { _count: { country: 'desc' } }
    })

    console.log('\n--- Country Breakdown ---')
    countries.forEach(c => {
        console.log(`${c.country || 'NULL'}: ${c._count.country}`)
    })

    // 3. Sample Validated Records
    console.log('\n--- Validated Sample (Top 10) ---')
    const sample = await prisma.location.findMany({
        take: 10,
        select: { name: true, town: true, district: true, region: true, country: true }
    })

    sample.forEach(s => {
        console.log(`[${s.name.padEnd(30)}] -> ${s.town}, ${s.district}, ${s.region} (${s.country})`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
