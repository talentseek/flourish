
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log("🌍 Starting Global Geocoding Remediation...");

    const locations = await prisma.location.findMany({
        where: {
            AND: [
                // Postcode filtering handled in JS to avoid Prisma Type errors
                // Must NOT have valid coordinates
                {
                    OR: [
                        { latitude: { equals: 0 } },
                        { longitude: { equals: 0 } }
                    ]
                }
            ]
        }
    });

    // Filter in JS for length > 3 to be safe
    const targetLocations = locations.filter(l => l.postcode && l.postcode.length > 3);

    console.log(`Found ${targetLocations.length} locations with postcodes requiring geocoding.`);

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (const loc of targetLocations) {
        const cleanPostcode = loc.postcode!.replace(/\s/g, '').toUpperCase();

        // Basic validation
        if (cleanPostcode === 'UNKNOWN' || cleanPostcode.length < 4) {
            skippedCount++;
            continue;
        }

        console.log(`📍 Processing: ${loc.name} (${cleanPostcode})...`);

        try {
            const response = await axios.get(`https://api.postcodes.io/postcodes/${cleanPostcode}`);

            if (response.data.status === 200 && response.data.result) {
                const { latitude, longitude } = response.data.result;

                if (!latitude || !longitude) {
                    console.log(`   ⚠️ API returned null coordinates for ${cleanPostcode}`);
                    failCount++;
                    continue;
                }

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
                console.log(`   ⚠️ API returned no result for ${cleanPostcode}`);
                failCount++;
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                console.log(`   ⚠️ Postcode not found: ${cleanPostcode}`);
            } else {
                console.log(`   ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
            failCount++;
        }

        // Respect API rate limits (mild delay)
        await delay(100);
    }

    console.log(`\n🎉 Remediation Complete!`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`⏭️ Skipped: ${skippedCount}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
