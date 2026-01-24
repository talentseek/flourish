
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. The Trafford Centre
    // ID: cmid0l57b01yymtpukrln8bvy
    console.log('Enriching The Trafford Centre...');
    await prisma.location.update({
        where: { id: 'cmid0l57b01yymtpukrln8bvy' },
        data: {
            name: 'The Trafford Centre',
            city: 'Manchester (Trafford)',
            postcode: 'M17 8AA',

            // Market Data Estimates
            totalFloorArea: 2200000,
            numberOfStores: 280,
            parkingSpaces: 11500,
            anchorTenants: 4, // Selfridges, John Lewis, M&S
            website: 'https://traffordcentre.co.uk',

            // Demographics (Trafford)
            population: 235000,
            medianAge: 39,
            avgHouseholdIncome: 41000,
            homeownership: 68,
            carOwnership: 80,
        }
    });

    // 2. Metrocentre (Gateshead)
    // ID: cmid0kwvf01qamtpu9f3v73my
    console.log('Enriching Metrocentre...');
    await prisma.location.update({
        where: { id: 'cmid0kwvf01qamtpu9f3v73my' },
        data: {
            name: 'Metrocentre',
            city: 'Gateshead',
            postcode: 'NE11 9YG',

            // Market Data Estimates
            totalFloorArea: 2100000,
            numberOfStores: 300,
            parkingSpaces: 10000,
            anchorTenants: 3,
            website: 'https://themetrocentre.co.uk',

            // Demographics (Gateshead)
            population: 200000,
            medianAge: 41,
            avgHouseholdIncome: 25000,
            homeownership: 58,
            carOwnership: 68,
        }
    });

    // 3. Manchester Arndale
    // ID: cmid0kw8b01plmtpu7p4c3x6o
    console.log('Enriching Manchester Arndale...');
    await prisma.location.update({
        where: { id: 'cmid0kw8b01plmtpu7p4c3x6o' },
        data: {
            name: 'Manchester Arndale',
            city: 'Manchester',
            postcode: 'M4 3AQ',

            // Market Data Estimates
            totalFloorArea: 1400000,
            numberOfStores: 240,
            parkingSpaces: 1450, // City centre low
            website: 'https://manchesterarndale.com',

            // Demographics (Manchester)
            population: 550000,
            medianAge: 31, // Young/Student
            avgHouseholdIncome: 29000,
            homeownership: 38,
            carOwnership: 45,
        }
    });

    // 4. Meadowhall (Sheffield)
    // ID: cmid0kwm801q0mtpuj3na7ywb (Centre, not Retail Park)
    console.log('Enriching Meadowhall...');
    await prisma.location.update({
        where: { id: 'cmid0kwm801q0mtpuj3na7ywb' },
        data: {
            name: 'Meadowhall Centre',
            city: 'Sheffield',
            postcode: 'S9 1EP',

            // Market Data Estimates
            totalFloorArea: 1500000,
            numberOfStores: 290,
            parkingSpaces: 12000,
            anchorTenants: 3,
            website: 'https://meadowhall.co.uk',

            // Demographics (Sheffield)
            population: 580000,
            medianAge: 36,
            avgHouseholdIncome: 26000,
            homeownership: 58,
            carOwnership: 65,
        }
    });

    // 5. Bullring (Birmingham)
    // ID: cmks95l0r0001fajk0kzfi8xr (Seeded one matches best name)
    // But check if existing is better populated? "Bullring Shopping Centre" (ID: cmid0kqpy01k2mtpul2a9ytd4)
    // I will enrich the NEW Seeded one for cleanliness.
    console.log('Enriching Bullring...');
    await prisma.location.update({
        where: { id: 'cmks95l0r0001fajk0kzfi8xr' },
        data: {
            name: 'Bullring & Grand Central',
            city: 'Birmingham',
            postcode: 'B5 4BU',
            totalFloorArea: 1700000,
            numberOfStores: 200,
            parkingSpaces: 3000,
            website: 'https://bullring.co.uk',
            population: 1140000,
            medianAge: 32,
            avgHouseholdIncome: 27000
        }
    });

    // 6. Merry Hill (Dudley)
    // ID: cmks95l1i0002fajkbhurjm5f (Seeded) - Avoid "Retail Park" ID: cmid0k8gy0116mtpufjy3vza3
    console.log('Enriching Merry Hill...');
    await prisma.location.update({
        where: { id: 'cmks95l1i0002fajkbhurjm5f' },
        data: {
            name: 'Merry Hill',
            city: 'Brierley Hill (Dudley)',
            postcode: 'DY5 1QX',
            totalFloorArea: 1670000,
            numberOfStores: 250,
            parkingSpaces: 10000,
            website: 'https://mymerryhill.co.uk',

            // Demographics (Dudley)
            population: 320000,
            medianAge: 40,
            avgHouseholdIncome: 24000,
            homeownership: 64,
            carOwnership: 75
        }
    });

    // 7. Liverpool ONE
    // ID: cmid0kw0e01pdmtpu3jwhpqaf (Looks correct but ID is weird, check find script output) 
    // Wait, find script output said: ID: cmid0kw0e01pdmtpu3jwhpqaf | Name: Liverpool ONE
    console.log('Enriching Liverpool ONE...');
    await prisma.location.update({
        where: { id: 'cmid0kw0e01pdmtpu3jwhpqaf' },
        data: {
            name: 'Liverpool ONE',
            city: 'Liverpool',
            postcode: 'L1 8JQ',
            totalFloorArea: 1600000,
            numberOfStores: 170,
            parkingSpaces: 3000, // City centre
            website: 'https://liverpool-one.com',
            population: 500000,
            medianAge: 34,
            avgHouseholdIncome: 26000
        }
    });

    // 8. White Rose (Leeds)
    // ID: cmid0l75y020xmtpu5n0vfpo8 (White Rose Shopping Centre) - Best match
    console.log('Enriching White Rose...');
    await prisma.location.update({
        where: { id: 'cmid0l75y020xmtpu5n0vfpo8' },
        data: {
            name: 'White Rose Shopping Centre',
            city: 'Leeds',
            postcode: 'LS11 8LU',
            totalFloorArea: 800000,
            numberOfStores: 120,
            parkingSpaces: 4800,
            website: 'https://white-rose.co.uk',
            population: 790000,
            medianAge: 35,
            avgHouseholdIncome: 29000
        }
    });

    // 9. Trinity Leeds
    // ID: cmid0l5rt01zkmtpu7a4vi5wc
    console.log('Enriching Trinity Leeds...');
    await prisma.location.update({
        where: { id: 'cmid0l5rt01zkmtpu7a4vi5wc' },
        data: {
            name: 'Trinity Leeds',
            city: 'Leeds',
            postcode: 'LS1 5ER',
            totalFloorArea: 1000000,
            numberOfStores: 120,
            parkingSpaces: 1000,
            website: 'https://trinityleeds.com',
            population: 790000,
            medianAge: 35,
            avgHouseholdIncome: 29000
        }
    });

    // 10. Eldon Square (Newcastle)
    // ID: cmid0kti401msmtpuxbhb3zhp
    console.log('Enriching Eldon Square...');
    await prisma.location.update({
        where: { id: 'cmid0kti401msmtpuxbhb3zhp' },
        data: {
            name: 'Eldon Square Shopping Centre',
            city: 'Newcastle',
            postcode: 'NE1 7JB',
            totalFloorArea: 1300000,
            numberOfStores: 140,
            parkingSpaces: 1500,
            website: 'https://eldonsquare.co.uk',
            population: 300000,
            medianAge: 34,
            avgHouseholdIncome: 26000
        }
    });

    console.log('✅ Enriched Batch 14 (Market Data: Midlands & North)');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
