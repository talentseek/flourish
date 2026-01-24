
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // The Strand, Bootle
    // ID: cmicxw4vz001j13hx8u2cfpiu
    // Postcode: L20 4SZ
    console.log('Enriching The Strand (Bootle)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4vz001j13hx8u2cfpiu' },
        data: {
            name: 'The Strand Shopping Centre',
            address: '73 The Hexagon',
            city: 'Bootle',
            county: 'Merseyside',
            postcode: 'L20 4SZ',

            // Operations
            website: 'https://strandshoppingcentre.com',
            parkingSpaces: 550,

            // Demographics (Sefton - Bootle is high deprivation)
            population: 32000,
            medianAge: 38,
            avgHouseholdIncome: 21000, // Lower income area
            homeownership: 45,
            carOwnership: 60,
        }
    });

    // Weavers Wharf (Kidderminster)
    // ID: cmicxw4y7001o13hxp4niwnzx
    // Postcode: DY10 1AA
    console.log('Enriching Weavers Wharf (Kidderminster)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4y7001o13hxp4niwnzx' },
        data: {
            name: 'Weavers Wharf Shopping Park',
            address: 'Vicar Street',
            city: 'Kidderminster',
            county: 'Worcestershire',
            postcode: 'DY10 1AA',

            // Operations
            website: 'https://weavers-wharf.com',
            parkingSpaces: 470,

            // Demographics (Wyre Forest)
            population: 55000,
            medianAge: 44, // Older profile
            avgHouseholdIncome: 26000,
            homeownership: 66,
            carOwnership: 78,
        }
    });

    console.log('✅ Updated The Strand and Weavers Wharf');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
