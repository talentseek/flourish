
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Listing ALL Unmanaged Shopping Centres without websites...");

    const locations = await prisma.location.findMany({
        where: {
            isManaged: false,
            type: 'SHOPPING_CENTRE',
            OR: [
                { website: null },
                { website: '' }
            ]
        },
        select: {
            name: true,
            city: true,
            county: true,
            postcode: true
        }
    });

    console.log(`Found ${locations.length} total. Grouping by County:\n`);

    const byCounty: Record<string, any[]> = {};

    for (const loc of locations) {
        const c = loc.county || "UNKNOWN";
        if (!byCounty[c]) byCounty[c] = [];
        byCounty[c].push(`${loc.name} (${loc.city})`);
    }

    // Sort by count
    const sortedCounties = Object.entries(byCounty).sort((a, b) => b[1].length - a[1].length);

    for (const [county, locs] of sortedCounties) {
        console.log(`\n📂 ${county} (${locs.length}):`);
        locs.slice(0, 5).forEach(l => console.log(`   - ${l}`));
        if (locs.length > 5) console.log(`   ...and ${locs.length - 5} more`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
