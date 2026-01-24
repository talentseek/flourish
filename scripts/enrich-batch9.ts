
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Chelmsley Wood
    // ID: cmicxw4c8000d13hxw8ui2frd
    console.log('Enriching Chelmsley Wood Shopping Centre...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4c8000d13hxw8ui2frd' },
        data: {
            name: 'Chelmsley Wood Shopping Centre',
            address: '33 Maple Walk',
            city: 'Chelmsley Wood (Solihull)',
            county: 'West Midlands',
            postcode: 'B37 5TT',

            // Operations
            website: 'https://chelmsleywood.co.uk',
            parkingSpaces: 500,

            // Demographics (Solihull - North)
            population: 26000,
            medianAge: 35, // Younger, higher deprivation
            avgHouseholdIncome: 24000,
            homeownership: 50,
            carOwnership: 65,
        }
    });

    // 2. Parkway (Coulby Newham)
    // ID: cmicxw4nw001213hxg33cfetn
    console.log('Enriching The Parkway Centre (Coulby Newham)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4nw001213hxg33cfetn' },
        data: {
            name: 'The Parkway Centre',
            address: 'Coulby Newham',
            city: 'Middlesbrough',
            county: 'North Yorkshire',
            postcode: 'TS8 0TJ',

            // Operations
            website: 'https://parkwaycentre.co.uk',
            parkingSpaces: 800, // Tesco Extra attached

            // Demographics (Middlesbrough)
            population: 15000, // Ward
            medianAge: 40,
            avgHouseholdIncome: 26000,
            homeownership: 68,
            carOwnership: 80,
        }
    });

    // 3. Borough Parade (Chippenham)
    // ID: cmicxw49t000813hxr6frnapt
    console.log('Enriching Borough Parade (Chippenham)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw49t000813hxr6frnapt' },
        data: {
            name: 'Borough Parade Shopping Centre',
            address: 'High Street',
            city: 'Chippenham',
            county: 'Wiltshire',
            postcode: 'SN15 3WL',

            // Operations
            website: 'https://boroughparade.co.uk',
            parkingSpaces: 150,

            // Demographics (Chippenham)
            population: 35000,
            medianAge: 41,
            avgHouseholdIncome: 31000,
            homeownership: 68,
            carOwnership: 82,
        }
    });

    // 4. Birchwood (Warrington)
    // ID: cmicxw49d000713hxtb6w7yfe
    console.log('Enriching Birchwood Shopping Centre...\n');
    await prisma.location.update({
        where: { id: 'cmicxw49d000713hxtb6w7yfe' },
        data: {
            name: 'Birchwood Shopping Centre',
            address: 'Benson Road',
            city: 'Warrington',
            county: 'Cheshire',
            postcode: 'WA3 7PG',

            // Operations
            website: 'https://birchwoodshoppingcentre.com',
            parkingSpaces: 1200, // Asda anchor

            // Demographics (Birchwood)
            population: 11000,
            medianAge: 39,
            avgHouseholdIncome: 29000,
            homeownership: 70,
            carOwnership: 85,
        }
    });

    // 5. St Martins Walk (Dorking)
    // ID: cmicxw4sn001c13hx4ilp5yh6
    console.log('Enriching St Martins Walk (Dorking)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4sn001c13hx4ilp5yh6' },
        data: {
            name: "St Martin's Walk",
            address: "St Martin's Walk",
            city: 'Dorking',
            county: 'Surrey',
            postcode: 'RH4 1EW',

            // Operations
            website: 'https://stmartinswalk.com',

            // Demographics (Mole Valley)
            population: 17000,
            medianAge: 45, // Wealthy commuter
            avgHouseholdIncome: 42000,
            homeownership: 75,
            carOwnership: 88,
        }
    });

    console.log('✅ Updated Batch 9 (Chelmsley, Parkway, Borough Parade, Birchwood, St Martins)');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
