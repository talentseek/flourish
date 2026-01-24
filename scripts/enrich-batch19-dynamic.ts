
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Helper with Try/Catch
    async function enrich(name, city, data) {
        console.log(`Enriching ${name}...`);

        let loc = await prisma.location.findFirst({
            where: {
                OR: [
                    { name: { contains: name } },
                    {
                        AND: [
                            { name: { contains: name.split(' ')[0] as string } },
                            { city: { contains: city } }
                        ]
                    }
                ]
            }
        });

        // Seed if missing
        if (!loc && (name === "Castlepoint" || name === "Eastgate Shopping Centre")) {
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
            console.log(`❌ Could not find ${name} in ${city} (and not auto-creating)`);
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

    // 1. Broadway (Bexleyheath)
    await enrich('Broadway Shopping Centre', 'Bexleyheath', {
        name: 'Broadway Shopping Centre',
        city: 'Bexleyheath',
        postcode: 'DA6 7JN',
        totalFloorArea: 500000,
        numberOfStores: 60,
        parkingSpaces: 1200,
        website: 'https://broadwaybexleyheath.co.uk',
        population: 240000,
        medianAge: 39,
        avgHouseholdIncome: 35000
    });

    // 2. The Mall (Blackburn)
    await enrich('The Mall Blackburn', 'Blackburn', {
        name: 'The Mall Blackburn',
        city: 'Blackburn',
        postcode: 'BB1 7JG',
        totalFloorArea: 600000,
        numberOfStores: 100,
        parkingSpaces: 1300,
        website: 'https://themall.co.uk/blackburn',
        population: 150000,
        medianAge: 35,
        avgHouseholdIncome: 23000
    });

    // 3. Market Place (Bolton)
    await enrich('Market Place', 'Bolton', {
        name: 'Market Place Bolton',
        city: 'Bolton',
        postcode: 'BL1 2AL',
        totalFloorArea: 380000,
        numberOfStores: 70,
        parkingSpaces: 500,
        website: 'https://marketplacebolton.co.uk',
        population: 280000,
        medianAge: 37,
        avgHouseholdIncome: 26000
    });

    // 4. Castlepoint (Bournemouth) - Seeded
    await enrich('Castlepoint', 'Bournemouth', {
        name: 'Castlepoint',
        city: 'Bournemouth',
        postcode: 'BH8 9UZ',
        totalFloorArea: 650000,
        numberOfStores: 40, // Big box
        parkingSpaces: 3000,
        website: 'https://castlepointshopping.com',
        population: 190000,
        medianAge: 40,
        avgHouseholdIncome: 30000
    });

    // 5. The Broadway (Bradford)
    await enrich('Broadway', 'Bradford', {
        name: 'The Broadway',
        city: 'Bradford',
        postcode: 'BD1 1US',
        totalFloorArea: 570000,
        numberOfStores: 90,
        parkingSpaces: 1300,
        website: 'https://broadwaybradford.com',
        population: 530000,
        medianAge: 34,
        avgHouseholdIncome: 23000
    });

    // 6. The Rock (Bury)
    await enrich('The Rock', 'Bury', {
        name: 'The Rock',
        city: 'Bury',
        postcode: 'BL9 0JY',
        totalFloorArea: 500000,
        numberOfStores: 60,
        parkingSpaces: 1000,
        website: 'https://therockbury.com',
        population: 190000,
        medianAge: 38,
        avgHouseholdIncome: 28000
    });

    // 7. The Square (Camberley)
    await enrich('The Square', 'Camberley', {
        name: 'The Square Camberley',
        city: 'Camberley',
        postcode: 'GU15 3SL',
        totalFloorArea: 460000,
        numberOfStores: 100,
        parkingSpaces: 1000,
        website: 'https://thesquarecamberley.co.uk',
        population: 90000,
        medianAge: 40,
        avgHouseholdIncome: 42000
    });

    // 8. Vicar Lane (Chesterfield)
    await enrich('Vicar Lane', 'Chesterfield', {
        name: 'Vicar Lane Shopping Centre',
        city: 'Chesterfield',
        postcode: 'S40 1PY',
        totalFloorArea: 200000,
        numberOfStores: 40,
        parkingSpaces: 400,
        website: 'https://vicarlaneshoppingcentre.co.uk',
        population: 105000,
        medianAge: 42,
        avgHouseholdIncome: 27000
    });

    // 9. Lion Walk (Colchester)
    await enrich('Lion Walk', 'Colchester', {
        name: 'Lion Walk Shopping Centre',
        city: 'Colchester',
        postcode: 'CO1 1DX',
        totalFloorArea: 200000,
        numberOfStores: 40,
        parkingSpaces: 0, // Town centre
        website: 'https://lionwalkshopping.com',
        population: 190000,
        medianAge: 36,
        avgHouseholdIncome: 31000
    });

    // 10. Eastgate (Basildon) - Seeded
    await enrich('Eastgate Shopping Centre', 'Basildon', {
        name: 'Eastgate Shopping Centre',
        city: 'Basildon',
        postcode: 'SS14 1EB',
        totalFloorArea: 750000,
        numberOfStores: 100,
        parkingSpaces: 1800,
        website: 'https://eastgateshoppingcentre.com',
        population: 185000,
        medianAge: 37,
        avgHouseholdIncome: 29000
    });

    // 11. The Mall Wood Green
    await enrich('The Mall Wood Green', 'London', {
        name: 'The Mall Wood Green',
        city: 'London (Wood Green)',
        postcode: 'N22 6YQ',
        totalFloorArea: 540000,
        numberOfStores: 100,
        parkingSpaces: 1200,
        website: 'https://themall.co.uk/wood-green',
        population: 280000,
        medianAge: 33,
        avgHouseholdIncome: 30000
    });

    // 12. The Mall Maidstone
    await enrich('The Mall Maidstone', 'Maidstone', {
        name: 'The Mall Maidstone',
        city: 'Maidstone',
        postcode: 'ME15 6AT',
        totalFloorArea: 500000,
        numberOfStores: 70,
        parkingSpaces: 1000,
        website: 'https://themall.co.uk/maidstone',
        population: 170000,
        medianAge: 38,
        avgHouseholdIncome: 34000
    });

    // 13. Exchange Ilford
    await enrich('Exchange', 'Ilford', {
        name: 'Exchange Ilford',
        city: 'Ilford',
        postcode: 'IG1 1RS',
        totalFloorArea: 300000,
        numberOfStores: 80,
        parkingSpaces: 1000,
        website: 'https://exchangeilford.com',
        population: 300000,
        medianAge: 32,
        avgHouseholdIncome: 31000
    });

    console.log('✅ Enriched Batch 19 (Market Data: The Final Giants)');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
