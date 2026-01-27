
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const cities = ['Lisburn', 'Banbridge', 'Antrim', 'Belfast', 'Newtownabbey', 'Bangor', 'Craigavon', 'Dungannon'];

    console.log('Listing sites in NI Cities...');

    for (const city of cities) {
        const results = await prisma.location.findMany({
            where: {
                OR: [
                    { city: { contains: city, mode: 'insensitive' } },
                    { county: { contains: city, mode: 'insensitive' } }
                ]
            },
            select: { id: true, name: true, city: true, type: true }
        });

        if (results.length > 0) {
            console.log(`\n--- Sites in ${city} ---`);
            console.table(results);
        } else {
            console.log(`\nNo sites found in ${city}`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
