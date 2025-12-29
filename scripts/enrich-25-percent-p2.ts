import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enrichLocations() {
    console.log('=== ENRICHING 25% COMPLETE LOCATIONS (Part 2) ===\n');

    const updates = [
        {
            name: 'Hillsborough Exchange',
            data: {
                footfall: 5200000, // ~5.2m (100k/week) - comparable to 44% group!
                totalFloorArea: 92000,
                // 98% let, anchored by Boots, Wilko, Home Bargains
                // Tram stop directly outside drives high flow
            }
        },
        {
            name: 'Mailbox Birmingham',
            data: {
                totalFloorArea: 600000, // 600k+ sq ft (Mixed Use)
                // parkingSpaces already set to 687 (Q-Park, 24/7)
                // Premier lifestyle destination: BBC HQ, Hotels, Dining
                // Functions differently from standard mall - "experience" focus
            }
        },
        {
            name: 'Eastgate- Ipswich',
            data: {
                totalFloorArea: 112053,
                numberOfStores: 18, // Often attracts value retailers due to lower rents
                // Location: Carr Street
            }
        },
        {
            name: 'Central Square, Maghull',
            data: {
                footfall: 900000, // ~900k (17k/week) - "little and often" destination
                totalFloorArea: 23600, // Core retail area
                // parkingSpaces already set to 235
                // Role: "Focus point" of Maghull town centre
            }
        },
        {
            name: 'Dukes Mill,Romsey',
            data: {
                totalFloorArea: 45000, // 4,189 sq m
                // Structure: Ground floor retail with residential above
                // Tenants: Pets at Home, The Factory Shop
            }
        },
        {
            name: 'Kingsland ,Thatcham',
            data: {
                totalFloorArea: 185000, // 17,200 sq m
                // Status: Subject to major regeneration proposals
                // Anchor: Waitrose (adjacent) drives footfall
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

    console.log('\n🌟 KEY FINDING: Hillsborough Exchange has ~5.2M footfall - comparable to 44% group!');
    console.log('   This asset is performing exceptionally well.\n');

    // Show updated enrichment scores
    console.log('=== UPDATED ENRICHMENT SCORES ===\n');

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
            if (loc.footfall) console.log(`  Footfall: ${loc.footfall.toLocaleString()}`);
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
