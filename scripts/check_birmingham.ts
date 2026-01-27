
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGETS = [
    // City Centre
    "Bullring",
    "Grand Central",
    "The Mailbox",
    "The Arcadian",
    "Martineau Place",
    "The Square Shopping Centre",
    "Great Western Arcade",
    "Piccadilly Arcade",
    "Burlington Arcade",
    "City Arcade",
    "Rag Market",
    "Indoor Market",

    // Out of Town
    "The Fort Shopping Park",
    "One Stop Shopping",
    "Battery Retail Park",
    "Selly Oak Shopping Park",
    "Castle Vale Retail Park",
    "Princess Alice Retail Park",
    "Stechford Retail Park",
    "Urban Exchange",
    "Star City",

    // Sutton Coldfield
    "The Gracechurch Centre",
    "The Red Rose Centre",
    "Mulberry Walk",
    "Mere Green Shopping Centre",

    // Suburban
    "Northfield Shopping Centre",
    "The Swan Shopping Centre",
    "Kings Heath",
    "Harborne High Street",
    "New Oscott",

    // Specialist
    "Jewellery Quarter",
    "Balti Triangle"
]

async function main() {
    console.log('Checking Birmingham Coverage...')

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
