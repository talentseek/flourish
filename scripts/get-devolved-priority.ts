
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REGIONS = {
    "Wales": [
        'Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Bridgend', 'Llanelli', 'Merthyr Tydfil',
        'Cwmbran', 'Barry', 'Neath', 'Port Talbot', 'Caerphilly', 'Pontypridd', 'Rhyl',
        'Llandudno', 'Bangor', 'Aberystwyth', 'Carmarthen', 'Haverfordwest', 'Ebbw Vale',
        'Talbot Green', 'Llantrisant', 'Gorseinon', 'Vale of Glamorgan', 'Flintshire', 'Gwynedd'
    ],
    "Scotland": [
        'Glasgow', 'Edinburgh', 'Aberdeen', 'Dundee', 'Inverness', 'Paisley', 'East Kilbride',
        'Livingston', 'Hamilton', 'Cumbernauld', 'Kirkcaldy', 'Dunfermline', 'Perth', 'Ayr',
        'Kilmarnock', 'Dumfries', 'Stirling', 'Falkirk', 'Irvine', 'Motherwell', 'Coatbridge',
        'Greenock', 'Glenrothes', 'Elgin', 'Renfrew', 'Clydebank', 'Bearsden', 'Bishopbriggs',
        'Newton Mearns', 'Wishaw', 'Rutherglen', 'Cambuslang', 'Dumbarton', 'Peterhead'
    ],
    "Northern Ireland": [
        'Belfast', 'Derry', 'Londonderry', 'Lisburn', 'Newtownabbey', 'Bangor', 'Craigavon',
        'Castlereagh', 'Ballymena', 'Newtownards', 'Newry', 'Carrickfergus', 'Coleraine',
        'Antrim', 'Omagh', 'Larne', 'Banbridge', 'Armagh', 'Enniskillen', 'Strabane',
        'Dungannon', 'Cookstown', 'Downpatrick', 'Limavady', 'Ballymoney', 'Holywood'
    ]
};

async function getPriority(regionName: string, towns: string[], limit: number = 20) {
    const locations = await prisma.location.findMany({
        where: {
            type: 'RETAIL_PARK',
            isManaged: false, // Unenriched only
            OR: [
                { county: { in: towns, mode: 'insensitive' } },
                { city: { in: towns, mode: 'insensitive' } }
            ]
        },
        orderBy: { numberOfStores: 'desc' },
        take: limit,
        select: { id: true, name: true, city: true, county: true, numberOfStores: true }
    });

    console.log(`\n--- Top ${limit} Priority: ${regionName} ---`);
    console.table(locations.map(l => ({
        name: l.name,
        town: l.county || l.city,
        stores: l.numberOfStores
    })));

    return locations;
}

async function main() {
    await getPriority("Wales", REGIONS["Wales"], 20);
    await getPriority("Scotland", REGIONS["Scotland"], 20);
    await getPriority("Northern Ireland", REGIONS["Northern Ireland"], 20);
}

main().catch(console.error).finally(() => prisma.$disconnect());
