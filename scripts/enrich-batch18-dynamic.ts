
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Helper
    async function enrich(name, city, data) {
        console.log(`Enriching ${name}...`);

        let loc = await prisma.location.findFirst({
            where: {
                OR: [
                    { name: { contains: name } },
                    {
                        AND: [
                            { name: { contains: name.split(' ')[0] } },
                            { city: { contains: city } }
                        ]
                    }
                ]
            }
        });

        // Seeding
        if (!loc && (city === "Dundee" || city === "Aberdeen" || city === "Liverpool" || city === "Hull" || city === "Carlisle")) {
            console.log(`   -> Creating Missing: ${name}`);
            loc = await prisma.location.create({
                data: {
                    name: name,
                    city: city,
                    postcode: data.postcode || 'UNKNOWN',
                    address: 'Seeded Market Data',
                    isManaged: false,
                    type: 'SHOPPING_CENTRE',
                    latitude: 0.0,
                    longitude: 0.0,
                    county: city // Placeholder
                }
            });
        }

        if (!loc) {
            console.log(`❌ Could not find ${name} in ${city}`);
            return;
        }

        console.log(`   -> Found ID: ${loc.id} (${loc.name})`);

        try {
            await prisma.location.update({
                where: { id: loc.id },
                data: data
            });
            console.log(`   -> Updated.`);
        } catch (e) {
            console.log(`   ❌ Update failed: ${e.message}`);
        }
    }

    // 1. Drake Circus (Plymouth)
    await enrich('Drake Circus', 'Plymouth', {
        name: 'Drake Circus Shopping Centre',
        city: 'Plymouth',
        postcode: 'PL1 1EA',
        totalFloorArea: 560000,
        numberOfStores: 70,
        parkingSpaces: 1270,
        website: 'https://drakecircus.com',
        population: 260000,
        medianAge: 38,
        avgHouseholdIncome: 27000
    });

    // 2. Princes Quay (Hull)
    await enrich('Princes Quay', 'Hull', {
        name: 'Princes Quay',
        city: 'Hull',
        postcode: 'HU1 2PQ',
        totalFloorArea: 300000,
        numberOfStores: 50,
        parkingSpaces: 900,
        website: 'https://princesquay.com',
        population: 260000,
        medianAge: 36,
        avgHouseholdIncome: 24000
    });

    // 3. Golden Square (Warrington)
    await enrich('Golden Square', 'Warrington', {
        name: 'Golden Square Shopping Centre',
        city: 'Warrington',
        postcode: 'WA1 1QB',
        totalFloorArea: 720000,
        numberOfStores: 130,
        parkingSpaces: 1700,
        website: 'https://gswarrington.com',
        population: 210000,
        medianAge: 39,
        avgHouseholdIncome: 31000
    });

    // 4. Overgate (Dundee) - Seeded
    await enrich('Overgate Centre', 'Dundee', {
        name: 'Overgate Centre',
        city: 'Dundee',
        postcode: 'DD1 1UQ',
        totalFloorArea: 420000,
        numberOfStores: 60,
        parkingSpaces: 1000,
        website: 'https://overgate.co.uk',
        population: 148000,
        medianAge: 36,
        avgHouseholdIncome: 25000
    });

    // 5. Bon Accord (Aberdeen) - Seeded
    await enrich('Bon Accord', 'Aberdeen', {
        name: 'Bon Accord Aberdeen',
        city: 'Aberdeen',
        postcode: 'AB25 1HZ',
        totalFloorArea: 600000, // Combined with St Nicholas
        numberOfStores: 70,
        parkingSpaces: 1300,
        website: 'https://bonaccordaberdeen.com',
        population: 220000,
        medianAge: 35,
        avgHouseholdIncome: 32000
    });

    // 6. Union Square (Aberdeen)
    await enrich('Union Square', 'Aberdeen', {
        name: 'Union Square',
        city: 'Aberdeen',
        postcode: 'AB11 5RG',
        totalFloorArea: 550000, // Newer one
        numberOfStores: 60,
        parkingSpaces: 1700,
        website: 'https://unionsquareaberdeen.com',
        population: 220000,
        medianAge: 35,
        avgHouseholdIncome: 33000
    });

    // 7. Houndshill (Blackpool)
    await enrich('Houndshill', 'Blackpool', {
        name: 'Houndshill Shopping Centre',
        city: 'Blackpool',
        postcode: 'FY1 4HU',
        totalFloorArea: 300000,
        numberOfStores: 60,
        parkingSpaces: 750,
        website: 'https://houndshillshoppingcentre.co.uk',
        population: 140000,
        medianAge: 42,
        avgHouseholdIncome: 22000
    });

    // 8. The Lanes (Carlisle) - Seeded
    await enrich('The Lanes Shopping Centre', 'Carlisle', {
        name: 'The Lanes Shopping Centre',
        city: 'Carlisle',
        postcode: 'CA3 8NX',
        totalFloorArea: 500000,
        numberOfStores: 70,
        parkingSpaces: 600,
        website: 'https://lanescarlisle.co.uk',
        population: 108000,
        medianAge: 43,
        avgHouseholdIncome: 26000
    });

    // 9. St Johns (Liverpool) - Seeded
    await enrich('St Johns Shopping Centre', 'Liverpool', {
        name: 'St Johns Shopping Centre',
        city: 'Liverpool',
        postcode: 'L1 1LY',
        totalFloorArea: 400000,
        numberOfStores: 100,
        parkingSpaces: 600,
        website: 'https://stjohns-shopping.co.uk',
        population: 500000,
        medianAge: 34,
        avgHouseholdIncome: 24000
    });

    // 10. Grosvenor (Chester)
    await enrich('Grosvenor Shopping Centre', 'Chester', {
        name: 'Grosvenor Shopping Centre',
        city: 'Chester',
        postcode: 'CH1 1EA',
        totalFloorArea: 250000,
        numberOfStores: 60,
        parkingSpaces: 400,
        website: 'https://thegrosvenorchester.co.uk',
        population: 120000,
        medianAge: 40,
        avgHouseholdIncome: 32000
    });

    // 11. Princesshay (Exeter)
    await enrich('Princesshay', 'Exeter', {
        name: 'Princesshay',
        city: 'Exeter',
        postcode: 'EX1 1QA',
        totalFloorArea: 530000,
        numberOfStores: 60,
        parkingSpaces: 500, // Nearby
        website: 'https://princesshay.co.uk',
        population: 130000,
        medianAge: 35,
        avgHouseholdIncome: 30000
    });

    // 12. St Stephens (Hull) - Seeded
    await enrich('St Stephens', 'Hull', {
        name: 'St Stephens Shopping Centre',
        city: 'Hull',
        postcode: 'HU2 8LN',
        totalFloorArea: 550000,
        numberOfStores: 50,
        parkingSpaces: 800,
        website: 'https://ststephens-hull.com',
        population: 260000,
        medianAge: 36,
        avgHouseholdIncome: 25000
    });

    console.log('✅ Enriched Batch 18 (Market Data: North, Scotland, South West)');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
