
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const missingTargets = [
    "Spinning Gate",
    "Queensgate",
    "Grosvenor",
    "Chimes",
    "Bon Accord",
    "Darwin",
    "Liberty",
    "Royal Priors",
    "Ashley",
    "Grafton",
    "Harpur",
    "Howgate"
];

async function main() {
    console.log("🔍 Searching for Fuzzy Matches...");

    for (const term of missingTargets) {
        console.log(`\nChecking variations for: "${term}"`);
        const matches = await prisma.location.findMany({
            where: {
                OR: [
                    { name: { contains: term } },
                    { city: { contains: term } }
                ]
            },
            select: { id: true, name: true, city: true, postcode: true }
        });

        if (matches.length === 0) {
            console.log(`❌ No matches found.`);
        } else {
            matches.forEach(m => console.log(`- [${m.id}] ${m.name} (${m.city}, ${m.postcode})`));
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
