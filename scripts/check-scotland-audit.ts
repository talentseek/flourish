
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targets = [
    { name: "St James Quarter", cityMatch: ["Edinburgh"], legacyNames: ["St James Centre"] },
    { name: "East Kilbride Shopping Centre", cityMatch: ["East Kilbride"], legacyNames: ["EK", "EK, East Kilbride", "The Plaza"] },
    { name: "Braehead Shopping Centre", cityMatch: ["Glasgow", "Renfrew"], legacyNames: ["Braehead", "Intu Braehead"] },
    { name: "Silverburn", cityMatch: ["Glasgow", "Pollock"], legacyNames: ["Silverburn Shopping Centre"] },
    { name: "The Centre, Livingston", cityMatch: ["Livingston"], legacyNames: ["The Centre", "Almondvale"] },
    { name: "St. Enoch Centre", cityMatch: ["Glasgow"], legacyNames: ["St Enoch"] },
    { name: "Clyde Shopping Centre", cityMatch: ["Clydebank", "Glasgow"], legacyNames: ["Clyde Retail Park"] },
    { name: "Union Square", cityMatch: ["Aberdeen"] },
    { name: "Bon Accord", cityMatch: ["Aberdeen"], legacyNames: ["Bon Accord Centre", "Bon Accord & St Nicholas"] },
    { name: "Buchanan Galleries", cityMatch: ["Glasgow"] },
    { name: "The Thistles", cityMatch: ["Stirling"], legacyNames: ["Thistles Shopping Centre"] },
    { name: "Kingdom Shopping Centre", cityMatch: ["Glenrothes"], legacyNames: ["The Kingdom Centre"] },
    { name: "Overgate", cityMatch: ["Dundee"], legacyNames: ["Overgate Centre"] },
    { name: "Eastgate", cityMatch: ["Inverness"], legacyNames: ["Eastgate Shopping Centre"] },
    { name: "The Gyle", cityMatch: ["Edinburgh"], legacyNames: ["Gyle Shopping Centre"] },
    { name: "Ocean Terminal", cityMatch: ["Edinburgh", "Leith"] },
    { name: "Regent Shopping Centre", cityMatch: ["Hamilton"], legacyNames: ["The Regent Centre"] },
    { name: "Rivergate", cityMatch: ["Irvine"], legacyNames: ["Rivergate Shopping Centre"] },
    { name: "Livingston Designer Outlet", cityMatch: ["Livingston"], legacyNames: ["McArthurGlen Livingston"] },
    { name: "Oak Mall", cityMatch: ["Greenock"], legacyNames: ["Oak Mall Shopping Centre"] }
];

async function main() {
    console.log("🏴󠁧󠁢󠁳󠁣󠁴󠁿  Auditing Scotland Top 20 (Deep Check)...\n");

    let foundCount = 0;

    for (const target of targets) {
        // Clean main target name
        const cleanName = target.name.replace(/ Shopping Centre| Centre|,/g, "").trim();
        let searchNames = [target.name, cleanName];
        if (target.legacyNames) searchNames = [...searchNames, ...target.legacyNames];
        // Deduplicate
        searchNames = [...new Set(searchNames)];

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
                if ((!m.city && !m.address) && matches.length > 1) return false; // If ambiguous and no geo, skip
                if ((!m.city && !m.address) && matches.length === 1) return true; // If only one result, assume match (risk, but low for unique names)

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
            if (validMatch.facebook) health.push("Fb");

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
