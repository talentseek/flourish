
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking Eastbourne...");
    const locs = await prisma.location.findMany({
        where: { city: "Eastbourne" }
    });

    if (locs.length === 0) {
        console.log("No locations found in Eastbourne.");
    } else {
        locs.forEach(l => console.log(`- ${l.name} (${l.id})`));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
