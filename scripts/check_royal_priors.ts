
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Searching for Royal Priors...')
    try {
        const byName = await prisma.location.findMany({
            where: {
                name: {
                    contains: 'Royal Priors',
                    mode: 'insensitive'
                }
            }
        })
        console.log('By Name:', JSON.stringify(byName, null, 2))

        const byPostcode = await prisma.location.findMany({
            where: {
                postcode: {
                    contains: 'CV32 4XT',
                    mode: 'insensitive'
                }
            }
        })
        console.log('By Postcode:', JSON.stringify(byPostcode, null, 2))

        // Also check for "Leamington" in city just in case
        const byCity = await prisma.location.count({
            where: {
                city: {
                    contains: 'Leamington',
                    mode: 'insensitive'
                }
            }
        })
        console.log('Count locations in Leamington:', byCity)

    } catch (error) {
        console.error('Error querying database:', error)
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
