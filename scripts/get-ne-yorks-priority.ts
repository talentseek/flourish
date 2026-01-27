
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REGIONS = {
    "North East": [
        'Newcastle', 'Newcastle Upon Tyne', 'Sunderland', 'Durham', 'Gateshead',
        'Darlington', 'Middlesbrough', 'Hartlepool', 'Stockton-On-Tees',
        'South Shields', 'Washington', 'Wallsend', 'Bishop Auckland', 'Peterlee',
        'Alnwick', 'Berwick-Upon-Tweed', 'Blyth', 'Consett', 'Cramlington',
        'Hexham', 'Jarrow', 'Morpeth', 'North Shields', 'Redcar', 'Seaham',
        'Spennymoor', 'Stanley', 'Whitley Bay'
    ],
    "Yorkshire": [
        'Leeds', 'Sheffield', 'Bradford', 'Hull', 'York', 'Doncaster', 'Rotherham',
        'Wakefield', 'Huddersfield', 'Barnsley', 'Halifax', 'Grimsby', 'Scunthorpe',
        'Harrogate', 'Keighley', 'Dewsbury', 'Scarborough', 'Batley', 'Castleford',
        'Cleethorpes', 'Pontefract', 'Bridlington', 'Brighouse', 'Goole', 'Heckmondwike',
        'Knaresborough', 'Mexborough', 'Northallerton', 'Ossett', 'Otley', 'Richmond',
        'Ripon', 'Selby', 'Shipley', 'Skipton', 'Thirsk', 'Todmorden', 'Wetherby',
        'Whitby'
    ]
};

async function getPriority(regionName: string, towns: string[]) {
    const locations = await prisma.location.findMany({
        where: {
            type: 'RETAIL_PARK',
            isManaged: false, // Unenriched only
            OR: [
                { county: { in: towns } },
                { city: { in: towns } }
            ]
        },
        orderBy: { numberOfStores: 'desc' },
        take: 20,
        select: { id: true, name: true, city: true, county: true, numberOfStores: true }
    });

    console.log(`\n--- Top 20 Priority: ${regionName} ---`);
    console.table(locations.map(l => ({
        name: l.name,
        town: l.county || l.city,
        stores: l.numberOfStores
    })));

    return locations;
}

async function main() {
    await getPriority("North East", REGIONS["North East"]);
    await getPriority("Yorkshire & The Humber", REGIONS["Yorkshire"]);
}

main().catch(console.error).finally(() => prisma.$disconnect());
