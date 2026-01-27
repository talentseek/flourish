
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface RawLocation {
    Location: string
}

async function main() {
    console.log('Fixing `isManaged` status...')

    // 1. Load the Golden List from locations.json
    const jsonPath = path.join(process.cwd(), 'scripts', 'locations.json');
    const rawData: RawLocation[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // Clean names for matching
    const managedNames = rawData
        .map(l => l.Location)
        .filter(Boolean)
        .map(name => name.trim())

    console.log(`Loaded ${managedNames.length} managed sites from Golden Record.`)

    // 2. Reset ALL to false
    console.log('Resetting all locations to isManaged=false...')
    await prisma.location.updateMany({
        data: { isManaged: false }
    })

    // 3. Re-enable for the Golden List (Fuzzy Match)
    let reEnabledCount = 0

    for (const name of managedNames) {
        // Try strict match first
        let loc = await prisma.location.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } }
        })

        // Try contains match if strict fails (for simple cases like 'Lexicon' vs 'Lexicon, Bracknell')
        if (!loc) {
            // Split by comma to handle "Location, Town" format in JSON
            const simpleName = name.split(',')[0].trim()
            loc = await prisma.location.findFirst({
                where: { name: { contains: simpleName, mode: 'insensitive' } }
            })
        }

        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: { isManaged: true }
            })
            console.log(`✅ Re-enabled: ${loc.name} (Matched: "${name}")`)
            reEnabledCount++
        } else {
            console.log(`⚠️  Could not find db record for: "${name}"`)
        }
    }

    console.log(`Process Complete.`)
    console.log(`- Total managed sites in JSON: ${managedNames.length}`)
    console.log(`- Total enabled in DB: ${reEnabledCount}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
