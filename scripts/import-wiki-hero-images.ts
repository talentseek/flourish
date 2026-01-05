#!/usr/bin/env tsx
/**
 * Import Hero Images from Wikipedia
 * Uses Wikipedia API to fetch shopping centre images
 */
import { PrismaClient } from '@prisma/client';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import https from 'https';

const prisma = new PrismaClient();

// Location name substring -> Wikipedia article
const wikiMappings: Record<string, string> = {
    'Pentagon': 'Pentagon_Shopping_Centre',
    'Mailbox Birmingham': 'Mailbox_Birmingham',
    'St Katharine Docks': 'St_Katharine_Docks',
    'One Stop': 'One_Stop_Shopping_Centre',
    'Lower Precinct': 'Lower_Precinct',
    'Cwmbran': 'Cwmbran_Centre',
    'The Walnuts': 'The_Walnuts',
    'Midsummer Place': 'Midsummer_Place',
    'Dockside Outlet': 'Dockside_Outlet_Centre',
    'Hempstead Valley': 'Hempstead_Valley',
    'Serpentine Green': 'Serpentine_Green',
    'Swan': 'Swan_Centre',
    'Grosvenor': 'Grosvenor_Shopping_Centre',
    'The Bridges': 'Bridges_Shopping_Centre',
    'Lexicon': 'The_Lexicon_Bracknell',
};

async function fetchWikiImage(article: string): Promise<string | null> {
    return new Promise((resolve) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(article)}&prop=pageimages&format=json&pithumbsize=1200`;

        https.get(url, { headers: { 'User-Agent': 'FlourishBot/1.0 (data enrichment)' } }, (res) => {
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
    return name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
}

async function main() {
    console.log('\n🖼️  WIKIPEDIA HERO IMAGE IMPORTER\n');
    console.log('='.repeat(50));

    if (!existsSync('./public/images/locations')) {
        mkdirSync('./public/images/locations', { recursive: true });
    }

    const locations = await prisma.location.findMany({
        where: {
            isManaged: true,
            OR: [{ heroImage: null }, { heroImage: '' }]
        },
        orderBy: { footfall: 'desc' }
    });

    console.log(`📍 ${locations.length} locations without hero images\n`);

    let success = 0;
    let failed: string[] = [];

    for (const loc of locations) {
        // Find matching Wikipedia article
        const wikiKey = Object.keys(wikiMappings).find(k => loc.name.includes(k));
        if (!wikiKey) {
            continue;
        }

        const article = wikiMappings[wikiKey];
        process.stdout.write(`  ${loc.name.substring(0, 30).padEnd(30)} `);

        try {
            const imageUrl = await fetchWikiImage(article);

            if (!imageUrl) {
                console.log('❌ No wiki image');
                failed.push(loc.name);
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
                console.log('✅ Downloaded');
                success++;
            } else {
                console.log('❌ Download failed');
                failed.push(loc.name);
            }
        } catch (e: any) {
            console.log(`❌ ${e.message?.substring(0, 20) || 'Error'}`);
            failed.push(loc.name);
        }

        // Small delay
        await new Promise(r => setTimeout(r, 500));
    }

    console.log('\n' + '='.repeat(50));
    console.log(`\n🎉 Downloaded ${success} images via Wikipedia`);

    if (failed.length > 0) {
        console.log(`\n📋 FAILED (no wiki article or image):`);
        failed.forEach(f => console.log(`   - ${f}`));
    }

    const withHero = await prisma.location.count({
        where: { isManaged: true, heroImage: { not: null } }
    });
    console.log(`\n📊 Managed locations with heroImage: ${withHero}/65`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
