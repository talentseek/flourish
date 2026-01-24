
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🛠️ Repairing Headingley Central (Take 2)...");

    const arndale = await prisma.location.findFirst({
        where: { name: 'Arndale Shopping Centre', city: 'West Yorkshire' }
    });

    if (arndale) {
        await prisma.location.update({
            where: { id: arndale.id },
            data: {
                name: 'Headingley Central',
                city: 'Headingley', // Improve city
                website: "https://headingleycentral.com",
                instagram: "https://www.instagram.com/headingleycentral",
                facebook: "https://www.facebook.com/HeadingleyCentral"
            }
        });
        console.log(`✅ Repaired & Enriched ${arndale.name} -> Headingley Central`);
    } else {
        console.log("⚠️ Could not find Arndale (West Yorkshire) record.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
