
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targets = [
    // Super-Giants
    { name: "Westfield London", cityMatch: ["White City", "Shepherd's Bush", "London"] },
    { name: "Westfield Stratford City", cityMatch: ["Stratford", "London"] },

    // Major Regionals
    { name: "Whitgift Centre", cityMatch: ["Croydon"] },
    { name: "Canary Wharf Shopping Centre", cityMatch: ["Canary Wharf", "London"] },
    { name: "Brent Cross Shopping Centre", cityMatch: ["Brent Cross", "Hendon", "London"] },
    { name: "Centrale", cityMatch: ["Croydon"] },
    { name: "Battersea Power Station", cityMatch: ["Battersea", "London"] },

    // Large Town Centres
    { name: "The Mall Wood Green", cityMatch: ["Wood Green", "London"] },
    { name: "Southside Wandsworth", cityMatch: ["Wandsworth", "London"] },
    { name: "Broadway Shopping Centre", cityMatch: ["Bexleyheath"] },
    { name: "The Glades", cityMatch: ["Bromley"] },
    { name: "The Chimes", cityMatch: ["Uxbridge"] },
    { name: "The Liberty", cityMatch: ["Romford"] },
    { name: "Palace Gardens", cityMatch: ["Enfield"] },
    { name: "Ealing Broadway", cityMatch: ["Ealing", "London"] },

    // Mid-Sized & Outlets
    { name: "The Pavilions", cityMatch: ["Uxbridge"] },
    { name: "St Nicholas Centre", cityMatch: ["Sutton"] },
    { name: "The Bentall Centre", cityMatch: ["Kingston"] },
    { name: "London Designer Outlet", cityMatch: ["Wembley", "London"] },
    { name: "Lewisham Shopping Centre", cityMatch: ["Lewisham", "London"] },
    { name: "Surrey Quays", cityMatch: ["Rotherhithe", "London"] },
    { name: "Wimbledon Quarter", cityMatch: ["Wimbledon", "London"] }, // Was Centre Court
    { name: "Exchange Ilford", cityMatch: ["Ilford"] },
    { name: "St Anns", cityMatch: ["Harrow"] },
    { name: "Livat Hammersmith", cityMatch: ["Hammersmith", "London"] },
    { name: "Treaty Centre", cityMatch: ["Hounslow"] },
    { name: "Eden Walk", cityMatch: ["Kingston"] },
    { name: "St George's", cityMatch: ["Harrow"] },
    { name: "ICON Outlet at The O2", cityMatch: ["Greenwich", "London"] },
    { name: "One New Change", cityMatch: ["London", "City of London"] },

    // Best of the Rest
    { name: "The Mercury", cityMatch: ["Romford"] },
    { name: "The Brunswick Centre", cityMatch: ["Bloomsbury", "London"] },
    { name: "W12 Shopping", cityMatch: ["Shepherd's Bush", "London"] },
    { name: "Angel Central", cityMatch: ["Islington", "London"] }, // aka N1
    { name: "Burlington Arcade", cityMatch: ["Mayfair", "London"] },
    { name: "Hay's Galleria", cityMatch: ["London Bridge", "London"] },
    { name: "Putney Exchange", cityMatch: ["Putney", "London"] },
    { name: "Merton Abbey Mills", cityMatch: ["Merton", "London"] }, // The 1929 Shop / Village
    { name: "Cardinal Place", cityMatch: ["Victoria", "London"] },
    { name: "Leadenhall Market", cityMatch: ["London", "City of London"] }
];

async function main() {
    console.log("🔍 Checking London Top 40 Inventory...\n");

    let foundCount = 0;
    const missing: string[] = [];

    for (const target of targets) {
        // Clean name for broader matching (remove "Shopping Centre", etc.)
        const cleanName = target.name.replace(/ Shopping Centre| Centre|,/g, "").trim();
        const searchNames = [target.name, cleanName];

        // Also check specifically for "N1" if Angel Central
        if (target.name === "Angel Central") searchNames.push("N1 Shopping Centre");

        const matches = await prisma.location.findMany({
            where: {
                OR: searchNames.map(n => ({ name: { contains: n, mode: "insensitive" } }))
            }
        });

        // Strict City Verification
        const match = matches.find(m => {
            const locStr = (m.city + " " + (m.address || "") + " " + (m.county || "")).toLowerCase();
            return target.cityMatch.some(c => locStr.includes(c.toLowerCase()));
        });

        if (match) {
            foundCount++;
            const gaps = [];
            if (!match.website) gaps.push("Web");
            if (!match.parkingSpaces) gaps.push("Park");
            if (!match.facebook && !match.instagram) gaps.push("Soc");

            if (gaps.length > 0) {
                console.log(`⚠️ FOUND (GAPS): ${target.name} -> ${match.name} [Missing: ${gaps.join(", ")}]`);
            } else {
                console.log(`✅ FOUND (HEALTHY): ${target.name} -> ${match.name}`);
            }
        } else {
            console.log(`❌ MISSING: ${target.name}`);
            missing.push(target.name);
        }
    }

    console.log(`\n📊 SUMMARY`);
    console.log(`Found: ${foundCount}/${targets.length}`);
    console.log(`Missing: ${missing.length}`);
    if (missing.length > 0) {
        console.log("Targets to Create:");
        missing.forEach(m => console.log(` - ${m}`));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
