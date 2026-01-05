#!/usr/bin/env tsx
/**
 * Import Midsummer Place tenants from CSV
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

function categorizeStore(name: string): { category: string; isAnchor: boolean } {
    const lowerName = name.toLowerCase();

    const anchors = ['primark', 'h&m', 'next', 'boots', 'jd sports', 'superdrug', 'tk maxx'];
    const isAnchor = anchors.some(a => lowerName.includes(a));

    // F&B names
    if (['popeyes', 'smoke', 'panda', 'costa', 'starbucks', 'mcdonald', 'kfc', 'subway', 'nando', 'pizza', 'cafe', 'coffee', 'restaurant', 'grill', 'bar', 'food'].some(k => lowerName.includes(k))) {
        return { category: 'Food & Beverage', isAnchor };
    }
    if (['jewel', 'eva jewel', 'pandora', 'h samuel', 'warren james'].some(k => lowerName.includes(k))) {
        return { category: 'Jewelry & Accessories', isAnchor };
    }
    if (['lane7', 'bowling', 'cinema', 'arcade', 'game'].some(k => lowerName.includes(k))) {
        return { category: 'Entertainment', isAnchor };
    }
    if (['bloom', 'flower'].some(k => lowerName.includes(k))) {
        return { category: 'Home & Garden', isAnchor };
    }
    if (['phone', 'mobile', 'ee', 'o2', 'vodafone', 'three', 'tech'].some(k => lowerName.includes(k))) {
        return { category: 'Electronics & Technology', isAnchor };
    }
    if (['grene', 'søstrene', 'trend', 'fashion', 'clothing'].some(k => lowerName.includes(k))) {
        return { category: 'Fashion & Apparel', isAnchor };
    }

    return { category: 'General Retail', isAnchor };
}

async function main() {
    console.log('\n🏪 MIDSUMMER PLACE TENANT IMPORT\n');

    const locationId = 'cmid0kwyn01qdmtpu7amq4nt9'; // Midsummer Place Shopping Centre

    // Verify location exists
    const loc = await prisma.location.findUnique({ where: { id: locationId } });
    if (!loc) {
        console.log('❌ Location not found');
        return;
    }
    console.log(`📍 Found: ${loc.name}`);

    // Read CSV
    const content = readFileSync('./public/midsummerplace_ULTIMATE.csv', 'utf-8');
    const records: Record<string, string>[] = parse(content, { columns: true, bom: true, skip_empty_lines: true });

    console.log(`📋 ${records.length} stores in CSV\n`);

    let imported = 0;
    for (const row of records) {
        const name = row['StoreName'];
        if (!name) continue;

        const { category, isAnchor } = categorizeStore(name);

        try {
            await prisma.tenant.upsert({
                where: { locationId_name: { locationId, name } },
                create: { locationId, name, category, isAnchorTenant: isAnchor },
                update: { category, isAnchorTenant: isAnchor }
            });
            console.log(`  ✅ ${name} → ${category}${isAnchor ? ' [ANCHOR]' : ''}`);
            imported++;
        } catch (e) {
            // Skip
        }
    }

    console.log(`\n✅ Imported ${imported} tenants to Midsummer Place`);

    // Update store count
    await prisma.location.update({
        where: { id: locationId },
        data: { numberOfStores: imported }
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
