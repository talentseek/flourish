#!/usr/bin/env tsx
/**
 * Import Anchor Stores and Supermarkets from Master List Excel
 * Adds these as tenants with isAnchorTenant=true
 */
import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';

const prisma = new PrismaClient();

function categorizeStore(name: string): string {
    const lowerName = name.toLowerCase();

    // Supermarkets
    if (['tesco', 'sainsbury', 'asda', 'morrisons', 'waitrose', 'lidl', 'aldi', 'iceland', 'm&s', 'co-op', 'coop'].some(k => lowerName.includes(k))) {
        return 'Supermarket';
    }
    // Fashion
    if (['primark', 'h&m', 'next', 'river island', 'new look', 'superdry', 'tk maxx', 'matalan', 'peacocks', 'bon marche'].some(k => lowerName.includes(k))) {
        return 'Fashion & Apparel';
    }
    // Sports
    if (['jd sport', 'sports direct', 'decathlon'].some(k => lowerName.includes(k))) {
        return 'Sports & Outdoors';
    }
    // Health & Beauty
    if (['boots', 'superdrug', 'body shop'].some(k => lowerName.includes(k))) {
        return 'Health & Beauty';
    }
    // Department stores
    if (['john lewis', 'fenwicks', 'dunelm', 'debenhams'].some(k => lowerName.includes(k))) {
        return 'Department Store';
    }
    // F&B
    if (['costa', 'starbucks', 'café nero', 'greggs', 'mcdonald', 'subway', 'wetherspoons', 'nando'].some(k => lowerName.includes(k))) {
        return 'Food & Beverage';
    }
    // Entertainment
    if (['vue', 'odeon', 'hollywood bowl', 'flip out', 'clip and climb', 'cinema'].some(k => lowerName.includes(k))) {
        return 'Entertainment';
    }
    // Home
    if (['home bargains', 'b&m', 'the range', 'wilko'].some(k => lowerName.includes(k))) {
        return 'Home & Garden';
    }
    // Electronics
    if (['apple', 'currys', 'ee', 'o2', 'vodafone'].some(k => lowerName.includes(k))) {
        return 'Electronics & Technology';
    }
    // Jewelry
    if (['pandora', 'h.samuel', 'h samuel', 'ernest jones'].some(k => lowerName.includes(k))) {
        return 'Jewelry & Accessories';
    }
    // Books/Stationery
    if (['wh smith', 'whsmith', 'waterstones'].some(k => lowerName.includes(k))) {
        return 'Books & Stationery';
    }
    // Discount
    if (['poundland', 'pound stretcher', 'poundstretcher'].some(k => lowerName.includes(k))) {
        return 'Discount Store';
    }
    // Gym
    if (['gym', 'fitness'].some(k => lowerName.includes(k))) {
        return 'Sports & Outdoors';
    }

    return 'General Retail';
}

function parseAnchors(anchorStr: string): string[] {
    if (!anchorStr || anchorStr === '-' || anchorStr.toLowerCase() === 'no') return [];

    // Split by comma, handle various formats
    return anchorStr
        .split(/[,|]/)
        .map(s => s.trim())
        .filter(s => s && s.length > 1 && s !== '-');
}

async function main() {
    console.log('\n🏬 ANCHOR STORES & SUPERMARKET IMPORT\n');
    console.log('='.repeat(60));

    // Read Excel
    const wb = XLSX.readFile('./public/Masterlistoflocations8-10-25.xlsx');
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet);

    console.log(`📋 Found ${data.length} locations in Excel\n`);

    let locationsUpdated = 0;
    let tenantsAdded = 0;

    for (const row of data) {
        const locationName = row['Location'];
        if (!locationName) continue;

        // Find matching location in DB
        const location = await prisma.location.findFirst({
            where: {
                isManaged: true,
                name: { contains: locationName.split(',')[0].trim(), mode: 'insensitive' }
            },
            select: { id: true, name: true }
        });

        if (!location) {
            continue;
        }

        // Parse anchors and supermarkets
        const anchors = parseAnchors(row['Anchor Stores'] || '');
        const supermarket = row['Supermarket'];
        const allTenants: string[] = [...anchors];

        // Add supermarket if it's a specific store name
        if (supermarket && supermarket !== 'No' && supermarket !== 'NO' && supermarket !== '-') {
            // Extract store names from strings like "Yes-Sainsburys" or "Waitrose/Tesco/M&S"
            const supermarkets = supermarket
                .replace(/^yes[-\s]*/i, '')
                .split(/[,\/]/)
                .map(s => s.trim())
                .filter(s => s && s.length > 2 && !['yes', 'no', 'independent'].includes(s.toLowerCase()));
            allTenants.push(...supermarkets);
        }

        if (allTenants.length === 0) continue;

        console.log(`📍 ${location.name}:`);
        locationsUpdated++;

        for (const tenantName of allTenants) {
            const category = categorizeStore(tenantName);

            try {
                await prisma.tenant.upsert({
                    where: { locationId_name: { locationId: location.id, name: tenantName } },
                    create: {
                        locationId: location.id,
                        name: tenantName,
                        category,
                        isAnchorTenant: true
                    },
                    update: {
                        isAnchorTenant: true,
                        category
                    }
                });
                console.log(`   ✅ ${tenantName} → ${category} [ANCHOR]`);
                tenantsAdded++;
            } catch (e) {
                // Skip errors
            }
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n🎉 IMPORT COMPLETE`);
    console.log(`   Locations updated: ${locationsUpdated}`);
    console.log(`   Anchor tenants added: ${tenantsAdded}`);

    // Final count
    const totalTenants = await prisma.tenant.count();
    const anchors = await prisma.tenant.count({ where: { isAnchorTenant: true } });
    console.log(`\n📊 DATABASE STATUS:`);
    console.log(`   Total tenants: ${totalTenants}`);
    console.log(`   Anchor tenants: ${anchors}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
