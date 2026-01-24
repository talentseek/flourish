
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targets = [
        "Drake Circus",
        "Princes Quay",
        "Golden Square",
        "Overgate",
        "Bon Accord",
        "Union Square",
        "Houndshill",
        "The Lanes",
        "St Johns",
        "Grosvenor",
        "Princesshay",
        "St Stephens"
    ];

    console.log("Searching for Batch 18 Candidates:");
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

    locations.forEach(loc => {
        console.log(`ID: ${loc.id} | Name: ${loc.name} | City: ${loc.city} | Managed: ${loc.isManaged}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
