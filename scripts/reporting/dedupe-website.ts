
import { PrismaClient, Location } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

const prisma = new PrismaClient();

// --- Types ---
type DuplicateGroup = {
    id: string;
    normalizedUrl: string;
    locations: Location[];
    survivorId: string;
    isValid: boolean;
    reason: string;
};

// --- Config ---
// Chain safeguard: If sharing a website, they must be this close to be considered the SAME location
const MAX_DISTANCE_FOR_SHARED_URL_METERS = 5000;
const NAME_SIMILARITY_THRESHOLD = 5;

// --- Helpers ---

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
        if (!u.startsWith('http')) u = 'https://' + u; // Ensure protocol for parsing
        const parsed = new URL(u);
        // Remove www.
        let hostname = parsed.hostname.replace(/^www\./, '');
        // Path (strip trailing slash)
        let pathname = parsed.pathname.replace(/\/$/, '');
        if (pathname === '/') pathname = '';

        return `${hostname}${pathname}`;
    } catch (e) {
        return null; // Invalid URL
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
    // Boost recent creation/update or specific data quality signals if any
    return score;
}

// --- Main Analysis ---

async function main() {
    console.log("🔍 Starting Website-Based Deduplication...");

    // Fetch all locations with a website
    const locations = await prisma.location.findMany({
        where: {
            website: { not: null }
        }
    });
    console.log(`Loaded ${locations.length} locations with websites.\n`);

    // Group by Normalized URL
    const urlMap = new Map<string, Location[]>();

    for (const loc of locations) {
        if (!loc.website) continue;
        const norm = normalizeUrl(loc.website);
        if (!norm) continue;

        if (!urlMap.has(norm)) {
            urlMap.set(norm, []);
        }
        urlMap.get(norm)!.push(loc);
    }

    console.log(`Found ${urlMap.size} unique normalized URLs.`);

    const candidateGroups: DuplicateGroup[] = [];

    for (const [url, locs] of urlMap.entries()) {
        if (locs.length < 2) continue; // No duplicates

        // SANITY CHECK: Are these actually the same place?
        // We define a group as valid if ALL members are "close enough" to at least one other member (chain link),
        // OR if they pass name similarity.
        // Actually, simpler: Determine if it's a "Chain" (e.g. Costa) or a "One Place" (e.g. Touchwood).

        // We will split this URL bucket into actual clusters.
        // Simple clustering: Take first, find all compatible. Then take next unassigned...

        let pool = [...locs];

        while (pool.length > 0) {
            const seed = pool.shift()!;
            const cluster = [seed];

            // Find compatible matches in the remaining pool
            for (let i = pool.length - 1; i >= 0; i--) {
                const candidate = pool[i];
                let isCompatible = false;
                let reason = "";

                // 1. Proximity Check
                const dist = getDistanceFromLatLonInM(
                    Number(seed.latitude), Number(seed.longitude),
                    Number(candidate.latitude), Number(candidate.longitude)
                );

                if (dist !== -1 && dist < MAX_DISTANCE_FOR_SHARED_URL_METERS) {
                    isCompatible = true;
                    reason = `Distance < 5km (${dist.toFixed(0)}m)`;
                }
                else if (dist === -1) {
                    // One missing coords. Check City match.
                    if (seed.city && candidate.city && seed.city.toLowerCase() === candidate.city.toLowerCase()) {
                        isCompatible = true;
                        reason = "Same City (Missing Coords)";
                    }
                }

                // 2. Name Check (Fallback if distance is large/unknown but Name is VERY similar)
                // e.g. "Touchwood" vs "Touchwood Shopping Centre"
                if (!isCompatible) {
                    const normA = normalizeName(seed.name);
                    const normB = normalizeName(candidate.name);
                    if (levenshtein(normA, normB) <= NAME_SIMILARITY_THRESHOLD || normA.includes(normB) || normB.includes(normA)) {
                        // Only trust name match if distance isn't HUGE (prevent "Westfield" matching London vs Stratford just by name if URL is shared root)
                        if (dist === -1 || dist < 20000) { // < 20km tolerance for name match
                            isCompatible = true;
                            reason = "Strong Name Similarity";
                        }
                    }
                }

                if (isCompatible) {
                    cluster.push(candidate);
                    pool.splice(i, 1); // Remove from pool
                }
            }

            if (cluster.length > 1) {
                // Determine survivor
                cluster.sort((a, b) => calculateEnrichmentScore(b) - calculateEnrichmentScore(a));

                candidateGroups.push({
                    id: `WEBGRP-${candidateGroups.length + 1}`,
                    normalizedUrl: url,
                    locations: cluster,
                    survivorId: cluster[0].id,
                    isValid: true,
                    reason: "Shared Website + " // Aggregated reasons? Simplified for now.
                });
            }
        }
    }

    console.log(`Identified ${candidateGroups.length} valid duplicate groups.\n`);

    // --- Generate Report ---
    let reportMd = "# Website-Based Deduplication Report\n\n";
    reportMd += `**Date:** ${new Date().toISOString()}\n`;
    reportMd += `**Logic:** Shared Normalized URL + (Distance < 5km OR Strong Name Match)\n`;
    reportMd += `**Groups Found:** ${candidateGroups.length}\n\n`;

    reportMd += "| Group | Website (Normalized) | Survivor | Victims | Notes |\n";
    reportMd += "| :--- | :--- | :--- | :--- | :--- |\n";

    for (const g of candidateGroups) {
        const survivor = g.locations.find(l => l.id === g.survivorId);
        const victims = g.locations.filter(l => l.id !== g.survivorId);

        let notes = "";
        // Check for distance issues in victims
        if (survivor && survivor.latitude && survivor.longitude) {
            const victimDists = victims.map(v => {
                const d = getDistanceFromLatLonInM(Number(survivor.latitude), Number(survivor.longitude), Number(v.latitude), Number(v.longitude));
                return d !== -1 ? `${(d / 1000).toFixed(1)}km` : "No Coords";
            });
            notes = `Dist: ${victimDists.join(", ")}`;
        }

        reportMd += `| **${g.id}** | \`${g.normalizedUrl}\` | **${survivor?.name}** (${survivor?.city}) | ${victims.map(v => v.name).join(", ")} | ${notes} |\n`;
    }

    const reportPath = path.join(process.cwd(), 'reports', 'DEDUPE-WEBSITE-ONLY.md');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, reportMd);

    console.log(`📝 Report generated at: ${reportPath}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
