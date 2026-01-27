
import { PrismaClient, Location } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// --- Types ---
type DuplicateGroup = {
    id: string;
    locations: Location[];
    method: 'EXACT_NAME_POSTCODE' | 'PROXIMITY_NAME' | 'CITY_NAME';
    survivorId: string;
};

// --- Config ---
// Distance in meters to consider "close" for fuzzy matching
const PROXIMITY_THRESHOLD_METERS = 500;
// Levenshtein threshold (allow smaller edits)
const NAME_SIMILARITY_THRESHOLD = 3;

// --- Helpers ---

// Calculate distance between two lat/long points (Haversine formula)
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat1)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d * 1000; // Distance in meters
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

// Simple Levenshtein distance
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

// Normalize name for comparison (remove "The", "Shopping Centre", etc.)
function normalizeName(name: string): string {
    return name.toLowerCase()
        .replace(/\b(the|shopping|centre|center|mall|park|retail)\b/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
}

// --- Scoring Logic ---
function calculateEnrichmentScore(loc: Location): number {
    let score = 0;
    if (loc.website) score += 10;
    if (loc.facebook || loc.instagram || loc.twitter) score += 5;
    if (loc.management || loc.managementEmail) score += 3;
    if (loc.phone) score += 1;
    if (loc.openingHours) score += 1;
    if (loc.tenantCount && loc.tenantCount > 0) score += 2; // Assuming field exists or similar
    return score;
}

// --- Main Analysis ---

async function main() {
    console.log("🔍 Starting Deduplication Analysis...");

    const locations = await prisma.location.findMany({
        where: { type: 'SHOPPING_CENTRE' } // Focus on SCs first
    });
    console.log(`Loaded ${locations.length} locations.\n`);

    const groups: DuplicateGroup[] = [];
    const processedIds = new Set<string>();

    for (let i = 0; i < locations.length; i++) {
        const A = locations[i];
        if (processedIds.has(A.id)) continue;

        const currentGroup: Location[] = [A];

        for (let j = i + 1; j < locations.length; j++) {
            const B = locations[j];
            if (processedIds.has(B.id)) continue;

            let isMatch = false;
            let method: DuplicateGroup['method'] = 'PROXIMITY_NAME';

            // 1. Strict Name + Postcode Match
            // Normalize postcodes (remove spaces)
            const pcA = A.postcode?.replace(/\s/g, '').toLowerCase();
            const pcB = B.postcode?.replace(/\s/g, '').toLowerCase();

            if (pcA && pcB && pcA === pcB) {
                const nameDist = levenshtein(normalizeName(A.name), normalizeName(B.name));
                if (nameDist <= 2) {
                    isMatch = true;
                    method = 'EXACT_NAME_POSTCODE';
                }
            }

            // 2. Proximity + Loose Name Match
            if (!isMatch && A.latitude && A.longitude && B.latitude && B.longitude) {
                const dist = getDistanceFromLatLonInM(
                    Number(A.latitude), Number(A.longitude),
                    Number(B.latitude), Number(B.longitude)
                );

                if (dist < PROXIMITY_THRESHOLD_METERS) {
                    const normA = normalizeName(A.name);
                    const normB = normalizeName(B.name);

                    // Allow substring matches (e.g., "Arndale" in "Manchester Arndale")
                    if (normA.includes(normB) || normB.includes(normA) || levenshtein(normA, normB) <= NAME_SIMILARITY_THRESHOLD) {
                        isMatch = true;
                        method = 'PROXIMITY_NAME';
                    }
                }
            }

            // 3. City + Very Strict Name Match (Catching exact dupes across data sources with no coords)
            if (!isMatch && A.city && B.city && A.city.toLowerCase() === B.city.toLowerCase()) {
                const normA = normalizeName(A.name);
                const normB = normalizeName(B.name);
                if (normA === normB && normA.length > 5) { // Ensure not matching empty/short strings
                    isMatch = true;
                    method = 'CITY_NAME';
                }
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
                method: 'PROXIMITY_NAME', // Simplified for now, could track specific method per pair
                survivorId: survivor.id
            });
            processedIds.add(A.id); // Mark A as processed
        }
    }

    console.log(`Found ${groups.length} duplicate groups.`);

    // --- Generate Report ---
    let reportMd = "# Deduplication Candidates Report\n\n";
    reportMd += `**Analysis Date:** ${new Date().toISOString()}\n`;
    reportMd += `**Total Locations Scanned:** ${locations.length}\n`;
    reportMd += `**Duplicate Groups Found:** ${groups.length}\n\n`;
    reportMd += "> **Action Required:** Please review the groups below. 'Survivor' is the record we will keep (merging data into it). 'Victims' will be deleted after merge.\n\n";

    for (const grp of groups) {
        reportMd += `## Group ${grp.id}\n`;
        reportMd += "| Role | Name | City | Website | Score | ID |\n";
        reportMd += "| :--- | :--- | :--- | :--- | :--- | :--- |\n";

        for (const loc of grp.locations) {
            const role = loc.id === grp.survivorId ? "✅ **SURVIVOR**" : "❌ Victim";
            const score = calculateEnrichmentScore(loc);
            const website = loc.website ? `[Link](${loc.website})` : "Nodes";
            reportMd += `| ${role} | ${loc.name} | ${loc.city} | ${website} | ${score} | \`${loc.id}\` |\n`;
        }
        reportMd += "\n---\n";
    }

    const reportPath = path.join(process.cwd(), 'reports', 'DEDUPE-CANDIDATES.md');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, reportMd);

    console.log(`📝 Report generated at: ${reportPath}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
