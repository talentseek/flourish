#!/usr/bin/env tsx
/**
 * Bulk CSV Tenant Import
 * Imports tenants from all CSV files in /public/
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync, readdirSync } from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// Category mapping based on store names
function categorizeStore(name: string, rawCategory?: string): { category: string; isAnchor: boolean } {
    const lowerName = name.toLowerCase();
    const lowerCategory = (rawCategory || '').toLowerCase();

    // Anchors - major national/international brands
    const anchors = ['boots', 'sainsbury', 'asda', 'tesco', 'primark', 'tk maxx', 'h&m', 'marks & spencer', 'm&s',
        'new look', 'jd sports', 'sports direct', 'next', 'wilko', 'argos', 'currys', 'home bargains',
        'poundland', 'b&m', 'aldi', 'lidl', 'morrisons', 'waitrose', 'matalan', 'iceland', 'the range'];
    const isAnchor = anchors.some(a => lowerName.includes(a));

    // Use raw category if provided and specific
    if (rawCategory) {
        if (lowerCategory.includes('supermarket') || lowerCategory.includes('grocery')) return { category: 'Supermarket', isAnchor };
        if (lowerCategory.includes('fashion') || lowerCategory.includes('apparel') || lowerCategory.includes('clothing')) return { category: 'Fashion & Apparel', isAnchor };
        if (lowerCategory.includes('food') || lowerCategory.includes('restaurant') || lowerCategory.includes('cafe') || lowerCategory.includes('coffee')) return { category: 'Food & Beverage', isAnchor };
        if (lowerCategory.includes('health') || lowerCategory.includes('beauty') || lowerCategory.includes('pharmacy')) return { category: 'Health & Beauty', isAnchor };
        if (lowerCategory.includes('electronic') || lowerCategory.includes('tech') || lowerCategory.includes('phone')) return { category: 'Electronics & Technology', isAnchor };
        if (lowerCategory.includes('jewel') || lowerCategory.includes('watch')) return { category: 'Jewelry & Accessories', isAnchor };
        if (lowerCategory.includes('service') || lowerCategory.includes('bank') || lowerCategory.includes('travel')) return { category: 'Services', isAnchor };
        if (lowerCategory.includes('sport') || lowerCategory.includes('fitness')) return { category: 'Sports & Outdoors', isAnchor };
        if (lowerCategory.includes('home') || lowerCategory.includes('garden') || lowerCategory.includes('furniture')) return { category: 'Home & Garden', isAnchor };
        if (lowerCategory.includes('toy') || lowerCategory.includes('kids') || lowerCategory.includes('children')) return { category: 'Kids & Toys', isAnchor };
        if (lowerCategory.includes('entertainment') || lowerCategory.includes('leisure')) return { category: 'Entertainment', isAnchor };
    }

    // Fallback to name-based categorization
    if (['costa', 'starbucks', 'greggs', 'subway', 'mcdonald', 'kfc', 'nando', 'coffee', 'cafe', 'pizza', 'food', 'eat', 'burger', 'kebab', 'bakery', 'muffin', 'restaurant', 'bella italia', 'wagamama', 'zizzi'].some(k => lowerName.includes(k))) {
        return { category: 'Food & Beverage', isAnchor };
    }
    if (['boots', 'superdrug', 'specsaver', 'optician', 'pharmacy', 'beauty', 'salon', 'barber', 'hair', 'nail', 'fragrance', 'holland & barrett'].some(k => lowerName.includes(k))) {
        return { category: 'Health & Beauty', isAnchor };
    }
    if (['fashion', 'clothing', 'new look', 'primark', 'h&m', 'river island', 'next', 'peacock', 'shoe', 'clarks', 'foot locker', 'deichmann', 'schuh', 'dr martens', 'sports direct', 'jd'].some(k => lowerName.includes(k))) {
        return { category: 'Fashion & Apparel', isAnchor };
    }
    if (['phone', 'mobile', 'ee', 'o2', 'vodafone', 'three', 'tech', 'game', 'electronic', 'argos', 'currys', 'cex', 'hmv'].some(k => lowerName.includes(k))) {
        return { category: 'Electronics & Technology', isAnchor };
    }
    if (['jewel', 'h samuel', 'pandora', 'warren james', 'watch', 'ernest jones', 'goldsmiths'].some(k => lowerName.includes(k))) {
        return { category: 'Jewelry & Accessories', isAnchor };
    }
    if (['bank', 'building society', 'halifax', 'natwest', 'barclays', 'lloyds', 'hsbc', 'post office', 'travel', 'tui', 'estate agent', 'insurance', 'recruitment', 'timpson', 'max spielmann'].some(k => lowerName.includes(k))) {
        return { category: 'Services', isAnchor };
    }
    if (['sports', 'jd', 'fitness', 'gym', 'decathlon', 'trespass'].some(k => lowerName.includes(k))) {
        return { category: 'Sports & Outdoors', isAnchor };
    }
    if (['home', 'garden', 'furniture', 'the range', 'wilko', 'b&m', 'dunelm', 'ikea', 'homesense'].some(k => lowerName.includes(k))) {
        return { category: 'Home & Garden', isAnchor };
    }
    if (['toy', 'entertainer', 'kids', 'baby', 'smyths', 'claire'].some(k => lowerName.includes(k))) {
        return { category: 'Kids & Toys', isAnchor };
    }
    if (['card', 'gift', 'book', 'works', 'whsmith', 'clintons', 'the entertainer'].some(k => lowerName.includes(k))) {
        return { category: 'Entertainment', isAnchor };
    }
    if (['poundland', 'pound', 'b&m', 'home bargains', 'discount'].some(k => lowerName.includes(k))) {
        return { category: 'Discount Store', isAnchor };
    }
    if (['tesco', 'sainsbury', 'asda', 'morrisons', 'aldi', 'lidl', 'waitrose', 'iceland', 'co-op'].some(k => lowerName.includes(k))) {
        return { category: 'Supermarket', isAnchor: true };
    }

    return { category: 'General Retail', isAnchor };
}

// Parse different CSV formats
function extractTenantName(row: Record<string, string>): string | null {
    // Try various column names
    const nameColumns = ['tenantName', 'storeName', 'StoreTitle', 'brand__title', 'name', 'Name', 'title', 'Title'];
    for (const col of nameColumns) {
        if (row[col] && row[col].trim()) {
            return row[col].trim();
        }
    }
    // Try href-based extraction
    if (row['tablescraper-selected-row href']) {
        const parts = row['tablescraper-selected-row href'].split('/').filter(Boolean);
        const last = parts[parts.length - 1];
        if (last) return last.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
    }
    return null;
}

function extractCategory(row: Record<string, string>): string | undefined {
    const catColumns = ['categoryRaw', 'rawCategory', 'category', 'normalizedCategoryId'];
    for (const col of catColumns) {
        if (row[col] && row[col].trim()) {
            return row[col].trim();
        }
    }
    return undefined;
}

function extractIsAnchor(row: Record<string, string>): boolean {
    const anchorColumns = ['isAnchorTenant'];
    for (const col of anchorColumns) {
        if (row[col]) {
            return row[col].toLowerCase() === 'true' || row[col] === '1';
        }
    }
    return false;
}

// CSV file to location matching
const csvLocationMap: Record<string, { searchName: string; searchCity?: string }> = {
    'pentagonshoppingcentre.csv': { searchName: 'Pentagon', searchCity: 'Chatham' },
    'chathamdockside.csv': { searchName: 'Dockside Outlet Centre' },
    'chathamdockside f&b.csv': { searchName: 'Dockside Outlet Centre' },
    'hempsteadvalley.csv': { searchName: 'Hempstead Valley' },
    'hempsteadvalley f&b.csv': { searchName: 'Hempstead Valley' },
    'serpentine_green_full_40stores.csv': { searchName: 'Serpentine' },
    'serpentine_green_tenant_directory.csv': { searchName: 'Serpentine' },
    'bretton_centre_full_35stores.csv': { searchName: 'Bretton' },
    'bretton_centre_tenants_full.csv': { searchName: 'Bretton' },
    'ortongate_shopping_centre_tenant_directory.csv': { searchName: 'Ortongate' },
    'werrington_centre_tenant_directory.csv': { searchName: 'Werrington' },
    'pyramid_shopping_centre_tenant_directory.csv': { searchName: 'Pyramid' },
    'maskew_avenue_retail_park_tenant_directory.csv': { searchName: 'Maskew' },
    'fengate_retail_cluster_tenant_directory.csv': { searchName: 'Fengate' },
    'brotherhood_retail_park_tenant_directory.csv': { searchName: 'Brotherhood' },
    'boongate_retail_park_tenant_directory.csv': { searchName: 'Boongate' },
    'stanground_cardea_tenant_directory.csv': { searchName: 'Stanground' },
    'deeping_shopping_centre_tenant_directory.csv': { searchName: 'Deeping' },
    'hereward_cross_shopping_centre_tenant_directory.csv': { searchName: 'Hereward' },
    'discovery_business_park_tenant_directory.csv': { searchName: 'Discovery' },
    'peterborough_one_retail_park_tenant_directory.csv': { searchName: 'Peterborough One' },
    'peterborough_trade_centre_retail_park_tenant_directory.csv': { searchName: 'Trade Centre' },
};

async function findLocation(searchName: string, searchCity?: string): Promise<{ id: string; name: string } | null> {
    // First try managed locations
    let location = await prisma.location.findFirst({
        where: {
            isManaged: true,
            name: { contains: searchName, mode: 'insensitive' },
            ...(searchCity ? { city: { contains: searchCity, mode: 'insensitive' } } : {})
        },
        select: { id: true, name: true }
    });

    // If not managed, try all locations
    if (!location) {
        location = await prisma.location.findFirst({
            where: {
                name: { contains: searchName, mode: 'insensitive' },
                ...(searchCity ? { city: { contains: searchCity, mode: 'insensitive' } } : {})
            },
            select: { id: true, name: true }
        });
    }

    return location;
}

async function importCSV(filename: string, filepath: string): Promise<{ imported: number; location: string | null }> {
    const mapping = csvLocationMap[filename];
    if (!mapping) {
        return { imported: 0, location: null };
    }

    const location = await findLocation(mapping.searchName, mapping.searchCity);
    if (!location) {
        console.log(`  ⚠️  No location found for ${filename} (search: ${mapping.searchName})`);
        return { imported: 0, location: null };
    }

    // Read and parse CSV
    const content = readFileSync(filepath, 'utf-8');
    let records: Record<string, string>[];

    try {
        records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            bom: true
        });
    } catch (e) {
        console.log(`  ⚠️  Failed to parse ${filename}`);
        return { imported: 0, location: location.name };
    }

    let imported = 0;
    for (const row of records) {
        const tenantName = extractTenantName(row);
        if (!tenantName || tenantName.length < 2) continue;

        const rawCategory = extractCategory(row);
        const { category, isAnchor: nameIsAnchor } = categorizeStore(tenantName, rawCategory);
        const isAnchor = extractIsAnchor(row) || nameIsAnchor;

        try {
            await prisma.tenant.upsert({
                where: { locationId_name: { locationId: location.id, name: tenantName } },
                create: {
                    locationId: location.id,
                    name: tenantName,
                    category,
                    isAnchorTenant: isAnchor,
                },
                update: {
                    category,
                    isAnchorTenant: isAnchor,
                },
            });
            imported++;
        } catch (e) {
            // Skip errors (duplicates, etc)
        }
    }

    return { imported, location: location.name };
}

async function main() {
    console.log('\n🏪 BULK CSV TENANT IMPORT\n');
    console.log('='.repeat(60));

    const csvFiles = readdirSync('./public').filter(f =>
        f.endsWith('.csv') &&
        !f.includes('census') &&
        !f.includes('Properties') &&
        !f.includes('peterborough_centres') &&
        !f.includes('peterborough_tenants')
    );

    console.log(`📋 Found ${csvFiles.length} tenant CSV files\n`);

    let totalImported = 0;
    const results: { file: string; imported: number; location: string | null }[] = [];

    for (const file of csvFiles) {
        console.log(`📄 ${file}`);
        const result = await importCSV(file, `./public/${file}`);
        results.push({ file, ...result });

        if (result.imported > 0) {
            console.log(`  ✅ ${result.imported} tenants → ${result.location}`);
            totalImported += result.imported;
        } else if (result.location === null) {
            console.log(`  ⏭️  No location mapping`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n🎉 IMPORT COMPLETE: ${totalImported} tenants imported\n`);

    // Show final stats
    const totalTenants = await prisma.tenant.count();
    const locsWithTenants = await prisma.location.count({ where: { tenants: { some: {} } } });

    console.log(`📊 DATABASE STATUS:`);
    console.log(`   Total tenants: ${totalTenants}`);
    console.log(`   Locations with tenants: ${locsWithTenants}`);

    // Show breakdown by location
    const locs = await prisma.location.findMany({
        where: { tenants: { some: {} } },
        select: { name: true, city: true, isManaged: true, _count: { select: { tenants: true } } },
        orderBy: { tenants: { _count: 'desc' } },
        take: 20
    });

    console.log(`\n📋 Top locations by tenant count:`);
    for (const l of locs) {
        const managed = l.isManaged ? '[M]' : '   ';
        console.log(`   ${managed} ${l._count.tenants}: ${l.name} (${l.city || 'N/A'})`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
