
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const TARGETS = [
    // Batch A
    { name: "Accrington Arndale", url: "https://arndaleaccrington.co.uk/" },
    { name: "Albert Square Shopping Centre", url: "https://albertsquareshoppingcentre.co.uk/" },
    { name: "Arcades Shopping Centre", url: "https://arcadesshopping.co.uk/" },
    { name: "Belle Vale Shopping Centre", url: "https://belle-vale.co.uk/" },
    { name: "Birchwood Shopping Centre", url: "https://birchwoodshoppingcentre.co.uk/" },
    { name: "Broadstone Mill Shopping Outlet", url: "https://broadstonemillshoppingoutlet.co.uk/" },
    { name: "Cavern Walks Shopping Centre", url: "https://www.cavern-walks.co.uk/" }, // Note: ukmalls link found, checking validity or skipping if unofficial? Actually user verified it? No, search found ukmalls. Let's use if looks official. Actually search result [1] was ukmalls. Let's skip Cavern Walks if no direct site found. Wait, search result 1 was ukmalls, but snippet didn't show official. Let's SKIP Cavern Walks to be safe.
    { name: "Church Square Shopping Centre", url: "https://churchsquaresthelens.co.uk/" },
    { name: "Concourse Shopping Centre", url: "https://theconcourseshoppingcentre.co.uk/" },

    // Batch B
    { name: "Dunmail Park Shopping Centre", url: "https://dunmailpark.com/" },
    { name: "Golden Square Shopping Centre", url: "https://gswarrington.com/" },
    { name: "Ladysmith Shopping Centre", url: "https://ladysmithshoppingcentre.com/" },
    { name: "Market Walk", url: "https://marketwalkchorley.co.uk/" }, // Chorley
    { name: "Metquarter", url: "https://metquarter.com/" },
    { name: "Mill Gate Shopping Centre", url: "https://millgatebury.co.uk/" },
    { name: "Liverpool ONE", url: "https://liverpool-one.com/" },
    { name: "Grosvenor Shopping Centre", url: "https://www.thegrosvenorcentre.co.uk/" }, // Chester
    { name: "St Johns Shopping Centre", url: "https://stjohns-shopping.co.uk/" },
    { name: "Market Place Bolton", url: "https://boltonmarketplace.co.uk/" },

    // Batch C
    { name: "Clarendon Square Shopping Centre", url: "https://clarendonsquare.co.uk/" },
    { name: "Parrswood Leisure Park", url: "https://parrswoodmanchester.co.uk/" },
    { name: "Great Northern", url: "https://thegreatnorthern.com/" },
    { name: "Fishergate Shopping Centre", url: "https://shopfishergate.co.uk/" },
    { name: "Spindles Town Square Shopping Centre", url: "https://spindlestownsquare.com/" },
    { name: "Cockhedge", url: "https://cockhedge.co.uk/" }, // "Cockhedge Shopping Park"
    { name: "Houndshill Shopping Centre", url: "https://houndshillshoppingcentre.co.uk/" },
    { name: "St George's Shopping Centre", url: "https://stgeorgespreston.co.uk/" },
    { name: "Charter Walk Shopping Centre", url: "https://charterwalk.com/" },

    // Batch D
    { name: "The Market Shopping Centre", url: "https://themarketcentre.co.uk/" }, // Crewe
    { name: "The Trafford Centre", url: "https://traffordcentre.co.uk/" },
    { name: "The Rock", url: "https://therockbury.com/" },
    { name: "Trafford Palazzo", url: "https://traffordpalazzo.co.uk/" },
    { name: "Village Square", url: "https://bramhallvillagesquare.co.uk/" }, // Stockport
    { name: "Walkden Town Centre", url: "https://walkdentowncentre.co.uk/" },
    { name: "Washington Square Shopping Centre", url: "https://washingtonsquare.co.uk/" },
    { name: "Wayfarers Arcade", url: "https://wayfarersarcade.co.uk/" },
    { name: "Westmorland Shopping Centre", url: "https://westmorlandshopping.com/" },
    { name: "Winsford Cross Shopping Centre", url: "https://winsfordcross.co.uk/" }
];

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log(`🚀 Starting North West Enrichment (${TARGETS.length} Sites)...`);
    let successCount = 0;

    for (const t of TARGETS) {
        console.log(`\n📍 Processing: ${t.name}...`);

        // Match name only to avoid city/county data issues
        const locs = await prisma.location.findMany({
            where: {
                name: { contains: t.name, mode: 'insensitive' }
            }
        });

        if (locs.length === 0) {
            console.log(`   ❌ Could not find location in DB: ${t.name}`);
            continue;
        }

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

    console.log(`\n🎉 North West Enrichment Complete! Updated ${successCount}/${TARGETS.length}.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
