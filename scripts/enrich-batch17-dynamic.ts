
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Helper to find ID or Create
    async function enrich(name, city, data) {
        console.log(`Enriching ${name}...`);

        // Find existing
        let loc = await prisma.location.findFirst({
            where: {
                OR: [
                    { name: { contains: name } },
                    {
                        AND: [
                            { name: { contains: name.split(' ')[0] } }, // First word match
                            { city: { contains: city } }
                        ]
                    }
                ]
            }
        });

        // Seed if missing (Specifically for The Beacon)
        if (!loc && name.includes("Beacon") && city === "Eastbourne") {
            console.log(`   -> Creating Missing: ${name}`);
            loc = await prisma.location.create({
                data: {
                    name: name,
                    city: city,
                    postcode: 'BN21 3NW',
                    address: 'Seeded Market Data',
                    isManaged: false,
                    type: 'SHOPPING_CENTRE',
                    latitude: 0.0,
                    longitude: 0.0
                }
            });
        }

        if (!loc) {
            console.log(`❌ Could not find ${name} in ${city} (and not auto-creating)`);
            return;
        }

        console.log(`   -> Found ID: ${loc.id} (${loc.name})`);

        await prisma.location.update({
            where: { id: loc.id },
            data: data
        });
        console.log(`   -> Updated.`);
    }

    // 1. Touchwood (Solihull)
    await enrich('Touchwood Shopping Centre', 'Solihull', {
        name: 'Touchwood',
        city: 'Solihull',
        postcode: 'B91 3GJ',
        totalFloorArea: 650000,
        numberOfStores: 80,
        parkingSpaces: 1700,
        website: 'https://touchwoodsolihull.co.uk',
        population: 215000,
        medianAge: 42,
        avgHouseholdIncome: 38000
    });

    // 2. West Orchards (Coventry)
    await enrich('West Orchards', 'Coventry', {
        name: 'West Orchards Shopping Centre',
        city: 'Coventry',
        postcode: 'CV1 1QX',
        totalFloorArea: 220000,
        numberOfStores: 40,
        parkingSpaces: 600,
        website: 'https://westorchards.co.uk',
        population: 360000,
        medianAge: 32,
        avgHouseholdIncome: 26000
    });

    // 3. Grand Arcade (Cambridge)
    await enrich('Grand Arcade', 'Cambridge', {
        name: 'Grand Arcade',
        city: 'Cambridge',
        postcode: 'CB2 3BJ',
        totalFloorArea: 450000,
        numberOfStores: 60,
        parkingSpaces: 900,
        website: 'https://grandarcade.co.uk',
        population: 130000,
        medianAge: 33, // Tech/Uni
        avgHouseholdIncome: 42000
    });

    // 4. Lion Yard (Cambridge)
    await enrich('Lion Yard', 'Cambridge', {
        name: 'Lion Yard Shopping Centre',
        city: 'Cambridge',
        postcode: 'CB2 3ET',
        totalFloorArea: 400000,
        numberOfStores: 50,
        parkingSpaces: 0, // Uses Grand Arcade
        website: 'https://thelionyard.co.uk',
        population: 130000,
        medianAge: 33,
        avgHouseholdIncome: 42000
    });

    // 5. Chantry Place (Norwich)
    await enrich('Chantry Place', 'Norwich', {
        name: 'Chantry Place',
        city: 'Norwich',
        postcode: 'NR1 3SH',
        totalFloorArea: 530000, // Ex-Chapelfield
        numberOfStores: 90,
        parkingSpaces: 1000,
        website: 'https://chantryplace.co.uk',
        population: 140000,
        medianAge: 37,
        avgHouseholdIncome: 29000
    });

    // 6. High Chelmer (Chelmsford)
    await enrich('High Chelmer', 'Chelmsford', {
        name: 'High Chelmer Shopping Centre',
        city: 'Chelmsford',
        postcode: 'CM1 1XB',
        totalFloorArea: 300000,
        numberOfStores: 70,
        parkingSpaces: 900,
        website: 'https://highchelmer.com',
        population: 115000,
        medianAge: 39,
        avgHouseholdIncome: 35000
    });

    // 7. Bond Street (Chelmsford)
    await enrich('Bond Street', 'Chelmsford', {
        name: 'Bond Street Chelmsford',
        city: 'Chelmsford',
        postcode: 'CM1 1GD',
        totalFloorArea: 300000,
        numberOfStores: 30, // Premium/Restaurants
        parkingSpaces: 200,
        website: 'https://bondstreetchelmsford.co.uk',
        population: 115000,
        medianAge: 39,
        avgHouseholdIncome: 37000
    });

    // 8. Atria Watford
    await enrich('Atria Watford', 'Watford', {
        name: 'Atria Watford',
        city: 'Watford',
        postcode: 'WD17 2UB',
        totalFloorArea: 1400000, // Massive extension
        numberOfStores: 140,
        parkingSpaces: 2700,
        website: 'https://atriawatford.com',
        population: 97000,
        medianAge: 36,
        avgHouseholdIncome: 38000
    });

    // 9. The Beacon (Eastbourne) - WILL CREATE
    await enrich('The Beacon', 'Eastbourne', {
        name: 'The Beacon',
        city: 'Eastbourne',
        postcode: 'BN21 3NW',
        totalFloorArea: 350000,
        numberOfStores: 70,
        parkingSpaces: 1300,
        website: 'https://thebeaconeastbourne.com',
        population: 100000,
        medianAge: 48, // Older coastal
        avgHouseholdIncome: 28000
    });

    // 10. Regent Arcade (Cheltenham)
    await enrich('Regent Arcade', 'Cheltenham', {
        name: 'Regent Arcade Shopping Centre',
        city: 'Cheltenham',
        postcode: 'GL50 1JZ',
        totalFloorArea: 185000,
        numberOfStores: 60,
        parkingSpaces: 500,
        website: 'https://regentarcade.co.uk',
        population: 117000,
        medianAge: 40,
        avgHouseholdIncome: 34000
    });

    console.log('✅ Enriched Batch 17 (Market Data: Midlands & East)');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
