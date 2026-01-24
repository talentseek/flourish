
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const locationId = 'cmicxw4ko000v13hxb5gyxosb';

    console.log('Enriching Marsh Hythe...\n');

    const updatedLocation = await prisma.location.update({
        where: { id: locationId },
        data: {
            name: 'The Marsh Centre', // Likely correct name
            address: 'Pylewell Road', // Based on postcode SO45 6AL
            city: 'Hythe',
            county: 'Hampshire',
            postcode: 'SO45 6AL',

            // Demographics (Hythe / New Forest) - Estimates
            population: 20500,
            medianAge: 48, // Older population
            avgHouseholdIncome: 29000,
            homeownership: 75,
            carOwnership: 80,
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
