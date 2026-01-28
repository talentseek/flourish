
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const loc = await prisma.location.findFirst({
        where: { name: { contains: "Grand Arcade", mode: 'insensitive' } }
    });

    if (!loc) {
        console.log("Location not found");
        return;
    }

    console.log(`Enriching ${loc.name}...`);
    
    await prisma.location.update({
        where: { id: loc.id },
        data: {
            owner: "Universities Superannuation Scheme (USS)",
            retailSpace: 475000,
            numberOfStores: 60,
            website: "https://grandarcade.co.uk/",
            isManaged: true
        }
    });

    console.log("Enrichment complete.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
