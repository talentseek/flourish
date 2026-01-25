
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targets = [
    { name: "Bluewater", cityMatch: ["Greenhithe", "Dartford", "Kent"] },
    { name: "centre:mk", cityMatch: ["Milton Keynes"], legacyNames: ["The Centre MK", "Milton Keynes Shopping Centre"] },
    { name: "Festival Place", cityMatch: ["Basingstoke"] },
    { name: "Westquay", cityMatch: ["Southampton"], legacyNames: ["West Quay"] },
    { name: "The Lexicon", cityMatch: ["Bracknell"] },
    { name: "Royal Victoria Place", cityMatch: ["Tunbridge Wells"] },
    { name: "Eden Shopping Centre", cityMatch: ["High Wycombe"] },
    { name: "Westgate", cityMatch: ["Oxford"] },
    { name: "The Oracle", cityMatch: ["Reading"] },
    { name: "Gunwharf Quays", cityMatch: ["Portsmouth"] },
    { name: "Victoria Place", cityMatch: ["Woking"], legacyNames: ["The Peacocks", "Peacocks Centre"] },
    { name: "Churchill Square", cityMatch: ["Brighton"] },
    { name: "The Beacon", cityMatch: ["Eastbourne"], legacyNames: ["Arndale Centre", "Eastbourne Arndale"] },
    { name: "County Mall", cityMatch: ["Crawley"] },
    { name: "Hempstead Valley", cityMatch: ["Gillingham", "Kent"] },
    { name: "Castle Quay", cityMatch: ["Banbury"] },
    { name: "Midsummer Place", cityMatch: ["Milton Keynes"], legacyNames: ["intu Milton Keynes"] },
    { name: "The Friary", cityMatch: ["Guildford"], legacyNames: ["Friary Centre"] },
    { name: "Pentagon Shopping Centre", cityMatch: ["Chatham"] },
    { name: "Cascades", cityMatch: ["Portsmouth"] }
];

async function main() {
    console.log("🌊 Checking South East Top 20 against Database...\n");

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
