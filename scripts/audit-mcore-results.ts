
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Auditing M Core Results...");

    // Check New Creations for potential duplicates
    // "The Gyle" vs "Gyle Shopping Centre"
    const gyle = await prisma.location.findMany({ where: { name: { contains: 'Gyle' } } });
    gyle.forEach(l => console.log(`Gyle: ${l.name} (${l.management})`));

    // "The Galleries" (Washington) vs "The Galleries Shopping Centre"
    const galleries = await prisma.location.findMany({ where: { name: { contains: 'Galleries' } } });
    galleries.forEach(l => console.log(`Galleries: ${l.name} (${l.management} - ${l.city})`));

    // "Three Spires" vs existing?
    const spires = await prisma.location.findMany({ where: { name: { contains: 'Spires' } } });
    spires.forEach(l => console.log(`Spires: ${l.name} (${l.management} - ${l.city})`));

    // "Piazza Centre" (Paisley)
    const piazza = await prisma.location.findMany({ where: { name: { contains: 'Piazza' } } });
    piazza.forEach(l => console.log(`Piazza: ${l.name} (${l.management} - ${l.city})`));

    // "Central 12" (Southport)
    const central12 = await prisma.location.findMany({ where: { name: { contains: 'Central 12' } } });
    central12.forEach(l => console.log(`Central 12: ${l.name} (${l.management})`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
