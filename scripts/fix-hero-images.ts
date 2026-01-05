#!/usr/bin/env tsx
/**
 * Fix Hero Images - Clear invalid entries and download missing ones
 */
import { PrismaClient } from '@prisma/client';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import https from 'https';

const prisma = new PrismaClient();

// Wikipedia mappings for managed locations needing images
const wikiMappings: Record<string, string> = {
    'Birchwood': 'Birchwood,_Warrington',
    'Byron Place': 'Byron_Place',
    'Hillsborough': 'Hillsborough_Barracks',
    'Killingworth': 'Killingworth_Shopping_Centre',
    'Lower Precinct': 'Lower_Precinct',
    'Swan': 'Swan_Centre',
    'The Centre Margate': 'Margate',
    'Weston Favell': 'Weston_Favell',
    'Windsor Royal': 'Windsor,_Berkshire',
    'Woolshops': 'Halifax,_West_Yorkshire',
};

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

async function downloadImage(url: string, filepath: string): Promise<boolean> {
    return new Promise((resolve) => {
        const file = createWriteStream(filepath);
        https.get(url, { headers: { 'User-Agent': 'FlourishBot/1.0' }, timeout: 15000 }, (res) => {
            if (res.statusCode !== 200) { file.close(); resolve(false); return; }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(true); });
        }).on('error', () => { file.close(); resolve(false); });
    });
}

function slugify(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 50);
}

async function main() {
    console.log('=== FIX HERO IMAGES ===\n');

    if (!existsSync('./public/images/locations')) {
        mkdirSync('./public/images/locations', { recursive: true });
    }

    // Step 1: Clear invalid entries
    console.log('Step 1: Clearing invalid heroImage entries...');
    const locations = await prisma.location.findMany({
        where: { isManaged: true, heroImage: { not: null } },
        select: { id: true, name: true, heroImage: true }
    });

    let cleared = 0;
    for (const loc of locations) {
        if (!loc.heroImage || loc.heroImage === '/royals.jpeg') continue;

        const filePath = './public' + loc.heroImage;
        if (!existsSync(filePath)) {
            await prisma.location.update({
                where: { id: loc.id },
                data: { heroImage: null }
            });
            console.log('  Cleared:', loc.name);
            cleared++;
        }
    }
    console.log(`  Cleared ${cleared} invalid entries\n`);

    // Step 2: Re-download missing images from Wikipedia
    console.log('Step 2: Downloading images from Wikipedia...');
    const needImages = await prisma.location.findMany({
        where: { isManaged: true, OR: [{ heroImage: null }, { heroImage: '' }] },
        select: { id: true, name: true }
    });

    let downloaded = 0;
    for (const loc of needImages) {
        const wikiKey = Object.keys(wikiMappings).find(k => loc.name.includes(k));
        if (!wikiKey) continue;

        const article = wikiMappings[wikiKey];
        console.log(`  ${loc.name.substring(0, 30).padEnd(32)} → wiki:${article}`);

        const imageUrl = await fetchWikiImage(article);
        if (!imageUrl) {
            console.log('    ❌ No image');
            continue;
        }

        const slug = slugify(loc.name);
        const filepath = `./public/images/locations/${slug}.jpg`;

        const success = await downloadImage(imageUrl, filepath);
        if (success) {
            await prisma.location.update({
                where: { id: loc.id },
                data: { heroImage: `/images/locations/${slug}.jpg` }
            });
            console.log('    ✅ Downloaded');
            downloaded++;
        } else {
            console.log('    ❌ Download failed');
        }

        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n  Downloaded ${downloaded} new images`);

    // Final status
    const withImages = await prisma.location.count({
        where: { isManaged: true, heroImage: { not: null } }
    });
    console.log(`\n=== RESULT: ${withImages}/65 managed locations have hero images ===`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
