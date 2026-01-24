
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("📊 Database Statistics Update");

    // 1. Total Locations
    const total = await prisma.location.count();

    // 2. Confirmed Shopping Centres (Explicit Type)
    const officialCentres = await prisma.location.count({
        where: { type: 'SHOPPING_CENTRE' }
    });

    // 3. Retail Parks
    const retailParks = await prisma.location.count({
        where: { type: 'RETAIL_PARK' }
    });

    // 4. Managed (by anyone - marked in 'management' column)
    const managedByData = await prisma.location.count({
        where: { management: { not: null } }
    });

    // 5. Managed (IsManaged flag - Flourish)
    const flourished = await prisma.location.count({
        where: { isManaged: true }
    });

    // 6. Generic "Town Name" Lookups (Heuristic)
    // Locations that don't have "Centre", "Mall", "Park", "Place", "Square", "Walk", "Arcade" in the name
    const all = await prisma.location.findMany({
        select: { id: true, name: true }
    });

    const keywords = ['Centre', 'Center', 'Mall', 'Park', 'Place', 'Square', 'Walk', 'Arcade', 'Court', 'Works', 'Outlet', 'Village', 'Galleria', 'Quarter', 'Gate', 'Circus', 'Parade', 'Gardens', 'Market'];

    let potentialGeneric = 0;
    let explicitNamed = 0;

    all.forEach(l => {
        if (keywords.some(k => l.name.includes(k))) {
            explicitNamed++;
        } else {
            potentialGeneric++;
            // log first 5 generic for context
            if (potentialGeneric <= 5) console.log(`   (Sample Generic: ${l.name})`);
        }
    });

    console.log(`\n--- Summary ---`);
    console.log(`Total Records:          ${total}`);
    console.log(`Explicit 'Shopping Centre' Type: ${officialCentres}`);
    console.log(`Explicit 'Retail Park' Type:     ${retailParks}`);
    console.log(`Explicitly Named (Heuristic):    ${explicitNamed} (e.g. "X Shopping Centre")`);
    console.log(`Potential 'Town Name' Records:   ${potentialGeneric} (e.g. "Abingdon")`);
    console.log(`\n--- Management ---`);
    console.log(`Managed (Data present): ${managedByData} (e.g. Savills)`);
    console.log(`Flourish Managed:       ${flourished}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
