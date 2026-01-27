
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const TARGETS = [
    { name: "Rutherglen", url: "https://www.rutherglenexchange.com/" },
    { name: "Springburn", url: "https://www.springburnshopping.com/" },
    { name: "Rivergate", url: "https://rivergatecentre.com/" },
    { name: "Sanderson Arcade", url: "https://www.sandersonarcade.co.uk/" },
    { name: "Park View", url: "https://parkviewshoppingcentre.co.uk/" },
    { name: "Newcastle Quays", url: "https://www.newcastlequays.com/" },
    { name: "The Bridges", url: "https://www.thebridges-shopping.com/" },
    { name: "Trinity Square", url: "https://trinitysquaregateshead.co.uk/" },
    { name: "St. Cuthberts", url: "https://www.stcuthbertswalk.co.uk/" }, // Search for "Cuthbert"
    { name: "Newgate", url: "https://newgatecentre.co.uk/" },
    { name: "Queen Street", url: "https://www.queenstreetshoppingcentre.co.uk/" },
    { name: "Promenades", url: "https://www.promenadesshoppingcentre.co.uk/" },
    { name: "Flemingate", url: "https://flemingate.co.uk/" },
    { name: "North Point", url: "https://www.northpointshoppingcentre.co.uk/" },
    { name: "Parishes", url: "https://theparishes.com/" },
    { name: "Britten", url: "https://brittencentre.co.uk/" },
    { name: "White River", url: "https://whiteriverplace.co.uk/" },
    { name: "Saxon Square", url: "https://www.saxon-square.co.uk/" },
    { name: "The Guild", url: "https://www.theguildwiltshire.co.uk/" },
    // "The Avenue" is problematic, searching specifically or skipping if not found
];

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log("🚀 Starting Bulk Enrichment for 19 Sites...");
    let successCount = 0;

    for (const t of TARGETS) {
        console.log(`\n📍 Processing: ${t.name} (${t.url})...`);

        // 1. Find Location
        const searchName = t.name === "St. Cuthberts" ? "Cuthbert" : t.name;

        const locs = await prisma.location.findMany({
            where: { name: { contains: searchName, mode: 'insensitive' } }
        });

        if (locs.length === 0) {
            console.log(`   ❌ Could not find location in DB matching "${searchName}"`);
            continue;
        }

        const location = locs[0]; // Take first match
        console.log(`   ✅ Matched: ${location.name} (${location.id})`);

        // 2. Update Website URL
        const socials: any = { website: t.url };

        // 3. Scrape for Socials
        try {
            const resp = await axios.get(t.url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
                timeout: 10000
            });
            const $ = cheerio.load(resp.data);

            $('a[href]').each((_, el) => {
                const href = $(el).attr('href')?.toLowerCase();
                if (!href) return;

                if (href.includes('facebook.com') && !href.includes('sharer')) socials.facebook = $(el).attr('href');
                if (href.includes('instagram.com')) socials.instagram = $(el).attr('href');
                if (href.includes('twitter.com') || href.includes('x.com')) socials.twitter = $(el).attr('href');
            });

            if (Object.keys(socials).length > 1) {
                console.log(`   found socials:`, Object.keys(socials).filter(k => k !== 'website'));
            }
        } catch (e) {
            console.log(`   ⚠️ Scraping failed (timeout/block), setting URL only.`);
        }

        // 4. Save
        await prisma.location.update({
            where: { id: location.id },
            data: socials
        });
        console.log("   ✅ Database Updated.");
        successCount++;

        await delay(500); // Be polite
    }

    console.log(`\n🎉 Bulk Enrichment Complete! Updated ${successCount}/${TARGETS.length} sites.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
