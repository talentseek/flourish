
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targets = [
    { name: "Trafford Centre", cityMatch: ["Manchester", "Trafford"] },
    { name: "Liverpool ONE", cityMatch: ["Liverpool"] },
    { name: "Manchester Arndale", cityMatch: ["Manchester"] },
    { name: "Golden Square", cityMatch: ["Warrington"] },
    { name: "The Rock", cityMatch: ["Bury"] },
    { name: "Pyramids", cityMatch: ["Birkenhead"] }, // Pyramids & The Grange
    { name: "The Grange", cityMatch: ["Birkenhead"] },
    { name: "Runcorn Shopping City", cityMatch: ["Runcorn", "Halton"] },
    { name: "Spindles Town Square", cityMatch: ["Oldham"] },
    { name: "Mill Gate", cityMatch: ["Bury"] },
    { name: "Grand Arcade", cityMatch: ["Wigan"] },
    { name: "The Lanes", cityMatch: ["Carlisle"] },
    { name: "Houndshill", cityMatch: ["Blackpool"] },
    { name: "Market Place", cityMatch: ["Bolton"] },
    { name: "The Concourse", cityMatch: ["Skelmersdale"] },
    { name: "St Johns Shopping Centre", cityMatch: ["Liverpool"] },
    { name: "Charter Walk", cityMatch: ["Burnley"] },
    { name: "Fishergate Centre", cityMatch: ["Preston"] },
    { name: "Middleton Shopping Centre", cityMatch: ["Middleton", "Manchester"] },
    { name: "Merseyway", cityMatch: ["Stockport"] },
    { name: "St George's", cityMatch: ["Preston"] }
];

async function main() {
    console.log("🐝 Checking North West Top 20 against Database...\n");

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

    // Note: Pyramids & Grange count as 1 or 2 depending on DB.
    console.log(`\nFound: ${foundCount}/${targets.length}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
