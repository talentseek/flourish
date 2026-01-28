
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Get all managed locations that still lack key data
    // We filter out ones that have owner AND retailSpace as a proxy for "done"
    // Or we can just list them all and visually check.
    const unenriched = await prisma.location.findMany({
        where: {
            isManaged: true,
            OR: [{ retailSpace: null }, { owner: null }],
            // Add a safety exclude for the ones we KNOW we did, just in case data didn't stick or verify check was loose
            // But better to just see what is actually null in the DB
        },
        select: { id: true, name: true, town: true },
        orderBy: { name: 'asc' }
    });

    console.log(`Batch 3 Candidates (${unenriched.length} remaining):`);
    console.log(JSON.stringify(unenriched, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
