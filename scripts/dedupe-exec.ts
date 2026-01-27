
import { PrismaClient, Location } from '@prisma/client';
import { URL } from 'url';

const prisma = new PrismaClient();

// --- Reuse Logic from dedupe-website.ts ---
const MAX_DISTANCE_FOR_SHARED_URL_METERS = 5000;
const NAME_SIMILARITY_THRESHOLD = 5;

function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return -1;
    var R = 6371;
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat1)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

function normalizeUrl(urlStr: string | null): string | null {
    if (!urlStr) return null;
    try {
        let u = urlStr.trim().toLowerCase();
        if (!u.startsWith('http')) u = 'https://' + u;
        const parsed = new URL(u);
        let hostname = parsed.hostname.replace(/^www\./, '');
        let pathname = parsed.pathname.replace(/\/$/, '');
        if (pathname === '/') pathname = '';
        return `${hostname}${pathname}`;
    } catch (e) {
        return null;
    }
}

function normalizeName(name: string): string {
    return name.toLowerCase()
        .replace(/\b(the|shopping|centre|center|mall|park|retail)\b/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
}

function levenshtein(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
}

function calculateEnrichmentScore(loc: Location): number {
    let score = 0;
    if (loc.facebook || loc.instagram || loc.twitter) score += 5;
    if (loc.management || loc.managementEmail) score += 3;
    if (loc.phone) score += 1;
    if (loc.latitude && Number(loc.latitude) !== 0) score += 2;
    return score;
}

// --- Execution Logic ---

async function mergeLocations(survivor: Location, victims: Location[]) {
    console.log(`\n🔄 Merging into Survivor: ${survivor.name} (${survivor.id})`);

    // 1. Update Survivor fields from Victims if null
    const updates: any = {};
    const fields = [
        'address', 'city', 'county', 'postcode', 'phone', 'website',
        'openingHours', 'parkingSpaces', 'totalFloorArea', 'numberOfStores',
        'numberOfFloors', 'anchorTenants', 'publicTransit', 'owner',
        'management', 'managementContact', 'managementEmail', 'managementPhone',
        'openedYear', 'heroImage', 'facebook', 'instagram', 'twitter',
        'youtube', 'tiktok', 'googleRating', 'googleReviews', 'googleVotes'
    ];

    for (const victim of victims) {
        for (const field of fields) {
            // @ts-ignore
            if ((survivor[field] === null || survivor[field] === 0 || survivor[field] === '') &&
                // @ts-ignore
                (victim[field] !== null && victim[field] !== 0 && victim[field] !== '')) {
                // @ts-ignore
                updates[field] = victim[field];
            }
        }
    }

    if (Object.keys(updates).length > 0) {
        console.log(`   📝 Updating survivor fields: ${Object.keys(updates).join(', ')}`);
        await prisma.location.update({
            where: { id: survivor.id },
            data: updates
        });
    } else {
        console.log(`   Example: No fields needed update.`);
    }

    // 2. Handle Tenants & Delete Victims
    for (const victim of victims) {
        console.log(`   🗑️ Processing Victim: ${victim.name} (${victim.id})`);

        // Check Tenants
        const victimTenants = await prisma.tenant.findMany({ where: { locationId: victim.id } });
        if (victimTenants.length > 0) {
            console.log(`      Found ${victimTenants.length} tenants.`);
            for (const vt of victimTenants) {
                // Check collision
                const exists = await prisma.tenant.findUnique({
                    where: {
                        locationId_name: {
                            locationId: survivor.id,
                            name: vt.name
                        }
                    }
                });

                if (exists) {
                    console.log(`      ⚠️ Collision on tenant "${vt.name}". Deleting victim copy.`);
                    await prisma.tenant.delete({ where: { id: vt.id } });
                } else {
                    console.log(`      ✅ Moving tenant "${vt.name}".`);
                    await prisma.tenant.update({
                        where: { id: vt.id },
                        data: { locationId: survivor.id }
                    });
                }
            }
        }

        // Delete Victim Location
        await prisma.location.delete({ where: { id: victim.id } });
        console.log(`      ❌ Deleted victim location.`);
    }
}

async function main() {
    console.log("🚀 Starting Deduplication Execution...");

    const locations = await prisma.location.findMany({
        where: { website: { not: null } }
    });
    console.log(`Loaded ${locations.length} locations with websites.`);

    const urlMap = new Map<string, Location[]>();
    for (const loc of locations) {
        const norm = normalizeUrl(loc.website!);
        if (!norm) continue;
        if (!urlMap.has(norm)) urlMap.set(norm, []);
        urlMap.get(norm)!.push(loc);
    }

    let groupsFound = 0;

    for (const [url, locs] of urlMap.entries()) {
        if (locs.length < 2) continue;

        let pool = [...locs];

        while (pool.length > 0) {
            const seed = pool.shift()!;
            const cluster = [seed];

            for (let i = pool.length - 1; i >= 0; i--) {
                const candidate = pool[i];
                let isCompatible = false;

                const dist = getDistanceFromLatLonInM(
                    Number(seed.latitude), Number(seed.longitude),
                    Number(candidate.latitude), Number(candidate.longitude)
                );

                if (dist !== -1 && dist < MAX_DISTANCE_FOR_SHARED_URL_METERS) {
                    isCompatible = true;
                } else if (dist === -1) {
                    if (seed.city && candidate.city && seed.city.toLowerCase() === candidate.city.toLowerCase()) {
                        isCompatible = true;
                    }
                }

                if (!isCompatible) {
                    const normA = normalizeName(seed.name);
                    const normB = normalizeName(candidate.name);
                    if (levenshtein(normA, normB) <= NAME_SIMILARITY_THRESHOLD || normA.includes(normB) || normB.includes(normA)) {
                        if (dist === -1 || dist < 20000) {
                            isCompatible = true;
                        }
                    }
                }

                if (isCompatible) {
                    cluster.push(candidate);
                    pool.splice(i, 1);
                }
            }

            if (cluster.length > 1) {
                groupsFound++;
                // Sort survivor
                cluster.sort((a, b) => calculateEnrichmentScore(b) - calculateEnrichmentScore(a));
                const survivor = cluster[0];
                const victims = cluster.slice(1);

                await mergeLocations(survivor, victims);
            }
        }
    }

    console.log(`\n🎉 Deduplication Complete. Processed ${groupsFound} groups.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
