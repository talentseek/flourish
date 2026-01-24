
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🛠️ Repairing Headingley Central...");

    const arndale = await prisma.location.findFirst({
        where: { name: { contains: 'Arndale' }, city: { contains: 'Headingley' } }
    });

    if (arndale) {
        await prisma.location.update({
            where: { id: arndale.id },
            data: {
                name: 'Headingley Central',
                website: "https://headingleycentral.com",
                instagram: "https://www.instagram.com/headingleycentral",
                facebook: "https://www.facebook.com/HeadingleyCentral"
            }
        });
        console.log(`✅ Repaired & Enriched ${arndale.name} -> Headingley Central`);
    } else {
        console.log("⚠️ Could not find Arndale (Headingley) record to repair.");
        // Try listing all Arndales
        const allArndales = await prisma.location.findMany({ where: { name: { contains: 'Arndale' } } });
        console.log("Found Arndales:", allArndales.map(a => `${a.name} (${a.city})`).join(', '));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
