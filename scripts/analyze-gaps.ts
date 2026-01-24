import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fields to check for completeness
const CRITICAL_FIELDS = [
    'phone', 'website', 'openingHours', 'heroImage', // Contact
    'owner', 'management', 'openedYear',             // Ownership
    'parkingSpaces', 'retailSpace', 'numberOfStores', // Operations
    'instagram', 'facebook',                         // Social
    'googleRating', 'googleReviews',                 // Reviews
    'population', 'medianAge'                        // Demographics
];

async function main() {
    // Find all managed locations
    const locations = await prisma.location.findMany({
        where: { isManaged: true },
        select: {
            id: true,
            name: true,
            ...Object.fromEntries(CRITICAL_FIELDS.map(f => [f, true]))
        }
    });

    console.log(`\nAnalyzing ${locations.length} Managed Locations...\n`);
    console.log('Location'.padEnd(30) + ' | ' + 'Missing Fields'.padEnd(50) + ' | ' + 'Completeness');
    console.log('-'.repeat(100));

    const gaps = locations.map(loc => {
        const missing = CRITICAL_FIELDS.filter(field => {
            const val = loc[field as keyof typeof loc];
            return val === null || val === undefined || val === '';
        });

        const score = Math.round(((CRITICAL_FIELDS.length - missing.length) / CRITICAL_FIELDS.length) * 100);

        return {
            name: loc.name,
            missing,
            score
        };
    }).sort((a, b) => a.score - b.score); // Sort by lowest score first

    gaps.forEach(g => {
        const missingStr = g.missing.length > 5
            ? `${g.missing.length} fields (e.g. ${g.missing.slice(0, 3).join(', ')}...)`
            : g.missing.join(', ');

        console.log(`${g.name.padEnd(30)} | ${missingStr.padEnd(50)} | ${g.score}%`);
    });

    console.log('\nTop 3 Priorities for Enrichment:');
    gaps.slice(0, 3).forEach((g, i) => {
        console.log(`${i + 1}. ${g.name} (${g.score}% complete)`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
