#!/usr/bin/env tsx
/**
 * PRIORITY TENANT ENRICHMENT
 * 
 * Scrapes tenants from priority locations (near managed centres)
 * Uses Playwright + OpenAI for AI-powered extraction
 */
import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';
import { readFileSync, existsSync, writeFileSync, appendFileSync } from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Load env from .env file
dotenv.config();

const prisma = new PrismaClient();
const PYTHON_PATH = process.env.PYTHON_PATH || 'python3';
const SCRAPER_PATH = path.join(__dirname, 'playwright_openai_scraper.py');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const LOG_FILE = '/tmp/priority-tenant-enrichment.log';
const PROGRESS_FILE = '/tmp/priority-tenant-progress.json';

interface Store {
    name: string;
    category?: string;
    url?: string;
}

function log(msg: string) {
    const ts = new Date().toISOString().slice(11, 19);
    const line = `[${ts}] ${msg}`;
    console.log(line);
    try { appendFileSync(LOG_FILE, line + '\n'); } catch { }
}

function loadProgress(): { processedIds: string[]; tenantsAdded: number } {
    try {
        if (existsSync(PROGRESS_FILE)) {
            return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
        }
    } catch { }
    return { processedIds: [], tenantsAdded: 0 };
}

function saveProgress(progress: { processedIds: string[]; tenantsAdded: number }) {
    try { writeFileSync(PROGRESS_FILE, JSON.stringify(progress)); } catch { }
}

async function runScraper(url: string): Promise<Store[]> {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => resolve([]), 60000);

        try {
            const proc = spawn(PYTHON_PATH, [SCRAPER_PATH, url], {
                env: { ...process.env, OPENAI_API_KEY },
            });

            let output = '';
            proc.stdout.on('data', (data) => { output += data.toString(); });
            proc.stderr.on('data', () => { });

            proc.on('close', () => {
                clearTimeout(timeout);
                try {
                    const jsonMatch = output.match(/\[[\s\S]*\]/);
                    if (jsonMatch) {
                        resolve(JSON.parse(jsonMatch[0]));
                    } else {
                        resolve([]);
                    }
                } catch {
                    resolve([]);
                }
            });
        } catch {
            clearTimeout(timeout);
            resolve([]);
        }
    });
}

async function saveTenants(stores: Store[], locationId: string): Promise<number> {
    let count = 0;
    for (const store of stores) {
        try {
            await prisma.tenant.upsert({
                where: { locationId_name: { locationId, name: store.name } },
                create: {
                    locationId,
                    name: store.name,
                    category: store.category || 'Other',
                    isAnchorTenant: store.name.length > 20
                },
                update: { category: store.category || 'Other' }
            });
            count++;
        } catch { }
    }
    return count;
}

async function main() {
    log('');
    log('═'.repeat(60));
    log('PRIORITY TENANT ENRICHMENT');
    log('═'.repeat(60));

    if (!OPENAI_API_KEY) {
        log('❌ OPENAI_API_KEY not set - cannot run AI scraper');
        return;
    }

    // Load priority locations
    const priorityIds: string[] = JSON.parse(readFileSync('/tmp/priority-location-ids.json', 'utf-8'));
    log(`Loaded ${priorityIds.length} priority location IDs`);

    const progress = loadProgress();
    log(`Already processed: ${progress.processedIds.length}`);
    log(`Tenants added so far: ${progress.tenantsAdded}`);

    // Get locations
    const locations = await prisma.location.findMany({
        where: {
            id: { in: priorityIds },
            website: { not: null }
        },
        include: { _count: { select: { tenants: true } } },
        orderBy: { name: 'asc' }
    });

    const remaining = locations.filter(l =>
        !progress.processedIds.includes(l.id) && l._count.tenants === 0
    );

    log(`Remaining to process: ${remaining.length}`);
    log('');

    const urlPatterns = ['/stores', '/shops', '/directory', '/store-directory', '/stores-list', ''];

    for (let i = 0; i < remaining.length; i++) {
        const loc = remaining[i];
        const baseUrl = loc.website?.replace(/\/$/, '') || '';

        log(`[${i + 1}/${remaining.length}] ${loc.name}`);
        log(`   Website: ${baseUrl}`);

        let foundStores: Store[] = [];

        for (const pattern of urlPatterns) {
            const url = baseUrl + pattern;
            log(`   Trying: ${pattern || '/'}`);

            const stores = await runScraper(url);
            if (stores.length >= 3) {
                foundStores = stores;
                log(`   ✅ Found ${stores.length} stores`);
                break;
            }
        }

        if (foundStores.length > 0) {
            const saved = await saveTenants(foundStores, loc.id);
            progress.tenantsAdded += saved;
            log(`   💾 Saved ${saved} tenants`);
        } else {
            log(`   ❌ No stores found`);
        }

        progress.processedIds.push(loc.id);

        if ((i + 1) % 10 === 0) {
            saveProgress(progress);
            log(`\n📊 Progress: ${progress.processedIds.length} processed, ${progress.tenantsAdded} tenants added\n`);
        }

        await new Promise(r => setTimeout(r, 2000));
    }

    saveProgress(progress);
    log('');
    log('═'.repeat(60));
    log('COMPLETE');
    log(`Processed: ${progress.processedIds.length}`);
    log(`Tenants added: ${progress.tenantsAdded}`);
    log('═'.repeat(60));
}

main()
    .catch(e => log(`❌ Error: ${e.message}`))
    .finally(() => prisma.$disconnect());
