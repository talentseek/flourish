#!/usr/bin/env tsx
/**
 * 🏬 MANAGED LOCATIONS TENANT ENRICHMENT
 * 
 * Extract store directories for all 65 managed locations.
 * Prioritized by footfall (highest first).
 */

import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PYTHON_PATH = '/Users/mbeckett/miniconda3/bin/python3';
const SCRAPER_PATH = path.join(process.cwd(), 'scripts', 'playwright_openai_scraper.py');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PROGRESS_FILE = '/tmp/managed-tenant-progress.json';

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
        } catch (e) {
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

async function runScraper(url: string, timeout: number = 60000): Promise<Store[]> {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(PYTHON_PATH, [SCRAPER_PATH, url], {
            env: { ...process.env, OPENAI_API_KEY },
        });

        let stdout = '';
        let stderr = '';

        childProcess.stdout.on('data', (data) => { stdout += data.toString(); });
        childProcess.stderr.on('data', (data) => { stderr += data.toString(); });

        const timer = setTimeout(() => {
            childProcess.kill();
            reject(new Error('Timeout'));
        }, timeout);

        childProcess.on('close', (code) => {
            clearTimeout(timer);
            if (code === 0) {
                try {
                    const data = JSON.parse(stdout);
                    if (Array.isArray(data)) {
                        resolve(data);
                    } else {
                        reject(new Error('Invalid JSON'));
                    }
                } catch (e) {
                    reject(new Error('Failed to parse JSON'));
                }
            } else {
                reject(new Error(`Exit code ${code}`));
            }
        });

        childProcess.on('error', (err) => {
            clearTimeout(timer);
            reject(err);
        });
    });
}

async function findStoreDirectory(baseUrl: string): Promise<{ stores: Store[]; url: string } | null> {
    const cleanBase = baseUrl.replace(/\/$/, '');

    const urlPatterns = [
        `${cleanBase}/stores`,
        `${cleanBase}/store-directory`,
        `${cleanBase}/shops`,
        `${cleanBase}/brands`,
        `${cleanBase}/retailers`,
        `${cleanBase}/directory`,
        `${cleanBase}/store-finder`,
        cleanBase,
    ];

    for (const url of urlPatterns) {
        const pattern = url.replace(cleanBase, '...');
        console.log(`   📍 Trying: ${pattern}`);

        try {
            const stores = await runScraper(url, 60000);

            if (stores && stores.length >= 5) {
                console.log(`   ✅ Found ${stores.length} stores!`);
                return { stores, url };
            } else if (stores && stores.length > 0) {
                console.log(`   ⚠️  Only ${stores.length} stores`);
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Timeout') {
                console.log(`   ⏱️  Timeout`);
            } else {
                console.log(`   ⚠️  ${error instanceof Error ? error.message : 'Error'}`);
            }
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return null;
}

async function saveTenants(stores: Store[], locationId: string) {
    const categoryMap: Record<string, string> = {
        fashion: 'Fashion & Apparel',
        electronics: 'Electronics',
        food: 'Food & Beverage',
        'health & beauty': 'Health & Beauty',
        home: 'Home & Garden',
        entertainment: 'Entertainment',
        services: 'Services',
        sports: 'Sports & Outdoors',
        jewellery: 'Jewelry & Accessories',
        jewelry: 'Jewelry & Accessories',
        kids: 'Kids & Toys',
        specialist: 'Specialist Retail',
    };

    let anchorCount = 0;
    const categories = new Set<string>();

    for (const store of stores) {
        const rawCategory = store.category?.toLowerCase() || 'other';
        const isAnchor = store.name.length > 15 || ['department', 'anchor'].some(k => rawCategory.includes(k));

        if (isAnchor) anchorCount++;

        const category = categoryMap[rawCategory] || categoryMap[rawCategory.split(' ')[0]] || 'Other';
        categories.add(category);

        await prisma.tenant.upsert({
            where: {
                locationId_name: {
                    locationId,
                    name: store.name,
                },
            },
            create: {
                locationId,
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

    console.log(`   ✅ Saved ${stores.length} stores`);
    console.log(`   🏬 Categories: ${Array.from(categories).join(', ')}`);
}

async function main() {
    console.log('\n🏬 MANAGED LOCATIONS TENANT ENRICHMENT');
    console.log('='.repeat(60));

    if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not set');
    }

    const progress = loadProgress();

    if (progress.completed.length > 0) {
        console.log(`🔄 Resuming: ${progress.completed.length} done, ${progress.successCount} success`);
    }

    // Get args
    const args = process.argv.slice(2);
    const limit = args[0] ? parseInt(args[0]) : undefined;

    // Get managed locations with REAL websites (not placeholder), sorted by footfall
    const allLocations = await prisma.location.findMany({
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
        take: limit,
    });

    // Filter out completed and already enriched
    const locations = allLocations.filter((loc) => {
        if (progress.completed.includes(loc.id)) return false;
        if (loc.numberOfStores && loc._count.tenants >= loc.numberOfStores * 0.8) {
            console.log(`⏭️  Skip ${loc.name} - already ${loc._count.tenants} tenants`);
            return false;
        }
        return true;
    });

    console.log(`\n📊 SCOPE:`);
    console.log(`   Managed with website: ${allLocations.length}`);
    console.log(`   Already done: ${progress.completed.length}`);
    console.log(`   Remaining: ${locations.length}\n`);

    if (locations.length === 0) {
        console.log('✅ All done!');
        return;
    }

    console.log('Starting in 3 seconds...\n');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    for (let i = 0; i < locations.length; i++) {
        const loc = locations[i];
        const footfallStr = loc.footfall ? `${(Number(loc.footfall) / 1000000).toFixed(1)}M` : 'N/A';

        console.log('\n' + '='.repeat(60));
        console.log(`[${i + 1}/${locations.length}] ${loc.name} (${loc.city})`);
        console.log(`   Footfall: ${footfallStr} | Expected: ${loc.numberOfStores || '?'} stores`);
        console.log(`   🌐 ${loc.website}`);

        try {
            const result = await findStoreDirectory(loc.website!);

            if (result && result.stores.length > 0) {
                await saveTenants(result.stores, loc.id);
                progress.successCount++;
                progress.totalStoresAdded += result.stores.length;
            } else {
                console.log(`   ❌ No stores found`);
                progress.failCount++;
            }

            progress.completed.push(loc.id);
            saveProgress(progress);

            // Checkpoint every 5
            if ((i + 1) % 5 === 0) {
                console.log(`\n📊 CHECKPOINT: ${progress.successCount} success, ${progress.failCount} failed, ${progress.totalStoresAdded} stores\n`);
            }

            await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
            console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
            progress.failCount++;
            progress.completed.push(loc.id);
            saveProgress(progress);
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 COMPLETE!');
    console.log(`✅ Success: ${progress.successCount}`);
    console.log(`❌ Failed: ${progress.failCount}`);
    console.log(`🏪 Stores added: ${progress.totalStoresAdded}`);

    const totalTenants = await prisma.tenant.count();
    const withTenants = await prisma.location.count({ where: { tenants: { some: {} } } });
    console.log(`\n📊 DB: ${totalTenants} tenants across ${withTenants} locations`);
}

main()
    .catch((error) => {
        console.error('❌ ERROR:', error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
