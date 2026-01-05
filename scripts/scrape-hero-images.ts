#!/usr/bin/env tsx
/**
 * Scrape Hero Images from Location Websites
 * Uses fetch to get OG images and fallback to main page images
 */
import { PrismaClient } from '@prisma/client';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import https from 'https';
import http from 'http';

const prisma = new PrismaClient();

async function fetchHTML(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const req = protocol.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
            timeout: 10000
        }, (res) => {
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // Follow redirect
                const redirectUrl = res.headers.location.startsWith('http')
                    ? res.headers.location
                    : new URL(res.headers.location, url).href;
                fetchHTML(redirectUrl).then(resolve).catch(reject);
                return;
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

function extractOGImage(html: string): string | null {
    // Try og:image first
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (ogMatch) return ogMatch[1];

    // Try twitter:image
    const twitterMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
    if (twitterMatch) return twitterMatch[1];

    // Try first large image in page
    const imgMatch = html.match(/<img[^>]*src=["']([^"']+(?:hero|banner|main|header|bg)[^"']*)["']/i);
    if (imgMatch) return imgMatch[1];

    return null;
}

async function downloadImage(url: string, filepath: string): Promise<boolean> {
    return new Promise((resolve) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = require('fs').createWriteStream(filepath);

        protocol.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 15000
        }, (res) => {
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
    console.log('\n🖼️  HERO IMAGE SCRAPER\n');
    console.log('='.repeat(60));

    // Ensure images directory exists
    if (!existsSync('./public/images/locations')) {
        mkdirSync('./public/images/locations', { recursive: true });
    }

    // Get locations with websites but no hero image
    const locations = await prisma.location.findMany({
        where: {
            isManaged: true,
            website: { not: null },
            OR: [
                { heroImage: null },
                { heroImage: '' }
            ]
        },
        orderBy: { footfall: 'desc' }
    });

    console.log(`📍 Found ${locations.length} locations to process\n`);

    let success = 0;
    let failed: string[] = [];

    for (const loc of locations) {
        const website = loc.website;
        if (!website || website.includes('thisisflourish')) {
            continue;
        }

        process.stdout.write(`  ${loc.name}... `);

        try {
            const html = await fetchHTML(website);
            const imageUrl = extractOGImage(html);

            if (!imageUrl) {
                console.log('❌ No image found');
                failed.push(loc.name);
                continue;
            }

            // Resolve relative URLs
            const fullImageUrl = imageUrl.startsWith('http')
                ? imageUrl
                : new URL(imageUrl, website).href;

            // Download image
            const slug = slugify(loc.name);
            const ext = fullImageUrl.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || 'jpg';
            const filepath = `./public/images/locations/${slug}.${ext}`;

            const downloaded = await downloadImage(fullImageUrl, filepath);

            if (downloaded) {
                // Update database
                await prisma.location.update({
                    where: { id: loc.id },
                    data: { heroImage: `/images/locations/${slug}.${ext}` }
                });
                console.log('✅', fullImageUrl.substring(0, 50) + '...');
                success++;
            } else {
                console.log('❌ Download failed');
                failed.push(loc.name);
            }
        } catch (e: any) {
            console.log('❌', e.message?.substring(0, 30) || 'Error');
            failed.push(loc.name);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n🎉 COMPLETE`);
    console.log(`   Downloaded: ${success}`);
    console.log(`   Failed: ${failed.length}`);

    if (failed.length > 0) {
        console.log(`\n📋 MANUAL REVIEW NEEDED:`);
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
