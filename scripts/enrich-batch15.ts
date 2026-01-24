
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. St James Quarter (Edinburgh)
    // ID: cmid0l0bc01tvmtpucxv3rzk5
    console.log('Enriching St James Quarter...');
    await prisma.location.update({
        where: { id: 'cmid0l0bc01tvmtpucxv3rzk5' },
        data: {
            name: 'St James Quarter',
            city: 'Edinburgh',
            postcode: 'EH1 3SS',
            totalFloorArea: 1700000,
            numberOfStores: 80,
            parkingSpaces: 1600,
            website: 'https://stjamesquarter.com',
            population: 500000,
            medianAge: 38,
            avgHouseholdIncome: 35000
        }
    });

    // 2. St David's (Cardiff)
    // ID: cmks95l980005fajkx22y1ctx (Verified Seeded ID)
    console.log("Enriching St David's...");
    await prisma.location.update({
        where: { id: 'cmks95l980005fajkx22y1ctx' },
        data: {
            name: "St David's Dewi Sant",
            city: 'Cardiff',
            postcode: 'CF10 2EF',
            totalFloorArea: 1400000,
            numberOfStores: 180,
            parkingSpaces: 2000,
            website: 'https://stdavidscardiff.com',
            population: 360000,
            medianAge: 33,
            avgHouseholdIncome: 27000
        }
    });

    // 3. Braehead (Glasgow)
    // ID: cmid0kq8y01jkmtpuda2z6obv
    console.log('Enriching Braehead...');
    await prisma.location.update({
        where: { id: 'cmid0kq8y01jkmtpuda2z6obv' },
        data: {
            name: 'Braehead Shopping Centre',
            city: 'Glasgow (Renfrew)',
            postcode: 'G51 4BN',
            totalFloorArea: 1100000,
            numberOfStores: 110,
            parkingSpaces: 6500,
            website: 'https://braehead.co.uk',
            population: 180000,
            medianAge: 39,
            avgHouseholdIncome: 26000
        }
    });

    // 4. Silverburn (Glasgow)
    // ID: cmid0l02q01tnmtpux785zt40
    console.log('Enriching Silverburn...');
    await prisma.location.update({
        where: { id: 'cmid0l02q01tnmtpux785zt40' },
        data: {
            name: 'Silverburn',
            city: 'Glasgow (Pollok)',
            postcode: 'G53 6AG',
            totalFloorArea: 1000000,
            numberOfStores: 100,
            parkingSpaces: 4500,
            website: 'https://shopsilverburn.com',
            population: 600000,
            medianAge: 35,
            avgHouseholdIncome: 25000
        }
    });

    // 5. Cribbs Causeway (Bristol)
    // ID: cmid0l3ob01xbmtpuas19mww5 (The Mall At Cribbs Causeway - Existing clean one)
    console.log('Enriching Cribbs Causeway...');
    await prisma.location.update({
        where: { id: 'cmid0l3ob01xbmtpuas19mww5' },
        data: {
            name: 'The Mall at Cribbs Causeway',
            city: 'Bristol',
            postcode: 'BS34 5DG',
            totalFloorArea: 1000000,
            numberOfStores: 130,
            parkingSpaces: 7000,
            website: 'https://mallcribbs.com',
            population: 460000,
            medianAge: 33,
            avgHouseholdIncome: 30000
        }
    });

    // 6. Cabot Circus (Bristol)
    // ID: cmid0kqvk01k8mtpuayhfr4ca
    console.log('Enriching Cabot Circus...');
    await prisma.location.update({
        where: { id: 'cmid0kqvk01k8mtpuayhfr4ca' },
        data: {
            name: 'Cabot Circus',
            city: 'Bristol',
            postcode: 'BS1 3BX',
            totalFloorArea: 1000000,
            numberOfStores: 120,
            parkingSpaces: 2500,
            website: 'https://cabotcircus.com',
            population: 460000,
            medianAge: 33,
            avgHouseholdIncome: 31000
        }
    });

    // 7. Victoria Centre (Nottingham)
    // ID: cmid0km1x01famtpulce7hkqq
    console.log('Enriching Victoria Centre...');
    await prisma.location.update({
        where: { id: 'cmid0km1x01famtpulce7hkqq' },
        data: {
            name: 'Victoria Centre',
            city: 'Nottingham',
            postcode: 'NG1 3QN',
            totalFloorArea: 980000,
            numberOfStores: 120,
            parkingSpaces: 2700,
            website: 'https://victoria-centre.com',
            population: 330000,
            medianAge: 31,
            avgHouseholdIncome: 24000
        }
    });

    // 8. East Kilbride
    // ID: cmks95lbi0006fajke474s7kn (Verified Seeded ID)
    console.log('Enriching East Kilbride...');
    await prisma.location.update({
        where: { id: 'cmks95lbi0006fajke474s7kn' },
        data: {
            name: 'East Kilbride Shopping Centre',
            city: 'East Kilbride',
            postcode: 'G74 1LL',
            totalFloorArea: 1200000,
            numberOfStores: 150,
            parkingSpaces: 3000,
            website: 'https://eklife.co.uk',
            population: 75000,
            medianAge: 42,
            avgHouseholdIncome: 27000
        }
    });

    // 9. St. Enoch (Glasgow)
    // ID: cmid0l0k801u5mtpue2ghsou2
    console.log('Enriching St Enoch...');
    await prisma.location.update({
        where: { id: 'cmid0l0k801u5mtpue2ghsou2' },
        data: {
            name: 'St. Enoch Centre',
            city: 'Glasgow',
            postcode: 'G1 4BW',
            totalFloorArea: 900000,
            numberOfStores: 120,
            parkingSpaces: 900,
            website: 'https://st-enoch.com',
            population: 600000,
            medianAge: 35,
            avgHouseholdIncome: 25000
        }
    });

    // 10. Victoria Square (Belfast)
    // ID: cmks95ldg0008fajkhu4i43ns (Verified Seeded ID)
    console.log('Enriching Victoria Square...');
    await prisma.location.update({
        where: { id: 'cmks95ldg0008fajkhu4i43ns' },
        data: {
            name: 'Victoria Square',
            city: 'Belfast',
            postcode: 'BT1 4QG',
            totalFloorArea: 800000,
            numberOfStores: 70,
            parkingSpaces: 1000,
            website: 'https://victoriasquare.com',
            population: 340000,
            medianAge: 36,
            avgHouseholdIncome: 26000
        }
    });

    console.log('✅ Enriched Batch 15 (Market Data: Scotland, Wales, Regional)');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
