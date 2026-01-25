
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targets = [
    { name: "Derbion", cityMatch: ["Derby"], legacyNames: ["Intu Derby", "Westfield Derby"] },
    { name: "Highcross", cityMatch: ["Leicester"], legacyNames: ["The Shires"] },
    { name: "Victoria Centre", cityMatch: ["Nottingham"] },
    { name: "St Marks Shopping Centre", cityMatch: ["Lincoln"] },
    { name: "Weston Favell Shopping Centre", cityMatch: ["Northampton"] },
    { name: "Grosvenor Shopping", cityMatch: ["Northampton"] },
    { name: "Four Seasons Shopping Centre", cityMatch: ["Mansfield"] },
    { name: "Newlands Shopping Centre", cityMatch: ["Kettering"] },
    { name: "Swansgate Shopping Centre", cityMatch: ["Wellingborough"] },
    { name: "Haymarket Shopping Centre", cityMatch: ["Leicester"] },
    { name: "The Rushes", cityMatch: ["Loughborough"] },
    { name: "Vicar Lane Shopping Centre", cityMatch: ["Chesterfield"] },
    { name: "Springfields Outlet", cityMatch: ["Spalding"] },
    { name: "The Pavements", cityMatch: ["Chesterfield"] },
    { name: "Willow Place", cityMatch: ["Corby"] },
    { name: "Idlewells Shopping Centre", cityMatch: ["Sutton-in-Ashfield", "Sutton"] },
    { name: "Waterside Shopping Centre", cityMatch: ["Lincoln"] },
    { name: "Beaumont Shopping Centre", cityMatch: ["Leicester"] },
    { name: "The Crescent", cityMatch: ["Hinckley"] },
    { name: "Belvoir Shopping Centre", cityMatch: ["Coalville"] }
];

async function main() {
    console.log("🌳 Checking East Midlands Top 20 against Database...\n");

    let foundCount = 0;

    for (const target of targets) {
        // Clean main target name
        const cleanName = target.name.replace(/ Shopping Centre| Centre|,/g, "").trim();
        let searchNames = [cleanName];
        if (target.legacyNames) searchNames = [...searchNames, ...target.legacyNames];

        let validMatch = null;
        let matchedNameUsed = "";

        // Try matching against current name AND legacy names
        for (const searchName of searchNames) {
            const matches = await prisma.location.findMany({
                where: {
                    name: { contains: searchName, mode: 'insensitive' }
                }
            });

            // Smart Filtering
            const match = matches.find(m => {
                if (!m.city && !m.address) return false;
                const locationString = (m.city + " " + m.address).toLowerCase();
                return target.cityMatch.some(c => locationString.includes(c.toLowerCase()));
            });

            if (match) {
                validMatch = match;
                matchedNameUsed = searchName;
                break; // Stop if found
            }
        }

        if (validMatch) {
            foundCount++;
            const health = [];
            if (validMatch.website) health.push("Web");
            if (validMatch.parkingSpaces) health.push("Park");
            if (validMatch.instagram) health.push("Insta");

            console.log(`✅ [${health.join('|')}] ${target.name} -> ${validMatch.name} (${validMatch.city}) [Matched on: ${matchedNameUsed}]`);
        } else {
            console.log(`❌ ${target.name} (Found 0 valid matches)`);
        }
    }

    console.log(`\nFound: ${foundCount}/${targets.length}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
