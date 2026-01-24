
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Carters Square (Uttoxeter)
    // ID: cmicxw4bb000b13hxtqri0usu
    // Postcode: ST14 7FN
    console.log('Enriching Carters Square (Uttoxeter)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4bb000b13hxtqri0usu' },
        data: {
            name: 'Carters Square',
            address: 'Carters Square',
            city: 'Uttoxeter',
            county: 'Staffordshire',
            postcode: 'ST14 7FN',

            // Operations
            // Smaller centre

            // Demographics (East Staffordshire)
            population: 13000,
            medianAge: 42,
            avgHouseholdIncome: 28000,
            homeownership: 70,
            carOwnership: 82,
        }
    });

    // Windsor Royal (Windsor)
    // ID: cmicxw4zk001r13hxqcet4qy7
    // Postcode: SL4 1RH -> Windsor Royal Station
    console.log('Enriching Windsor Royal Station...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4zk001r13hxqcet4qy7' },
        data: {
            name: 'Windsor Royal Station',
            address: '5 Goswell Hill',
            city: 'Windsor',
            county: 'Berkshire',
            postcode: 'SL4 1RH',

            // Operations
            website: 'https://windsorroyalstation.co.uk',

            // Demographics (Windsor & Maidenhead)
            population: 32000,
            medianAge: 41,
            avgHouseholdIncome: 45000, // Very high
            homeownership: 68,
            carOwnership: 80,
            // tourismScore removed
        }
    });

    // Naunton Fitzwarren Taunton (Likely "Norton Fitzwarren")
    // ID: cmicxw4lk000x13hx8bf5dx9q
    // Postcode: TA2 6NS
    console.log('Enriching Norton Fitzwarren (Taunton)...\n');
    await prisma.location.update({
        where: { id: 'cmicxw4lk000x13hx8bf5dx9q' },
        data: {
            name: 'Norton Fitzwarren Retail Centre',
            address: 'Station Road', // General
            city: 'Taunton',
            county: 'Somerset',
            postcode: 'TA2 6NS',

            // Operations
            // Smaller local

            // Demographics (Taunton Deane)
            population: 3000,
            medianAge: 43,
            avgHouseholdIncome: 29000,
            homeownership: 72,
            carOwnership: 85,
        }
    });

    console.log('✅ Updated Carters, Windsor, and Norton Fitzwarren');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
