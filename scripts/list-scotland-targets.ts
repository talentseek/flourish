
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SCOTLAND_TERMS = [
    // Counties/Regions
    "Glasgow", "Edinburgh", "Aberdeen", "Dundee", "Highland", "Fife", "Lanarkshire",
    "Lothian", "Aberdeenshire", "Angus", "Argyll", "Ayrshire", "Clackmannanshire",
    "Dumfries", "Dunbartonshire", "Falkirk", "Inverclyde", "Moray", "Orkney", "Perth",
    "Renfrewshire", "Borders", "Shetland", "Stirling", "Hebrides",
    // Cities/Towns
    "Inverness", "Paisley", "East Kilbride", "Livingston", "Hamilton", "Cumbernauld",
    "Dunfermline", "Kirkcaldy", "Glenrothes", "Kilmarnock", "Coatbridge", "Greenock"
];

async function main() {
    console.log("🔍 Listing Scotland Targets...\n");

    const locations = await prisma.location.findMany({
        where: {
            isManaged: false,
            type: 'SHOPPING_CENTRE',
            OR: [
                { website: null },
                { website: '' }
            ],
            OR: [
                ...SCOTLAND_TERMS.map(t => ({ county: { contains: t, mode: 'insensitive' } })),
                ...SCOTLAND_TERMS.map(t => ({ city: { contains: t, mode: 'insensitive' } }))
            ]
        },
        select: {
            name: true,
            city: true,
            county: true
        }
    });

    console.log(`Found ${locations.length} locations.`);
    console.table(locations);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
