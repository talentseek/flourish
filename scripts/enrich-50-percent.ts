import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enrichLocations() {
    console.log('=== ENRICHING 50-99% COMPLETE LOCATIONS ===\n');

    const updates = [
        {
            name: 'Highcross',
            data: {
                footfall: 16000000, // ~14.7-18m, using midpoint
                totalFloorArea: 1200000, // 1.2 million sq ft
                numberOfStores: 140,
                // Parking already set to 3000
            }
        },
        {
            name: 'Marlands',
            data: {
                footfall: 5700000, // Already correct
                totalFloorArea: 220000, // Already correct
                // Note: Secondary shopper profile vs Westquay, avg spend £40.79
            }
        },
        {
            name: 'Byron Place Shopping Centre',
            data: {
                footfall: 2400000, // 2.4m (not the 11m portfolio figure)
                totalFloorArea: 115378,
                // Already has: parking 358, stores 15
            }
        },
        {
            name: 'Heart',
            data: {
                footfall: 4680000, // ~4.7m (90k/week)
                totalFloorArea: 260000,
                parkingSpaces: 800, // Updated from 700
                numberOfStores: 59, // Including 7 restaurants
            }
        },
        {
            name: 'Longton Exchange',
            data: {
                footfall: 2000000, // ~2.0m
                totalFloorArea: 170000, // Estimated 150-180k
                numberOfStores: 60, // Based on unit counts
                // Already has: parking 213
            }
        },
        {
            name: 'Woolshops',
            data: {
                footfall: 5200000, // ~5.2m
                totalFloorArea: 250000, // 250,000+ sq ft
                // Already has: parking 320, stores 40
                // Note: Footfall up 4.6% year-on-year in late 2025
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
                    console.log(`   ${key}: ${value}`);
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
            console.log(`  Footfall: ${loc.footfall?.toLocaleString()}, FloorArea: ${loc.totalFloorArea?.toLocaleString()} sqft, Stores: ${loc.numberOfStores}`);
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
