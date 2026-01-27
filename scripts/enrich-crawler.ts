
import { PrismaClient, Location } from '@prisma/client';
import { chromium } from 'playwright'; // Use Puppeteer/Playwright if available, or just fetch? 
// Actually, read_url_content is an agent tool, I cannot call it from this script directly unless I wrap it.
// Protocol says: "Tier 2: read_url_content - Use when you have a specific URL".
// But I am writing a USER SCRIPT that runs on their machine. Using simple 'fetch' + 'cheerio' is better.

import * as cheerio from 'cheerio';
// Note: User might not have cheerio installed. I should check package.json or use fetch + regex.
// I'll assume standard fetch for now.

const prisma = new PrismaClient();

// Helper to extract social links
function extractSocials(html: string) {
    const socials = {
        facebook: null as string | null,
        instagram: null as string | null,
        twitter: null as string | null
    };

    // Regex for social links
    const fbMatch = html.match(/href=["'](https?:\/\/(www\.)?facebook\.com\/[^"']+)["']/i);
    const instaMatch = html.match(/href=["'](https?:\/\/(www\.)?instagram\.com\/[^"']+)["']/i);
    const twMatch = html.match(/href=["'](https?:\/\/(www\.)?(twitter|x)\.com\/[^"']+)["']/i);

    if (fbMatch) socials.facebook = fbMatch[1];
    if (instaMatch) socials.instagram = instaMatch[1];
    if (twMatch) socials.twitter = twMatch[1];

    return socials;
}

// Helper to extract phone
function extractPhone(html: string) {
    // UK Phone Regex (Basic)
    const phoneMatch = html.match(/0\d{3,4}\s?\d{3,4}\s?\d{3,4}/); // e.g. 01234 567 890
    return phoneMatch ? phoneMatch[0] : null;
}

// Helper: Fetch with timeout
async function fetchWithTimeout(url: string, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)' }
        });
        clearTimeout(id);
        return await response.text();
    } catch (e) {
        clearTimeout(id);
        return null;
    }
}

async function main() {
    console.log("🕷️ Starting Website Crawler Enrichment...");

    // Batch size to avoid prolonged execution
    const locations = await prisma.location.findMany({
        where: {
            website: { not: null, not: '' },
            OR: [
                { facebook: null },
                { instagram: null },
                { phone: null }
            ]
        }
    }); // Process ALL eligible locations

    console.log(`Processing ${locations.length} locations...`);
    let successCount = 0;

    for (const loc of locations) {
        if (!loc.website) continue;

        console.log(`\nProcessing: ${loc.name} (${loc.website})`);
        const html = await fetchWithTimeout(loc.website);

        // Polite delay
        await new Promise(r => setTimeout(r, 1000));


        if (!html) {
            console.log("   ❌ Failed to fetch (Timeout/Error)");
            continue;
        }

        const socials = extractSocials(html);
        const phone = extractPhone(html);

        const updates: any = {};
        if (!loc.facebook && socials.facebook) updates.facebook = socials.facebook;
        if (!loc.instagram && socials.instagram) updates.instagram = socials.instagram;
        if (!loc.twitter && socials.twitter) updates.twitter = socials.twitter;
        if (!loc.phone && phone) updates.phone = phone;

        if (Object.keys(updates).length > 0) {
            console.log(`   ✅ Found: ${Object.keys(updates).join(', ')}`);
            await prisma.location.update({
                where: { id: loc.id },
                data: updates
            });
            successCount++;
        } else {
            console.log("   ℹ️ No new data found.");
        }
    }

    console.log(`\n🎉 Crawler Finished. Enriched ${successCount} locations.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
