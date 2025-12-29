import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enrichLocations() {
    console.log('=== ENRICHING 31% COMPLETE LOCATIONS ===\n');

    const updates = [
        {
            name: 'Chelmsley Wood',
            data: {
                footfall: 7500000, // 7.5m
                totalFloorArea: 461012,
                parkingSpaces: 686, // Free spaces
                // Future: Key transport hub for HS2; subject of £15m NHS investment
            }
        },
        {
            name: 'One Stop',
            data: {
                footfall: 6400000, // 6.3-6.5m, using midpoint
                totalFloorArea: 380000,
                parkingSpaces: 1225, // Free spaces
                // Ranking: Top 19% of UK retail locations by market size
                // Hybrid asset: part retail park (Asda, M&S Outlet), part covered mall
            }
        },
        {
            name: 'Britten Centre',
            data: {
                footfall: 3300000, // ~3.3m (impacted by car park closure)
                totalFloorArea: 100000,
                // CRITICAL: 330-space multi-storey CLOSED indefinitely since July 2025 due to vandalism
            }
        },
        {
            name: 'Borough Parade',
            data: {
                footfall: 2500000, // Estimated from 321 people/10 mins flow rate
                totalFloorArea: 70000, // Using midpoint of 57-82k
                population: 45000, // Town population
                // Small open-air precinct, tenants: Waitrose, New Look, Waterstones
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

    console.log('\n⚠️  CRITICAL NOTE: Britten Centre car park (330 spaces) CLOSED since July 2025');
    console.log('   Status: Indefinite closure due to vandalism. Impacts current footfall.\n');

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
            console.log(`  Footfall: ${loc.footfall?.toLocaleString()}, FloorArea: ${loc.totalFloorArea?.toLocaleString()} sqft, Parking: ${loc.parkingSpaces}`);
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
