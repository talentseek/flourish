
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targets = [
    { name: "Metrocentre", cityMatch: ["Gateshead", "Newcastle"] },
    { name: "Eldon Square", cityMatch: ["Newcastle"] },
    { name: "The Bridges", cityMatch: ["Sunderland"] },
    { name: "The Galleries", cityMatch: ["Washington", "Sunderland"] },
    { name: "Middleton Grange", cityMatch: ["Hartlepool"] },
    { name: "Manor Walks", cityMatch: ["Cramlington"] },
    { name: "Cleveland Centre", cityMatch: ["Middlesbrough"] },
    { name: "Billingham Shopping Centre", cityMatch: ["Billingham"] },
    { name: "Wellington Square", cityMatch: ["Stockton"] },
    { name: "Captain Cook Square", cityMatch: ["Middlesbrough"] },
    { name: "Hillstreet Centre", cityMatch: ["Middlesbrough"] },
    { name: "Cornmill Centre", cityMatch: ["Darlington"] },
    { name: "Parkway Shopping Centre", cityMatch: ["Coulby Newham", "Middlesbrough"] },
    { name: "The Forum", cityMatch: ["Wallsend"] },
    { name: "Beacon Centre", cityMatch: ["North Shields"] },
    { name: "The Riverwalk", cityMatch: ["Durham"] },
    { name: "Viking Centre", cityMatch: ["Jarrow"] },
    { name: "Prince Bishops Place", cityMatch: ["Durham"] },
    { name: "The Gate", cityMatch: ["Newcastle"] },
    { name: "Byron Place", cityMatch: ["Seaham"] }
];

async function main() {
    console.log("🏰 Checking North East Top 20 against Database...\n");

    let foundCount = 0;

    for (const target of targets) {
        // clean target name for fuzzy search
        const cleanName = target.name.replace(/ Shopping Centre| Centre|,/g, "").trim();

        const matches = await prisma.location.findMany({
            where: {
                name: { contains: cleanName, mode: 'insensitive' }
            }
        });

        // Smart Filtering: Check if ANY match has a compatible city
        const validMatch = matches.find(m => {
            if (!m.city) return false;
            return target.cityMatch.some(c => m.city.includes(c) || m.address?.includes(c));
        });

        if (validMatch) {
            foundCount++;
            const health = [];
            if (validMatch.website) health.push("Web");
            if (validMatch.parkingSpaces) health.push("Park");
            if (validMatch.instagram) health.push("Insta");

            console.log(`✅ [${health.join('|')}] ${target.name} -> ${validMatch.name} (${validMatch.city})`);
        } else {
            console.log(`❌ ${target.name} (Found ${matches.length} candidates, 0 formatted match)`);
            if (matches.length > 0) {
                console.log(`   Candidates: ${matches.map(m => `${m.name} (${m.city})`).join(", ")}`);
            }
        }
    }

    console.log(`\nFound: ${foundCount}/${targets.length}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
