
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Restoring wrongly merged locations...');

    // 1. Restore Trafford Retail Park
    const traffordRetailPark = await prisma.location.create({
        data: {
            name: 'Trafford Retail Park',
            postcode: 'M41 7FN',
            town: 'Manchester',
            street: 'Neary Way',
            latitude: 53.468,
            longitude: -2.338,
            website: 'https://completelyretail.co.uk/scheme/Trafford-Retail-Park-Trafford',
            isManaged: false,
            type: 'RETAIL_PARK',
            address: 'Neary Way, Manchester, M41 7FN', // Required field
            city: 'Manchester', // Required field
            county: 'Greater Manchester' // Required field
        }
    });
    console.log(`Restored: ${traffordRetailPark.name} (${traffordRetailPark.id})`);

    // 2. Restore Metro Park West
    const metroParkWest = await prisma.location.create({
        data: {
            name: 'Metro Park West',
            postcode: 'NE11 9XS',
            town: 'Gateshead',
            street: 'Metro Park West',
            latitude: 54.958,
            longitude: -1.670,
            website: null,
            isManaged: false,
            type: 'RETAIL_PARK',
            address: 'Metro Park West, Gateshead, NE11 9XS',
            city: 'Gateshead',
            county: 'Tyne and Wear'
        }
    });
    console.log(`Restored: ${metroParkWest.name} (${metroParkWest.id})`);

    // 3. Restore White City Retail Park
    const whiteCity = await prisma.location.create({
        data: {
            name: 'White City Retail Park',
            postcode: 'M16 0RP',
            town: 'Manchester',
            street: 'Chester Road',
            latitude: 53.460,
            longitude: -2.285,
            website: 'https://whitecityretailpark.co.uk',
            isManaged: false,
            type: 'RETAIL_PARK',
            address: 'Chester Road, Manchester, M16 0RP',
            city: 'Manchester',
            county: 'Greater Manchester'
        }
    });
    console.log(`Restored: ${whiteCity.name} (${whiteCity.id})`);

}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
