#!/usr/bin/env tsx
/**
 * 🏬 MANAGED TENANT ENRICHMENT (Crawl4AI)
 * 
 * Uses Crawl4AI's AI-powered extraction to scrape store directories
 * for managed locations, prioritized by footfall.
 */

import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';

const prisma = new PrismaClient();

interface Store {
    name: string;
    category?: string;
    url?: string;
}

// Run the crawl4ai scraper
async function runCrawl4AI(url: string, timeout: number = 90000): Promise<Store[]> {
    return new Promise((resolve) => {
        const pythonPath = '/Users/mbeckett/miniconda3/bin/python3';
        const scriptPath = './scripts/crawl4ai_scraper.py';

        const childProcess = spawn(pythonPath, [scriptPath, url], {
            env: { ...process.env, OPENAI_API_KEY: process.env.OPENAI_API_KEY || '' }
        });

        let output = '';
        let error = '';

        childProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        childProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        const timer = setTimeout(() => {
            childProcess.kill();
            console.log(`   ⏱️  Timeout`);
            resolve([]);
        }, timeout);

        childProcess.on('close', (code) => {
            clearTimeout(timer);

            if (code !== 0) {
                if (error) console.log(`   ⚠️  ${error.substring(0, 100)}`);
                resolve([]);
                return;
            }

            try {
                const result = JSON.parse(output);
                if (result.error) {
                    console.log(`   ⚠️  ${result.error}`);
                    resolve([]);
                    return;
                }
                resolve(Array.isArray(result) ? result : []);
            } catch (e) {
                console.log(`   ⚠️  Parse error`);
                resolve([]);
            }
        });
    });
}

// Map scraped categories to our standard categories
function normalizeCategory(rawCategory?: string): string {
    if (!rawCategory) return 'Other';

    const cat = rawCategory.toLowerCase();

    const categoryMap: Record<string, string> = {
        fashion: 'Fashion & Apparel',
        clothing: 'Fashion & Apparel',
        apparel: 'Fashion & Apparel',
        shoes: 'Fashion & Apparel',
        footwear: 'Fashion & Apparel',
        electronics: 'Electronics & Technology',
        technology: 'Electronics & Technology',
        food: 'Food & Beverage',
        restaurant: 'Food & Beverage',
        cafe: 'Food & Beverage',
        coffee: 'Food & Beverage',
        health: 'Health & Beauty',
        beauty: 'Health & Beauty',
        pharmacy: 'Health & Beauty',
        home: 'Home & Garden',
        homeware: 'Home & Garden',
        furniture: 'Home & Garden',
        entertainment: 'Entertainment',
        sports: 'Sports & Outdoors',
        outdoor: 'Sports & Outdoors',
        jewellery: 'Jewelry & Accessories',
        jewelry: 'Jewelry & Accessories',
        accessories: 'Jewelry & Accessories',
        kids: 'Kids & Toys',
        toys: 'Kids & Toys',
        children: 'Kids & Toys',
        services: 'Services',
        bank: 'Financial Services',
        financial: 'Financial Services',
    };

    for (const [key, value] of Object.entries(categoryMap)) {
        if (cat.includes(key)) return value;
    }

    return 'Other';
}

// Detect if a store is likely an anchor tenant
function isAnchorTenant(name: string): boolean {
    const anchors = [
        'apple', 'john lewis', 'debenhams', 'house of fraser', 'selfridges',
        'marks & spencer', 'm&s', 'next', 'primark', 'h&m', 'zara', 'boots',
        'sainsbury', 'tesco', 'asda', 'morrisons', 'waitrose', 'aldi', 'lidl',
        'argos', 'currys', 'tk maxx', 'sports direct', 'river island'
    ];

    const lowerName = name.toLowerCase();
    return anchors.some(a => lowerName.includes(a));
}

async function main() {
    console.log('\n🏬 MANAGED TENANT ENRICHMENT (Crawl4AI)\n');
    console.log('='.repeat(60));

    if (!process.env.OPENAI_API_KEY) {
        console.error('❌ OPENAI_API_KEY not set');
        process.exit(1);
    }

    // Get command line arguments
    const args = process.argv.slice(2);
    const limit = args[0] ? parseInt(args[0]) : undefined;

    // Get managed locations with real websites AND footfall, sorted by footfall
    // First get locations WITH footfall (high value), then append those without
    const locationsWithFootfall = await prisma.location.findMany({
        where: {
            isManaged: true,
            footfall: { not: null },
            website: {
                not: null,
                notIn: ['https://thisisflourish.co.uk', 'http://thisisflourish.co.uk']
            },
        },
        select: {
            id: true,
            name: true,
            city: true,
            website: true,
            footfall: true,
            numberOfStores: true,
            _count: { select: { tenants: true } },
        },
        orderBy: { footfall: 'desc' },
    });

    // Apply limit to high-value locations first
    const locations = limit ? locationsWithFootfall.slice(0, limit) : locationsWithFootfall;

    // Filter out already enriched (80%+ coverage)
    const toEnrich = locations.filter(loc => {
        if (loc.numberOfStores && loc._count.tenants >= loc.numberOfStores * 0.8) {
            console.log(`⏭️  Skip ${loc.name} - already has ${loc._count.tenants} tenants`);
            return false;
        }
        return true;
    });

    console.log(`\n📊 SCOPE:`);
    console.log(`   Managed with real websites: ${locations.length}`);
    console.log(`   Already enriched: ${locations.length - toEnrich.length}`);
    console.log(`   To enrich: ${toEnrich.length}\n`);

    if (toEnrich.length === 0) {
        console.log('✅ All locations already enriched!');
        return;
    }

    let successCount = 0;
    let failCount = 0;
    let totalStoresAdded = 0;

    for (let i = 0; i < toEnrich.length; i++) {
        const loc = toEnrich[i];
        const footfallStr = loc.footfall ? `${(Number(loc.footfall) / 1000000).toFixed(1)}M` : 'N/A';

        console.log('\n' + '='.repeat(60));
        console.log(`[${i + 1}/${toEnrich.length}] ${loc.name} (${loc.city})`);
        console.log(`   Footfall: ${footfallStr} | Expected: ${loc.numberOfStores || '?'} stores`);
        console.log(`   Current: ${loc._count.tenants} tenants`);

        // Try different URL patterns for store directory
        const baseUrl = loc.website!.replace(/\/$/, '');
        const urlPatterns = [
            `${baseUrl}/shopping`,
            `${baseUrl}/stores`,
            `${baseUrl}/store-directory`,
            `${baseUrl}/shops`,
            `${baseUrl}/brands`,
            `${baseUrl}/retailers`,
            `${baseUrl}/directory`,
            baseUrl,
        ];

        let stores: Store[] = [];
        let successUrl = '';

        for (const url of urlPatterns) {
            const pattern = url.replace(baseUrl, '...');
            console.log(`   📍 ${pattern}`);

            stores = await runCrawl4AI(url);

            if (stores.length >= 5) {
                console.log(`   ✅ Found ${stores.length} stores`);
                successUrl = url;
                break;
            } else if (stores.length > 0) {
                console.log(`   ⚠️  Only ${stores.length} stores`);
            }

            // Small delay between URL attempts
            await new Promise(r => setTimeout(r, 1000));
        }

        if (stores.length === 0) {
            console.log(`   ❌ No stores found`);
            failCount++;
            continue;
        }

        // Save tenants to database
        let anchors = 0;
        const categories = new Set<string>();

        for (const store of stores) {
            const category = normalizeCategory(store.category);
            const isAnchor = isAnchorTenant(store.name);

            categories.add(category);
            if (isAnchor) anchors++;

            await prisma.tenant.upsert({
                where: {
                    locationId_name: {
                        locationId: loc.id,
                        name: store.name,
                    },
                },
                create: {
                    locationId: loc.id,
                    name: store.name,
                    category,
                    isAnchorTenant: isAnchor,
                },
                update: {
                    category,
                    isAnchorTenant: isAnchor,
                },
            });
        }

        console.log(`   💾 Saved ${stores.length} tenants`);
        console.log(`   📁 Categories: ${Array.from(categories).slice(0, 5).join(', ')}`);
        if (anchors > 0) console.log(`   ⭐ Anchors: ${anchors}`);

        successCount++;
        totalStoresAdded += stores.length;

        // Progress checkpoint every 5 locations
        if ((i + 1) % 5 === 0) {
            console.log(`\n📊 CHECKPOINT: ${successCount}/${i + 1} success, ${totalStoresAdded} stores added\n`);
        }

        // Delay between locations
        await new Promise(r => setTimeout(r, 3000));
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 COMPLETE!');
    console.log(`   ✅ Success: ${successCount}/${toEnrich.length}`);
    console.log(`   ❌ Failed: ${failCount}/${toEnrich.length}`);
    console.log(`   🏪 Stores added: ${totalStoresAdded}`);

    const totalTenants = await prisma.tenant.count();
    const withTenants = await prisma.location.count({ where: { tenants: { some: {} } } });
    console.log(`\n📊 DATABASE: ${totalTenants} tenants across ${withTenants} locations`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
