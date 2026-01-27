
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Calculate distance between two lat/long points (Haversine formula)
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat1)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d * 1000;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

async function main() {
    console.log("🕵️‍♀️ Starting Forensic Analysis (Target: Touchwood & Distant Twins)...\n");

    // 1. Investigate "Touchwood" specifically
    const touchwoods = await prisma.location.findMany({
        where: { name: { contains: "Touchwood", mode: 'insensitive' } }
    });

    console.log(`Found ${touchwoods.length} 'Touchwood' locations:`);
    for (const t of touchwoods) {
        console.log(`- [${t.id}] ${t.name}`);
        console.log(`  City: ${t.city}, Postcode: ${t.postcode}`);
        console.log(`  Coords: ${t.latitude}, ${t.longitude}`);
        console.log(`  Website: ${t.website}`);
        console.log(`  Managed: ${t.isManaged}`);
        console.log('---');
    }

    if (touchwoods.length >= 2) {
        const dist = getDistanceFromLatLonInM(
            Number(touchwoods[0].latitude), Number(touchwoods[0].longitude),
            Number(touchwoods[1].latitude), Number(touchwoods[1].longitude)
        );
        console.log(`⚠️ Distance between first two Touchwoods: ${(dist / 1000).toFixed(2)} km\n`);
    }

    // 2. Scan for other "Name Twins" with huge distances (> 50km)
    // This helps identifying if "Touchwood" is a systemic issue (e.g. data ingestion error) or isolated.
    const allLocs = await prisma.location.findMany({
        select: { id: true, name: true, latitude: true, longitude: true, postcode: true, city: true }
    });

    console.log("🔎 Scanning for other distant twins (>50km)...");
    let count = 0;
    // Simple naive check for identical normalized names
    const map = new Map<string, typeof allLocs[0]>();

    for (const loc of allLocs) {
        const normName = loc.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normName.length < 5) continue; // Skip short names

        if (map.has(normName)) {
            const twin = map.get(normName)!;
            const dist = getDistanceFromLatLonInM(
                Number(loc.latitude), Number(loc.longitude),
                Number(twin.latitude), Number(twin.longitude)
            );

            if (dist > 50000) { // > 50km
                console.log(`⚠️ DISTANT TWIN: "${loc.name}"`);
                console.log(`   A: ${loc.city} (${loc.postcode})`);
                console.log(`   B: ${twin.city} (${twin.postcode})`);
                console.log(`   Distance: ${(dist / 1000).toFixed(0)} km`);
                console.log('---');
                count++;
            }
        } else {
            map.set(normName, loc);
        }
    }
    console.log(`Found ${count} distant twin pairs.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
