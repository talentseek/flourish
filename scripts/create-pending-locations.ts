import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAndEnrichLocations() {
    // Create Priors Hall Park
    console.log('Creating Priors Hall Park...');
    const priorsHall = await prisma.location.create({
        data: {
            name: 'Priors Hall Park',
            type: 'SHOPPING_CENTRE',
            address: 'Priors Hall, Weldon, NN17 3JG',
            city: 'Weldon',
            county: 'Northamptonshire',
            postcode: 'NN17 3JG',
            latitude: 52.5023,
            longitude: -0.6045,
            isManaged: false, // NOT managed yet - awaiting client confirmation
            openingHours: {
                Monday: '07:00-23:00',
                Tuesday: '07:00-23:00',
                Wednesday: '07:00-23:00',
                Thursday: '07:00-23:00',
                Friday: '07:00-23:00',
                Saturday: '07:00-23:00',
                Sunday: '07:00-23:00'
            },
            // Note: Neighbourhood Centre / District Centre for Priors Hall Park residential development
            // Anchored by Sainsbury's Local
        }
    });
    console.log(`✅ Created: ${priorsHall.name} (ID: ${priorsHall.id})`);

    // Create Riverside Shopping Centre Evesham
    console.log('Creating Riverside Shopping Centre (Evesham)...');
    const riverside = await prisma.location.create({
        data: {
            name: 'Riverside Shopping Centre',
            type: 'SHOPPING_CENTRE',
            address: 'Merstow Green, Evesham, WR11 4BD',
            city: 'Evesham',
            county: 'Worcestershire',
            postcode: 'WR11 4BD',
            latitude: 52.0891,
            longitude: -1.9473,
            isManaged: false, // NOT managed yet - awaiting client confirmation
            openingHours: {
                Monday: '07:30-18:30',
                Tuesday: '07:30-18:30',
                Wednesday: '07:30-18:30',
                Thursday: '07:30-18:30',
                Friday: '07:30-18:30',
                Saturday: '07:30-18:30',
                Sunday: '09:30-16:00'
            },
            // Note: Open-air precinct in Evesham, managed by Wychavon Council
            // Surface parking Pay & Display £4/24h
        }
    });
    console.log(`✅ Created: ${riverside.name} (ID: ${riverside.id})`);

    console.log('\n=== SUMMARY ===');
    console.log('Both locations created with isManaged: false');
    console.log('Awaiting client confirmation before marking as managed.');
}

createAndEnrichLocations()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
