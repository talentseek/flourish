
import { PrismaClient, Location } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// --- Types ---
type DeductionCategory =
    | 'HIGH_CONFIDENCE'       // Same Postcode + Name -> Safe Merge
    | 'MEDIUM_CONFIDENCE'     // Close Proximity (<1km) + Name -> Likely Safe
    | 'COORDINATE_ERROR'      // Name match but huge distance (>50km) -> Check lat/long
    | 'NAME_COLLISION';       // Name match but different cities/postcodes (<50km but >1km) -> Do NOT Merge

type DuplicateGroup = {
    id: string;
    locations: Location[];
    category: DeductionCategory;
    survivorId: string;
    reason: string;
    distanceMeters?: number;
};

// --- Config ---
const NAME_SIMILARITY_THRESHOLD = 3;

// --- Helpers ---

function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return -1; // Missing coords
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

function normalizeName(name: string): string {
    return name.toLowerCase()
        .replace(/\b(the|shopping|centre|center|mall|park|retail)\b/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
}

function calculateEnrichmentScore(loc: Location): number {
    let score = 0;
    if (loc.website) score += 10;
    if (loc.facebook || loc.instagram || loc.twitter) score += 5;
    if (loc.management || loc.managementEmail) score += 3;
    if (loc.phone) score += 1;
    // Prefer records with coordinates
    if (loc.latitude && Number(loc.latitude) !== 0) score += 2;
    return score;
}

// --- Main Analysis ---

async function main() {
    console.log("🔍 Starting Robust Deduplication Analysis (v2)...");

    // Fetch ONLY unmanaged for victim candidates, but all for checking?
    // Actually, deduplicating everything is safer.
    const locations = await prisma.location.findMany({
        where: { type: 'SHOPPING_CENTRE' }
    });
    console.log(`Loaded ${locations.length} locations.\n`);

    const groups: DuplicateGroup[] = [];
    const processedIds = new Set<string>();

    for (let i = 0; i < locations.length; i++) {
        const A = locations[i];
        if (processedIds.has(A.id)) continue;

        const currentGroup: Location[] = [A];
        let category: DeductionCategory = 'NAME_COLLISION'; // Default to "No Merge" unless proven otherwise
        let reason = "";
        let maxDist = 0;

        for (let j = i + 1; j < locations.length; j++) {
            const B = locations[j];
            if (processedIds.has(B.id)) continue;

            const normA = normalizeName(A.name);
            const normB = normalizeName(B.name);

            // Basic Name Check First
            const nameMatch = (normA === normB) || (levenshtein(normA, normB) <= NAME_SIMILARITY_THRESHOLD);

            if (!nameMatch) continue;

            // --- CATEGORIZATION LOGIC ---

            let isMatch = false;

            // 1. Postcode Match (High Confidence)
            const pcA = A.postcode?.replace(/\s/g, '').toLowerCase();
            const pcB = B.postcode?.replace(/\s/g, '').toLowerCase();

            if (pcA && pcB && pcA === pcB) {
                isMatch = true;
                category = 'HIGH_CONFIDENCE';
                reason = "Exact Postcode Match";
            }

            // 2. Proximity Match
            const dist = getDistanceFromLatLonInM(
                Number(A.latitude), Number(A.longitude),
                Number(B.latitude), Number(B.longitude)
            );

            if (!isMatch && dist !== -1) {
                if (dist < 1000) { // < 1km
                    isMatch = true;
                    category = 'MEDIUM_CONFIDENCE';
                    reason = `Close Proximity (${dist.toFixed(0)}m)`;
                    maxDist = dist;
                } else if (dist > 50000) { // > 50km
                    // Name match but huge distance
                    isMatch = true; // We flag it, but as an ERROR
                    category = 'COORDINATE_ERROR';
                    reason = `Name Match but Distant (${(dist / 1000).toFixed(0)}km) - Lat/Long Error?`;
                    maxDist = dist;
                } else {
                    // Between 1km and 50km
                    // Likely different branches or just name collision
                    isMatch = true;
                    category = 'NAME_COLLISION';
                    reason = `Generic Name Match in same region (${(dist / 1000).toFixed(0)}km)`;
                    maxDist = dist;
                }
            }

            // 3. Fallback: City Match (if coords missing)
            if (!isMatch && A.city && B.city && A.city.toLowerCase() === B.city.toLowerCase()) {
                if (normA.length > 5) {
                    isMatch = true;
                    category = 'MEDIUM_CONFIDENCE'; // City match w/o coords is fairly strong
                    reason = "City Match (Missing Coords)";
                }
            }

            // 4. Website Conflict Check (Downgrade confidence)
            if (isMatch && A.website && B.website && A.website !== B.website) {
                // If distinct websites, risky to merge
                category = 'NAME_COLLISION';
                reason += " [WEBSITE CONFLICT]";
            }

            if (isMatch) {
                currentGroup.push(B);
                processedIds.add(B.id);
            }
        }

        if (currentGroup.length > 1) {
            // Determine Survivor
            currentGroup.sort((a, b) => calculateEnrichmentScore(b) - calculateEnrichmentScore(a));
            const survivor = currentGroup[0];

            groups.push({
                id: `GRP-${groups.length + 1}`,
                locations: currentGroup,
                category: category,
                survivorId: survivor.id,
                reason: reason,
                distanceMeters: maxDist
            });
            processedIds.add(A.id);
        }
    }

    console.log(`Found ${groups.length} candidate groups.`);

    // --- Generate Report ---
    let reportMd = "# Robust Deduplication Report (v2)\n\n";
    reportMd += `**Date:** ${new Date().toISOString()}\n`;
    reportMd += `**Groups Found:** ${groups.length}\n\n`;

    // Section 1: Ready to Merge
    reportMd += "## ✅ Section A: Safe to Merge (High/Medium Confidence)\n";
    reportMd += "These pairs share Postcodes or are within 1km. **Touchwood should be here.**\n\n";
    reportMd += "| Group | Logic | Survivor | Victims |\n";
    reportMd += "| :--- | :--- | :--- | :--- |\n";

    const safeGroups = groups.filter(g => g.category === 'HIGH_CONFIDENCE' || g.category === 'MEDIUM_CONFIDENCE');
    for (const g of safeGroups) {
        const survivor = g.locations.find(l => l.id === g.survivorId);
        const victims = g.locations.filter(l => l.id !== g.survivorId).map(l => l.name).join(", ");
        reportMd += "| **" + g.id + "** | " + g.reason + " | **" + survivor?.name + "** (" + survivor?.city + ") | " + victims + " |\n";
    }

    // Section 2: Coordinate Errors
    reportMd += "\n## ⚠️ Section B: Data Integrity Issues (Coordinate Errors)\n";
    reportMd += "Name matches but distance > 50km. Suggests one record has `0.00,0.00` or wrong coords. **Merge advisable ONLY if one coord is clearly 0.**\n\n";

    const errorGroups = groups.filter(g => g.category === 'COORDINATE_ERROR');
    for (const g of errorGroups) {
        reportMd += `### Group ${g.id}: ${g.locations[0].name}\n`;
        reportMd += `*Reason: ${g.reason}*\n`;
        for (const loc of g.locations) {
            reportMd += `- ${loc.name} (${loc.city}) [${loc.latitude}, ${loc.longitude}] - ID: \`${loc.id}\`\n`;
        }
        reportMd += "\n";
    }

    // Section 3: Name Collisions (Do Not Merge)
    reportMd += "\n## 🛑 Section C: Name Collisions (Do Not Merge)\n";
    reportMd += "Generic names (e.g. 'Kingfisher', 'Riverside') in different towns. **Ignore these.**\n\n";
    const collisionGroups = groups.filter(g => g.category === 'NAME_COLLISION');
    for (const g of collisionGroups) {
        reportMd += `- **${g.id}**: ${g.locations.map(l => `${l.name} (${l.city})`).join(" vs ")} [${g.reason}]\n`;
    }

    const reportPath = path.join(process.cwd(), 'reports', 'DEDUPE-V2-ROBUST.md');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, reportMd);

    console.log(`📝 Report generated at: ${reportPath}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
