
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targets = [
    "St David's Dewi Sant",
    "Cwmbran Centre",
    "The Quadrant",
    "Eagles Meadow",
    "Friars Walk",
    "Aberafan Shopping Centre",
    "Kingsway Centre",
    "St Catherine's Walk",
    "McArthurGlen Outlet Bridgend",
    "The Capitol",
    "Queens Arcade",
    "Victoria Centre",
    "White Rose Centre",
    "Daniel Owen Centre",
    "Riverside Haverfordwest"
];

async function main() {
    console.log("🏴󠁧󠁢󠁷󠁬󠁳󠁿 Checking Wales Top 15 against Database...\n");

    let foundCount = 0;

    for (const target of targets) {
        // clean target name for fuzzy search
        const cleanName = target.replace(/ Shopping Centre| Centre| Outlet|,/g, "").trim();

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

            console.log(`✅ [${health.join('|')}] ${target} -> ${loc.name}`);
        } else {
            console.log(`❌ ${target}`);
        }
    }

    console.log(`\nFound: ${foundCount}/${targets.length}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
