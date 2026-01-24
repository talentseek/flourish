
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targets = [
        "Churchill Square",
        "The Glades",
        "Bentall Centre",
        "Southside",
        "County Mall",
        "The Friary",
        "Castle Quay",
        "Eden",
        "Gunwharf Quays"
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

    console.log("Found Batch 16 Locations:");
    locations.forEach(loc => {
        console.log(`ID: ${loc.id} | Name: ${loc.name} | City: ${loc.city}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
