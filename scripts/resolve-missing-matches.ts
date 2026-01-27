
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Check Rutherglen
    const rutherglen = await prisma.location.findMany({
        where: { OR: [{ city: { contains: 'Rutherglen', mode: 'insensitive' } }, { name: { contains: 'Rutherglen', mode: 'insensitive' } }] }
    });
    console.log("Rutherglen Matches:", rutherglen.map(l => `${l.name} (${l.city})`));

    // Check St Cuthberts
    const stc = await prisma.location.findMany({
        where: { name: { contains: 'Cuthbert', mode: 'insensitive' } }
    });
    console.log("St Cuthberts Matches:", stc.map(l => `${l.name} (${l.city})`));

    // Check Avenue (Newton Mearns)
    const avenue = await prisma.location.findMany({
        where: {
            name: { contains: 'Avenue', mode: 'insensitive' },
            city: { contains: 'Newton', mode: 'insensitive' }
        }
    });
    console.log("The Avenue (Newton Mearns) Matches:", avenue.map(l => `${l.name} (${l.city})`));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
