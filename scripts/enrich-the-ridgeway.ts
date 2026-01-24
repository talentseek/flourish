
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const locationId = 'cmicxw4t5001d13hx2pyeqfy3';

    console.log('Enriching The Ridgeway (Plympton)...\n');

    const updatedLocation = await prisma.location.update({
        where: { id: locationId },
        data: {
            name: 'The Ridgeway',
            address: 'The Ridgeway',
            city: 'Plympton',
            county: 'Devon',
            postcode: 'PL7 2ZN',

            // Demographics (Plympton / Plymouth)
            population: 30000,
            medianAge: 42,
            avgHouseholdIncome: 27000,
            homeownership: 68,
            carOwnership: 75,
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
