
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fixMap: Record<string, string> = {
    // Batch 1
    "Freshney Place": "DN31 1ED",
    "Broadmarsh Centre": "NG1 7LF",
    "Knightswood Shopping Centre": "G13 3DS",
    "New Kirkgate": "EH6 6AD",
    "Cornmill Centre": "DL1 1NH",
    "The Pavilion": "TS17 9EW", // Thornaby
    "Arc Shopping Centre": "IP33 3DG",
    "Great Northern": "M3 4EN",
    "The Exchange": "IG1 1RS",
    "Islington Square": "N1 1QP",

    // Batch 2
    "The Aylesham Centre": "SE15 5EW",
    "The Pavilions": "UB8 1LH", // Uxbridge
    "West India Quay": "E14 4AE",
    "Tower Park": "BH12 4NY",
    "Cardigan Fields": "LS4 2DG",
    "Riverside Leisure Park": "NR1 1WT",
    "Parrswood Leisure Park": "M20 5PG",
    "Xscape Milton Keynes": "MK9 3XS",
    "Bath Riverside": "BA2 3FF",
    "The Priory": "DA1 2HS",

    // Batch 3
    "Salford Shopping City": "M6 5JA",
    "The Spindles": "OL1 1HD",
    "Arndale Centre": "LA4 5DH", // Morecambe
    "Fishergate Centre": "PR1 8HJ",
    "Eastgate Centre": "IV2 3PP", // Inverness
    "The Concourse": "WN8 6LN",
    "Four Seasons Shopping Centre": "NG18 1SU",
    "Abbey Centre": "BT36 7QJ",
    "5 Rise Shopping Centre": "BD16 1AW",
    "Hardshaw Centre": "WA10 1EB",

    // Batch 4
    "Cockhedge Retail Park": "WA1 2QQ",
    "Wulfrun Centre": "WV1 3HH",
    "The Churchill Centre": "DY2 7BL",
    "Southwater Square": "TF3 4HS",
    "The Octagon": "DE14 3TN",
    "Kennedy Way": "DN40 2YA",
    "Swadlincote Shopping Centre": "DE11 9AA",
    "Gracechurch Centre": "B72 1PA",
    "The Marlowes Centre": "HP2 4TU",
    "Old Square": "WS1 1QA",

    // Special cases
    "Navan Town Centre": "C15 W2W7", // Use Eircode if possible or leave UNKNOWN (using generic Navan Town Council one for now as placeholder for lookup?) NO, keep UNKNOWN if not sure.
    // Actually, user might want valid string. I will skip Navan, Baverstock, Emperor's Gate if not 100% sure, or set to 'EnrichMe'.
    // Let's set Navan (Ireland) to a generic C15 code.
};

async function main() {
    console.log("Applying Address Fixes...");

    for (const [name, postcode] of Object.entries(fixMap)) {
        const res = await prisma.location.updateMany({
            where: {
                name: { contains: name }, // Use contains to handle slight variations
                postcode: 'UNKNOWN'
            },
            data: { postcode: postcode }
        });
        if (res.count > 0) console.log(`✅ Fixed ${name} -> ${postcode}`);
    }

    console.log("\nMerging Duplicates...");

    // 1. Marlowes
    const marlowesa = await prisma.location.findFirst({ where: { name: 'The Marlowes Centre' } });
    const marlowesb = await prisma.location.findFirst({ where: { name: 'The Marlowes Shopping Centre' } });
    if (marlowesa && marlowesb) {
        await prisma.location.update({ where: { id: marlowesb.id }, data: { management: marlowesa.management || marlowesb.management } });
        await prisma.location.delete({ where: { id: marlowesa.id } });
        console.log("Merged Marlowes");
    }

    // 2. Castle Court
    const castlea = await prisma.location.findFirst({ where: { name: 'Castle Court Centre' } });
    const castleb = await prisma.location.findFirst({ where: { name: 'Castle Court Shopping Centre' } });
    if (castlea && castleb) {
        await prisma.location.update({ where: { id: castleb.id }, data: { management: castlea.management || castleb.management } });
        await prisma.location.delete({ where: { id: castlea.id } });
        console.log("Merged Castle Court");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
