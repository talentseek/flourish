
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targetNames = [
    "Beacon Place",
    "Dukes Mill,Romsey",
    "Marsh Hythe", // Note: The name in the list might be "Marsh Hythe" or similar
    "The Ridgeway", // Plympton might be part of address
    "Kingsland" // Thatcham might be part of address
];

async function main() {
    const locations = await prisma.location.findMany({
        where: {
            isManaged: true,
            OR: [
                { name: { contains: "Beacon Place" } },
                { name: { contains: "Dukes Mill" } },
                { name: { contains: "Marsh" } }, // Broader search for Marsh Hythe
                { name: { contains: "Ridgeway" } },
                { name: { contains: "Kingsland" } }
            ]
        },
        select: {
            id: true,
            name: true,
            address: true,
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
