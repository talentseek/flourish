import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Locations with real shopping centre websites (not placeholders)
const targetLocations = [
    { name: 'Armada Way', website: 'https://armadacentreplymouth.co.uk' },
    { name: 'Mailbox Birmingham', website: 'https://mailboxlife.com' },
    { name: 'Byron Place', website: 'https://byronplace.co.uk' },
    { name: 'Longton Exchange', website: 'https://longtonexchange.co.uk' },
    { name: 'St Martins Walk', website: 'https://stmartinswalk.com' },
    { name: 'The Viking Centre', website: 'https://thevikingcentre.co.uk' },
    { name: 'Weavers Wharf', website: 'https://weavers-wharf.com' },
];

async function getStoreListUrl(baseUrl: string): Promise<string[]> {
    // Common patterns for store directory pages
    const patterns = [
        '/stores',
        '/shops',
        '/directory',
        '/retailers',
        '/tenants',
        '/store-directory',
        '/shop-directory',
        '/our-stores',
        '/our-shops',
        '/all-stores',
        '/brands',
        '/eat-drink',
        '/food-drink',
    ];

    return patterns.map(p => baseUrl.replace(/\/$/, '') + p);
}

async function main() {
    console.log('=== TARGETED AI ENRICHMENT ===\n');
    console.log('Target locations:', targetLocations.length);

    for (const target of targetLocations) {
        const location = await prisma.location.findFirst({
            where: { name: { contains: target.name } },
            include: { _count: { select: { tenants: true } } }
        });

        if (location) {
            console.log(`\n📍 ${location.name}`);
            console.log(`   Website: ${target.website}`);
            console.log(`   Current tenants: ${location._count.tenants}`);

            const urls = await getStoreListUrl(target.website);
            console.log(`   Potential store pages:`);
            urls.slice(0, 5).forEach(u => console.log(`     - ${u}`));
        }
    }

    await prisma.$disconnect();
}

main();
