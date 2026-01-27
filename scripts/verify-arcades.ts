
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Verifying Arcades Records...\n");

    // 1. Check the ID that was updated
    const updatedLocation = await prisma.location.findUnique({
        where: { id: 'cmid0kyfx01rymtpulu949ywa' }
    });
    console.log("Updated Record (Expected Port Arcades?):", updatedLocation);

    // 2. Search for "Arcades" (Ashton)
    const ashtonMatches = await prisma.location.findMany({
        where: {
            name: { contains: 'Arcades', mode: 'insensitive' },
            city: { contains: 'Ashton', mode: 'insensitive' }
        }
    });
    console.log("\nAshton-under-Lyne Matches:", ashtonMatches);

    // 3. Search for "Port Arcades"
    const portMatches = await prisma.location.findMany({
        where: {
            name: { contains: 'Port Arcades', mode: 'insensitive' }
        }
    });
    console.log("\nPort Arcades Matches:", portMatches);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
