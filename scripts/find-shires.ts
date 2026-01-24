
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const locations = await prisma.location.findMany({
        where: {
            name: { contains: "Shires" } // Trowbridge
        },
        select: {
            id: true,
            name: true,
            city: true,
            postcode: true
        }
    });

    console.log("Found Locations:");
    locations.forEach(loc => {
        console.log(`ID: ${loc.id} | Name: ${loc.name} | City: ${loc.city} | Postcode: ${loc.postcode}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
