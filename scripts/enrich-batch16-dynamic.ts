
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Helper to find ID
    async function enrich(name, city, data) {
        console.log(`Enriching ${name}...`);
        const loc = await prisma.location.findFirst({
            where: {
                OR: [
                    { name: { contains: name } },
                    { city: { contains: city } }
                ]
            }
        });

        if (!loc) {
            console.log(`❌ Could not find ${name} in ${city}`);
            return;
        }

        console.log(`   -> Found ID: ${loc.id} (${loc.name})`);

        await prisma.location.update({
            where: { id: loc.id },
            data: data
        });
        console.log(`   -> Updated.`);
    }

    // 1. Churchill Square (Brighton)
    await enrich('Churchill Square', 'Brighton', {
        name: 'Churchill Square Shopping Centre',
        city: 'Brighton',
        postcode: 'BN1 2RG',
        totalFloorArea: 700000,
        numberOfStores: 80,
        parkingSpaces: 1600,
        website: 'https://churchillsquare.com',
        population: 290000,
        medianAge: 37,
        avgHouseholdIncome: 33000
    });

    // 2. The Glades (Bromley)
    await enrich('The Glades', 'Bromley', {
        name: 'The Glades',
        city: 'Bromley',
        postcode: 'BR1 1DN',
        totalFloorArea: 460000,
        numberOfStores: 130,
        parkingSpaces: 1500,
        website: 'https://theglades.co.uk',
        population: 330000,
        medianAge: 40,
        avgHouseholdIncome: 38000
    });

    // 3. The Bentall Centre (Kingston)
    await enrich('Bentall Centre', 'Kingston', {
        name: 'The Bentall Centre',
        city: 'Kingston upon Thames',
        postcode: 'KT1 1TP',
        totalFloorArea: 600000,
        numberOfStores: 75,
        parkingSpaces: 1900,
        website: 'https://bentallcentre.co.uk',
        population: 180000,
        medianAge: 36,
        avgHouseholdIncome: 42000
    });

    // 4. Southside (Wandsworth)
    // Target the Winner: cmid0l05h01tqmtputt1s1h9v (Southside Wandsworth)
    // Avoid seed: Southside Shopping Centre
    await enrich('Southside Wandsworth', 'Wandsworth', {
        name: 'Southside Wandsworth',
        city: 'London (Wandsworth)',
        postcode: 'SW18 4TF',
        totalFloorArea: 600000,
        numberOfStores: 90,
        parkingSpaces: 1100,
        website: 'https://southsidewandsworth.com',
        population: 330000,
        medianAge: 32,
        avgHouseholdIncome: 40000
    });

    // 5. County Mall (Crawley)
    await enrich('County Mall', 'Crawley', {
        name: 'County Mall Shopping Centre',
        city: 'Crawley',
        postcode: 'RH10 1FP',
        totalFloorArea: 450000,
        numberOfStores: 90,
        parkingSpaces: 1700,
        website: 'https://countymall.co.uk',
        population: 110000,
        medianAge: 36,
        avgHouseholdIncome: 32000
    });

    // 6. The Friary (Guildford)
    // Target Winner: The Friary Shopping Centre
    await enrich('Friary Shopping Centre', 'Guildford', {
        name: 'The Friary Guildford',
        city: 'Guildford',
        postcode: 'GU1 4YT',
        totalFloorArea: 350000,
        numberOfStores: 50,
        parkingSpaces: 1000,
        website: 'https://thefriaryguildford.com',
        population: 150000,
        medianAge: 38,
        avgHouseholdIncome: 45000
    });

    // 7. Castle Quay (Banbury)
    await enrich('Castle Quay', 'Banbury', {
        name: 'Castle Quay Shopping Centre',
        city: 'Banbury',
        postcode: 'OX16 5UN',
        totalFloorArea: 380000,
        numberOfStores: 80,
        parkingSpaces: 1200,
        website: 'https://castlequay.co.uk',
        population: 48000,
        medianAge: 36,
        avgHouseholdIncome: 29000
    });

    // 8. Eden (High Wycombe)
    await enrich('Eden Shopping Centre', 'High Wycombe', {
        name: 'Eden Shopping Centre',
        city: 'High Wycombe',
        postcode: 'HP11 2DQ',
        totalFloorArea: 800000,
        numberOfStores: 110,
        parkingSpaces: 1600,
        website: 'https://edenshopping.co.uk',
        population: 125000,
        medianAge: 38,
        avgHouseholdIncome: 34000
    });

    // 9. Gunwharf Quays (Portsmouth)
    await enrich('Gunwharf Quays', 'Portsmouth', {
        name: 'Gunwharf Quays',
        city: 'Portsmouth',
        postcode: 'PO1 3TZ',
        totalFloorArea: 500000,
        numberOfStores: 90,
        parkingSpaces: 1500,
        website: 'https://gunwharf-quays.com',
        population: 200000,
        medianAge: 32,
        avgHouseholdIncome: 27000,
        type: "OUTLET_CENTRE"
    });

    console.log('✅ Enriched Batch 16 (Market Data: South East)');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
