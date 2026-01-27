
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔧 Fixing Arcades Mismatch...\n");

    // 1. Correct Port Arcades (Ellesmere Port)
    // ID from previous verification: cmid0kyfx01rymtpulu949ywa
    const portArcades = await prisma.location.update({
        where: { id: 'cmid0kyfx01rymtpulu949ywa' },
        data: { website: 'https://www.port-arcades.co.uk/' }
    });
    console.log("✅ Fixed Port Arcades:", portArcades.name, "->", portArcades.website);

    // 2. Correct Arcades Shopping Centre (Ashton-under-Lyne)
    // Find it by name (strict) and location hint (City/County swapped issue)
    const ashtonArcades = await prisma.location.findFirst({
        where: {
            name: { equals: 'Arcades Shopping Centre', mode: 'insensitive' },
            // It has city='Greater Manchester' or county='Ashton' usually
        }
    });

    if (ashtonArcades) {
        await prisma.location.update({
            where: { id: ashtonArcades.id },
            data: { website: 'https://arcadesshopping.co.uk/' }
        });
        console.log("✅ Fixed Arcades Shopping Centre (Ashton):", ashtonArcades.name, "-> https://arcadesshopping.co.uk/");
    } else {
        console.log("❌ Could not find 'Arcades Shopping Centre' (Ashton) record.");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
