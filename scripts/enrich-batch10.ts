
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Beacons Place
    // ID: cmicxw482000413hx6wu6uigt
    console.log('Enriching Beacons Place (Merthyr Tydfil)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw482000413hx6wu6uigt' },
        data: {
            name: 'Beacons Place Shopping Centre',
            address: 'High Street',
            city: 'Merthyr Tydfil',
            county: 'Mid Glamorgan',
            postcode: 'CF47 8DF',

            // Operations
            // Smaller centre

            // Demographics (Merthyr)
            population: 60000,
            medianAge: 40,
            avgHouseholdIncome: 22000,
            homeownership: 55,
            carOwnership: 65,
        }
    });

    // 2. Cwmbran Centre
    // ID: cmicxw4cn000e13hxq49ww240
    console.log('Enriching Cwmbran Centre...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4cn000e13hxq49ww240' },
        data: {
            name: 'Cwmbran Centre',
            address: 'Gwent Square',
            city: 'Cwmbran',
            county: 'Torfaen',
            postcode: 'NP44 1PB',

            // Operations
            website: 'https://cwmbrancentre.com',
            parkingSpaces: 3000, // Massive free parking

            // Demographics (Torfaen)
            population: 48000,
            medianAge: 41,
            avgHouseholdIncome: 24000,
            homeownership: 62,
            carOwnership: 75,
        }
    });

    // 3. Lower Precinct (Coventry)
    // ID: cmicxw4i8000q13hxzukdlnbo
    console.log('Enriching Lower Precinct (Coventry)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4i8000q13hxzukdlnbo' },
        data: {
            name: 'Lower Precinct Shopping Centre',
            address: 'Lower Precinct',
            city: 'Coventry',
            county: 'West Midlands',
            postcode: 'CV1 1NQ',

            // Operations
            website: 'https://lowerprecinct.com',
            parkingSpaces: 500,

            // Demographics (Coventry)
            population: 345000,
            medianAge: 32, // Student city
            avgHouseholdIncome: 26000,
            homeownership: 52,
            carOwnership: 60,
        }
    });

    // 4. Britten Centre (Lowestoft)
    // ID: cmicxw4ab000913hxacpya41l
    console.log('Enriching Britten Centre (Lowestoft)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4ab000913hxacpya41l' },
        data: {
            name: 'The Britten Centre',
            address: '7a London Road North',
            city: 'Lowestoft',
            county: 'Suffolk',
            postcode: 'NR32 1LR',

            // Operations
            website: 'https://brittencentre.co.uk',
            parkingSpaces: 350,

            // Demographics (East Suffolk)
            population: 70000, // Lowestoft
            medianAge: 46, // Coastal ageing
            avgHouseholdIncome: 23000,
            homeownership: 65,
            carOwnership: 72,
        }
    });

    // 5. Heart (Walton)
    // ID: cmicxw4ei000i13hxr8mty7fq
    console.log('Enriching Heart Shopping Centre...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4ei000i13hxr8mty7fq' },
        data: {
            name: 'The Heart Shopping Centre',
            address: 'New Zealand Avenue',
            city: 'Walton-on-Thames',
            county: 'Surrey',
            postcode: 'KT12 1GH',

            // Operations
            website: 'https://heartshopping.co.uk',
            parkingSpaces: 800,

            // Demographics (Elmbridge - Wealthy)
            population: 24000,
            medianAge: 42,
            avgHouseholdIncome: 48000,
            homeownership: 78,
            carOwnership: 88,
        }
    });

    console.log('✅ Updated Batch 10 (Beacons, Cwmbran, Lower Pct, Britten, Heart)');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
