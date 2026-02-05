import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const swanley = await prisma.location.findFirst({
        where: { name: { contains: 'Swanley' } }
    });
    
    if (swanley) {
        console.log(`Found Swanley: ${swanley.id}`);
        await prisma.location.update({
            where: { id: swanley.id },
            data: { website: "https://www.swanleysquare.co.uk/" }
        });
        console.log("✅ Updated Swanley website.");
    } else {
        console.log("❌ Could not find Swanley in DB.");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
