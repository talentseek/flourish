
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

// Levenshtein Implementation
function getLevenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

// Scoring function to determine the "Winner"
function scoreLocation(loc: any): number {
    let score = 0;
    if (loc.isManaged) score += 50; // Huge preference for managed sites
    if (loc.website && loc.website.length > 5) score += 10;
    if (loc.phone && loc.phone.length > 5) score += 5;
    if (loc.postcode && loc.postcode.length > 4) score += 5;
    if (loc.town) score += 2;
    // Prefer older ID? Or newer? Maybe irrelevant if data is better.
    // Let's rely on data completeness.
    return score;
}

async function main() {
    const args = process.argv.slice(2);
    const verifyOnly = !args.includes('--execute'); // Default to verify/dry-run

    console.log(`Starting Duplicate Merge Process... (Mode: ${verifyOnly ? 'DRY RUN' : 'EXECUTE'})`);
    if (verifyOnly) console.log('Run with --execute to perform actual merges.');

    // 1. Fetch all locations
    // We need tenants count to help decide too, maybe?
    // For now, let's just fetch scalar fields and handle tenants in the transaction
    const locations = await prisma.location.findMany({
        include: { _count: { select: { tenants: true } } }
    });

    console.log(`Loaded ${locations.length} locations.\n`);

    const processed = new Set<string>();
    const mergePlan = [];

    // 2. Detect Duplicates
    for (let i = 0; i < locations.length; i++) {
        const A = locations[i];
        if (processed.has(A.id)) continue;

        for (let j = i + 1; j < locations.length; j++) {
            const B = locations[j];
            if (processed.has(B.id)) continue;

            let isMatch = false;
            let reason = "";

            // Normalize
            const normWebA = A.website?.trim().toLowerCase().replace(/\/$/, '').replace(/^https?:\/\/(www\.)?/, '') || "";
            const normWebB = B.website?.trim().toLowerCase().replace(/\/$/, '').replace(/^https?:\/\/(www\.)?/, '') || "";
            const normPostA = A.postcode?.replace(/\s+/g, '').toUpperCase() || "";
            const normPostB = B.postcode?.replace(/\s+/g, '').toUpperCase() || "";

            // Rule 1: Exact Website (Robust)
            const GENERIC_DOMAINS = [
                'lidl.co.uk', 'home.bargains', 'completelyretail.co.uk', 'aldi.co.uk',
                'tesco.com', 'asda.com', 'sainsburys.co.uk', 'morrisons.com',
                'costa.co.uk', 'starbucks.co.uk', 'mcdonalds.com', 'boots.com',
                'next.co.uk', 'marksandspencer.com', 'argos.co.uk', 'currys.co.uk',
                'savills.com', 'knightfrank.co.uk', 'cushmanwakefield.com', 'cbre.co.uk',
                'jll.co.uk', 'colliers.com', 'avisonyoung.co.uk', 'completelygroup.com',
                'wikipedia.org', 'facebook.com', 'instagram.com', 'twitter.com', 'youtube.com',
                'traffordcentre.co.uk', 'themetrocentre.co.uk', 'westfield.com',
                'whitecityretailpark.co.uk' // Added specific ones that caused issues if shared
            ];

            const domainA = normWebA.split('/')[0];
            const isGeneric = GENERIC_DOMAINS.some(d => domainA.includes(d));

            if (!isGeneric && normWebA && normWebB && normWebA === normWebB && normWebA.length > 5) {
                // Safety Check: If names are radically different, DO NOT MERGE even if website matches.
                // e.g. "White City Retail Park" vs "Castlemore Retail Park" -> Distance is huge.
                const dist = getLevenshteinDistance(A.name.toLowerCase(), B.name.toLowerCase());
                const maxLen = Math.max(A.name.length, B.name.length);
                const similarity = 1 - (dist / maxLen);

                // If one contains "Retail Park" and other "Centre", or radically different
                if (similarity > 0.4) {
                    isMatch = true;
                    reason = `Exact Website (${normWebA})`;
                } else {
                    // console.log(`Skipped Exact Website Match due to name mismatch: ${A.name} vs ${B.name}`);
                }
            }

            // Rule 2: Postcode + Name Sim
            if (!isMatch && normPostA && normPostB && normPostA === normPostB && normPostA.length > 4) {
                const dist = getLevenshteinDistance(A.name.toLowerCase(), B.name.toLowerCase());
                const maxLen = Math.max(A.name.length, B.name.length);
                const similarity = 1 - (dist / maxLen);

                // If names are very short (<5 chars), strictness must be high
                if (maxLen < 5 && A.name.toLowerCase() !== B.name.toLowerCase()) {
                    // Skip short ambiguous names unless identical
                } else if (similarity > 0.75) { // Increased from 0.6 to 0.75 to capture only true duplicates
                    isMatch = true;
                    reason = `Same Postcode + Name Sim ${(similarity * 100).toFixed(0)}%`;
                }
            }

            // Rule 3: Proximity + Exact Name
            // Approx 0.002 deg ~ 200m
            if (!isMatch && A.latitude && B.latitude &&
                Math.abs(Number(A.latitude) - Number(B.latitude)) < 0.002 &&
                Math.abs(Number(A.longitude) - Number(B.longitude)) < 0.002) {

                if (A.name.toLowerCase().trim() === B.name.toLowerCase().trim()) {
                    isMatch = true;
                    reason = "Proximity <200m + Exact Name";
                }
            }

            if (isMatch) {
                // Determine Winner
                const scoreA = scoreLocation(A);
                const scoreB = scoreLocation(B);

                // Default to A if tie, or if A has more tenants?
                // check tenants
                const tenantsA = A._count.tenants;
                const tenantsB = B._count.tenants;

                let winner = A;
                let loser = B;
                let winReason = `Score ${scoreA} vs ${scoreB}`;

                if (scoreB > scoreA) {
                    winner = B;
                    loser = A;
                    winReason = `Score ${scoreB} vs ${scoreA}`;
                } else if (scoreA === scoreB) {
                    // Tie-break: Tenants
                    if (tenantsB > tenantsA) {
                        winner = B;
                        loser = A;
                        winReason = "Tie-break: More Tenants";
                    }
                }

                mergePlan.push({
                    reason,
                    winReason,
                    winner,
                    loser
                });

                processed.add(A.id);
                processed.add(B.id);
                // Break inner loop to avoid chaining triplets in this simple pass
                // (Though chaining might be desirable, strict pairing is safer for now)
                break;
            }
        }
    }

    console.log(`Identified ${mergePlan.length} duplicate pairs to merge.`);

    // 3. Execute or Log
    const logOutput = [];

    for (const plan of mergePlan) {
        const { winner, loser, reason, winReason } = plan;

        const logLine = `[${reason}] MERGE: ${loser.name} (${loser.id}) -> ${winner.name} (${winner.id}) [${winReason}]`;
        console.log(logLine);
        logOutput.push(logLine);

        if (!verifyOnly) {
            // MERGE LOGIC
            await prisma.$transaction(async (tx: any) => {
                // 1. Move Tenants
                const updateTenants = await tx.tenant.updateMany({
                    where: { locationId: loser.id },
                    data: { locationId: winner.id }
                });

                // 2. Update Winner Fields (Lossless)
                const updateData: any = {};
                const fieldsToCheck = [
                    'website', 'phone', 'email', 'description',
                    'twitter', 'facebook', 'instagram', 'linkedin', 'tiktok',
                    'image', 'parkingSpaces', 'footfall'
                ];

                for (const field of fieldsToCheck) {
                    const winnerVal = (winner as any)[field];
                    const loserVal = (loser as any)[field];

                    if ((winnerVal === null || winnerVal === '' || winnerVal === 0) && (loserVal !== null && loserVal !== '' && loserVal !== 0)) {
                        updateData[field] = loserVal;
                    }
                }

                // Only update if we have new data
                if (Object.keys(updateData).length > 0) {
                    await tx.location.update({
                        where: { id: winner.id },
                        data: updateData
                    });
                }

                // 3. Delete Loser
                await tx.location.delete({
                    where: { id: loser.id }
                });

                console.log(`   -> Moved ${updateTenants.count} tenants. Updated fields: ${Object.keys(updateData).join(', ')}. Deleted loser.`);
            });
        }
    }

    if (verifyOnly) {
        console.log(`\n[DRY RUN COMPLETE] ${mergePlan.length} pairs identified.`);
        console.log("Run with --execute to commit changes.");
    } else {
        console.log(`\n[SUCCESS] Merged ${mergePlan.length} pairs.`);
    }

    fs.writeFileSync('merge_log.txt', logOutput.join('\n'));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
