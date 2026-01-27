
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const TARGETS = [
    // Batch A
    { name: "Angel Central", url: "https://angelcentral.co.uk/" }, // Islington (formerly N1)
    { name: "Battersea Power Station", url: "https://batterseapowerstation.co.uk/" },
    { name: "Brent Cross Shopping Centre", url: "https://www.brentcross.co.uk/" },
    { name: "Broadway Shopping Centre", url: "https://www.broadwayshoppingcentre.com/" }, // Bexleyheath
    { name: "Cardinal Place", url: "https://atvictorialondon.com/" }, // Victoria
    { name: "Canary Wharf Shopping Centre", url: "https://canarywharf.com/shops-services/" },
    { name: "Coal Drops Yard", url: "https://www.coaldropsyard.com/" },
    { name: "East Shopping Centre", url: "https://eastshoppingcentre.com/" }, // Green St
    { name: "Edmonton Green Shopping Centre", url: "https://edmontongreencentre.co.uk/" },
    { name: "Eden Walk Shopping Centre", url: "https://www.edenwalkshopping.co.uk/" }, // Kingston
    { name: "Erith Riverside Shopping Centre", url: "https://erith-riverside.co.uk/" },
    { name: "Ealing Broadway Shopping Centre", url: "https://www.ealingbroadwayshopping.co.uk/" },
    { name: "Fulham Broadway Shopping Centre", url: "https://fulhambroadway.co.uk/" },
    { name: "Gabriel's Wharf", url: "https://coinstreet.org/gabriels-wharf" }, // Coin Street managed
    { name: "Hammersmith Broadway Shopping Centre", url: "https://broadwayhammersmith.co.uk/" },

    // Batch B
    { name: "Hay's Galleria", url: "https://hays-galleria.com/" },
    { name: "Heathway Shopping", url: "https://heathwayshoppingcentre.co.uk/" }, // Dagenham
    { name: "Icon Outlet", url: "https://www.theo2.co.uk/icon-outlet" }, // Included in O2
    { name: "Kingsland Shopping Centre", url: "https://kingslandshoppingcentre.co.uk/" }, // Dalston
    { name: "Livat Hammersmith", url: "https://www.livat.com/hammersmith" }, // Replaced Kings Mall
    { name: "Lakeside Shopping Centre", url: "https://lakeside-shopping.com/" }, // Thurrock (Greater London periphery)
    { name: "Leadenhall Market", url: "https://leadenhallmarket.co.uk/" },
    { name: "Lewisham Shopping Centre", url: "https://lewishamshopping.co.uk/" },
    { name: "London Designer Outlet", url: "https://londondesigneroutlet.com/" }, // Wembley
    { name: "N1 Shopping Centre", url: "https://angelcentral.co.uk/" }, // Duplicate/Old name for Angel Central - ensure match
    { name: "One New Change", url: "https://onenewchange.com/" },
    { name: "Palace Shopping", url: "https://palaceshopping.co.uk/" }, // Enfield
    { name: "St Christopher's Place", url: "https://stchristophersplace.com/" },
    { name: "St Katharine Docks", url: "https://www.skdocks.co.uk/" },

    // Batch C
    { name: "Surrey Quays Shopping Centre", url: "https://www.surreyquays.co.uk/" },
    { name: "The Bentall Centre", url: "https://www.bentallcentre.co.uk/" }, // Kingston
    { name: "The Broadwalk Centre", url: "https://www.thebroadwalkcentre.co.uk/" }, // Edgware
    { name: "The Brunswick Centre", url: "https://www.thebrunswick.london/" },
    { name: "The Centre, Feltham", url: "https://www.thecentrefeltham.co.uk/" },
    { name: "The Chimes", url: "https://chimesuxbridge.co.uk/" }, // Uxbridge
    { name: "The Exchange", url: "https://exchangeilford.co.uk/" }, // Ilford
    { name: "The Glades", url: "https://www.theglades.co.uk/" }, // Bromley
    { name: "The Liberty Shopping Centre", url: "https://www.theliberty.co.uk/" }, // Romford
    { name: "The Mall Wood Green", url: "https://www.themallwoodgreen.co.uk/" },
    { name: "The Mercury", url: "https://www.themercurymall.co.uk/" }, // Romford
    { name: "The O2 Centre", url: "https://o2centre.co.uk/" }, // Finchley Road
    { name: "The Pavilions", url: "https://www.pavilionsuxbridge.co.uk/" }, // Uxbridge
    { name: "Whitgift Shopping Centre", url: "https://centraleandwhitgift.co.uk/" }, // Croydon
    { name: "Westfield London", url: "https://www.westfield.com/united-kingdom/london" },
    { name: "Westfield Stratford City", url: "https://www.westfield.com/united-kingdom/stratfordcity" },
    { name: "Wimbledon Quarter", url: "https://wimbledonquarter.com/" }
];

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log(`🚀 Starting London Enrichment (${TARGETS.length} Sites)...`);
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

    console.log(`\n🎉 London Enrichment Complete! Updated ${successCount}/${TARGETS.length}.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
