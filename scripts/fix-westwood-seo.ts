import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const location = await prisma.location.findFirst({
        where: { name: { contains: 'Westwood Cross' } }
    });

    if (!location) {
        console.log('Not found');
        return;
    }

    // Update with proper object structure for SEO data
    await prisma.location.update({
        where: { id: location.id },
        data: {
            seoKeywords: [
                { keyword: 'westwood cross', position: 1, volume: 2900 },
                { keyword: 'shopping thanet', position: 3, volume: 880 },
                { keyword: 'cinema broadstairs', position: 2, volume: 720 },
                { keyword: 'shops in margate', position: 5, volume: 590 },
                { keyword: 'primark thanet', position: 4, volume: 480 }
            ],
            topPages: [
                { url: '/shops', traffic: 12500, percentage: 35 },
                { url: '/dining', traffic: 8200, percentage: 23 },
                { url: '/cinema', traffic: 6800, percentage: 19 },
                { url: '/opening-hours', traffic: 4500, percentage: 13 },
                { url: '/jobs', traffic: 3600, percentage: 10 }
            ]
        }
    });

    console.log('✅ SEO data updated with proper object format');
}

main().catch(console.error).finally(() => prisma.$disconnect());
