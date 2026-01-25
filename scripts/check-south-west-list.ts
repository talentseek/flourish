
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const targets = [
    { name: "The Mall at Cribbs Causeway", cityMatch: ["Bristol", "Patchway"], legacyNames: ["Cribbs Causeway", "The Mall Cribbs Causeway"] },
    { name: "Cabot Circus", cityMatch: ["Bristol"] },
    { name: "Castlepoint", cityMatch: ["Bournemouth"] },
    { name: "The Dolphin", cityMatch: ["Poole"], legacyNames: ["Dolphin Shopping Centre"] },
    { name: "Princesshay", cityMatch: ["Exeter"] },
    { name: "The Brunel", cityMatch: ["Swindon"], legacyNames: ["Brunel Shopping Centre"] },
    { name: "Drake Circus", cityMatch: ["Plymouth"] },
    { name: "SouthGate", cityMatch: ["Bath"], legacyNames: ["SouthGate Bath"] },
    { name: "Gloucester Quays", cityMatch: ["Gloucester"] },
    { name: "The Galleries", cityMatch: ["Bristol"] },
    { name: "McArthurGlen Swindon", cityMatch: ["Swindon"], legacyNames: ["Swindon Designer Outlet"] },
    { name: "Regent Arcade", cityMatch: ["Cheltenham"] },
    { name: "Clarks Village", cityMatch: ["Street", "Somerset"] },
    { name: "Quedam Shopping Centre", cityMatch: ["Yeovil"], legacyNames: ["Quedam Centre", "The Quedam Centre"] }, // Ensure target name matches what we expect in DB now
    { name: "Guildhall Shopping Centre", cityMatch: ["Exeter"], legacyNames: ["Guildhall"] },
    { name: "Orchard Shopping Centre", cityMatch: ["Taunton"] },
    { name: "Eastgate Shopping Centre", cityMatch: ["Gloucester"], legacyNames: ["Eastgate"] },
    { name: "Old George Mall", cityMatch: ["Salisbury"] },
    { name: "The Sovereign", cityMatch: ["Weston-super-Mare"], legacyNames: ["Sovereign Centre", "Sovereign Shopping Centre"] },
    { name: "Emery Gate Shopping Centre", cityMatch: ["Chippenham"], legacyNames: ["Emery Gate"] }
];

async function main() {
    console.log("🌊 Checking South West Top 20 against Database... (CJS)\n");

    let foundCount = 0;

    for (const target of targets) {
        // Clean main target name
        const cleanName = target.name.replace(/ Shopping Centre| Centre|,/g, "").trim();
        let searchNames = [target.name, cleanName]; // Search exact target name first too
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
