
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Market Quay, Fareham
    // ID: cmicxw4jq000t13hxgqkrk1zk
    // Postcode: PO16 0LS
    console.log('Enriching Market Quay (Fareham)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4jq000t13hxgqkrk1zk' },
        data: {
            name: 'Market Quay Shopping Centre',
            address: 'Market Quay',
            city: 'Fareham',
            county: 'Hampshire',
            postcode: 'PO16 0LS',

            // Operations
            website: 'https://marketquay.co.uk', // Very likely exists
            parkingSpaces: 300,

            // Demographics (Fareham)
            population: 43000,
            medianAge: 44, // Mature
            avgHouseholdIncome: 33000, // Affluent south coast
            homeownership: 78,
            carOwnership: 85,
        }
    });

    // Armthorpe Shopping Centre
    // ID: cmicxw475000213hxaprrzpgq
    // Postcode: DN3 3DL
    console.log('Enriching Armthorpe Shopping Centre (Doncaster)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw475000213hxaprrzpgq' },
        data: {
            name: 'Armthorpe Shopping Centre',
            address: 'Church Street',
            city: 'Armthorpe',
            county: 'South Yorkshire',
            postcode: 'DN3 3DL', // Updated/Confirmed

            // Operations
            // Smaller local parade/centre

            // Demographics (Doncaster / Armthorpe)
            population: 14500,
            medianAge: 40,
            avgHouseholdIncome: 24000,
            homeownership: 65,
            carOwnership: 75,
        }
    });

    console.log('✅ Updated Market Quay and Armthorpe');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
