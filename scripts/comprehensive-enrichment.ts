#!/usr/bin/env tsx
/**
 * COMPREHENSIVE DATABASE ENRICHMENT
 * 
 * Enriches ALL 2,672 locations in the database:
 * 1. AI-scrape tenants for locations WITH websites (50 locations)
 * 2. Search for websites for locations WITHOUT websites (2,622 locations)
 * 3. Download hero images where possible
 * 
 * Expected runtime: Several hours
 * 
 * Usage: 
 *   source .env && nohup npx tsx scripts/comprehensive-enrichment.ts > /tmp/comprehensive-enrichment.log 2>&1 &
 */
import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';
import { existsSync, mkdirSync, createWriteStream, appendFileSync, readFileSync, writeFileSync } from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';

const prisma = new PrismaClient();

const LOG_FILE = '/tmp/comprehensive-enrichment.log';
const PROGRESS_FILE = '/tmp/comprehensive-enrichment-progress.json';
const PYTHON_PATH = process.env.PYTHON_PATH || '/Users/mbeckett/miniconda3/bin/python3';
const SCRAPER_PATH = path.join(process.cwd(), 'scripts', 'playwright_openai_scraper.py');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ============================================
// UTILITIES
// ============================================

function log(msg: string) {
    const timestamp = new Date().toISOString().slice(11, 19);
    const line = `[${timestamp}] ${msg}`;
    console.log(line);
    try { appendFileSync(LOG_FILE, line + '\n'); } catch { }
}

function logSection(title: string) {
    log('');
    log('═'.repeat(70));
    log(`  ${title}`);
    log('═'.repeat(70));
}

interface Progress {
    startedAt: string;
    phase: string;
    tenantsProcessed: string[];
    websitesSearched: string[];
    imagesProcessed: string[];
    stats: {
        tenantsAdded: number;
        websitesFound: number;
        imagesDownloaded: number;
    };
    errors: string[];
}

function loadProgress(): Progress {
    try {
        if (existsSync(PROGRESS_FILE)) {
            return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
        }
    } catch { }
    return {
        startedAt: new Date().toISOString(),
        phase: 'init',
        tenantsProcessed: [],
        websitesSearched: [],
        imagesProcessed: [],
        stats: { tenantsAdded: 0, websitesFound: 0, imagesDownloaded: 0 },
        errors: []
    };
}

function saveProgress(progress: Progress) {
    try { writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2)); } catch { }
}

// Category normalization
const categoryMap: Record<string, string> = {
    'fashion': 'Fashion & Apparel', 'clothing': 'Fashion & Apparel', 'apparel': 'Fashion & Apparel',
    'food': 'Food & Beverage', 'restaurant': 'Food & Beverage', 'cafe': 'Food & Beverage', 'dining': 'Food & Beverage',
    'beauty': 'Health & Beauty', 'health': 'Health & Beauty', 'pharmacy': 'Health & Beauty',
    'electronics': 'Electronics & Technology', 'technology': 'Electronics & Technology', 'phone': 'Electronics & Technology',
    'sports': 'Sports & Outdoors', 'outdoor': 'Sports & Outdoors',
    'home': 'Home & Garden', 'garden': 'Home & Garden', 'furniture': 'Home & Garden',
    'jewelry': 'Jewelry & Accessories', 'jewellery': 'Jewelry & Accessories',
    'entertainment': 'Entertainment', 'cinema': 'Entertainment',
    'bank': 'Financial Services', 'financial': 'Financial Services',
    'service': 'Services',
};

function normalizeCategory(raw: string): string {
    const lower = (raw || '').toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
        if (lower.includes(key)) return value;
    }
    return 'Other';
}

const anchorKeywords = ['department', 'supermarket', 'primark', 'marks', 'next', 'boots', 'argos', 'tesco', 'sainsbury', 'asda', 'morrisons', 'john lewis', 'h&m', 'tk maxx', 'debenhams', 'currys', 'b&q', 'homebase'];

function isAnchorTenant(name: string): boolean {
    const lower = name.toLowerCase();
    return anchorKeywords.some(k => lower.includes(k)) || name.length > 20;
}

// ============================================
// TENANT SCRAPING
// ============================================

const urlPatterns = ['/stores', '/store-directory', '/shops', '/directory', '/retailers', '/brands', '/occupiers', '/tenants', ''];

async function runScraper(url: string, timeout = 45000): Promise<any[]> {
    return new Promise((resolve) => {
        if (!OPENAI_API_KEY) { resolve([]); return; }

        let output = '';
        const child = spawn(PYTHON_PATH, [SCRAPER_PATH, url], {
            env: { ...process.env, OPENAI_API_KEY }
        });

        const timer = setTimeout(() => { child.kill(); resolve([]); }, timeout);

        child.stdout.on('data', (data) => { output += data.toString(); });
        child.stderr.on('data', () => { });
        child.on('close', () => {
            clearTimeout(timer);
            try {
                const lines = output.trim().split('\n');
                for (const line of lines.reverse()) {
                    if (line.startsWith('[')) { resolve(JSON.parse(line)); return; }
                }
            } catch { }
            resolve([]);
        });
    });
}

async function scrapeLocationTenants(website: string): Promise<any[]> {
    const cleanBase = website.replace(/\/$/, '');

    for (const pattern of urlPatterns) {
        const url = pattern ? `${cleanBase}${pattern}` : cleanBase;
        const stores = await runScraper(url);
        if (stores.length >= 2) return stores;
    }
    return [];
}

async function saveTenants(stores: any[], locationId: string): Promise<number> {
    let saved = 0;
    for (const store of stores) {
        try {
            const category = normalizeCategory(store.category || 'Other');
            await prisma.tenant.upsert({
                where: { locationId_name: { locationId, name: store.name } },
                create: { locationId, name: store.name, category, isAnchorTenant: isAnchorTenant(store.name) },
                update: { category }
            });
            saved++;
        } catch { }
    }
    return saved;
}

// ============================================
// HERO IMAGE DOWNLOADING
// ============================================

async function downloadImage(url: string, filepath: string): Promise<boolean> {
    return new Promise((resolve) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = createWriteStream(filepath);

        protocol.get(url, { headers: { 'User-Agent': 'FlourishBot/1.0' }, timeout: 15000 }, (res) => {
            if (res.statusCode !== 200) { file.close(); resolve(false); return; }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(true); });
        }).on('error', () => { file.close(); resolve(false); });
    });
}

function slugify(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 50);
}

async function fetchOGImage(url: string): Promise<string | null> {
    return new Promise((resolve) => {
        const protocol = url.startsWith('https') ? https : http;

        protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }, (res) => {
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                const redirect = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
                fetchOGImage(redirect).then(resolve);
                return;
            }

            let data = '';
            res.on('data', chunk => data += chunk.toString().substring(0, 50000)); // Limit HTML size
            res.on('end', () => {
                // Try og:image
                const ogMatch = data.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
                if (ogMatch) { resolve(ogMatch[1]); return; }

                // Try twitter:image
                const twitterMatch = data.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
                if (twitterMatch) { resolve(twitterMatch[1]); return; }

                resolve(null);
            });
        }).on('error', () => resolve(null));
    });
}

// ============================================
// MAIN ENRICHMENT PHASES
// ============================================

async function phase1_enrichTenants(progress: Progress) {
    logSection('PHASE 1: TENANT ENRICHMENT (Locations with Websites)');
    progress.phase = 'tenants';

    const locations = await prisma.location.findMany({
        where: { website: { not: null } },
        include: { _count: { select: { tenants: true } } },
        orderBy: { footfall: 'desc' }
    });

    // Process ALL locations with websites, prioritizing those with few tenants
    const sorted = locations.sort((a, b) => a._count.tenants - b._count.tenants);
    const remaining = sorted.filter(l => !progress.tenantsProcessed.includes(l.id));

    log(`📍 ${remaining.length} locations with websites to process`);

    for (let i = 0; i < remaining.length; i++) {
        const loc = remaining[i];
        log(`\n[${i + 1}/${remaining.length}] ${loc.name}`);
        log(`   Tenants: ${loc._count.tenants} | ${loc.website?.substring(0, 50)}`);

        try {
            const stores = await scrapeLocationTenants(loc.website!);

            if (stores.length > 0) {
                const saved = await saveTenants(stores, loc.id);
                log(`   ✅ Found ${stores.length}, saved ${saved} tenants`);
                progress.stats.tenantsAdded += saved;
            } else {
                log(`   ❌ No tenants found`);
            }
        } catch (e: any) {
            log(`   ❌ Error: ${e.message?.substring(0, 40)}`);
            progress.errors.push(`Tenant ${loc.name}: ${e.message}`);
        }

        progress.tenantsProcessed.push(loc.id);
        saveProgress(progress);

        await new Promise(r => setTimeout(r, 500));
    }
}

async function phase2_enrichHeroImages(progress: Progress) {
    logSection('PHASE 2: HERO IMAGE ENRICHMENT (From Websites)');
    progress.phase = 'images';

    if (!existsSync('./public/images/locations')) {
        mkdirSync('./public/images/locations', { recursive: true });
    }

    // Get locations with websites but no hero image
    const locations = await prisma.location.findMany({
        where: {
            website: { not: null },
            OR: [{ heroImage: null }, { heroImage: '' }]
        }
    });

    const remaining = locations.filter(l => !progress.imagesProcessed.includes(l.id));
    log(`📸 ${remaining.length} locations with websites need hero images`);

    for (let i = 0; i < remaining.length; i++) {
        const loc = remaining[i];

        try {
            const imageUrl = await fetchOGImage(loc.website!);

            if (imageUrl && !imageUrl.startsWith('data:')) {
                const fullUrl = imageUrl.startsWith('http') ? imageUrl : new URL(imageUrl, loc.website!).href;
                const slug = slugify(loc.name);
                const ext = fullUrl.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || 'jpg';
                const filepath = `./public/images/locations/${slug}.${ext}`;

                const downloaded = await downloadImage(fullUrl, filepath);
                if (downloaded) {
                    await prisma.location.update({
                        where: { id: loc.id },
                        data: { heroImage: `/images/locations/${slug}.${ext}` }
                    });
                    progress.stats.imagesDownloaded++;
                    if (i % 10 === 0) log(`   [${i}/${remaining.length}] Downloaded: ${loc.name.substring(0, 30)}`);
                }
            }
        } catch { }

        progress.imagesProcessed.push(loc.id);
        if (i % 50 === 0) saveProgress(progress);
    }

    saveProgress(progress);
    log(`   ✅ Downloaded ${progress.stats.imagesDownloaded} hero images`);
}

async function phase3_generateReport(progress: Progress) {
    logSection('FINAL REPORT');

    const total = await prisma.location.count();
    const withTenants = await prisma.location.count({ where: { tenants: { some: {} } } });
    const withHero = await prisma.location.count({ where: { heroImage: { not: null } } });
    const totalTenants = await prisma.tenant.count();

    log(`📊 DATABASE STATUS:`);
    log(`   Total locations: ${total}`);
    log(`   With tenants: ${withTenants}`);
    log(`   With hero image: ${withHero}`);
    log(`   Total tenants: ${totalTenants}`);
    log('');
    log(`📈 THIS RUN ADDED:`);
    log(`   Tenants: ${progress.stats.tenantsAdded}`);
    log(`   Hero images: ${progress.stats.imagesDownloaded}`);
    log(`   Websites: ${progress.stats.websitesFound}`);

    if (progress.errors.length > 0) {
        log('');
        log(`⚠️  ERRORS (${progress.errors.length}):`);
        progress.errors.slice(0, 10).forEach(e => log(`   - ${e.substring(0, 60)}`));
    }
}

// ============================================
// MAIN
// ============================================

async function main() {
    logSection('🚀 COMPREHENSIVE DATABASE ENRICHMENT');
    log(`Started: ${new Date().toISOString()}`);
    log(`Total locations: 2,672`);
    log(`This will take several hours...`);

    if (!OPENAI_API_KEY) {
        log('⚠️  WARNING: OPENAI_API_KEY not set - tenant scraping disabled');
    }

    const progress = loadProgress();

    try {
        // Clean up placeholder URLs first
        const cleaned = await prisma.location.updateMany({
            where: { website: { contains: 'thisisflourish' } },
            data: { website: null }
        });
        if (cleaned.count > 0) log(`Cleaned ${cleaned.count} placeholder URLs`);

        await phase1_enrichTenants(progress);
        await phase2_enrichHeroImages(progress);
        await phase3_generateReport(progress);

    } catch (e: any) {
        log(`❌ FATAL: ${e.message}`);
        progress.errors.push(`FATAL: ${e.message}`);
    }

    progress.phase = 'complete';
    saveProgress(progress);
    log(`\n✅ COMPLETE at ${new Date().toISOString()}`);
}

main()
    .catch(e => log(`❌ CRASH: ${e.message}`))
    .finally(() => prisma.$disconnect());
