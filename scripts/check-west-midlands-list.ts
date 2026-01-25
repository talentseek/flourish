
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targets = [
    { name: "Bullring", cityMatch: ["Birmingham"] },
    { name: "Merry Hill", cityMatch: ["Brierley Hill", "Dudley"], legacyNames: ["Intu Merry Hill"] },
    { name: "Telford Centre", cityMatch: ["Telford"] },
    { name: "Kingfisher Shopping Centre", cityMatch: ["Redditch"] },
    { name: "Touchwood", cityMatch: ["Solihull"] },
    { name: "Mander Centre", cityMatch: ["Wolverhampton"] },
    { name: "The Potteries Centre", cityMatch: ["Stoke-on-Trent", "Hanley"], legacyNames: ["Intu Potteries"] },
    { name: "Gracechurch Centre", cityMatch: ["Sutton Coldfield"] },
    { name: "Grand Central", cityMatch: ["Birmingham"] },
    { name: "New Square", cityMatch: ["West Bromwich"] },
    { name: "Old Market", cityMatch: ["Hereford"] },
    { name: "Crowngate", cityMatch: ["Worcester"] },
    { name: "Lower Precinct", cityMatch: ["Coventry"] },
    { name: "West Orchards", cityMatch: ["Coventry"] },
    { name: "Wulfrun Centre", cityMatch: ["Wolverhampton"] },
    { name: "Darwin Centre", cityMatch: ["Shrewsbury"] },
    { name: "Ankerside", cityMatch: ["Tamworth"] },
    { name: "Ropewalk", cityMatch: ["Nuneaton"] },
    { name: "Three Spires", cityMatch: ["Lichfield"] },
    { name: "Cornbow", cityMatch: ["Halesowen"] }
];

async function main() {
    console.log("🐂 Checking West Midlands Top 20 against Database...\n");

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
