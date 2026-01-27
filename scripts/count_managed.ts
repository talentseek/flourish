
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const count = await prisma.location.count({
        where: {
            isManaged: true
        }
    })

    console.log(`Number of Managed Sites (Flourish Locations): ${count}`)

    const sites = await prisma.location.findMany({
        where: { isManaged: true },
        select: { name: true, town: true }
    })

    if (sites.length > 0) {
        console.log('Sites:')
        sites.forEach(s => console.log(`- ${s.name} (${s.town})`))
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
