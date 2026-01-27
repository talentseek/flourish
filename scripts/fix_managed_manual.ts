
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Manual mapping for failed matches
const MISSING_MAP: Record<string, string> = {
    "28 East Park Retail": "28 East",
    "Armada Way ,Royal Parade,Plymouth": "Armada Way",
    "Balmoral Centre, Scarborough": "Balmoral",
    "Beacon Place": "Beacon",
    "Eastgate- Ipswich": "Eastgate Shopping",
    "Hillsborough Barracks, Sheffield": "Hillsborough",
    "LadySmith Newcastle under lyme": "Ladysmith",
    "M Swanley": "Swanley",
    "Mailbox Birmingham": "The Mailbox",
    "Marsh Hythe": "Marsh",
    "Naunton Fitzwarren Taunton": "Norton Fitzwarren",
    "Palace Shopping, Enfield": "Palace Gardens", // Palace Gardens & Palace Exchange
    "Parc-t-Lyn Retail Park": "Parc-y-Llyn",
    "Penicuick": "Penicuik",
    "St Martins Walk": "St Martin's Walk",
    "St Stephens Place Plympton": "Ridgeway", // The Ridgeway Shopping Centre (Plympton)
    "Totten Shopping Centre": "Totton",
}

async function main() {
    console.log('Fixing remaining `isManaged` sites...')

    let fixedCount = 0

    for (const [jsonName, dbSearch] of Object.entries(MISSING_MAP)) {
        const loc = await prisma.location.findFirst({
            where: { name: { contains: dbSearch, mode: 'insensitive' } }
        })

        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: { isManaged: true }
            })
            console.log(`✅ Re-enabled: ${loc.name} (Mapped: "${jsonName}" -> "${dbSearch}")`)
            fixedCount++
        } else {
            console.log(`❌ Still missing: "${jsonName}" (Tried: "${dbSearch}")`)
        }
    }

    console.log(`Manual Fix Complete. Enabled: ${fixedCount}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
