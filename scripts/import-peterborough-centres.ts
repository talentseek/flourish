#!/usr/bin/env tsx
/**
 * Import Peterborough Centres Summary Data
 * Imports parking, transit, ratings from the research CSV
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
    console.log('\n🅿️ PETERBOROUGH CENTRES IMPORT\n');
    console.log('='.repeat(60));

    // Read CSV
    const content = readFileSync('./public/peterborough_centres_summary.csv', 'utf-8');
    const records: Record<string, string>[] = parse(content, { columns: true, bom: true });

    console.log(`📋 Found ${records.length} centres in CSV\n`);

    let updated = 0;
    let notFound = 0;

    for (const row of records) {
        const centreName = row['name'];
        if (!centreName) continue;

        // Find matching location
        const location = await prisma.location.findFirst({
            where: { name: { contains: centreName, mode: 'insensitive' } },
            select: { id: true, name: true }
        });

        if (!location) {
            console.log(`  ⚠️  ${centreName} - not found in database`);
            notFound++;
            continue;
        }

        // Parse data
        const parkingSpaces = row['parkingSpaces'] ? parseInt(row['parkingSpaces']) : null;
        const publicTransit = row['publicTransit'] || null;
        const numberOfStores = row['numberOfStores_published'] ? parseInt(row['numberOfStores_published']) : null;
        const website = row['website'] || null;
        const instagram = row['instagram'] || null;
        const facebook = row['facebook'] || null;
        const youtube = row['youtube'] || null;
        const tiktok = row['tiktok'] || null;

        // Parse opening hours JSON if present
        let openingHours = null;
        if (row['openingHours_json']) {
            try {
                openingHours = JSON.parse(row['openingHours_json'].replace(/""/g, '"'));
            } catch (e) {
                // Skip invalid JSON
            }
        }

        // Update location
        try {
            await prisma.location.update({
                where: { id: location.id },
                data: {
                    ...(parkingSpaces && { parkingSpaces }),
                    ...(publicTransit && { publicTransit }),
                    ...(numberOfStores && { numberOfStores }),
                    ...(website && { website }),
                    ...(instagram && { instagram }),
                    ...(facebook && { facebook }),
                    ...(youtube && { youtube }),
                    ...(tiktok && { tiktok }),
                    ...(openingHours && { openingHours }),
                }
            });
            console.log(`  ✅ ${centreName} → ${location.name} (parking: ${parkingSpaces || 'N/A'})`);
            updated++;
        } catch (e) {
            console.log(`  ❌ ${centreName} - update failed`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n🎉 IMPORT COMPLETE`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Not found: ${notFound}`);

    // Final counts
    const withParking = await prisma.location.count({ where: { parkingSpaces: { not: null } } });
    const withTransit = await prisma.location.count({ where: { publicTransit: { not: null } } });

    console.log(`\n📊 DATABASE STATUS:`);
    console.log(`   Parking Spaces: ${withParking}`);
    console.log(`   Public Transit: ${withTransit}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
