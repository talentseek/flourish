
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const TARGETS = [
    { name: "Lower Precinct", url: "https://lowerprecinct.com/" },
    { name: "Northfield Shopping Centre", url: "https://northfieldshopping.co.uk/" },
    { name: "One Stop Shopping Centre", url: "https://onestop-shopping.co.uk/" },
    { name: "Parkgate", url: "https://parkgateshirley.com/" },
    { name: "Queens Square Shopping Centre", url: "http://www.queenssquaresc.co.uk/" },
    { name: "Regent Court Shopping Centre", url: "https://regent-court.co.uk/" },
    { name: "Resorts World Birmingham", url: "https://resortsworldbirmingham.co.uk/" },
    { name: "Riverside Shopping Centre", url: "https://riversidehub.com/" },
    { name: "Rugby Central", url: "https://rugby-central.co.uk/" },
    { name: "St. Andrews Square Shopping Centre", url: "https://saintandrewssquare.com/" },
    { name: "The Moor Shopping Centre", url: "https://moorshoppingcentre.co.uk/" },
    { name: "The Octagon Centre", url: "https://theoctagoncentre.co.uk/" },
    { name: "The Parade Shops", url: "https://paradeshops.co.uk/" },
    { name: "The Swan Centre", url: "https://swancentre.com/" },
    { name: "The Valley", url: "https://thevalleyshopping.co.uk/" },
    { name: "Chelmsley Wood Shopping Centre", url: "https://chelmsleywoodshopping.co.uk/" },
    { name: "Tipton Shopping Centre", url: "https://tiptoncentre.co.uk/" },
    { name: "Old Square", url: "https://oldsquareshoppingcentre.co.uk/" },
    { name: "The Churchill Shopping Centre", url: "https://thechurchillshoppingcentre.co.uk/" }
];

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log(`🚀 Starting West Midlands Enrichment (Retrying ${TARGETS.length} Sites)...`);
    let successCount = 0;

    for (const t of TARGETS) {
        console.log(`\n📍 Processing: ${t.name}...`);

        // Relaxed match on name only
        const locs = await prisma.location.findMany({
            where: {
                name: { contains: t.name, mode: 'insensitive' }
            }
        });

        if (locs.length === 0) {
            console.log(`   ❌ Could not find location in DB: ${t.name}`);
            continue;
        }

        // Pick the first match, or prefer one with matching city if possible (but we know data is messy)
        // Here we just pick index 0.
        const location = locs[0];
        console.log(`   ✅ Matched: ${location.name} (ID: ${location.id})`);

        const updateData: any = { website: t.url };

        // Scrape Socials
        try {
            const resp = await axios.get(t.url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
                timeout: 8000
            });
            const $ = cheerio.load(resp.data);

            $('a[href]').each((_, el) => {
                const href = $(el).attr('href')?.toLowerCase();
                if (!href) return;

                if (href.includes('facebook.com') && !href.includes('sharer')) updateData.facebook = $(el).attr('href');
                if (href.includes('instagram.com')) updateData.instagram = $(el).attr('href');
                if (href.includes('twitter.com') || href.includes('x.com')) updateData.twitter = $(el).attr('href');
            });

            if (Object.keys(updateData).length > 1) {
                console.log(`   found socials:`, Object.keys(updateData).filter(k => k !== 'website'));
            }
        } catch (e) {
            console.log(`   ⚠️ Scraping failed/timeout, saving URL only.`);
        }

        await prisma.location.update({
            where: { id: location.id },
            data: updateData
        });
        successCount++;
        await delay(500);
    }

    console.log(`\n🎉 West Midlands Enrichment Complete! Updated ${successCount}/${TARGETS.length}.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
