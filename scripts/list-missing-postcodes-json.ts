
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log("Listing Missing Postcodes...");

    const targets = await prisma.location.findMany({
        where: {
            type: 'SHOPPING_CENTRE',
            // OR: [{ postcode: null }, { postcode: 'UNKNOWN' }] // Postcode is not nullable in schema? Schema says String.
            postcode: 'UNKNOWN'
        },
        select: { id: true, name: true, city: true, county: true }
    });

    console.log(`Found ${targets.length} targets.`);
    fs.writeFileSync('missing_postcodes.json', JSON.stringify(targets, null, 2));
    console.log("Saved to missing_postcodes.json");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
