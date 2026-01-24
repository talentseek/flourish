
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targets = [
        "St James Quarter",
        "St David",
        "Braehead",
        "Silverburn",
        "Cribbs",
        "Cabot Circus",
        "Victoria Centre",
        "East Kilbride",
        "St. Enoch",
        "Victoria Square"
    ];

    const locations = await prisma.location.findMany({
        where: {
            OR: targets.map(t => ({ name: { contains: t } }))
        },
        select: {
            id: true,
            name: true,
            city: true,
            isManaged: true
        }
    });

    console.log("Found Batch 15 Locations:");
    locations.forEach(loc => {
        console.log(`ID: ${loc.id} | Name: ${loc.name} | City: ${loc.city} | Managed: ${loc.isManaged}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
