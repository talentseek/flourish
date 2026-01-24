
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targets = [
        "Trafford Centre",
        "Metrocentre",
        "Manchester Arndale",
        "Meadowhall",
        "Bullring",
        "Merry Hill",
        "Liverpool ONE",
        "White Rose",
        "Trinity Leeds",
        "Eldon Square"
    ];

    const locations = await prisma.location.findMany({
        where: {
            OR: targets.map(t => ({ name: { contains: t } }))
        },
        select: {
            id: true,
            name: true,
            city: true,
            postcode: true,
            isManaged: true
        }
    });

    console.log("Found Batch 14 Locations:");
    locations.forEach(loc => {
        console.log(`ID: ${loc.id} | Name: ${loc.name} | City: ${loc.city} | Managed: ${loc.isManaged}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
