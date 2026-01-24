
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Churchill Square (Brighton)
    // ID: cmid0jxn900pqmtpune7h3uhz
    console.log('Enriching Churchill Square...');
    await prisma.location.update({
        where: { id: 'cmid0jxn900pqmtpune7h3uhz' },
        data: {
            name: 'Churchill Square Shopping Centre',
            city: 'Brighton',
            postcode: 'BN1 2RG',
            totalFloorArea: 700000,
            numberOfStores: 80,
            parkingSpaces: 1600,
            website: 'https://churchillsquare.com',
            population: 290000, // Brighton
            medianAge: 37,
            avgHouseholdIncome: 33000
        }
    });

    // 2. The Glades (Bromley)
    // ID: cmid0l2xy01wjmtpuya0m3m6d
    console.log('Enriching The Glades...');
    await prisma.location.update({
        where: { id: 'cmid0l2xy01wjmtpuya0m3m6d' },
        data: {
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
        }
    });

    // 3. The Bentall Centre (Kingston)
    // ID: cmid0l1l701v9mtpuj4ushtjg
    console.log('Enriching The Bentall Centre...');
    await prisma.location.update({
        where: { id: 'cmid0l1l701v9mtpuj4ushtjg' },
        data: {
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
        }
    });

    // 4. Southside (Wandsworth)
    // ID: cmid0l05h01tqmtputt1s1h9v (Winner)
    console.log('Enriching Southside Wandsworth...');
    await prisma.location.update({
        where: { id: 'cmid0l05h01tqmtputt1s1h9v' },
        data: {
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
        }
    });

    // 5. County Mall (Crawley)
    // ID: cmid0kscw01lsmtpuasyi1xfb
    console.log('Enriching County Mall...');
    await prisma.location.update({
        where: { id: 'cmid0kscw01lsmtpuasyi1xfb' },
        data: {
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
        }
    });

    // 6. The Friary (Guildford)
    // ID: cmid0l2t401wemtpum0f892js (Winner)
    console.log('Enriching The Friary...');
    await prisma.location.update({
        where: { id: 'cmid0l2t401wemtpum0f892js' },
        data: {
            name: 'The Friary Guildford',
            city: 'Guildford',
            postcode: 'GU1 4YT',
            totalFloorArea: 350000,
            numberOfStores: 50,
            parkingSpaces: 1000, // Nearby
            website: 'https://thefriaryguildford.com',
            population: 150000,
            medianAge: 38,
            avgHouseholdIncome: 45000
        }
    });

    // 7. Castle Quay (Banbury)
    // ID: cmks9w2vd0000p2aadahaezi0 (Seeded)
    console.log('Enriching Castle Quay...');
    await prisma.location.update({
        where: { id: 'cmks9w2vd0000p2aadahaezi0' },
        data: {
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
        }
    });

    // 8. Eden (High Wycombe)
    // ID: cmid0ktd201mnmtpu76e50jw2
    console.log('Enriching Eden (High Wycombe)...');
    await prisma.location.update({
        where: { id: 'cmid0ktd201mnmtpu76e50jw2' },
        data: {
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
        }
    });

    // 9. Gunwharf Quays (Portsmouth)
    // ID: cmid0jnsk00fnmtpumnlm5cus
    console.log('Enriching Gunwharf Quays...');
    await prisma.location.update({
        where: { id: 'cmid0jnsk00fnmtpumnlm5cus' },
        data: {
            name: 'Gunwharf Quays',
            city: 'Portsmouth',
            postcode: 'PO1 3TZ',
            totalFloorArea: 500000,
            numberOfStores: 90,
            parkingSpaces: 1500,
            website: 'https://gunwharf-quays.com',
            population: 200000,
            medianAge: 32, // Student/Naval
            avgHouseholdIncome: 27000,
            type: "OUTLET_CENTRE" // Actually an outlet
        }
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
