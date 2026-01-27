
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Counting Retail Parks...');

    const total = await prisma.location.count({
        where: { type: 'RETAIL_PARK' }
    });

    const enriched = await prisma.location.count({
        where: {
            type: 'RETAIL_PARK',
            website: { not: null },
            owner: { not: null }
        }
    });

    const missingWebsite = await prisma.location.count({
        where: {
            type: 'RETAIL_PARK',
            website: null
        }
    });

    console.log(`Total Retail Parks: ${total}`);
    console.log(`Fully Enriched (Website + Owner): ${enriched}`);
    console.log(`Missing Website: ${missingWebsite}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
