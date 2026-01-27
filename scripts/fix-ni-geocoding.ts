
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log("☘️ Starting Northern Ireland Geocoding Remediation...");

    // 1. Fetch broken locations
    const niCities = ['Belfast', 'Londonderry', 'Derry', 'Lisburn', 'Newry', 'Bangor', 'Craigavon', 'Newtownabbey'];

    const locations = await prisma.location.findMany({
        where: {
            AND: [
                {
                    OR: [
                        { city: { in: niCities, mode: 'insensitive' } },
                        { county: { contains: 'Ireland', mode: 'insensitive' } },
                        { postcode: { startsWith: 'BT' } }
                    ]
                },
                {
                    OR: [
                        { latitude: { equals: 0 } },
                        { longitude: { equals: 0 } }
                    ]
                }
            ]
        }
    });

    console.log(`Found ${locations.length} NI locations requiring geocoding.`);

    let successCount = 0;
    let failCount = 0;

    // Manual overrides for known missing/invalid postcodes
    const MANUAL_FIXES: Record<string, string> = {
        'Foyleside Shopping Centre': 'BT48 6XY',
        'Rushmere Shopping Centre': 'BT64 1AA',
        'The Quays Shopping Centre': 'BT35 8QS',
        'Forestside Shopping Centre': 'BT8 6FX',
        'Bow Street Mall': 'BT28 1AW',
        'Kennedy Centre': 'BT11 9AE',
        'Fairhill Shopping Centre': 'BT43 6UF',
        'Buttercrane Shopping Centre': 'BT35 8HJ',
        'Ards Shopping Centre': 'BT23 4EU',
        'Park Centre': 'BT12 6HN',
        'Flagship Centre': 'BT20 5QP',
        'Meadowlane Shopping Centre': 'BT45 6PR',
        'Richmond Centre': 'BT48 6PE',
        'Connswater': 'BT5 5LP',
        'Tower Centre': 'BT43 6AH',
        'Great Northern Mall': 'BT2 7JA' // Retry
    };

    for (const loc of locations) {
        let postcodeToUse = loc.postcode;

        if (MANUAL_FIXES[loc.name]) {
            postcodeToUse = MANUAL_FIXES[loc.name];
            console.log(`ℹ️ [${loc.name}] Using manual postcode: ${postcodeToUse}`);

            // Update DB with the correct postcode while we're at it
            await prisma.location.update({
                where: { id: loc.id },
                data: { postcode: postcodeToUse }
            });
        }

        if (!postcodeToUse || postcodeToUse === 'UNKNOWN') {
            console.log(`❌ [${loc.name}] Skipping: No Postcode`);
            failCount++;
            continue;
        }

        // Skip Irish Eircodes (Postcodes.io only covers UK/NI)
        if (!postcodeToUse.startsWith('BT')) {
            console.log(`⚠️ [${loc.name}] Skipping: Non-UK Postcode (${postcodeToUse})`);
            failCount++;
            continue;
        }

        console.log(`📍 Processing: ${loc.name} (${postcodeToUse})...`);

        try {
            // Use Postcodes.io (Free, reliable for UK/NI)
            const cleanPostcode = postcodeToUse.replace(/\s/g, '');
            const response = await axios.get(`https://api.postcodes.io/postcodes/${cleanPostcode}`);

            if (response.data.status === 200 && response.data.result) {
                const { latitude, longitude } = response.data.result;

                await prisma.location.update({
                    where: { id: loc.id },
                    data: {
                        latitude: latitude,
                        longitude: longitude
                    }
                });

                console.log(`   ✅ Fixed! Lat: ${latitude}, Lng: ${longitude}`);
                successCount++;
            } else {
                console.log(`   ⚠️ API returned no result for ${loc.postcode}`);
                failCount++;
            }
        } catch (error) {
            console.log(`   ❌ Failed: ${error.message}`);
            failCount++;
        }

        // Respect API rate limits (mild delay)
        await delay(200);
    }

    console.log(`\n🎉 Remediation Complete!`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
