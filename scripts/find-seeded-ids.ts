
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targets = [
        "St David's Dewi Sant",
        "East Kilbride Shopping Centre",
        "The Mall at Cribbs Causeway",
        "Victoria Square"
    ];

    const locations = await prisma.location.findMany({
        where: {
            OR: targets.map(t => ({ name: { contains: t } }))
        },
        select: {
            id: true,
            name: true,
            city: true
        }
    });

    console.log("Found Seeded Locations:");
    locations.forEach(loc => {
        console.log(`ID: ${loc.id} | Name: ${loc.name} | City: ${loc.city}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
