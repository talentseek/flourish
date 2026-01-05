#!/usr/bin/env tsx
/**
 * 🏬 LOW-TENANT MANAGED LOCATION ENRICHMENT
 * 
 * Targets managed locations with 0-5 tenants that have real websites.
 * Uses Playwright + OpenAI to extract tenant directories.
 * 
 * Usage:
 *   npx tsx scripts/enrich-low-tenant-managed.ts
 */

import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PYTHON_PATH = '/Users/mbeckett/miniconda3/bin/python3';
const SCRAPER_PATH = path.join(process.cwd(), 'scripts', 'playwright_openai_scraper.py');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PROGRESS_FILE = '/tmp/low-tenant-enrichment-progress.json';

interface Progress {
    completed: string[];
    successCount: number;
    failCount: number;
    totalStoresAdded: number;
    lastSaved: string;
    startTime: string;
}

interface Store {
    name: string;
    category?: string;
    url?: string;
}

function loadProgress(): Progress {
    if (existsSync(PROGRESS_FILE)) {
        try {
            return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
        } catch {
            console.log('⚠️  Starting fresh');
        }
    }
    return {
        completed: [],
        successCount: 0,
        failCount: 0,
        totalStoresAdded: 0,
        lastSaved: new Date().toISOString(),
        startTime: new Date().toISOString(),
    };
}

function saveProgress(progress: Progress) {
    progress.lastSaved = new Date().toISOString();
    writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function runScraper(url: string, timeout: number = 90000): Promise<Store[]> {
    return new Promise((resolve) => {
        const childProcess = spawn(PYTHON_PATH, [SCRAPER_PATH, url], {
            env: { ...process.env, OPENAI_API_KEY },
        });

        let stdout = '';
        let stderr = '';

        childProcess.stdout.on('data', (data) => { stdout += data.toString(); });
        childProcess.stderr.on('data', (data) => { stderr += data.toString(); });

        const timer = setTimeout(() => {
            childProcess.kill();
            console.log(`   ⏱️  Timeout`);
            resolve([]);
        }, timeout);

        childProcess.on('close', (code) => {
            clearTimeout(timer);
            if (code === 0) {
                try {
                    const data = JSON.parse(stdout);
                    if (Array.isArray(data)) {
                        resolve(data);
                    } else if (data.error) {
                        console.log(`   ⚠️  ${data.error}`);
                        resolve([]);
                    } else {
                        resolve([]);
                    }
                } catch {
                    console.log(`   ⚠️  Failed to parse response`);
                    resolve([]);
                }
            } else {
                if (stderr) console.log(`   ⚠️  ${stderr.substring(0, 100)}`);
                resolve([]);
            }
        });

        childProcess.on('error', (err) => {
            clearTimeout(timer);
            console.log(`   ❌ ${err.message}`);
            resolve([]);
        });
    });
}

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
        dining: 'Food & Beverage',
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
        parking: 'Services',
    };

    for (const [key, value] of Object.entries(categoryMap)) {
        if (cat.includes(key)) return value;
    }

    return 'Other';
}

function isAnchorTenant(name: string): boolean {
    const anchors = [
        'apple', 'john lewis', 'debenhams', 'house of fraser', 'selfridges',
        'marks & spencer', 'm&s', 'next', 'primark', 'h&m', 'zara', 'boots',
        'sainsbury', 'tesco', 'asda', 'morrisons', 'waitrose', 'aldi', 'lidl',
        'argos', 'currys', 'tk maxx', 'sports direct', 'river island',
        'superdrug', 'wilko', 'poundland', 'iceland'
    ];

    const lowerName = name.toLowerCase();
    return anchors.some(a => lowerName.includes(a));
}

async function findStoreDirectory(baseUrl: string): Promise<{ stores: Store[]; url: string } | null> {
    const cleanBase = baseUrl.replace(/\/$/, '');

    // URL patterns to try, prioritized
    const urlPatterns = [
        `${cleanBase}/stores`,
        `${cleanBase}/store-directory`,
        `${cleanBase}/shops`,
        `${cleanBase}/shopping`,
        `${cleanBase}/brands`,
        `${cleanBase}/retailers`,
        `${cleanBase}/directory`,
        `${cleanBase}/whats-here`,
        `${cleanBase}/our-stores`,
        cleanBase, // Fallback to main page
    ];

    for (const url of urlPatterns) {
        const pattern = url.replace(cleanBase, '...');
        console.log(`   📍 Trying: ${pattern}`);

        const stores = await runScraper(url, 90000);

        if (stores && stores.length >= 3) {
            console.log(`   ✅ Found ${stores.length} stores!`);
            return { stores, url };
        } else if (stores && stores.length > 0) {
            console.log(`   ⚠️  Only ${stores.length} stores`);
        }

        // Small delay between attempts
        await new Promise(r => setTimeout(r, 1000));
    }

    return null;
}

async function main() {
    console.log('\n🏬 LOW-TENANT MANAGED LOCATION ENRICHMENT');
    console.log('='.repeat(60));

    if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not set');
    }

    const progress = loadProgress();

    if (progress.completed.length > 0) {
        console.log(`🔄 Resuming: ${progress.completed.length} done, ${progress.successCount} success`);
    }

    // Get managed locations with 0-5 tenants AND real websites
    const locations = await prisma.location.findMany({
        where: {
            isManaged: true,
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

    // Filter to only locations with 0-5 tenants and not already processed
    const toEnrich = locations.filter(loc => {
        if (progress.completed.includes(loc.id)) return false;
        if (loc._count.tenants > 5) return false;
        return true;
    });

    console.log(`\n📊 SCOPE:`);
    console.log(`   Managed with website & ≤5 tenants: ${toEnrich.length}`);
    console.log(`   Already processed: ${progress.completed.length}\n`);

    if (toEnrich.length === 0) {
        console.log('✅ All eligible locations processed!');
        return;
    }

    console.log('🎯 Locations to enrich:');
    for (const loc of toEnrich) {
        const footfallStr = loc.footfall ? `${(Number(loc.footfall) / 1000000).toFixed(1)}M` : 'N/A';
        console.log(`   - ${loc.name} (${loc._count.tenants} tenants, ${footfallStr})`);
    }

    console.log('\nStarting in 3 seconds...\n');
    await new Promise(r => setTimeout(r, 3000));

    for (let i = 0; i < toEnrich.length; i++) {
        const loc = toEnrich[i];
        const footfallStr = loc.footfall ? `${(Number(loc.footfall) / 1000000).toFixed(1)}M` : 'N/A';

        console.log('\n' + '='.repeat(60));
        console.log(`[${i + 1}/${toEnrich.length}] ${loc.name}`);
        console.log(`   City: ${loc.city || 'Unknown'} | Footfall: ${footfallStr}`);
        console.log(`   Current tenants: ${loc._count.tenants}`);
        console.log(`   🌐 ${loc.website}`);

        try {
            const result = await findStoreDirectory(loc.website!);

            if (result && result.stores.length > 0) {
                // Save tenants to database
                let anchors = 0;
                const categories = new Set<string>();

                for (const store of result.stores) {
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

                console.log(`   💾 Saved ${result.stores.length} tenants`);
                console.log(`   📁 Categories: ${Array.from(categories).slice(0, 4).join(', ')}`);
                if (anchors > 0) console.log(`   ⭐ Anchors: ${anchors}`);

                progress.successCount++;
                progress.totalStoresAdded += result.stores.length;
            } else {
                console.log(`   ❌ No stores found`);
                progress.failCount++;
            }

            progress.completed.push(loc.id);
            saveProgress(progress);

            // Delay between locations
            await new Promise(r => setTimeout(r, 2000));
        } catch (error) {
            console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
            progress.failCount++;
            progress.completed.push(loc.id);
            saveProgress(progress);
        }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 COMPLETE!');
    console.log(`   ✅ Success: ${progress.successCount}`);
    console.log(`   ❌ Failed: ${progress.failCount}`);
    console.log(`   🏪 Stores added: ${progress.totalStoresAdded}`);

    // Overall stats
    const totalTenants = await prisma.tenant.count();
    const withTenants = await prisma.location.count({ where: { tenants: { some: {} } } });
    const managedWithTenants = await prisma.location.count({
        where: { isManaged: true, tenants: { some: {} } }
    });

    console.log(`\n📊 DATABASE SUMMARY:`);
    console.log(`   Total tenants: ${totalTenants}`);
    console.log(`   Locations with tenants: ${withTenants}`);
    console.log(`   Managed with tenants: ${managedWithTenants}/65`);
}

main()
    .catch((error) => {
        console.error('❌ ERROR:', error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
