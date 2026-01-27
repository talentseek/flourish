
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WALES_TERMS = [
    // Regions
    "Wales", "Gwent", "Glamorgan", "Powys", "Dyfed", "Clwyd", "Gwynedd",
    // Cities/Towns
    "Cardiff", "Swansea", "Newport", "Wrexham", "Llandudno", "Bangor", "Bridgend",
    "Merthyr Tydfil", "Llanelli", "Neath", "Barry", "Cwmbran", "Pontypridd", "Caerphilly",
    "Rhyl", "Aberystwyth", "Carmarthen", "Haverfordwest", "Port Talbot"
];

async function main() {
    console.log("🔍 Listing Wales Targets...\n");

    const locations = await prisma.location.findMany({
        where: {
            isManaged: false,
            type: 'SHOPPING_CENTRE',
            OR: [
                { website: null },
                { website: '' }
            ],
            OR: [
                ...WALES_TERMS.map(t => ({ county: { contains: t, mode: 'insensitive' } })),
                ...WALES_TERMS.map(t => ({ city: { contains: t, mode: 'insensitive' } })),
                ...WALES_TERMS.map(t => ({ address: { contains: t, mode: 'insensitive' } }))
            ]
        },
        select: {
            name: true,
            city: true,
            county: true
        }
    });

    console.log(`Found ${locations.length} locations associated with Wales.`);
    console.table(locations);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
