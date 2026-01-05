#!/usr/bin/env tsx
/**
 * ULTIMATE ENRICHMENT SCRIPT
 * 
 * Runs unattended to enrich all locations with:
 * 1. Tenant data via AI scraping (Playwright + OpenAI)
 * 2. Hero images from Wikipedia API
 * 3. Progress logging to file
 * 
 * Usage: npx tsx scripts/ultimate-enrichment.ts 2>&1 | tee enrichment.log
 */
import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';
import { existsSync, mkdirSync, createWriteStream, appendFileSync } from 'fs';
import https from 'https';
import path from 'path';

const prisma = new PrismaClient();

const LOG_FILE = '/tmp/ultimate-enrichment.log';
const PROGRESS_FILE = '/tmp/ultimate-enrichment-progress.json';
const PYTHON_PATH = process.env.PYTHON_PATH || '/Users/mbeckett/miniconda3/bin/python3';
const SCRAPER_PATH = path.join(process.cwd(), 'scripts', 'playwright_openai_scraper.py');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Logging utilities
function log(msg: string) {
    const timestamp = new Date().toISOString().slice(11, 19);
    const line = `[${timestamp}] ${msg}`;
    console.log(line);
    appendFileSync(LOG_FILE, line + '\n');
}

function logSection(title: string) {
    log('');
    log('='.repeat(60));
    log(title);
    log('='.repeat(60));
}

// Progress tracking
interface Progress {
    startedAt: string;
    tenantsProcessed: string[];
    imagesProcessed: string[];
    totalTenants: number;
    totalImages: number;
    errors: string[];
}

function loadProgress(): Progress {
    try {
        if (existsSync(PROGRESS_FILE)) {
            return JSON.parse(require('fs').readFileSync(PROGRESS_FILE, 'utf-8'));
        }
    } catch { }
    return {
        startedAt: new Date().toISOString(),
        tenantsProcessed: [],
        imagesProcessed: [],
        totalTenants: 0,
        totalImages: 0,
        errors: []
    };
}

function saveProgress(progress: Progress) {
    require('fs').writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Category normalization
const categoryMap: Record<string, string> = {
    'fashion': 'Fashion & Apparel',
    'clothing': 'Fashion & Apparel',
    'apparel': 'Fashion & Apparel',
    'shoes': 'Fashion & Apparel',
    'food': 'Food & Beverage',
    'restaurant': 'Food & Beverage',
    'cafe': 'Food & Beverage',
    'coffee': 'Food & Beverage',
    'dining': 'Food & Beverage',
    'beauty': 'Health & Beauty',
    'health': 'Health & Beauty',
    'pharmacy': 'Health & Beauty',
    'cosmetics': 'Health & Beauty',
    'electronics': 'Electronics & Technology',
    'technology': 'Electronics & Technology',
    'phone': 'Electronics & Technology',
    'mobile': 'Electronics & Technology',
    'sports': 'Sports & Outdoors',
    'outdoor': 'Sports & Outdoors',
    'home': 'Home & Garden',
    'garden': 'Home & Garden',
    'furniture': 'Home & Garden',
    'jewelry': 'Jewelry & Accessories',
    'jewellery': 'Jewelry & Accessories',
    'accessories': 'Jewelry & Accessories',
    'entertainment': 'Entertainment',
    'cinema': 'Entertainment',
    'games': 'Entertainment',
    'bank': 'Financial Services',
    'financial': 'Financial Services',
    'service': 'Services',
    'services': 'Services',
};

function normalizeCategory(raw: string): string {
    const lower = raw.toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
        if (lower.includes(key)) return value;
    }
    return 'Other';
}

// Anchor tenant detection
const anchorKeywords = ['department', 'supermarket', 'anchor', 'cinema', 'primark', 'marks', 'next', 'boots', 'argos', 'tesco', 'sainsbury', 'asda', 'morrisons', 'john lewis', 'debenhams', 'h&m', 'tk maxx', 'river island'];

function isAnchorTenant(name: string, category: string): boolean {
    const lower = name.toLowerCase();
    return anchorKeywords.some(k => lower.includes(k)) || category.includes('Department');
}

// URL patterns for store directories
const urlPatterns = [
    '/stores', '/store-directory', '/shops', '/shopping', '/brands',
    '/retailers', '/directory', '/whats-here', '/our-stores', '/occupiers',
    '/tenants', '/our-tenants', ''
];

// Run the Python scraper
async function runScraper(url: string, timeout = 60000): Promise<any[]> {
    return new Promise((resolve) => {
        if (!OPENAI_API_KEY) {
            log('  ⚠️  No OPENAI_API_KEY - skipping');
            resolve([]);
            return;
        }

        let output = '';
        const child = spawn(PYTHON_PATH, [SCRAPER_PATH, url], {
            env: { ...process.env, OPENAI_API_KEY }
        });

        const timer = setTimeout(() => {
            child.kill();
            log('  ⏱️  Timeout');
            resolve([]);
        }, timeout);

        child.stdout.on('data', (data) => { output += data.toString(); });
        child.stderr.on('data', () => { });
        child.on('close', () => {
            clearTimeout(timer);
            try {
                const lines = output.trim().split('\n');
                for (const line of lines.reverse()) {
                    if (line.startsWith('[')) {
                        resolve(JSON.parse(line));
                        return;
                    }
                }
                resolve([]);
            } catch {
                resolve([]);
            }
        });
    });
}

// Find store directory URL
async function findStoreDirectory(baseUrl: string): Promise<{ stores: any[]; url: string } | null> {
    const cleanBase = baseUrl.replace(/\/$/, '');

    for (const pattern of urlPatterns) {
        const url = pattern ? `${cleanBase}${pattern}` : cleanBase;
        log(`  📍 Trying: ${url.replace(cleanBase, '...')}`);

        const stores = await runScraper(url);
        if (stores.length >= 3) {
            return { stores, url };
        }
    }
    return null;
}

// Save tenants to database
async function saveTenants(stores: any[], locationId: string): Promise<number> {
    let saved = 0;
    for (const store of stores) {
        try {
            const category = normalizeCategory(store.category || 'Other');
            const isAnchor = isAnchorTenant(store.name, category);

            await prisma.tenant.upsert({
                where: { locationId_name: { locationId, name: store.name } },
                create: {
                    locationId,
                    name: store.name,
                    category,
                    isAnchorTenant: isAnchor
                },
                update: { category, isAnchorTenant: isAnchor }
            });
            saved++;
        } catch { }
    }
    return saved;
}

// Wikipedia article mappings for hero images
const wikiMappings: Record<string, string> = {
    'Pentagon': 'Pentagon_Shopping_Centre',
    'Mailbox Birmingham': 'Mailbox_Birmingham',
    'St Katharine': 'St_Katharine_Docks',
    'Cwmbran': 'Cwmbran_Centre',
    'Grosvenor': 'Grosvenor_Shopping_Centre',
    'Marlands': 'Marlands_Shopping_Centre',
    'Shires': 'The_Shires_Shopping_Centre',
    'Highcross': 'Highcross_Leicester',
    'Forge': 'The_Forge_Shopping_Centre',
    'Serpentine': 'Serpentine_Green',
    'Bridges': 'The_Bridges,_Sunderland',
    'Midsummer': 'Midsummer_Place',
    'One Stop': 'One_Stop_Shopping_Centre',
    'Lower Precinct': 'Lower_Precinct',
};

// Fetch image URL from Wikipedia
async function fetchWikiImage(article: string): Promise<string | null> {
    return new Promise((resolve) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(article)}&prop=pageimages&format=json&pithumbsize=1200`;

        https.get(url, { headers: { 'User-Agent': 'FlourishBot/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const pages = json.query?.pages || {};
                    const page = Object.values(pages)[0] as any;
                    resolve(page?.thumbnail?.source || null);
                } catch {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

// Download image
async function downloadImage(url: string, filepath: string): Promise<boolean> {
    return new Promise((resolve) => {
        const file = createWriteStream(filepath);
        https.get(url, { headers: { 'User-Agent': 'FlourishBot/1.0' } }, (res) => {
            if (res.statusCode !== 200) {
                file.close();
                resolve(false);
                return;
            }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(true); });
        }).on('error', () => { file.close(); resolve(false); });
    });
}

function slugify(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 50);
}

// ============================================
// MAIN ENRICHMENT PHASES
// ============================================

async function enrichTenants(progress: Progress) {
    logSection('PHASE 1: TENANT ENRICHMENT');

    // Get locations with websites but low tenant count
    const locations = await prisma.location.findMany({
        where: {
            website: { not: null },
            NOT: { website: { contains: 'thisisflourish' } }
        },
        include: { _count: { select: { tenants: true } } },
        orderBy: { footfall: 'desc' }
    });

    // Filter to locations with <= 10 tenants
    const candidates = locations.filter(l =>
        l._count.tenants <= 10 &&
        !progress.tenantsProcessed.includes(l.id)
    );

    log(`📍 ${candidates.length} locations need tenant enrichment`);

    for (let i = 0; i < candidates.length; i++) {
        const loc = candidates[i];
        log(`\n[${i + 1}/${candidates.length}] ${loc.name}`);
        log(`   Current tenants: ${loc._count.tenants} | Website: ${loc.website?.substring(0, 40)}...`);

        try {
            const result = await findStoreDirectory(loc.website!);

            if (result && result.stores.length > 0) {
                const saved = await saveTenants(result.stores, loc.id);
                log(`   ✅ Found ${result.stores.length} stores, saved ${saved}`);
                progress.totalTenants += saved;
            } else {
                log(`   ❌ No stores found`);
            }
        } catch (e: any) {
            log(`   ❌ Error: ${e.message?.substring(0, 50)}`);
            progress.errors.push(`${loc.name}: ${e.message}`);
        }

        progress.tenantsProcessed.push(loc.id);
        saveProgress(progress);

        // Small delay between locations
        await new Promise(r => setTimeout(r, 1000));
    }
}

async function enrichHeroImages(progress: Progress) {
    logSection('PHASE 2: HERO IMAGE ENRICHMENT');

    if (!existsSync('./public/images/locations')) {
        mkdirSync('./public/images/locations', { recursive: true });
    }

    const locations = await prisma.location.findMany({
        where: {
            OR: [{ heroImage: null }, { heroImage: '' }]
        }
    });

    log(`📸 ${locations.length} locations need hero images`);

    for (const loc of locations) {
        if (progress.imagesProcessed.includes(loc.id)) continue;

        // Check for Wikipedia article match
        const wikiKey = Object.keys(wikiMappings).find(k => loc.name.includes(k));
        if (!wikiKey) {
            progress.imagesProcessed.push(loc.id);
            continue;
        }

        const article = wikiMappings[wikiKey];
        log(`  ${loc.name.substring(0, 30).padEnd(30)} → wiki:${article}`);

        try {
            const imageUrl = await fetchWikiImage(article);
            if (!imageUrl) {
                log(`     ❌ No wiki image`);
                progress.imagesProcessed.push(loc.id);
                saveProgress(progress);
                continue;
            }

            const slug = slugify(loc.name);
            const filepath = `./public/images/locations/${slug}.jpg`;

            const downloaded = await downloadImage(imageUrl, filepath);
            if (downloaded) {
                await prisma.location.update({
                    where: { id: loc.id },
                    data: { heroImage: `/images/locations/${slug}.jpg` }
                });
                log(`     ✅ Downloaded`);
                progress.totalImages++;
            } else {
                log(`     ❌ Download failed`);
            }
        } catch (e: any) {
            log(`     ❌ Error: ${e.message?.substring(0, 30)}`);
        }

        progress.imagesProcessed.push(loc.id);
        saveProgress(progress);

        await new Promise(r => setTimeout(r, 500));
    }
}

async function generateReport() {
    logSection('FINAL REPORT');

    const totalLocations = await prisma.location.count();
    const managed = await prisma.location.count({ where: { isManaged: true } });
    const withWebsite = await prisma.location.count({
        where: { website: { not: null }, NOT: { website: { contains: 'thisisflourish' } } }
    });
    const withHero = await prisma.location.count({
        where: { heroImage: { not: null } }
    });
    const totalTenants = await prisma.tenant.count();

    log(`📊 SUMMARY:`);
    log(`   Total locations: ${totalLocations}`);
    log(`   Managed: ${managed}`);
    log(`   With website: ${withWebsite}`);
    log(`   With hero image: ${withHero}`);
    log(`   Total tenants: ${totalTenants}`);
}

// ============================================
// RUN
// ============================================

async function cleanupDatabase() {
    logSection('PHASE 0: DATABASE CLEANUP');

    // Remove thisisflourish.co.uk placeholder URLs
    const result = await prisma.location.updateMany({
        where: { website: { contains: 'thisisflourish' } },
        data: { website: null }
    });
    log(`Cleaned up ${result.count} placeholder URLs (thisisflourish.co.uk)`);
}

async function main() {
    log('');
    log('🚀 ULTIMATE ENRICHMENT SCRIPT');
    log(`Started at: ${new Date().toISOString()}`);

    if (!OPENAI_API_KEY) {
        log('⚠️  WARNING: OPENAI_API_KEY not set - tenant scraping will be skipped');
    }

    const progress = loadProgress();

    try {
        await cleanupDatabase();
        await enrichTenants(progress);
        await enrichHeroImages(progress);
        await generateReport();
    } catch (e: any) {
        log(`❌ FATAL ERROR: ${e.message}`);
        progress.errors.push(`FATAL: ${e.message}`);
    }

    saveProgress(progress);
    log(`\n✅ COMPLETE at ${new Date().toISOString()}`);
}

main()
    .catch(e => {
        log(`❌ CRASH: ${e.message}`);
        console.error(e);
    })
    .finally(() => prisma.$disconnect());
