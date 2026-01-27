
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const outlets = await prisma.location.findMany({
        where: {
            type: 'OUTLET_CENTRE' // Assuming this is the enum value - checking via grep next if this fails again, but fixing syntax first
        },
        select: {
            id: true,
            name: true,
            city: true,
            website: true,
            owner: true,
            parkingSpaces: true,
            openingHours: true
        },
        orderBy: { name: 'asc' }
    });

    console.log(`Found ${outlets.length} Outlet Centres.`);

    console.table(outlets.map(o => ({
        name: o.name,
        city: o.city,
        hasWebsite: !!o.website,
        hasOwner: !!o.owner,
        hasParking: o.parkingSpaces != null,
        hasHours: o.openingHours != null
    })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
