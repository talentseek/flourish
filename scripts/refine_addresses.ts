
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Suffix Whitelist - Valid street endings to preserve even if contained in Name
const STREET_SUFFIXES = [
    'street', 'road', 'way', 'lane', 'drive', 'avenue', 'place', 'square',
    'parade', 'close', 'court', 'crescent', 'boulevard', 'highway', 'terrace',
    'walk', 'gate', 'rise', 'row', 'gardens', 'grove', 'hill', 'view', 'wharf',
    'quay', 'mews', 'yard'
]

async function main() {
    console.log('Starting Address Parsing Refinement...')

    const locations = await prisma.location.findMany({
        select: { id: true, name: true, address: true, town: true, county: true, region: true, postcode: true, city: true, street: true }
    })

    console.log(`Processing ${locations.length} locations...`)
    let updatedCount = 0

    for (const loc of locations) {
        if (!loc.address) continue

        const parts = loc.address.split(',').map(p => p.trim()).filter(p => p.length > 0)

        // Blacklist for filtering
        const blacklist = [
            loc.town,
            loc.city,
            loc.county,
            loc.region,
            loc.postcode,
            "United Kingdom",
            "England", "Wales", "Scotland", "Northern Ireland"
        ].filter(x => x).map(x => x!.toLowerCase())

        let proposedStreet = ""

        for (const part of parts) {
            const lowerPart = part.toLowerCase()

            // 1. Skip if matches Geo/Admin fields
            // Use substring matching for town/county to catch "Greater London" vs "London"
            const isGeo = blacklist.some(b => lowerPart === b || (b.length > 4 && lowerPart.includes(b)) || (lowerPart.length > 4 && b.includes(lowerPart)))
            if (isGeo) continue

            // 2. Skip Postcode Regex
            // Simple UK postcode regex
            if (/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(part)) continue

            // 3. Name Check with Suffix Logic
            const nameLower = loc.name.toLowerCase()
            if (nameLower.includes(lowerPart) || lowerPart.includes(nameLower)) {
                // It overlaps with the Name. 
                // BUT does it look like a street?
                const hasSuffix = STREET_SUFFIXES.some(s => lowerPart.endsWith(s))

                if (hasSuffix) {
                    // Keep it! It's likely "Commercial Road" inside "Commercial Road Retail Park"
                    proposedStreet = part
                    break
                } else {
                    // Discard it! It's likely "The Centre" inside "The Centre MK"
                    continue
                }
            }

            // If we survived all checks, this is likely the street part (e.g. "Unit 5" or "High Street")
            proposedStreet = part
            break
        }

        // Update if changed (and not empty vs null ambiguity)
        if (proposedStreet !== loc.street) {
            await prisma.location.update({
                where: { id: loc.id },
                data: { street: proposedStreet }
            })
            updatedCount++
        }
    }

    console.log(`Refinement Complete. Updated ${updatedCount} locations.`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
