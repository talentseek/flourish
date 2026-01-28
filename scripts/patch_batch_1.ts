
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Patching skipped locations...');

    // 1. Cornmill Centre
    // DB: Cornmill Centre (cmksfw8b10004ivpajuj6k4br)
    // Data: Owner NewRiver, 220k sq ft
    await prisma.location.update({
        where: { id: 'cmksfw8b10004ivpajuj6k4br' },
        data: {
            owner: "NewRiver Retail",
            retailSpace: 220000,
            numberOfStores: 50,
            website: "https://cornmillcentre.co.uk/",
            isManaged: true
        }
    });

    // 2. The Meridian Centre (Havant)
    // DB: The Meridian Centre (cmid0l43501xrmtpumkjthiso) OR Meridian Centre (cmid0kwp101q3mtpumdp0x5r8)?
    // Let's standardise the name to "The Meridian Shopping Centre" for the one in Havant
    // Check postcode or town if possible, but based on search 'Havant' was the target.
    // Assuming 'cmid0l43501xrmtpumkjthiso' is likely it. Let's update both just in case or check town.

    const meridian = await prisma.location.findFirst({
        where: { name: 'The Meridian Centre', town: { contains: 'Havant', mode: 'insensitive' } }
    });

    if (meridian) {
        await prisma.location.update({
            where: { id: meridian.id },
            data: {
                name: "Meridian Shopping Centre",
                owner: "Callander Properties",
                retailSpace: 113662,
                website: "https://meridianshoppingcentre.com/",
                isManaged: true
            }
        });
        console.log(`Patched Meridian (${meridian.id})`);
    } else {
        // Try finding by name only if town matches logic unavailable in script context easily
        console.log('Could not pinpoint Meridian Havant safely.');
    }

    console.log("Patch complete.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
