#!/usr/bin/env tsx
/**
 * FIRECRAWL TENANT ENRICHMENT
 * 
 * Uses Firecrawl's AI-powered JSON extraction to scrape tenant lists
 * from managed shopping centre websites.
 * 
 * Budget: 900 credits available
 * Target: 16 managed locations with <10 tenants
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const FIRECRAWL_API_KEY = 'fc-e76a22b8414146b0a8928c82683c9a22';
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v2/scrape';
const LOG_FILE = '/tmp/firecrawl-tenant-enrichment.log';
const PROGRESS_FILE = '/tmp/firecrawl-progress.json';
const MAX_CREDITS = 100; // Safety limit

interface FirecrawlResponse {
    success: boolean;
    data?: {
        json?: {
            stores?: Array<{
                name: string;
                category?: string;
            }>;
        };
        metadata?: {
            title?: string;
            sourceURL?: string;
        };
    };
    error?: string;
}

interface Progress {
    startedAt: string;
    processedIds: string[];
    creditsUsed: number;
    tenantsAdded: number;
}

function log(msg: string) {
    const ts = new Date().toISOString().slice(11, 19);
    const line = `[${ts}] ${msg}`;
    console.log(line);
    try { appendFileSync(LOG_FILE, line + '\n'); } catch { }
}

function loadProgress(): Progress {
    try {
        if (existsSync(PROGRESS_FILE)) {
            return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
        }
    } catch { }
    return { startedAt: new Date().toISOString(), processedIds: [], creditsUsed: 0, tenantsAdded: 0 };
}

function saveProgress(progress: Progress) {
    try { writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2)); } catch { }
}

// JSON Schema for tenant extraction
const TENANT_SCHEMA = {
    type: "object",
    properties: {
        stores: {
            type: "array",
            description: "List of all stores, shops, restaurants and tenants at this shopping centre",
            items: {
                type: "object",
                properties: {
                    name: { type: "string", description: "Store/shop name" },
                    category: { type: "string", description: "Category like Fashion, Food & Drink, Services, etc" }
                },
                required: ["name"]
            }
        }
    },
    required: ["stores"]
};

async function scrapeWithFirecrawl(url: string): Promise<{ stores: Array<{ name: string, category?: string }>, creditsUsed: number }> {
    try {
        const response = await fetch(FIRECRAWL_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                formats: [{
                    type: "json",
                    schema: TENANT_SCHEMA,
                    prompt: "Extract all store names and their categories from this shopping centre directory page. Include all shops, restaurants, cafes, services, and retailers. If categories aren't shown, infer from the store name."
                }],
                timeout: 60000
            })
        });

        const data: FirecrawlResponse = await response.json();

        if (!data.success || !data.data?.json?.stores) {
            return { stores: [], creditsUsed: 5 }; // JSON extraction costs ~5 credits even on failure
        }

        return {
            stores: data.data.json.stores.filter(s => s.name && s.name.length > 1),
            creditsUsed: 5
        };
    } catch (error: any) {
        log(`   API Error: ${error.message}`);
        return { stores: [], creditsUsed: 0 };
    }
}

async function saveTenants(stores: Array<{ name: string, category?: string }>, locationId: string): Promise<number> {
    let count = 0;
    for (const store of stores) {
        try {
            await prisma.tenant.upsert({
                where: { locationId_name: { locationId, name: store.name } },
                create: {
                    locationId,
                    name: store.name,
                    category: store.category || 'Other',
                    isAnchorTenant: false
                },
                update: { category: store.category || 'Other' }
            });
            count++;
        } catch { }
    }
    return count;
}

// Based on website research: known URL patterns for store directories
const STORE_URL_PATTERNS = [
    '/stores',
    '/stores/',
    '/shops',
    '/shops/',
    '/shopping',
    '/shopping/',
    '/all-retailers',
    '/directory',
    '/store-directory',
    ''  // Homepage as last resort
];

// Generate URLs to try based on known patterns
function getStoreUrls(baseUrl: string): string[] {
    return STORE_URL_PATTERNS.map(pattern => baseUrl + pattern);
}

async function main() {
    log('');
    log('═'.repeat(60));
    log('FIRECRAWL TENANT ENRICHMENT (Smart Mode)');
    log('═'.repeat(60));
    log(`Credit limit: ${MAX_CREDITS}`);

    const progress = loadProgress();
    log(`Previously used credits: ${progress.creditsUsed}`);
    log(`Previously added tenants: ${progress.tenantsAdded}`);

    if (progress.creditsUsed >= MAX_CREDITS) {
        log('❌ Credit limit reached. Stopping.');
        return;
    }

    // Get managed locations with websites and <10 tenants
    const locations = await prisma.location.findMany({
        where: {
            isManaged: true,
            website: { not: null }
        },
        include: { _count: { select: { tenants: true } } },
        orderBy: { name: 'asc' }
    });

    const needTenants = locations
        .filter(l => l._count.tenants < 10 && !progress.processedIds.includes(l.id));

    log(`Locations to process: ${needTenants.length}`);
    log('');

    for (let i = 0; i < needTenants.length; i++) {
        const loc = needTenants[i];
        const baseUrl = loc.website?.replace(/\/$/, '') || '';

        log(`[${i + 1}/${needTenants.length}] ${loc.name}`);
        log(`   Current tenants: ${loc._count.tenants}`);
        log(`   Website: ${baseUrl}`);

        // Check credit budget
        if (progress.creditsUsed >= MAX_CREDITS) {
            log(`⚠️  Credit limit reached (${progress.creditsUsed}/${MAX_CREDITS}). Stopping.`);
            break;
        }

        // Get URLs to try based on known patterns
        const storeUrls = getStoreUrls(baseUrl);
        log(`   📍 Trying ${storeUrls.length} URL patterns...`);

        let bestStores: Array<{ name: string, category?: string }> = [];

        // Step 2: Scrape the found URLs with JSON extraction
        for (const url of storeUrls) {
            log(`   🔍 Scraping: ${url.substring(0, 55)}...`);

            const result = await scrapeWithFirecrawl(url);
            progress.creditsUsed += result.creditsUsed;

            if (result.stores.length > bestStores.length) {
                bestStores = result.stores;
                log(`   ✅ Found ${result.stores.length} stores`);
            }

            // If we found good results, stop
            if (bestStores.length >= 10) {
                break;
            }

            await new Promise(r => setTimeout(r, 1000));
        }

        if (bestStores.length > 0) {
            const saved = await saveTenants(bestStores, loc.id);
            progress.tenantsAdded += saved;
            log(`   💾 Saved ${saved} tenants to database`);

            const examples = bestStores.slice(0, 5).map(s => s.name).join(', ');
            log(`   📝 Examples: ${examples}${bestStores.length > 5 ? '...' : ''}`);
        } else {
            log(`   ❌ No stores found`);
        }

        progress.processedIds.push(loc.id);
        saveProgress(progress);

        log(`   💰 Credits used: ${progress.creditsUsed}/${MAX_CREDITS}`);
        log('');

        await new Promise(r => setTimeout(r, 2000));
    }

    saveProgress(progress);

    log('═'.repeat(60));
    log('COMPLETE');
    log('═'.repeat(60));
    log(`Total credits used: ${progress.creditsUsed}`);
    log(`Total tenants added: ${progress.tenantsAdded}`);
    log(`Locations processed: ${progress.processedIds.length}`);
}

main()
    .catch(e => log(`❌ Error: ${e.message}`))
    .finally(() => prisma.$disconnect());
