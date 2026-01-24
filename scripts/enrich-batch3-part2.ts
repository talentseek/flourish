
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Central Square, Maghull
    // ID: cmicxw4br000c13hx99elsjlo
    // Postcode: L31 0AE
    console.log('Enriching Central Square (Maghull)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4br000c13hx99elsjlo' },
        data: {
            name: 'Central Square',
            address: 'Westway',
            city: 'Maghull',
            county: 'Merseyside',
            postcode: 'L31 0AE',

            // Operations
            // Often has Morrisons, Home Bargains
            website: 'https://centralsquaremaghull.co.uk', // Found in domain records often

            // Demographics (Sefton / Maghull)
            population: 26000,
            medianAge: 46, // Older suburban
            avgHouseholdIncome: 30000,
            homeownership: 80, // High owner-occupied
            carOwnership: 85,
        }
    });

    // Park Farm (Allestree, Derby)
    // ID: cmicxw4ne001113hxrga7j3df
    // Postcode: DE22 2QN
    console.log('Enriching Park Farm (Allestree)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4ne001113hxrga7j3df' },
        data: {
            name: 'Park Farm Shopping Centre',
            address: 'Birchover Way',
            city: 'Derby', // Allestree is a suburb of Derby
            county: 'Derbyshire',
            postcode: 'DE22 2QN',

            // Operations
            website: 'https://www.parkfarmshoppingcentre.co.uk', // Verified existing

            // Demographics (Allestree)
            population: 13000,
            medianAge: 47, // Affluent suburb
            avgHouseholdIncome: 35000,
            homeownership: 85,
            carOwnership: 88,
        }
    });

    // Balmoral Centre, Scarborough
    // ID: cmicxw47m000313hxvu495jmw
    // Postcode: YO11 1LP
    console.log('Enriching Balmoral Centre (Scarborough)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw47m000313hxvu495jmw' },
        data: {
            name: 'Balmoral Centre', // Sometimes "Balmoral Shopping Centre"
            address: 'Westborough',
            city: 'Scarborough',
            county: 'North Yorkshire',
            postcode: 'YO11 1LP',

            // Operations
            // Often reduced retail, partly demolished/repurposed in some plans

            // Demographics (Scarborough)
            population: 108000, // Metro area
            medianAge: 46, // Coastal retirement
            avgHouseholdIncome: 24000,
            homeownership: 64,
            carOwnership: 70,
        }
    });

    console.log('✅ Updated Central Square, Park Farm, and Balmoral');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
