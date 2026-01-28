
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Exclude enriched
    const unenriched = await prisma.location.findMany({
        where: {
            isManaged: true,
            OR: [{ retailSpace: null }, { owner: null }],
            // Filter out names we know we just processed
            NOT: {
                name: { in: ['Birchwood', 'Carters Square', 'Borough Parade', 'Bowen Square', 'Cascades', 'Castle Quay', 'Cornmill', 'Meridian'] }
            }
        },
        select: { id: true, name: true, town: true },
        take: 15
    });

    console.log(`Batch 2 Candidates (${unenriched.length}):`);
    console.log(JSON.stringify(unenriched, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
