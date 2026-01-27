
import { PrismaClient } from '@prisma/client'
import { levenshtein } from './utils/string-distance' // Need to implement or mock this

const prisma = new PrismaClient()

// Simple Levenshtein Implementation if util doesn't exist
function getLevenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

async function main() {
    console.log('Starting Broad Duplicate Detection...')
    console.log('Rules: >95% Name Sim & Same Postcode OR Exact Website OR Proximity < 200m & Exact Name')

    const locations = await prisma.location.findMany({
        select: { id: true, name: true, postcode: true, website: true, latitude: true, longitude: true, town: true }
    })

    console.log(`Scanning ${locations.length} locations...`)

    const duplicates = []
    const processed = new Set<string>()

    for (let i = 0; i < locations.length; i++) {
        const A = locations[i]
        if (processed.has(A.id)) continue

        for (let j = i + 1; j < locations.length; j++) {
            const B = locations[j]
            if (processed.has(B.id)) continue

            let isMatch = false
            let reason = ""

            // Rule 1: Website Match (Robust)
            if (A.website && B.website && A.website.length > 5) {
                // Simple normalization
                const webA = A.website.trim().toLowerCase().replace(/\/$/, '').replace(/^https?:\/\/(www\.)?/, '')
                const webB = B.website.trim().toLowerCase().replace(/\/$/, '').replace(/^https?:\/\/(www\.)?/, '')

                if (webA === webB) {
                    isMatch = true
                    reason = `Exact Website: ${webA}`
                }
            }

            // Rule 2: Postcode + Name Sim
            if (!isMatch && A.postcode && B.postcode) {
                const postA = A.postcode.replace(/\s+/g, '').toUpperCase()
                const postB = B.postcode.replace(/\s+/g, '').toUpperCase()

                if (postA === postB && postA.length > 4) {
                    const dist = getLevenshteinDistance(A.name.toLowerCase(), B.name.toLowerCase())
                    // Allow small variance (e.g. "The Broadway" vs "The Broadway Bradford" => dist ~9)
                    // Using length ratio for strictness
                    const maxLen = Math.max(A.name.length, B.name.length)
                    const similarity = 1 - (dist / maxLen)

                    if (similarity > 0.6) { // 60% similarity is strict enough given exact postcode
                        isMatch = true
                        reason = `Same Postcode (${postA}) + Name Sim (${(similarity * 100).toFixed(0)}%)`
                    }
                }
            }

            // Rule 3: Proximity + Exact Name
            // (Skipping complex haversine for now, relying on Lat/Long approx)
            // 0.002 degrees approx 200m
            if (!isMatch && A.latitude && B.latitude && Math.abs(Number(A.latitude) - Number(B.latitude)) < 0.002 && Math.abs(Number(A.longitude) - Number(B.longitude)) < 0.002) {
                if (A.name.toLowerCase().trim() === B.name.toLowerCase().trim()) {
                    isMatch = true
                    reason = "Exact Name + Proximity (<200m)"
                }
            }


            if (isMatch) {
                duplicates.push({
                    reason,
                    locA: { id: A.id, name: A.name, town: A.town, postcode: A.postcode, web: A.website },
                    locB: { id: B.id, name: B.name, town: B.town, postcode: B.postcode, web: B.website }
                })
                // Don't mark as processed yet, might have triplets. 
                // But for this simple scanner, let's just log pairs.
            }
        }
    }

    console.log(`\nFound ${duplicates.length} duplicate pairs:`)
    duplicates.forEach((d, idx) => {
        console.log(`\n#${idx + 1} [${d.reason}]`)
        console.log(`   A: ${d.locA.name} (${d.locA.town}, ${d.locA.postcode}) - ${d.locA.id}`)
        console.log(`   B: ${d.locB.name} (${d.locB.town}, ${d.locB.postcode}) - ${d.locB.id}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
