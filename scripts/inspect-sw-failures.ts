
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ids = [
    "cmid0l3ob01xbmtpuas19mww5", // The Mall at Cribbs Causeway
    "cmid0jo1h00fxmtpumde0mgjp", // McArthurGlen Swindon
    "cmid0jh84008xmtpule7z0gf7", // Westfield London (The Good One - check if fully healthy)
    "cmid0kvuu01p7mtpuuulvazba"  // Lewisham Shopping Centre
];

async function main() {
    console.log("🔍 INSPECTING FAILURES");

    const results = await prisma.location.findMany({
        where: { id: { in: ids } }
    });

    for (const r of results) {
        console.log(`\nID: ${r.id} (${r.name})`);
        console.log(`   Web: ${r.website}`);
        console.log(`   Park: ${r.parkingSpaces}`);
        console.log(`   FB: ${r.facebook}`);
        console.log(`   Insta: ${r.instagram}`);
        console.log(`   Full Record Keys: ${Object.keys(r).join(", ")}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
