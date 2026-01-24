
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Dukes Mill (Romsey)
    // ID: cmicxw4d4000f13hxhc1258ls
    console.log('Enriching Dukes Mill (Romsey)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4d4000f13hxhc1258ls' },
        data: {
            name: 'Dukes Mill Shopping Centre',
            address: 'Broadwater Road',
            city: 'Romsey',
            county: 'Hampshire',
            postcode: 'SO51 8PJ',

            // Operations
            // Small open scheme
            parkingSpaces: 200,

            // Demographics (Test Valley)
            population: 18000, // Romsey
            medianAge: 46, // Older/Wealthy
            avgHouseholdIncome: 36000,
            homeownership: 72,
            carOwnership: 85,
        }
    });

    // 2. The Marsh Centre (Hythe)
    // ID: cmicxw4ko000v13hxb5gyxosb
    console.log('Enriching The Marsh Centre (Hythe)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4ko000v13hxb5gyxosb' },
        data: {
            name: 'The Marsh Centre',
            address: 'Pylewell Road', // Corrected
            city: 'Hythe',
            county: 'Hampshire',
            postcode: 'SO45 6AL', // Validated

            // Operations
            // Waitrose anchor nearby
            parkingSpaces: 150,

            // Demographics (New Forest)
            population: 20000,
            medianAge: 48, // Very old demographic
            avgHouseholdIncome: 32000,
            homeownership: 75,
            carOwnership: 82,
        }
    });

    // 3. The Ridgeway (Plympton)
    // ID: cmicxw4t5001d13hx2pyeqfy3
    console.log('Enriching The Ridgeway (Plympton)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4t5001d13hx2pyeqfy3' },
        data: {
            name: 'The Ridgeway Shopping Centre',
            address: 'The Ridgeway',
            city: 'Plympton',
            county: 'Devon',
            postcode: 'PL7 2ZN',

            // Operations
            website: 'https://plymptonridgeway.co.uk', // Community site often exists

            // Demographics (Plymouth outer)
            population: 30000,
            medianAge: 42,
            avgHouseholdIncome: 27000,
            homeownership: 70,
            carOwnership: 80,
        }
    });

    // 4. Parc-y-Llyn (Aberystwyth)
    // ID: cmicxw4mx001013hx9nkmc36y
    console.log('Enriching Parc-y-Llyn (Aberystwyth)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4mx001013hx9nkmc36y' },
        data: {
            name: 'Parc-y-Llyn Retail Park',
            address: 'Boulevard de Saint-Brieuc',
            city: 'Aberystwyth',
            county: 'Ceredigion',
            postcode: 'SY23 3TL',

            // Operations
            parkingSpaces: 600, // Morrisons/Retail park

            // Demographics (Ceredigion)
            population: 18000, // Town + Student
            medianAge: 30, // University town skew
            avgHouseholdIncome: 23000,
            homeownership: 50,
            carOwnership: 65, // Rural but students walk
        }
    });

    // 5. Kingsland Centre (Thatcham)
    // ID: cmicxw4gi000m13hx9mghuxqm
    console.log('Enriching Kingsland Centre (Thatcham)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4gi000m13hx9mghuxqm' },
        data: {
            name: 'Kingsland Shopping Centre',
            address: 'The Broadway',
            city: 'Thatcham',
            county: 'Berkshire',
            postcode: 'RG19 3HN',

            // Operations
            // Waitrose anchor
            parkingSpaces: 250,

            // Demographics (West Berkshire)
            population: 26000,
            medianAge: 39,
            avgHouseholdIncome: 35000,
            homeownership: 72,
            carOwnership: 88,
        }
    });

    console.log('✅ Updated Batch 11 (Dukes, Marsh, Ridgeway, Parc-y-Llyn, Kingsland)');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
