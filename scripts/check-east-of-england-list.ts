
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targets = [
    { name: "Lakeside Shopping Centre", cityMatch: ["Thurrock", "Grays", "Essex"] },
    { name: "Atria Watford", cityMatch: ["Watford"], legacyNames: ["Intu Watford", "Harlequin Centre"] },
    { name: "Luton Point", cityMatch: ["Luton"], legacyNames: ["The Mall Luton", "The Arndale", "Luton Arndale"] },
    { name: "Queensgate", cityMatch: ["Peterborough"] },
    { name: "Eastgate", cityMatch: ["Basildon"] },
    { name: "Chantry Place", cityMatch: ["Norwich"], legacyNames: ["Intu Chapelfield", "Chapelfield"] },
    { name: "The Grafton", cityMatch: ["Cambridge"] },
    { name: "Grand Arcade", cityMatch: ["Cambridge"] }, // Watch out for Wigan
    { name: "Vancouver Quarter", cityMatch: ["King's Lynn", "Kings Lynn"] },
    { name: "Castle Quarter", cityMatch: ["Norwich"], legacyNames: ["Castle Mall"] },
    { name: "The Marlowes", cityMatch: ["Hemel Hempstead"] },
    { name: "High Chelmer", cityMatch: ["Chelmsford"] },
    { name: "Serpentine Green", cityMatch: ["Peterborough"] },
    { name: "Victoria Shopping Centre", cityMatch: ["Southend", "Southend-on-Sea"] },
    { name: "The Galleria", cityMatch: ["Hatfield"] },
    { name: "Riverside", cityMatch: ["Hemel Hempstead"] },
    { name: "The Royals", cityMatch: ["Southend", "Southend-on-Sea"] },
    { name: "Culver Square", cityMatch: ["Colchester"] },
    { name: "Lion Walk", cityMatch: ["Colchester"] },
    { name: "Buttermarket", cityMatch: ["Ipswich"] }
];

async function main() {
    console.log("🌾 Checking East of England Top 20 against Database...\n");

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
                const locationString = (m.city + " " + m.address + " " + (m.county || "")).toLowerCase();
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
