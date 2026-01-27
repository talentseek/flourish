
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const TARGETS = [
    // Batch A
    { name: "Alhambra Shopping Centre", url: "https://alhambracentre.co.uk/" },
    { name: "Captain Cook Square", url: "https://captaincooksquare.com/" },
    { name: "Carlton Lanes Shopping Centre", url: "https://carltonlanes.com/" },
    { name: "Cleveland Centre", url: "https://clevelandcentre.co.uk/" },
    { name: "Coppergate Shopping Centre", url: "https://coppergate-york.co.uk/" },
    { name: "Craven Court Shopping Centre", url: "https://cravencourtskipton.co.uk/" },
    { name: "Crossgates Shopping Centre", url: "https://crossgatesshopping.co.uk/" },
    { name: "Dundas Shopping Centre", url: "https://dundasshoppingcentre.co.uk/" },

    // Batch B
    { name: "Flemingate Shopping Centre", url: "https://flemingate.co.uk/" },
    { name: "Frenchgate Shopping Centre", url: "https://frenchgate.co.uk/" },
    { name: "Hildreds Centre", url: "https://hildredsshoppingcentre.co.uk/" },
    { name: "Hillstreet Centre", url: "https://hillstreet.co.uk/" },
    { name: "Hillsborough Exchange", url: "https://hillsboroughexchange.com/" },
    { name: "Isaac Newton Shopping Centre", url: "https://isaacnewtonshopping.co.uk/" },
    { name: "Kingsgate Shopping Centre", url: "https://kingsgateshoppingcentre.co.uk/" }, // Huddersfield
    { name: "The Kirkgate Shopping Centre", url: "https://kirkgate.co.uk/" },
    { name: "Leeds Corn Exchange", url: "https://leedscornexchange.co.uk/" },
    { name: "Market Cross Shopping Centre", url: "https://marketcross-selby.co.uk/" },

    // Batch C
    { name: "Meadowhall Centre", url: "https://meadowhall.co.uk/" },
    { name: "Merrion Centre", url: "https://merrioncentre.co.uk/" },
    { name: "The Packhorse Shopping Centre", url: "https://packhorseshoppingcentre.co.uk/" },
    { name: "Pescod Square Shopping Mall", url: "https://pescodsquare.com/" },
    { name: "Princess Of Wales Shopping Centre", url: "https://estama.co.uk/" }, // Property manager site, no standalone found
    { name: "Promenades Shopping Centre", url: "https://promenadesbridlington.co.uk/" },
    { name: "Prospect Shopping Centre", url: "https://prospectshoppingcentre.co.uk/" },
    { name: "The Ridings", url: "https://ridingscentre.com/" },
    { name: "St. Johns Centre", url: "https://stjohnscentreleeds.co.uk/" }, // Leeds
    { name: "St Stephens Shopping Centre", url: "https://ststephens-hull.com/" }, // Hull
    { name: "The Glass Works", url: "https://theglassworksbarnsley.com/" },
    { name: "Trinity Walk Shopping Centre", url: "https://trinitywalk.com/" },
    { name: "Victoria Leeds", url: "https://victoria-leeds.co.uk/" },
    { name: "White Rose Shopping Centre", url: "https://whiteroseshopping.co.uk/" },
    { name: "Woolshops Shopping Centre", url: "https://woolshops.co.uk/" }
];

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log(`🚀 Starting Yorkshire Enrichment (${TARGETS.length} Sites)...`);
    let successCount = 0;

    for (const t of TARGETS) {
        console.log(`\n📍 Processing: ${t.name}...`);

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

    console.log(`\n🎉 Yorkshire Enrichment Complete! Updated ${successCount}/${TARGETS.length}.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
