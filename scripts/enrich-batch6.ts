
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // M Swanley -> Swanley Shopping Centre
    // ID: cmicxw4is000r13hxavd7ijyw
    console.log('Enriching M Swanley (Swanley)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4is000r13hxavd7ijyw' },
        data: {
            name: 'Swanley Shopping Centre',
            address: 'London Road',
            city: 'Swanley',
            county: 'Kent',
            postcode: 'BR8 7AE',

            // Operations
            // Asda anchor
            parkingSpaces: 300,
            website: 'https://swanleyshoppingcentre.co.uk',

            // Demographics (Sevenoaks district)
            population: 17000,
            medianAge: 39,
            avgHouseholdIncome: 28000,
            homeownership: 68,
            carOwnership: 80,
        }
    });

    // Bell Walk -> Bell Walk (Uckfield)
    // ID: cmicxw48h000513hxtb3l36m6
    console.log('Enriching Bell Walk (Uckfield)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw48h000513hxtb3l36m6' },
        data: {
            name: 'Bell Walk Shopping Centre',
            address: 'Bell Walk',
            city: 'Uckfield',
            county: 'East Sussex',
            postcode: 'TN22 5DQ',

            // Operations
            // Small open air

            // Demographics (Wealden)
            population: 15000,
            medianAge: 45, // Older/Affluent
            avgHouseholdIncome: 34000,
            homeownership: 75,
            carOwnership: 88,
        }
    });

    // Waterborne Walk -> Waterborne Walk (Leighton Buzzard)
    // ID: cmicxw4xq001n13hxin90rbjb
    console.log('Enriching Waterborne Walk (Leighton Buzzard)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4xq001n13hxin90rbjb' },
        data: {
            name: 'Waterborne Walk',
            address: 'Waterborne Walk',
            city: 'Leighton Buzzard',
            county: 'Bedfordshire',
            postcode: 'LU7 1DH',

            // Operations
            website: 'https://waterbornewalk.co.uk',
            parkingSpaces: 450,

            // Demographics (Central Beds)
            population: 43000,
            medianAge: 39,
            avgHouseholdIncome: 32000,
            homeownership: 72,
            carOwnership: 85,
        }
    });

    // Armada Way... -> Plymouth City Centre (Armada Way)
    // ID: cmicxw46q000113hxex9ugmsx
    console.log('Enriching Armada Way (Plymouth)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw46q000113hxex9ugmsx' },
        data: {
            name: 'Armada Way (Plymouth City Centre)',
            address: 'Armada Way',
            city: 'Plymouth',
            county: 'Devon',
            postcode: 'PL1 1DZ',

            // Operations
            // Main high street / pedestrianised

            // Demographics (Plymouth)
            population: 260000,
            medianAge: 36, // Student city
            avgHouseholdIncome: 24000,
            homeownership: 55,
            carOwnership: 65,
        }
    });

    // 28 East Park Retail -> Newport (Skipping enrichment, just fixing name to avoid raw ID look)
    console.log('Renaming 28 East Park Retail (Newport)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw45r000013hx8bab8rdg' },
        data: {
            name: 'East Park Retail (Newport) [Address Review Needed]',
            city: 'Newport',
            county: 'Gwent',
            postcode: 'NP20 2NN',
        }
    });

    console.log('✅ Updated Batch 6 (Identity Repair)');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
