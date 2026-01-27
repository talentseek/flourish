
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNI() {
    const niCities = ['Belfast', 'Londonderry', 'Derry', 'Lisburn', 'Newry', 'Bangor', 'Craigavon', 'Newtownabbey'];

    // Check by City
    const locations = await prisma.location.findMany({
        where: {
            OR: [
                { city: { in: niCities, mode: 'insensitive' } },
                { county: { contains: 'Ireland', mode: 'insensitive' } }, // Check for 'Northern Ireland' in county
                { postcode: { startsWith: 'BT' } } // BT is the postcode area for Northern Ireland
            ]
        },
        select: {
            id: true,
            name: true,
            city: true,
            county: true,
            postcode: true,
            latitude: true,
            longitude: true,
            isManaged: true,
            type: true
        }
    });

    console.log(`Found ${locations.length} potential Northern Ireland locations.`);

    const invalidCoords = locations.filter(l => !l.latitude || !l.longitude || Number(l.latitude) === 0);
    console.log(`${invalidCoords.length} have invalid/missing coordinates.`);

    console.log("\nSample Locations:");
    locations.slice(0, 5).forEach(l => {
        console.log(`- ${l.name} (${l.city}, ${l.county}) [${l.postcode}]`);
        console.log(`  Lat: ${l.latitude}, Lng: ${l.longitude}, Managed: ${l.isManaged}`);
    });
}

checkNI()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
