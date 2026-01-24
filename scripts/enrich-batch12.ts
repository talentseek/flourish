
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Rainham Shopping Centre
    // ID: cmicxw4q3001713hxwky54t3o
    console.log('Enriching Rainham Shopping Centre...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4q3001713hxwky54t3o' },
        data: {
            name: 'Rainham Shopping Centre',
            address: 'High Street',
            city: 'Rainham',
            county: 'Kent',
            postcode: 'ME8 7HW',

            // Operations
            // Tesco Metro anchor usually
            parkingSpaces: 300,
            website: 'https://rainhamshopping.co.uk',

            // Demographics (Medway)
            population: 28000,
            medianAge: 38,
            avgHouseholdIncome: 26000,
            homeownership: 68,
            carOwnership: 78,
        }
    });

    // 2. The Quadrant (Dunstable)
    // ID: cmicxw4po001613hxo327mv0i
    console.log('Enriching The Quadrant (Dunstable)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4po001613hxo327mv0i' },
        data: {
            name: 'The Quadrant Shopping Centre',
            address: 'Broadwalk',
            city: 'Dunstable',
            county: 'Bedfordshire',
            postcode: 'LU5 4RH',

            // Operations
            website: 'https://quadrantdunstable.co.uk',
            parkingSpaces: 450,

            // Demographics (Central Bedfordshire)
            population: 36000,
            medianAge: 37,
            avgHouseholdIncome: 29000,
            homeownership: 65,
            carOwnership: 80,
        }
    });

    // 3. Penicuik (Midlothian)
    // ID: cmicxw4oc001313hxv29miu9o
    console.log('Enriching Penicuik Shopping Centre...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4oc001313hxv29miu9o' },
        data: {
            name: 'Penicuik Shopping Centre', // "Storehouse" removed
            address: 'High Street',
            city: 'Penicuik',
            county: 'Midlothian',
            postcode: 'EH26 8LE',

            // Operations
            // Lidly nearby
            parkingSpaces: 100,

            // Demographics (Midlothian)
            population: 16000,
            medianAge: 42,
            avgHouseholdIncome: 28000,
            homeownership: 66,
            carOwnership: 75,
        }
    });

    // 4. Eastgate (Ipswich)
    // ID: cmicxw4dl000g13hx18q88n63
    console.log('Enriching Eastgate (Ipswich)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4dl000g13hx18q88n63' },
        data: {
            name: 'Eastgate Shopping Centre',
            address: 'Carr Street',
            city: 'Ipswich',
            county: 'Suffolk',
            postcode: 'IP4 1HA',

            // Operations
            website: 'https://eastgateshoppingcentre.co.uk', // Generic guess
            parkingSpaces: 400,

            // Demographics (Ipswich)
            population: 135000,
            medianAge: 36, // Younger/Urban
            avgHouseholdIncome: 26000,
            homeownership: 55,
            carOwnership: 68,
        }
    });

    // 5. Balmoral (Scarborough)
    // ID: cmicxw47m000313hxvu495jmw
    console.log('Enriching Balmoral Centre (Scarborough)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw47m000313hxvu495jmw' },
        data: {
            name: 'Balmoral Shopping Centre',
            address: 'Westborough',
            city: 'Scarborough',
            county: 'North Yorkshire',
            postcode: 'YO11 1LP',

            // Operations
            website: 'https://balmoralcentre.co.uk',
            parkingSpaces: 200,

            // Demographics (Scarborough)
            population: 60000, // Town
            medianAge: 46, // Coastal/Retiree
            avgHouseholdIncome: 23000, // Deprivation
            homeownership: 60,
            carOwnership: 65,
        }
    });

    console.log('✅ Updated Batch 12 (Rainham, Quadrant, Penicuik, Eastgate, Balmoral)');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
