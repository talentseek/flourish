
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Analyzing Unmanaged Locations...");

    // 1. Count Total
    const total = await prisma.location.count({ where: { isManaged: false } });
    console.log(`Total Unmanaged Locations: ${total}`);

    // 2. Sample Top 50 (by what? Name?)
    // We assume biggest ones might be popular or have data.
    // Let's just grab the first 50 to see what we are dealing with.
    const locations = await prisma.location.findMany({
        where: {
            isManaged: false,
            name: { not: { contains: "Retail Park" } }, // Simple filter
            AND: [
                { name: { not: { contains: "Outlet" } } },
                { name: { not: { contains: "Village" } } }
            ]
        },
        take: 50,
        select: { id: true, name: true, city: true }
    });

    console.log("\nSample Candidates (Non-Retail Park):");
    locations.forEach(loc => console.log(`- ${loc.name} (${loc.city})`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
