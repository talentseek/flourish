
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const TARGETS = [
    // Batch A
    { name: "Willow Place", url: "https://willowplace.co.uk/" }, // Corby
    { name: "Highcross", url: "https://highcrossleicester.com/" },
    { name: "St Marks Place Shopping Centre", url: "https://saintmarksplace.co.uk/" }, // Newark
    { name: "Swansgate Centre", url: "https://swansgateshoppingcentre.com/" },
    { name: "The Buttermarket Shopping Centre", url: "https://www.newark-sherwooddc.gov.uk/buttermarket/" }, // Newark (Council managed but has page) - SKIP or specific
    // Actually skipping Buttermarket council page as it's not a commercial site, but "The Pavements" has a similar one.
    // Let's include if it looks official enough. The search result was a deep link. Let's start with commercial ones first.
    { name: "The Crescent", url: "https://thecrescenthinckley.co.uk/" }, // Hinckley
    { name: "The Parishes Shopping Centre", url: "https://theparishes.com/" },
    { name: "The Pavements", url: "https://www.chesterfield.gov.uk/explore-chesterfield/shopping/the-pavements-shopping-centre.aspx" }, // Chesterfield

    // Batch B
    { name: "The Springs Shopping Centre", url: "https://thespringsshoppingcentre.co.uk/" }, // Buxton
    { name: "Vicar Lane Shopping Centre", url: "https://vicarlaneshoppingcentre.co.uk/" },
    { name: "Waterside Shopping Centre", url: "https://watersideshopping.com/" }, // Lincoln
    { name: "Pescod Square Shopping Mall", url: "https://pescodsquare.com/" }, // Boston
    { name: "The Rushes", url: "https://rushes-shopping.co.uk/" }, // Loughborough
    { name: "The Riverside Shopping Centre", url: "https://www.lincolnshire.coop/store-finder/riverside-centre-sleaford" }, // Sleaford (Managed by Co-op)
    { name: "Weston Favell Shopping Centre", url: "https://weston-favell.com/" },
    { name: "St Marks Shopping Precinct", url: "https://stmarks-lincoln.co.uk/" }, // Lincoln (St Marks Shopping Centre)
    { name: "Priors Hall Park", url: "https://priorshallparkmanagement.co.uk/" }, // Corby
    { name: "Hildreds Centre", url: "https://hildredsshoppingcentre.co.uk/" }, // Skegness
    { name: "Grosvenor Shopping", url: "https://grosvenorshoppingnorthampton.co.uk/" }, // Northampton

    // Batch C
    { name: "Fosse Park", url: "https://fossepark.co.uk/" },
    { name: "Four Seasons Shopping Centre", url: "https://fourseasonsshopping.co.uk/" }, // Mansfield
    { name: "Idlewells Shopping Centre", url: "https://idlewells.co.uk/" }, // Sutton-in-Ashfield
    { name: "Beaumont Shopping Centre", url: "https://beaumontshoppingcentre.com/" }, // Leicester
    { name: "Haymarket Shopping Centre", url: "https://haymarketshoppingcentre.com/" }, // Leicester
    { name: "Grosvenor Centre", url: "https://grosvenorshoppingnorthampton.co.uk/" }, // Duplicate of above, ensures matching
    { name: "Newlands Shopping Centre", url: "https://newlandsshopping.co.uk/" }, // Kettering
    { name: "Derbion", url: "https://derbion.com/" }, // Derby
    { name: "Belvoir Shopping Centre", url: "https://belvoirshoppingcentre.co.uk/" } // Coalville
];

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log(`🚀 Starting East Midlands Enrichment (${TARGETS.length} Sites)...`);
    let successCount = 0;

    for (const t of TARGETS) {
        console.log(`\n📍 Processing: ${t.name}...`);

        // Use loose matching for names to catch slight variations
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
        console.log(`   ✅ Matched: ${location.name} (ID: ${location.id}) - ${location.city}`);

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

    console.log(`\n🎉 East Midlands Enrichment Complete! Updated ${successCount}/${TARGETS.length}.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
