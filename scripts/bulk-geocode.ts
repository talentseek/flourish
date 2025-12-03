
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getCoordinates(postcodes: string[]) {
    const uniquePostcodes = [...new Set(postcodes.filter(p => p))];
    const results: Record<string, { latitude: number; longitude: number }> = {};

    // Chunk into batches of 100
    const chunkSize = 100;
    for (let i = 0; i < uniquePostcodes.length; i += chunkSize) {
        const chunk = uniquePostcodes.slice(i, i + chunkSize);
        try {
            const response = await fetch('https://api.postcodes.io/postcodes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ postcodes: chunk }),
            });

            if (!response.ok) {
                console.error(`Failed to fetch coordinates for chunk ${i}: ${response.statusText}`);
                continue;
            }

            const data = await response.json();
            if (data.result) {
                data.result.forEach((item: any) => {
                    if (item.result) {
                        results[item.query] = {
                            latitude: item.result.latitude,
                            longitude: item.result.longitude,
                        };
                    }
                });
            }
            // Be nice to the API
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error(`Error fetching coordinates for chunk ${i}:`, error);
        }
    }
    return results;
}

async function main() {
    console.log('🚀 Starting bulk geocoding...');

    // Find locations with missing coordinates (lat=0, lng=0)
    // Note: Prisma Decimal type handling requires care. 
    // We can fetch all and filter, or use raw query if needed.
    // For simplicity, let's fetch all locations where latitude is 0.

    const locations = await prisma.location.findMany({
        where: {
            latitude: { equals: 0 },
            postcode: { not: '' }
        },
        select: {
            id: true,
            postcode: true
        }
    });

    console.log(`Found ${locations.length} locations needing geocoding.`);

    if (locations.length === 0) {
        console.log('No locations to geocode.');
        return;
    }

    const postcodes = locations.map(l => l.postcode);
    const coordinates = await getCoordinates(postcodes);

    console.log(`Resolved coordinates for ${Object.keys(coordinates).length} postcodes.`);

    let updated = 0;
    for (const loc of locations) {
        const coords = coordinates[loc.postcode];
        if (coords) {
            try {
                await prisma.location.update({
                    where: { id: loc.id },
                    data: {
                        latitude: Number(coords.latitude.toFixed(8)),
                        longitude: Number(coords.longitude.toFixed(8))
                    }
                });
                updated++;
                if (updated % 100 === 0) process.stdout.write('.');
            } catch (error) {
                console.error(`\nFailed to update location ${loc.id} (${loc.postcode}):`, error);
            }
        }
    }

    console.log(`\n✅ Updated ${updated} locations with new coordinates.`);
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
