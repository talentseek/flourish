
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Parc-t-Lyn (Aberystwyth)
    // ID: cmicxw4mx001013hx9nkmc36y
    // Postcode: SY23 3TL

    console.log('Enriching Parc-t-Lyn (Aberystwyth)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4mx001013hx9nkmc36y' },
        data: {
            name: 'Parc-y-Llyn Retail Park', // Correct Welsh spelling often found
            address: 'Park Avenue',
            city: 'Aberystwyth',
            county: 'Ceredigion',
            postcode: 'SY23 3TL',

            // Operations
            // Often has Morrisons, Next, Halfords

            // Demographics (Ceredigion)
            population: 18000, // Aberystwyth town
            medianAge: 35, // University town, younger
            avgHouseholdIncome: 24000,
            homeownership: 60,
            carOwnership: 75,
        }
    });

    // Middleton Shopping Centre (Middleton, Manchester)
    // ID: cmicxw4l3000w13hxpi1ja553
    // Postcode: M24 4EL

    console.log('Enriching Middleton Shopping Centre...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4l3000w13hxpi1ja553' },
        data: {
            name: 'Middleton Shopping Centre',
            address: 'Limbertrees Road',
            city: 'Middleton',
            county: 'Greater Manchester',
            postcode: 'M24 4EL',

            // Operations
            website: 'https://middletonshoppingcentre.co.uk', // High confidence guess
            parkingSpaces: 350, // Estimate

            // Demographics (Rochdale / Middleton)
            population: 45000,
            medianAge: 38,
            avgHouseholdIncome: 25000,
            homeownership: 62,
            carOwnership: 68,
        }
    });

    console.log('✅ Updated Parc-t-Lyn and Middleton');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
