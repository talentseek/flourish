
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Westfield London (White City)
    // ID: cmid0jh84008xmtpule7z0gf7
    console.log('Enriching Westfield London...');
    await prisma.location.update({
        where: { id: 'cmid0jh84008xmtpule7z0gf7' },
        data: {
            name: 'Westfield London',
            city: 'London (White City)',
            postcode: 'W12 7GF',

            // Market Data Estimates (Super Regional)
            totalFloorArea: 2600000, // 2.6m sq ft
            numberOfStores: 450,
            parkingSpaces: 4500,
            anchorTenants: 5, // John Lewis, M&S, Waitrose, etc.
            website: 'https://uk.westfield.com/london',

            // Demographics (Hammersmith & Fulham)
            population: 185000,
            medianAge: 32,
            avgHouseholdIncome: 45000,
            homeownership: 35, // High rental
            carOwnership: 40, // High transit
        }
    });

    // 2. Westfield Stratford City
    // ID: cmid0l6r0020jmtpulcs3sweh
    console.log('Enriching Westfield Stratford...');
    await prisma.location.update({
        where: { id: 'cmid0l6r0020jmtpulcs3sweh' },
        data: {
            name: 'Westfield Stratford City',
            city: 'London (Stratford)',
            postcode: 'E20 1EJ',

            // Market Data Estimates
            totalFloorArea: 1900000,
            numberOfStores: 350,
            parkingSpaces: 5000,
            anchorTenants: 4, // John Lewis, M&S
            website: 'https://uk.westfield.com/stratfordcity',

            // Demographics (Newham)
            population: 350000,
            medianAge: 29, // Young/Diverse
            avgHouseholdIncome: 28000,
            homeownership: 25,
            carOwnership: 35,
        }
    });

    // 3. Bluewater (Kent)
    // ID: cmid0kq3f01jemtpu3o9ttf3g
    console.log('Enriching Bluewater...');
    await prisma.location.update({
        where: { id: 'cmid0kq3f01jemtpu3o9ttf3g' },
        data: {
            name: 'Bluewater Shopping Centre',
            city: 'Greenhithe',
            postcode: 'DA9 9ST',

            // Market Data Estimates
            totalFloorArea: 1600000,
            numberOfStores: 330,
            parkingSpaces: 13000, // Famous for parking
            anchorTenants: 4,
            website: 'https://bluewater.co.uk',

            // Demographics (Dartford)
            population: 110000,
            medianAge: 36,
            avgHouseholdIncome: 36000,
            homeownership: 65,
            carOwnership: 85,
        }
    });

    // 4. Lakeside (Thurrock) - Picking the correct one
    // ID: cmid0kvs301p4mtpuhrvn6jgz (Essex)
    console.log('Enriching Lakeside...');
    await prisma.location.update({
        where: { id: 'cmid0kvs301p4mtpuhrvn6jgz' },
        data: {
            name: 'Lakeside Shopping Centre',
            city: 'West Thurrock',
            postcode: 'RM20 2ZP',

            // Market Data Estimates
            totalFloorArea: 1400000,
            numberOfStores: 250,
            parkingSpaces: 11000,
            anchorTenants: 3,
            website: 'https://lakeside-shopping.com',

            // Demographics (Thurrock)
            population: 175000,
            medianAge: 35,
            avgHouseholdIncome: 29000,
            homeownership: 60,
            carOwnership: 75,
        }
    });

    // 5. Brent Cross (London)
    // ID: cmid0jdj7005cmtpufsu7mxmt
    console.log('Enriching Brent Cross...');
    await prisma.location.update({
        where: { id: 'cmid0jdj7005cmtpufsu7mxmt' },
        data: {
            name: 'Brent Cross Shopping Centre',
            city: 'London (Hendon)',
            postcode: 'NW4 3FP',

            // Market Data Estimates
            totalFloorArea: 900000,
            numberOfStores: 120,
            parkingSpaces: 8000,
            anchorTenants: 2, // Fenwick, John Lewis
            website: 'https://brentcross.co.uk',

            // Demographics (Barnet)
            population: 390000,
            medianAge: 37,
            avgHouseholdIncome: 42000,
            homeownership: 62,
            carOwnership: 70,
        }
    });

    // 6. Whitgift (Croydon)
    // ID: cmid0l7930210mtpu89m79uog
    console.log('Enriching Whitgift...');
    await prisma.location.update({
        where: { id: 'cmid0l7930210mtpu89m79uog' },
        data: {
            name: 'Whitgift Shopping Centre',
            city: 'Croydon',
            postcode: 'CR0 1LP',

            // Market Data Estimates
            totalFloorArea: 1300000, // Combined with Centrale effectively
            numberOfStores: 140,
            parkingSpaces: 2000,
            website: 'https://centraleandwhitgift.co.uk',

            // Demographics (Croydon)
            population: 380000,
            medianAge: 34,
            avgHouseholdIncome: 34000,
            homeownership: 55,
            carOwnership: 60,
        }
    });

    // 7. Festival Place (Basingstoke) - Newly Created
    // Need to find newly created ID, allowing fuzzy search
    const festival = await prisma.location.findFirst({ where: { name: "Festival Place" } });
    if (festival) {
        console.log('Enriching Festival Place...');
        await prisma.location.update({
            where: { id: festival.id },
            data: {
                totalFloorArea: 1000000,
                numberOfStores: 160,
                parkingSpaces: 2500,
                website: 'https://festivalplace.co.uk',
                population: 180000, // Basingstoke
                medianAge: 38,
                avgHouseholdIncome: 38000
            }
        });
    }

    // 8. Centre:MK (Milton Keynes)
    // ID: cmid0l2ac01vvmtpuopzxzitz
    console.log('Enriching Centre:MK...');
    await prisma.location.update({
        where: { id: 'cmid0l2ac01vvmtpuopzxzitz' },
        data: {
            name: 'The Centre:MK',
            city: 'Milton Keynes',
            postcode: 'MK9 3ES',
            totalFloorArea: 1300000,
            numberOfStores: 190,
            parkingSpaces: 5000, // Town centre
            website: 'https://centremk.com',
            population: 270000,
            medianAge: 35,
            avgHouseholdIncome: 36000
        }
    });

    // 9. Westquay (Southampton)
    // ID: cmid0l6vz020omtpud1z338b8
    console.log('Enriching Westquay...');
    await prisma.location.update({
        where: { id: 'cmid0l6vz020omtpud1z338b8' },
        data: {
            name: 'Westquay Shopping Centre',
            city: 'Southampton',
            postcode: 'SO15 1QF',
            totalFloorArea: 800000,
            numberOfStores: 100,
            parkingSpaces: 4000,
            website: 'https://westquay.co.uk',
            population: 250000,
            medianAge: 32, // Student
            avgHouseholdIncome: 28000
        }
    });

    // 10. Royal Victoria Place (Tunbridge Wells)
    // ID: cmid0kzl901t4mtpum4y8pkqm
    console.log('Enriching Royal Victoria Place...');
    await prisma.location.update({
        where: { id: 'cmid0kzl901t4mtpum4y8pkqm' },
        data: {
            name: 'Royal Victoria Place',
            city: 'Tunbridge Wells',
            postcode: 'TN1 2SS',
            totalFloorArea: 300000,
            numberOfStores: 90,
            parkingSpaces: 1200,
            website: 'https://royalvictoriaplace.com',
            population: 118000,
            medianAge: 42,
            avgHouseholdIncome: 45000
        }
    });

    console.log('✅ Enriched Batch 13 (Market Data: London & SE)');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
