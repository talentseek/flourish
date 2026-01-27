
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REGIONS = {
    "Midlands": [
        // West Midlands
        'Birmingham', 'Coventry', 'Wolverhampton', 'Dudley', 'Walsall', 'Solihull',
        'Stoke-on-Trent', 'Telford', 'Shrewsbury', 'Worcester', 'Hereford', 'Rugby',
        'Tamworth', 'Cannock', 'Stafford', 'West Midlands', 'Sutton Coldfield',
        // East Midlands
        'Nottingham', 'Leicester', 'Derby', 'Northampton', 'Lincoln', 'Mansfield',
        'Chesterfield', 'Loughborough', 'Kettering', 'Corby', 'Wellingborough',
        'Grantham', 'Newark', 'Worksop'
    ],
    "South": [
        // South East
        'Southampton', 'Portsmouth', 'Brighton', 'Reading', 'Milton Keynes', 'Oxford',
        'Slough', 'Guildford', 'Maidstone', 'Canterbury', 'Crawley', 'Ashford',
        'Basingstoke', 'Bracknell', 'High Wycombe',
        // South West
        'Bristol', 'Plymouth', 'Swindon', 'Bournemouth', 'Poole', 'Gloucester',
        'Exeter', 'Cheltenham', 'Bath', 'Weston-super-Mare', 'Taunton', 'Truro',
        // East of England
        'Norwich', 'Ipswich', 'Cambridge', 'Peterborough', 'Luton', 'Bedford',
        'Stevenage', 'Watford', 'Southend', 'Chelmsford', 'Colchester', 'Basildon',
        'Harlow', 'Thurrock'
    ]
};

async function getPriority(regionName: string, towns: string[], limit: number = 20) {
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
    await getPriority("Midlands (East & West)", REGIONS["Midlands"], 20);
    await getPriority("South (SE, SW, East)", REGIONS["South"], 20);
}

main().catch(console.error).finally(() => prisma.$disconnect());
