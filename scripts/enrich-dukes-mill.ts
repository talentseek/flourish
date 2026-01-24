
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const locationId = 'cmicxw4d4000f13hxhc1258ls';

    console.log('Enriching Dukes Mill, Romsey...\n');

    const updatedLocation = await prisma.location.update({
        where: { id: locationId },
        data: {
            name: 'Dukes Mill',
            address: 'Broadwater Road', // Dukes Mill is on Broadwater Road
            city: 'Romsey',
            postcode: 'SO51 8PJ',

            // Operations
            // Owner unknown
            // Hours unknown

            // Demographics (Romsey / Test Valley) - Estimates
            population: 19500, // Romsey Town
            medianAge: 46, // Older demographic
            avgHouseholdIncome: 32000, // Affluent market town
            homeownership: 72, // High 
            carOwnership: 85, // High

            // lastEnriched removed as not in schema
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
    console.log('   - Name cleaned');
    console.log('   - Address updated');
    console.log('   - Demographics (Estimated) added');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
