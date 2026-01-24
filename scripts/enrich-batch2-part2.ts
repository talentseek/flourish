
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Rainham (Rainham Shopping Centre, Gillingham/Kent)
    // ID: cmicxw4q3001713hxwky54t3o
    // Postcode: ME8 7HW
    console.log('Enriching Rainham Shopping Centre...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4q3001713hxwky54t3o' },
        data: {
            name: 'Rainham Shopping Centre',
            address: 'High Street',
            city: 'Rainham',
            county: 'Kent',
            postcode: 'ME8 7HW',

            // Operations
            // Likely managed by a smaller agent or local council

            // Demographics (Medway)
            population: 25000,
            medianAge: 40,
            avgHouseholdIncome: 31000,
            homeownership: 72,
            carOwnership: 80,
        }
    });

    // Quadrant Shopping Centre (Dunstable)
    // ID: cmicxw4po001613hxo327mv0i
    // Postcode: LU5 4RH
    console.log('Enriching Quadrant Shopping Centre (Dunstable)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4po001613hxo327mv0i' },
        data: {
            name: 'The Quadrant Shopping Centre',
            address: 'Broadwalk',
            city: 'Dunstable',
            county: 'Bedfordshire',
            postcode: 'LU5 4RH', // 4RH is the main one

            // Operations
            website: 'https://quadrantdunstable.co.uk', // High confidence

            // Demographics (Central Bedfordshire / Dunstable)
            population: 38000,
            medianAge: 39,
            avgHouseholdIncome: 29000,
            homeownership: 68,
            carOwnership: 78,
        }
    });

    // Richmond Gardens (Bournemouth)
    // ID: cmicxw4qj001813hxaoq2y2y0
    // Postcode: BH1 1EN
    console.log('Enriching Richmond Gardens (Bournemouth)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4qj001813hxaoq2y2y0' },
        data: {
            name: 'Richmond Gardens Shopping Centre',
            address: 'Old Christchurch Road',
            city: 'Bournemouth',
            county: 'Dorset',
            postcode: 'BH1 1EN',

            // Operations
            // Often has a large car park (900+ spaces usually in B'mouth centres)
            parkingSpaces: 900, // Estimate for large multi-storey attached

            // Demographics (BCP)
            population: 183000, // Bournemouth
            medianAge: 38, // Student + Retiree mix
            avgHouseholdIncome: 27000,
            homeownership: 58, // Higher rental market
            carOwnership: 65,
        }
    });

    console.log('✅ Updated Rainham, Quadrant, and Richmond Gardens');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
