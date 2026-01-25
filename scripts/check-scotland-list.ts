
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targets = [
    "St James Quarter",
    "East Kilbride Shopping Centre",
    "Braehead Shopping Centre",
    "Silverburn",
    "The Centre, Livingston",
    "St. Enoch Centre",
    "Clyde Shopping Centre",
    "Union Square",
    "Bon Accord",
    "Buchanan Galleries",
    "The Thistles",
    "Kingdom Shopping Centre",
    "Overgate",
    "Eastgate",
    "The Gyle",
    "Ocean Terminal",
    "Regent Shopping Centre",
    "Rivergate",
    "Livingston Designer Outlet",
    "Oak Mall"
];

async function main() {
    console.log("🏴󠁧󠁢󠁳󠁣󠁴󠁿 Checking Scotland Top 20 against Database...\n");

    let foundCount = 0;

    for (const target of targets) {
        // clean target name for fuzzy search
        const cleanName = target.replace(/ Shopping Centre| Centre| Designer Outlet|,/g, "").trim();

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
