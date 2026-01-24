
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const locationId = 'cmicxw4gi000m13hx9mghuxqm';

    console.log('Enriching Kingsland Centre (Thatcham)...\n');

    const updatedLocation = await prisma.location.update({
        where: { id: locationId },
        data: {
            name: 'Kingsland Centre',
            address: 'The Broadway', // RG19 3HN points here
            city: 'Thatcham',
            county: 'Berkshire',
            postcode: 'RG19 3HN',

            // Demographics (Thatcham / West Berkshire)
            population: 26000,
            medianAge: 41,
            avgHouseholdIncome: 34000,
            homeownership: 70,
            carOwnership: 82,
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
