
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UPDATES = [
    { name: "Ards Shopping Centre", city: "Newtownards", owner: "Comer Group" },
    { name: "Forestside Shopping Centre", city: "Belfast", owner: "Mussenden Properties Limited (Michael and Lesley Herbert)" },
    { name: "Rushmere Shopping Centre", city: "Craigavon", owner: "Killahoey Ltd (Sheephaven & May Street Capital)" },
    { name: "Carters Square", city: "Uttoxeter", owner: "Evolve Estates (M Core)" },
    { name: "The Shires", city: "Trowbridge", owner: "LCP (M Core)" }
];

async function main() {
    console.log(`🚀 Applying Commercial Data Updates (${UPDATES.length})...`);

    for (const u of UPDATES) {
        const locs = await prisma.location.findMany({
            where: {
                name: { contains: u.name, mode: 'insensitive' },
                city: { contains: u.city, mode: 'insensitive' }
            }
        });

        if (locs.length > 0) {
            console.log(`✅ Updating Owner (${u.name}): ${u.owner}`);
            await prisma.location.update({
                where: { id: locs[0].id },
                data: { owner: u.owner }
            });
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
