
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGETS = [
    // Stoke-on-Trent
    "The Potteries Centre",
    "Festival Park",
    "Octagon Retail Park", // Stoke
    "Etruria Mills",
    "Phoenix Retail Park",
    "Springfields Retail Park",

    // Newcastle-under-Lyme
    "Affinity Staffordshire",
    "Wolstanton Retail Park",
    "Roebuck Shopping Centre",

    // Cannock
    "McArthurGlen Designer Outlet West Midlands",
    "Gateway Retail Park",
    "Cannock Shopping Centre",
    "Orbital Retail Park",

    // Tamworth
    "Ventura Retail Park",
    "Jolly Sailor Retail Park",
    "Ankerside Shopping Centre",

    // Stafford
    "Guildhall Shopping Centre",
    "Riverside Shopping Centre",
    "Queens Shopping Park",
    "Madford Retail Park",

    // Lichfield
    "Three Spires Shopping Centre",
    "Imperial Retail Park",

    // Burton upon Trent
    "The Octagon Shopping Centre", // Burton
    "Coopers Square",
    "Burton Place",
    "Middleway Retail Park",

    // Uttoxeter & Rugeley
    "Dovefields Retail Park",
    "The Maltings",
    "Brewery Street Shopping Centre",

    // Leisure & Lifestyle
    "Trentham Shopping Village",
    "Getliffes Yard"
]

async function main() {
    console.log('Checking Staffordshire Coverage...')

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
