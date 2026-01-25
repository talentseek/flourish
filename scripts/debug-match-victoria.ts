
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Debugging Victoria Match Logic...");

    // Test Victoria Centre (Llandudno) - Wales
    const victoria = { name: "Victoria Centre", cityMatch: ["Llandudno"] };
    await testMatch(victoria);

    // Test Abbey Centre (Newtownabbey) - NI
    const abbey = { name: "Abbey Centre", cityMatch: ["Newtownabbey"] };
    await testMatch(abbey);

    // Test Riverside
    const river = { name: "Riverside Haverfordwest", cityMatch: ["Haverfordwest"] };
    await testMatch(river);
}

async function testMatch(target: { name: string, cityMatch: string[] }) {
    console.log(`\nTesting: ${target.name} (City: ${target.cityMatch})`);
    const cleanName = target.name.replace(/ Shopping Centre| Centre|,/g, "").trim();
    const searchNames = [target.name, cleanName];
    console.log(`Search Names: ${JSON.stringify(searchNames)}`);

    const matches = await prisma.location.findMany({
        where: {
            OR: searchNames.map(n => ({ name: { contains: n, mode: "insensitive" } }))
        }
    });

    console.log(`Found ${matches.length} candidates.`);
    matches.forEach(m => {
        const locStr = (m.city + " " + (m.address || "") + " " + (m.county || "")).toLowerCase();
        const hits = target.cityMatch.some(c => locStr.includes(c.toLowerCase()));
        console.log(` - Candidate: '${m.name}' (City: ${m.city})`);
        console.log(`   LocStr: "${locStr}"`);
        console.log(`   Matches City? ${hits ? "YES" : "NO"}`);
    });

    const match = matches.find(m => {
        const locStr = (m.city + " " + (m.address || "") + " " + (m.county || "")).toLowerCase();
        return target.cityMatch.some(c => locStr.includes(c.toLowerCase()));
    });

    if (match) {
        console.log("✅ MATCHED!");
    } else {
        console.log("❌ NO MATCH");
    }
}

main()
    .finally(async () => await prisma.$disconnect());
