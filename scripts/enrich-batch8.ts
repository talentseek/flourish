
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Totton Shopping Centre
    // ID: cmicxw4xc001m13hx3v8lgjni
    console.log('Enriching Totton Shopping Centre...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4xc001m13hx3v8lgjni' },
        data: {
            name: 'Totton Base Shopping Centre', // Known locally/signage often "Totton Shopping Centre" or "The Precinct"
            address: 'Commercial Road',
            city: 'Totton / Southampton', // Totton is a town near Southampton
            county: 'Hampshire',
            postcode: 'SO40 3AG',

            // Operations
            // Asda anchor
            parkingSpaces: 450,

            // Demographics (New Forest)
            population: 29000, // Totton
            medianAge: 42,
            avgHouseholdIncome: 28000,
            homeownership: 72,
            carOwnership: 80,
        }
    });

    // 2. Hillsborough Exchange
    // ID: cmicxw4fi000k13hxblnhl921 
    console.log('Enriching Hillsborough Exchange (Sheffield)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4fi000k13hxblnhl921' },
        data: {
            name: 'Hillsborough Exchange',
            address: 'Middlewood Road',
            city: 'Sheffield',
            county: 'South Yorkshire',
            postcode: 'S6 2GB',

            // Operations
            // Morrisons anchor nearby, Home Bargains inside
            website: 'https://hillsboroughexchange.co.uk',
            parkingSpaces: 200, // Roof parking

            // Demographics (Sheffield S6)
            population: 18000, // Hillsborough ward
            medianAge: 38,
            avgHouseholdIncome: 24000,
            homeownership: 60,
            carOwnership: 65,
        }
    });

    // 3. Killingworth Centre
    // ID: cmicxw4fy000l13hxwzrp9dds
    console.log('Enriching Killingworth Centre...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4fy000l13hxwzrp9dds' },
        data: {
            name: 'The Killingworth Centre',
            address: 'Citadel East',
            city: 'Killingworth',
            county: 'Tyne and Wear',
            postcode: 'NE12 6YT',

            // Operations
            // Morrisons anchor
            parkingSpaces: 900,

            // Demographics (North Tyneside)
            population: 20000, // Killingworth
            medianAge: 40,
            avgHouseholdIncome: 26000,
            homeownership: 65,
            carOwnership: 75,
        }
    });

    // 4. Palace Shopping, Enfield
    // ID: cmicxw4mg000z13hxqr5gzivf
    console.log('Enriching Palace Shopping (Enfield)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4mg000z13hxqr5gzivf' },
        data: {
            name: 'Palace Gardens & Palace Exchange', // Usually managed together
            address: 'Church Street',
            city: 'Enfield',
            county: 'Greater London',
            postcode: 'EN2 6SN',

            // Operations
            website: 'https://palaceshopping.co.uk',
            parkingSpaces: 500,

            // Demographics (Enfield)
            population: 330000, // Borough
            medianAge: 36,
            avgHouseholdIncome: 34000,
            homeownership: 60,
            carOwnership: 65,
        }
    });

    // 5. Weston Favell
    // ID: cmicxw4ym001p13hxttj2pxq9
    console.log('Enriching Weston Favell (Northampton)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4ym001p13hxttj2pxq9' },
        data: {
            name: 'Weston Favell Shopping Centre',
            address: 'Wellingborough Road',
            city: 'Northampton',
            county: 'Northamptonshire',
            postcode: 'NN3 8JZ',

            // Operations
            website: 'https://westonfavellshopping.com',
            parkingSpaces: 1000, // Tesco Extra attached

            // Demographics (Northampton)
            population: 25000, // Ward
            medianAge: 37,
            avgHouseholdIncome: 26000,
            homeownership: 65,
            carOwnership: 78,
        }
    });

    console.log('✅ Updated Batch 8 (Totton, Hillsborough, Killingworth, Palace, Weston)');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
