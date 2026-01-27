
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();
const LOCATION_ID = "cmid0l1ib01v6mtpu1o6usooz"; // The Avenue Shopping Centre (Glasgow)
const WEBSITE_URL = "https://www.avenueshopping.co.uk/";

async function main() {
    console.log("🚀 Enriching The Avenue Shopping Centre...");

    // 1. Update Website URL
    console.log(`Phase 1: Updating Database URL to ${WEBSITE_URL}...`);
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: { website: WEBSITE_URL }
    });
    console.log("✅ URL Updated.");

    // 2. Fetch Website & Scrape Socials
    console.log("Phase 2: Scraping Website for Socials...");
    try {
        const response = await axios.get(WEBSITE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });
        const html = response.data;
        const $ = cheerio.load(html);

        const socials: any = {};

        $('a[href]').each((_, el) => {
            const href = $(el).attr('href')?.toLowerCase();
            if (!href) return;
            if (href.includes('facebook.com') && !href.includes('sharer')) socials.facebook = $(el).attr('href');
            if (href.includes('instagram.com')) socials.instagram = $(el).attr('href');
            if (href.includes('twitter.com') || href.includes('x.com')) socials.twitter = $(el).attr('href');
        });

        console.log("Found Socials:", socials);

        if (Object.keys(socials).length > 0) {
            await prisma.location.update({
                where: { id: LOCATION_ID },
                data: socials
            });
            console.log("✅ Socials Updated.");
        } else {
            console.log("⚠️ No socials found on homepage.");
        }

    } catch (error) {
        console.error("❌ Scraping failed:", error.message);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
