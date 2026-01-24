
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. The Lexicon (Bracknell)
    // ID: cmicxw4hd000o13hxkrkb8enf
    console.log('Enriching The Lexicon (Bracknell)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4hd000o13hxkrkb8enf' },
        data: {
            name: 'The Lexicon',
            address: 'The Avenue',
            city: 'Bracknell',
            county: 'Berkshire',
            postcode: 'RG12 1AP',

            // Operations
            website: 'https://thelexiconbracknell.com',
            parkingSpaces: 3800, // Massive regeneration project
            openedYear: 2017,

            // Demographics (Bracknell Forest)
            population: 120000,
            medianAge: 37, // Young families
            avgHouseholdIncome: 38000,
            homeownership: 68,
            carOwnership: 85,
        }
    });

    // 2. Mailbox Birmingham
    // ID: cmicxw4j7000s13hxzkrmasy0
    console.log('Enriching Mailbox Birmingham...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4j7000s13hxzkrmasy0' },
        data: {
            name: 'The Mailbox',
            address: 'Wharfside Street',
            city: 'Birmingham',
            county: 'West Midlands',
            postcode: 'B1 1RS',

            // Operations
            website: 'https://mailboxlife.com',
            parkingSpaces: 600,
            openedYear: 2000, // Redevelopment

            // Demographics (Birmingham City Centre)
            population: 1100000,
            medianAge: 32,
            avgHouseholdIncome: 28000,
            homeownership: 40, // City living
            carOwnership: 55,
        }
    });

    // 3. One Stop (Perry Barr)
    // ID: cmicxw4m0000y13hxetux3i04
    // Postcode: B42 1AA
    console.log('Enriching One Stop (Perry Barr)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4m0000y13hxetux3i04' },
        data: {
            name: 'One Stop Shopping Centre',
            address: '2 Walsall Road',
            city: 'Birmingham (Perry Barr)',
            county: 'West Midlands',
            postcode: 'B42 1AA',

            // Operations
            website: 'https://onestopshopping.co.uk',
            parkingSpaces: 1200,

            // Demographics (Perry Barr)
            population: 25000,
            medianAge: 34,
            avgHouseholdIncome: 22000,
            homeownership: 55,
            carOwnership: 65,
        }
    });

    // 4. Swan (Eastleigh)
    // ID: cmicxw4tl001e13hx7ae4i2db
    // Postcode: SO50 5SF
    console.log('Enriching Swan Centre (Eastleigh)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4tl001e13hx7ae4i2db' },
        data: {
            name: 'The Swan Centre',
            address: 'Wells Place',
            city: 'Eastleigh',
            county: 'Hampshire',
            postcode: 'SO50 5SF',

            // Operations
            website: 'https://swancentre.co.uk',
            parkingSpaces: 800,

            // Demographics (Eastleigh)
            population: 130000,
            medianAge: 41,
            avgHouseholdIncome: 31000,
            homeownership: 70,
            carOwnership: 82,
        }
    });

    // 5. Ladysmith (Ashton-under-Lyne - fixing data error)
    // ID: cmicxw4gy000n13hxz4gs23l9
    // Postcode: OL6 7JY
    console.log('Fixing Ladysmith (Ashton-under-Lyne)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4gy000n13hxz4gs23l9' },
        data: {
            name: 'Ladysmith Shopping Centre',
            address: 'Mercian Mall',
            city: 'Ashton-under-Lyne', // Fixed from blank/Newcastle
            county: 'Greater Manchester',
            postcode: 'OL6 7JY',

            // Operations
            website: 'https://ladysmithshoppingcentre.com',
            parkingSpaces: 400,

            // Demographics (Tameside)
            population: 22000, // Ashton
            medianAge: 39,
            avgHouseholdIncome: 23000,
            homeownership: 60,
            carOwnership: 68,
        }
    });

    console.log('✅ Updated Batch 7 (Identity Repair & Majors)');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
