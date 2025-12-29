import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enrichLocations() {
    console.log('=== ENRICHING 44% COMPLETE LOCATIONS ===\n');

    const updates = [
        {
            name: 'Lexicon , Bracknell',
            data: {
                footfall: 13700000, // 13.7m in 2023
                totalFloorArea: 1000000, // ~1m sq ft (mixed use)
                // Already has: website, socials
                // Trend: Visitor numbers grew 20% in 2023, now top 30 UK retail destination
            }
        },
        {
            name: 'The Bridges',
            data: {
                footfall: 18000000, // 18m - exceptionally high
                totalFloorArea: 580000, // 560-598k, using midpoint
                // Already has: parking 900, website, socials
                // Key tenants: Primark, Next, TK Maxx
            }
        },
        {
            name: 'Pentagon',
            data: {
                footfall: 11700000, // ~11.7m (225k/week)
                totalFloorArea: 330000,
                // Already has: parking 433, website, socials
                // Dominant retail offer in Chatham, anchors: Sainsbury's, New Look
            }
        },
        {
            name: 'Grosvenor',
            data: {
                footfall: 10000000, // ~10m
                totalFloorArea: 325000,
                googleRating: '3.8',
                // Already has: parking 810, website, socials
                // Tenants: Primark, River Island, The Entertainer
            }
        },
        {
            name: 'The Walnuts',
            data: {
                footfall: 6500000, // ~6.5m
                totalFloorArea: 400000, // 400k total estate (205k pure retail + leisure)
                // Already has: parking 525, website, socials
                // Structure: 205k retail, balance is Odeon/PureGym
            }
        },
        {
            name: 'Birchwood',
            data: {
                footfall: 4700000, // ~4.7m (91k/week)
                totalFloorArea: 400000,
                // Already has: parking 1100, website, socials
                // 100% occupancy, anchors: Asda, Aldi, Sports Direct
            }
        },
        {
            name: 'Killingworth Centre',
            data: {
                footfall: 2500000, // Estimate 2-3m, using midpoint
                totalFloorArea: 103913,
                // Already has: parking 700, website, socials
                // Serves captive catchment anchored by Morrisons
            }
        }
    ];

    for (const update of updates) {
        try {
            const result = await prisma.location.updateMany({
                where: { name: update.name },
                data: update.data
            });

            if (result.count > 0) {
                console.log(`✅ Updated: ${update.name}`);
                Object.entries(update.data).forEach(([key, value]) => {
                    if (typeof value === 'number') {
                        console.log(`   ${key}: ${value.toLocaleString()}`);
                    } else {
                        console.log(`   ${key}: ${value}`);
                    }
                });
            } else {
                console.log(`⚠️  Not found: ${update.name}`);
            }
        } catch (error) {
            console.error(`❌ Error updating ${update.name}:`, error);
        }
    }

    // Show updated enrichment scores
    console.log('\n=== UPDATED ENRICHMENT SCORES ===\n');

    const keyFields = ['heroImage', 'website', 'phone', 'instagram', 'facebook', 'twitter',
        'googleRating', 'googleReviews', 'footfall', 'numberOfStores', 'parkingSpaces', 'totalFloorArea',
        'population', 'medianAge', 'avgHouseholdIncome', 'openingHours'];

    for (const update of updates) {
        const loc = await prisma.location.findFirst({
            where: { name: update.name },
        });
        if (loc) {
            const filled = keyFields.filter(f => loc[f] !== null && loc[f] !== undefined && loc[f] !== '').length;
            const score = Math.round((filled / keyFields.length) * 100);
            console.log(`${loc.name}: ${score}% (${filled}/${keyFields.length} fields)`);
            console.log(`  Footfall: ${loc.footfall?.toLocaleString()}, FloorArea: ${loc.totalFloorArea?.toLocaleString()} sqft`);
        }
    }
}

enrichLocations()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
