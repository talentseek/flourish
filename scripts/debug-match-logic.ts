
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Debugging Match Logic...");

    const target = { name: "McArthurGlen Outlet Bridgend", cityMatch: ["Bridgend"] };

    const cleanName = target.name.replace(/ Shopping Centre| Centre|,/g, "").trim();
    const searchNames = [target.name, cleanName];
    console.log(`Search Names: ${JSON.stringify(searchNames)}`);

    const matches = await prisma.location.findMany({
        where: {
            name: { contains: "Bridgend", mode: "insensitive" }
        }
    });

    console.log(`Found ${matches.length} candidates for 'Bridgend'.`);
    matches.forEach(m => {
        console.log(` - DB Name: '${m.name}' (Len: ${m.name.length})`);
        console.log(` - Target:  '${target.name}' (Len: ${target.name.length})`);
        console.log(` - Equality: ${m.name === target.name}`);
        console.log(` - Contains: ${m.name.toLowerCase().includes(target.name.toLowerCase())}`);
    });

    const match = matches.find(m => {
        const locStr = (m.city + " " + (m.address || "") + " " + (m.county || "")).toLowerCase();
        console.log(`   Checking vs locStr: "${locStr}"`);
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
