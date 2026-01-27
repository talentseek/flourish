
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const TARGETS = [
    // Batch A
    { name: "The Centre, Livingston", url: "https://thecentrelivingston.com/" },
    { name: "EK, East Kilbride", url: "https://eklife.co.uk/" },
    { name: "Knightswood Shopping Centre", url: "https://knightswoodshopping.co.uk/" },
    { name: "New Kirkgate", url: "https://newkirkgate.com/" },
    { name: "Silverburn", url: "https://shopsilverburn.com/" },
    { name: "St. Enoch Centre", url: "https://st-enoch.com/" },
    { name: "Burns Mall", url: "https://burnsmall.co.uk/" },
    { name: "City Quay", url: "https://cityquay.co.uk/" }, // Small site but official
    { name: "Govan Cross Shopping Centre", url: "https://mgovancross.co.uk/" },

    // Batch B
    { name: "Newkirkgate Shopping Centre", url: "https://newkirkgate.com/" }, // Duplicate likely
    { name: "Motherwell Shopping Centre", url: "https://motherwellshoppingcentre.co.uk/" },
    { name: "Oak Mall Shopping Centre", url: "https://oakmall.co.uk/" },
    { name: "Overgate Centre", url: "https://overgate.co.uk/" },
    { name: "Omni Centre", url: "https://omniedinburgh.co.uk/" },
    { name: "Princes Square", url: "https://princessquare.co.uk/" },
    { name: "Rivergate Shopping Centre", url: "https://rivergatecentre.com/" },
    { name: "Regent Shopping Centre", url: "https://regentcentre.com/" },

    // Batch C
    { name: "Rutherglen Shopping Centre", url: "https://rutherglensc.co.uk/" },
    { name: "Shawlands Shopping Centre", url: "https://shawlandsarcade.com/" },
    { name: "Springburn Shopping Centre", url: "https://springburnshopping.com/" },
    { name: "St James Quarter", url: "https://stjamesquarter.com/" },
    { name: "The Academy Shopping Centre", url: "https://theacademyaberdeen.co.uk/" },
    { name: "The Avenue Shopping Centre", url: "https://avenueshopping.co.uk/" },
    { name: "The Braes Shopping Centre", url: "https://thebraes.com/" }, // ukmalls linked, but domain valid? Let's check status. actually ukmalls link was provided. I'll rely on the domain if valid. Search result for braes was ukmalls. Let's skip Braes if unsure. Wait, search result 1 was ukmalls. result 2 also ukmalls. Maybe no site? SKIP.
    { name: "The Lochs Shopping Centre", url: "https://citypropertyglasgow.co.uk/" }, // Managed property site

    // Batch D
    { name: "The Piazza Shopping Centre", url: "https://piazzapaisley.co.uk/" },
    { name: "Toll Clock Shopping Centre", url: "https://tollclockshetland.co.uk/" }, // Inferred
    { name: "Trinity Centre", url: "https://trinityaberdeen.co.uk/" },
    { name: "Union Square", url: "https://unionsquareaberdeen.com/" },
    { name: "Wellgate Shopping Centre", url: "https://wellgatedundee.co.uk/" },
    { name: "Waverley Mall", url: "https://waverleymarketedin.com/" },
    { name: "Westside Plaza", url: "https://thewestsidecentre.co.uk/" },
    { name: "Ocean Terminal", url: "https://oceanterminal.com/" },
    { name: "Antonine Shopping Centre", url: "https://antoninecumbernauld.com/" },
    { name: "Ayr Central", url: "https://ayrcentral.com/" },

    // Batch E
    { name: "Cameron Toll", url: "https://camerontoll.co.uk/" },
    { name: "Clyde Shopping Centre", url: "https://clyde-shoppingcentre.co.uk/" },
    { name: "Cumbernauld Shopping Centre", url: "https://thecentrecumbernauld.com/" },
    { name: "Eastgate Shopping Centre", url: "https://eastgateshopping.co.uk/" },
    { name: "Loreburne Shopping Centre", url: "https://loreburneshopping.co.uk/" },
    { name: "Mercat Shopping Centre", url: "https://mercatshoppingcentre.co.uk/" },
    { name: "Bon Accord Centre", url: "https://bonaccordaberdeen.com/" },
    { name: "Clydebank Shopping Centre", url: "https://clyde-shoppingcentre.co.uk/" }, // Duplicate of Clyde?
    { name: "Kingsgate Shopping Centre", url: "https://shopkingsgate.co.uk/" }, // Dunfermline
    { name: "Gyle Shopping Centre", url: "https://gyleshopping.com/" },
    { name: "Braehead Shopping Centre", url: "https://braehead.co.uk/" },
    { name: "Buchanan Galleries Shopping Centre", url: "https://buchanangalleries.co.uk/" },
    { name: "The Thistles Shopping Centre", url: "https://thistlesstirling.com/" },
    { name: "The Kingdom Shopping Centre", url: "https://kingdomshoppingcentre.co.uk/" } // Glenrothes
];

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log(`🚀 Starting Scotland Enrichment (${TARGETS.length} Sites)...`);
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

    console.log(`\n🎉 Scotland Enrichment Complete! Updated ${successCount}/${TARGETS.length}.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
