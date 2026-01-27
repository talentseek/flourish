
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const YORKSHIRE_TERMS = [
    // Counties/Regions
    "Yorkshire", "Humberside", "North Yorkshire", "South Yorkshire", "West Yorkshire",
    "East Riding", "Lincolnshire", // Sometimes grouped here
    // Cities/Towns
    "Leeds", "Sheffield", "Bradford", "Hull", "York", "Huddersfield", "Wakefield",
    "Doncaster", "Rotherham", "Halifax", "Barnsley", "Grimsby", "Scunthorpe",
    "Harrogate", "Scarborough", "Keighley", "Dewsbury", "Batley"
];

async function main() {
    console.log("🔍 Listing Yorkshire Targets...\n");

    const locations = await prisma.location.findMany({
        where: {
            isManaged: false,
            type: 'SHOPPING_CENTRE',
            OR: [
                { website: null },
                { website: '' }
            ],
            OR: [
                ...YORKSHIRE_TERMS.map(t => ({ county: { contains: t, mode: 'insensitive' } })),
                ...YORKSHIRE_TERMS.map(t => ({ city: { contains: t, mode: 'insensitive' } }))
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
