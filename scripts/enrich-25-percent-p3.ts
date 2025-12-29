import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enrichLocations() {
    console.log('=== ENRICHING 25% COMPLETE LOCATIONS (Part 3) ===\n');

    const updates = [
        {
            name: 'Priory',
            data: {
                footfall: 5000000, // ~5.0m - surprisingly high for 39k sqft!
                totalFloorArea: 39473,
                // Tenants: Sainsbury's, McDonald's, Poundland
                // High footfall density driven by Sainsbury's anchor
            }
        },
        {
            name: 'Park Farm',
            data: {
                totalFloorArea: 165000, // Much larger than it appears
                parkingSpaces: 400, // Free spaces
                population: 60000, // Catchment - wealthy suburb
                // Anchored by Co-op & Boots
                // Significant district centre, not just local parade
            }
        },
        {
            name: 'Parc-t-Lyn Retail Park',
            data: {
                totalFloorArea: 87916,
                parkingSpaces: 266,
                // "Premier Shopping Park" in the region
                // Anchored by B&M and Halfords
            }
        },
        {
            name: 'Penicuik Shopping Centre',
            data: {
                totalFloorArea: 40000, // Est. 35-45k, using midpoint
                // parkingSpaces already set to 96
                // Pedestrianised precinct (John St)
                // Anchored by B&M and Farmfoods
            }
        },
        {
            name: 'Rotherham Retail Park',
            data: {
                totalFloorArea: 60000, // Est. 60k+
                // CRITICAL NOTE: This is "The Foundry" (S60 1RP), NOT "Parkgate" (S60 1TG)
                // Parkgate is 8m visitors, 560k sqft - different location
                // Tenants: The Range, Smyths Toys, Currys
            }
        },
        {
            name: 'Marsh Hythe ',
            data: {
                totalFloorArea: 5000, // Small high street units (500-1000 sq ft each)
                // CORRECTION: Not a shopping centre - refers to "The Marsh" street
                // Anchored by Waitrose, local parade units
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

    console.log('\n🌟 KEY FINDING: Priory Centre has 5M footfall on just 39k sqft - exceptional density!');
    console.log('⚠️  CRITICAL: Rotherham (S60 1RP) is "Foundry Retail Park", NOT Parkgate (S60 1TG)');
    console.log('📍 NOTE: Marsh Hythe is a high street parade, not a shopping centre\n');

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
