
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const id = 'cmid0l6v0020nmtpu8iu6nz2k'; // Weston Favell (Winner)
    const loc = await prisma.location.findUnique({
        where: { id },
        include: { _count: { select: { tenants: true } } }
    });
    console.log(`Location: ${loc.name} (${loc.id})`);
    console.log(`Tenant Count: ${loc._count.tenants}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
