
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const unenriched = await prisma.location.findMany({
        where: {
            isManaged: true,
            OR: [
                { retailSpace: null },
                { isManaged: true } // Just get all managed for simpler filtering or double check criteria
            ],
            // Actually stricter filter: Managed AND (No Owner OR No Space)
            AND: {
                isManaged: true,
                OR: [{ owner: null }, { retailSpace: null }]
            }
        },
        select: { id: true, name: true, town: true, postcode: true },
        orderBy: { name: 'asc' }
    });

    console.log(`Found ${unenriched.length} unenriched managed locations.`);
    console.log(JSON.stringify(unenriched, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
