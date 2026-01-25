
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targets = [
    "Victoria Square",
    "Foyleside Shopping Centre",
    "Rushmere Shopping Centre",
    "CastleCourt",
    "Abbey Centre",
    "The Quays",
    "Forestside",
    "Bow Street Mall",
    "Kennedy Centre",
    "Bloomfield Shopping Centre", // "Bloomfield" might be vague
    "Fairhill Shopping Centre", // "Fairhill" might be vague
    "Buttercrane",
    "Ards Shopping Centre",
    "Connswater",
    "Tower Centre",
    "Erneside",
    "Park Centre",
    "Flagship Centre",
    "Meadowlane",
    "Richmond Centre"
];

async function main() {
    console.log("☘️ Checking Northern Ireland Top 20 against Database...\n");

    let foundCount = 0;

    for (const target of targets) {
        // clean target name for fuzzy search
        const cleanName = target.replace(/ Shopping Centre| Centre| Mall|,/g, "").trim();

        const loc = await prisma.location.findFirst({
            where: {
                name: { contains: cleanName, mode: 'insensitive' }
            }
        });

        if (loc) {
            foundCount++;
            const health = [];
            if (loc.website) health.push("Web");
            if (loc.parkingSpaces) health.push("Park");
            if (loc.instagram) health.push("Insta");

            console.log(`✅ [${health.join('|')}] ${target} -> ${loc.name} (${loc.city})`);
        } else {
            console.log(`❌ ${target}`);
        }
    }

    console.log(`\nFound: ${foundCount}/${targets.length}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
