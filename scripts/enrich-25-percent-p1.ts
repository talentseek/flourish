import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enrichLocations() {
    console.log('=== ENRICHING 25% COMPLETE LOCATIONS (Part 1) ===\n');

    const updates = [
        {
            name: 'Armada Way ,Royal Parade,Plymouth',
            data: {
                footfall: 4600000, // 4.6m
                totalFloorArea: 129191,
                parkingSpaces: 376, // 2-storey car park
                numberOfStores: 8, // Anchored by Sainsbury's
            }
        },
        {
            name: 'Billingham, Town Centre',
            data: {
                footfall: 3600000, // ~3.6m (70k/week)
                totalFloorArea: 320000,
                parkingSpaces: 673,
                numberOfStores: 90,
                // Recently purchased by Evolve Estates
                // Functions as open-air regional mall
            }
        },
        {
            name: 'Balmoral Centre, Scarborough',
            data: {
                totalFloorArea: 73437, // Excludes adjacent NCP car park
                parkingSpaces: 480, // Adjacent NCP car park with direct access
                // Previously anchored by Wilko
            }
        },
        {
            name: 'Carters Square',
            data: {
                totalFloorArea: 68241,
                parkingSpaces: 182,
                // Town's prime modern retail pitch, anchored by Asda
            }
        },
        {
            name: 'Armthorpe Shopping centre',
            data: {
                totalFloorArea: 40717,
                numberOfStores: 22,
                // Busy local convenience centre (open air)
            }
        },
        {
            name: 'Bell Walk',
            data: {
                totalFloorArea: 35578,
                numberOfStores: 22,
                // Often listed as "Bell Walk by M" in agent brochures
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
