
import { PrismaClient, LocationType } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface RawLocation {
    Location: string
    Postcode: string | null
    "Regional Manager": string | null
    "RM Email": string | null
    "RM Tel:": string | null
    "First line address": string | null
    "Town ": string | null
    "County": string | null
    "On website": string | null
    "Fund": string | null
    "Asset Manager": string | null
    "Platform ": string | null
    "Electric Cars": string | null
    "Car Displays": string | null
    "Cars - Internal": string | null
    "Anchor Stores": string | null
    "Footfall": string | null
    "Posters Y/N": string | null
    "Sizes": string | null
    "RM Telephone": string | null
    "Supermarket": string | null
    "CARS": string | null
    "Media Screens Int": string | null
    "Mscreen Ex": string | null
}

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
        } catch (error) {
            console.error(`Error fetching coordinates for chunk ${i}:`, error);
        }
    }
    return results;
}

function parseFootfall(footfall: string | null): number | null {
    if (!footfall) return null;

    const lower = footfall.toLowerCase();
    const clean = lower.replace(/,/g, '');
    const match = clean.match(/([\d.]+)/);
    if (!match) return null;

    let val = parseFloat(match[1]);

    // Check for multipliers, ensuring we don't match words like "month" or "week"
    // We'll check if 'm' or 'k' exists and is NOT part of the time period words
    const isMillion = /[\d.]+\s*m(?!onth)/.test(clean) || (clean.includes('m') && !clean.includes('month') && !clean.includes('mile'));
    const isThousand = /[\d.]+\s*k/.test(clean) || (clean.includes('k') && !clean.includes('week'));

    if (isMillion) val *= 1000000;
    else if (isThousand) val *= 1000;

    // Time period adjustments
    if (lower.includes('month')) val *= 12;
    else if (lower.includes('week')) val *= 52;

    return Math.round(val);
}

function countAnchorTenants(anchors: string | null): number {
    if (!anchors) return 0;
    return anchors.split(',').length;
}

async function main() {
    const jsonPath = path.join(process.cwd(), 'scripts', 'locations.json');
    const rawData: RawLocation[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    console.log(`Found ${rawData.length} locations in JSON.`);

    const postcodes = rawData.map(l => l.Postcode).filter((p): p is string => !!p);
    console.log(`Fetching coordinates for ${postcodes.length} postcodes...`);

    const coordinates = await getCoordinates(postcodes);
    console.log(`Resolved coordinates for ${Object.keys(coordinates).length} postcodes.`);

    // console.log('Clearing existing locations...');
    // await prisma.location.deleteMany();

    for (const loc of rawData) {
        if (!loc.Location) continue;

        const coords = loc.Postcode ? coordinates[loc.Postcode] : null;

        // Determine type based on some heuristics or default to SHOPPING_CENTRE
        let type: LocationType = LocationType.SHOPPING_CENTRE;
        if (loc.Location.toLowerCase().includes('retail park')) type = LocationType.RETAIL_PARK;
        else if (loc.Location.toLowerCase().includes('outlet')) type = LocationType.OUTLET_CENTRE;

        // Construct address
        const addressParts = [
            loc["First line address"],
            loc["Town "],
            loc.Postcode
        ].filter(Boolean).join(', ');

        const data = {
            name: loc.Location,
            type: type,
            address: addressParts || loc.Location, // Fallback
            city: loc["Town "] || '',
            county: loc.County || '',
            postcode: loc.Postcode || '',
            latitude: coords ? coords.latitude : 0,
            longitude: coords ? coords.longitude : 0,
            phone: loc["RM Tel:"] ? String(loc["RM Tel:"]) : (loc["RM Telephone"] ? String(loc["RM Telephone"]) : null),
            website: loc["On website"] === 'Yes' ? 'https://thisisflourish.co.uk' : null,
            footfall: parseFootfall(loc.Footfall),
            anchorTenants: countAnchorTenants(loc["Anchor Stores"]),
            owner: loc["Fund"],
            management: loc["Asset Manager"],
            evCharging: loc["Electric Cars"]?.toLowerCase().includes('y') || false,
            isManaged: true, // Mark as managed
        };

        // Try to find existing location by name and postcode (fuzzy match)
        // or just name if postcode is missing
        const existing = await prisma.location.findFirst({
            where: {
                name: { equals: loc.Location, mode: 'insensitive' },
                ...(loc.Postcode ? { postcode: loc.Postcode } : {})
            }
        });

        if (existing) {
            console.log(`Updating managed location: ${loc.Location}`);
            await prisma.location.update({
                where: { id: existing.id },
                data: {
                    ...data,
                    // Preserve existing lat/long if we don't have new ones and existing ones are valid
                    latitude: (coords && coords.latitude) ? coords.latitude : existing.latitude,
                    longitude: (coords && coords.longitude) ? coords.longitude : existing.longitude,
                }
            });
        } else {
            console.log(`Creating new managed location: ${loc.Location}`);
            await prisma.location.create({
                data: data
            });
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
