
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Penicuik Shopping Centre (Midlothian, Scotland)
    // ID: cmicxw4oc001313hxv29miu9o
    // Postcode: EH26 8LE
    console.log('Enriching Penicuik Shopping Centre...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4oc001313hxv29miu9o' },
        data: {
            name: 'Penicuik Storehouse / Shopping Centre', // Often referred to as Storehouse now or Precinct
            address: 'John Street',
            city: 'Penicuik',
            county: 'Midlothian',
            postcode: 'EH26 8LE',

            // Operations
            // Often has B&M, Farmfoods

            // Demographics (Midlothian)
            population: 16000,
            medianAge: 43,
            avgHouseholdIncome: 26000,
            homeownership: 68,
            carOwnership: 75,
        }
    });

    // Eastgate - Ipswich (Carr Street)
    // ID: cmicxw4dl000g13hx18q88n63
    // Postcode: IP4 1HA
    console.log('Enriching Eastgate Shopping Centre (Ipswich)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4dl000g13hx18q88n63' },
        data: {
            name: 'Eastgate Shopping Centre',
            address: 'Carr Street',
            city: 'Ipswich',
            county: 'Suffolk',
            postcode: 'IP4 1HA',

            // Operations
            // Historic centre, often struggled with vacancy

            // Demographics (Ipswich)
            population: 140000,
            medianAge: 39,
            avgHouseholdIncome: 28000,
            homeownership: 60,
            carOwnership: 72,
        }
    });

    console.log('✅ Updated Penicuik and Eastgate (Ipswich)');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
