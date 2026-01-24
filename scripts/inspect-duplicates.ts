
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pairs = [
    { name: "Park Farm", id1: "cmicxw4ne001113hxrga7j3df", id2: "cmid0kbdo013zmtpu6yy2z5ao" },
    { name: "Parkgate / Rotherham", id1: "cmicxw4r5001913hx99kvdrl3", id2: "cmid0kbhr0143mtpuzvsfkwlw" },
    { name: "The Forge", id1: "cmicxw4v1001h13hx7jef1ft4", id2: "cmid0l2qi01wbmtpu253fktx6" }
];

async function main() {
    console.log("Inspecting Duplicate Pairs...\n");

    for (const pair of pairs) {
        console.log(`--- ${pair.name} ---`);
        const loc1 = await prisma.location.findUnique({ where: { id: pair.id1 } });
        const loc2 = await prisma.location.findUnique({ where: { id: pair.id2 } });

        if (loc1) console.log(`[ID1] ${loc1.id} | ${loc1.name} | ${loc1.address}, ${loc1.city} | Enriched: ${loc1.lastEnriched ?? 'Never'}`);
        else console.log(`[ID1] ${pair.id1} NOT FOUND`);

        if (loc2) console.log(`[ID2] ${loc2.id} | ${loc2.name} | ${loc2.address}, ${loc2.city} | Enriched: ${loc2.lastEnriched ?? 'Never'}`);
        else console.log(`[ID2] ${pair.id2} NOT FOUND`);

        console.log('\n');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
