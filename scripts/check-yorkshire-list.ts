
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targets = [
    { name: "Meadowhall", cityMatch: ["Sheffield"] },
    { name: "Trinity Leeds", cityMatch: ["Leeds"] },
    { name: "Frenchgate", cityMatch: ["Doncaster"] },
    { name: "White Rose Shopping Centre", cityMatch: ["Leeds"] },
    { name: "Victoria Leeds", cityMatch: ["Leeds"] }, // Combined Quarter + Gate
    { name: "Crystal Peaks", cityMatch: ["Sheffield"] },
    { name: "The Broadway", cityMatch: ["Bradford"] },
    { name: "Trinity Walk", cityMatch: ["Wakefield"] },
    { name: "St Stephen's", cityMatch: ["Hull"] },
    { name: "Freshney Place", cityMatch: ["Grimsby"] },
    { name: "Merrion Centre", cityMatch: ["Leeds"] },
    { name: "The Ridings", cityMatch: ["Wakefield"] },
    { name: "Princes Quay", cityMatch: ["Hull"] },
    { name: "Kingsgate", cityMatch: ["Huddersfield"] },
    { name: "The Glass Works", cityMatch: ["Barnsley"] },
    { name: "Airedale Shopping Centre", cityMatch: ["Keighley"] },
    { name: "Prospect Centre", cityMatch: ["Hull"] },
    { name: "St Johns Centre", cityMatch: ["Leeds"] },
    { name: "Kirkgate Shopping Centre", cityMatch: ["Bradford"] },
    { name: "The Core", cityMatch: ["Leeds"] }
];

async function main() {
    console.log("🌹 Checking Yorkshire Top 20 against Database...\n");

    let foundCount = 0;

    for (const target of targets) {
        // clean target name for fuzzy search, removing "Shopping Centre" carefully
        const cleanName = target.name.replace(/ Shopping Centre| Centre|,/g, "").trim();

        const matches = await prisma.location.findMany({
            where: {
                name: { contains: cleanName, mode: 'insensitive' }
            }
        });

        // Smart Filtering: Check if ANY match has a compatible city
        const validMatch = matches.find(m => {
            if (!m.city && !m.address) return false;
            const locationString = (m.city + " " + m.address).toLowerCase();
            return target.cityMatch.some(c => locationString.includes(c.toLowerCase()));
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
