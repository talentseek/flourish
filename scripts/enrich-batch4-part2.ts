
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Rotherham Retail Park (Parkgate?)
    // ID: cmicxw4r5001913hx99kvdrl3
    // Postcode: S62 6EJ -> Parkgate Shopping (huge retail park)
    console.log('Enriching Rotherham Retail Park (Parkgate)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4r5001913hx99kvdrl3' },
        data: {
            name: 'Parkgate Shopping (Rotherham Retail Park)',
            address: 'Stadium Way',
            city: 'Rotherham',
            county: 'South Yorkshire',
            postcode: 'S62 6EJ',

            // Operations
            website: 'https://www.parkgateshopping.co.uk',
            parkingSpaces: 2000, // Massive park
            publicTransit: 'Rotherham Parkgate Tram Train',

            // Demographics (Rotherham)
            population: 110000,
            medianAge: 40,
            avgHouseholdIncome: 23000,
            homeownership: 62,
            carOwnership: 78,
        }
    });

    // Billingham Town Centre
    // ID: cmicxw48w000613hxyfj9l1z7
    // Postcode: TS23 2LS
    console.log('Enriching Billingham Town Centre...\n');
    await prisma.location.update({
        where: { id: 'cmicxw48w000613hxyfj9l1z7' },
        data: {
            name: 'Billingham Town Centre',
            address: 'Town Centre',
            city: 'Billingham',
            county: 'County Durham',
            postcode: 'TS23 2LS',

            // Operations
            website: 'https://billinghamtowncentre.co.uk',

            // Demographics (Stockton-on-Tees / Billingham)
            population: 35000,
            medianAge: 42,
            avgHouseholdIncome: 25000,
            homeownership: 68,
            carOwnership: 75,
        }
    });

    // The Forge, Retail Park (Glasgow)
    // ID: cmicxw4v1001h13hx7jef1ft4
    // Postcode: G31 4BH -> The Forge Shopping Centre, Glasgow
    console.log('Enriching The Forge (Glasgow)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4v1001h13hx7jef1ft4' },
        data: {
            name: 'The Forge Shopping Centre',
            address: '1221 Gallowgate',
            city: 'Glasgow', // Correcting from Telford
            county: 'Glasgow City',
            postcode: 'G31 4BH',

            // Operations
            website: 'https://forgeshopping.com',
            parkingSpaces: 1600,

            // Demographics (Glasgow East End)
            population: 30000, // Parkhead/Dalmarnock
            medianAge: 36, // Younger/Urban
            avgHouseholdIncome: 22000, // Deprivation index higher
            homeownership: 45, // Lower
            carOwnership: 50, // High transit use
        }
    });

    console.log('✅ Updated Rotherham, Billingham, and The Forge');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
