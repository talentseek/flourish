
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Sampling 5 random locations for address parsing analysis...')

    // Get count to pick random skip
    const count = await prisma.location.count()

    const samples = []
    for (let i = 0; i < 5; i++) {
        const skip = Math.floor(Math.random() * count)
        const loc = await prisma.location.findFirst({
            skip: skip,
            select: {
                name: true,
                address: true,
                street: true, // Current value
                town: true,
                county: true,
                postcode: true,
                region: true
            }
        })
        if (loc) samples.push(loc)
    }

    console.log('\n--- Analysis ---')

    samples.forEach(s => {
        console.log(`\nLocation: "${s.name}"`)
        console.log(`Raw Address: "${s.address}"`)
        console.log(`Current Street Field: "${s.street}"`)

        // Simulate Logic
        const parts = s.address.split(',').map(p => p.trim())
        let proposedStreet = ""

        const blacklist = [
            s.name,
            s.town,
            s.county,
            s.region,
            s.postcode,
            "United Kingdom",
            "England", "Wales", "Scotland", "Northern Ireland"
        ].filter(x => x).map(x => x!.toLowerCase())

        // Filter
        const remaining = parts.filter(p => {
            const lower = p.toLowerCase()
            // Check exact matches or if part is contained in blacklist items (fuzzy)
            const isBlacklisted = blacklist.some(b => b === lower || b.includes(lower))
            return !isBlacklisted
        })

        if (remaining.length > 0) {
            proposedStreet = remaining[0]
        }

        console.log(`Proposed Street Extraction: "${proposedStreet}"`)
        console.log(`Filtered Parts: ${JSON.stringify(remaining)}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
