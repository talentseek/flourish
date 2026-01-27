
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const TARGETS = [
    // Batch A
    { name: "The Brunel", url: "https://thebrunel.co.uk/" },
    { name: "Quedam Shopping Centre", url: "https://quedamshopping.co.uk/" },
    { name: "Eastgate Shopping Centre", url: "https://eastgateshoppingcentre.co.uk/" },
    { name: "Darts Farm", url: "https://dartsfarm.co.uk/" },
    { name: "Bishops Walk", url: "https://bishops-walk.co.uk/" },
    { name: "Castle Place Shopping Centre", url: "https://castleplacetrowbridge.com/" },
    { name: "Crown Glass Shopping Centre", url: "https://crownglassnailsea.co.uk/" },
    { name: "Orchard Shopping Centre", url: "https://orchardtaunton.co.uk/" },
    { name: "Princesshay", url: "https://princesshay.co.uk/" },
    { name: "Richmond Gardens Shopping Centre", url: "https://richmondgardensshoppingcentre.co.uk/" },
    { name: "The Sovereign", url: "https://thesovereignweston.co.uk/" }, // Matches Weston-super-Mare
    { name: "Saxon Square Shopping Centre", url: "https://saxon-square.co.uk/" },
    { name: "SouthGate", url: "https://southgatebath.com/" },

    // Batch B
    { name: "St Mary Shopping Centre", url: "https://stmarycentre.co.uk/" },
    { name: "The Dolphin", url: "https://dolphinshoppingcentre.co.uk/" }, // Poole
    { name: "The Guild Wiltshire", url: "https://theguildwiltshire.co.uk/" },
    { name: "The Mall at Cribbs Causeway", url: "https://mallcribbs.com/" },
    { name: "The Martingate Centre", url: "https://martingate.co.uk/" },
    { name: "The Quedam Centre", url: "https://quedamshopping.co.uk/" }, // Duplicate, ensure coverage
    { name: "Three Horseshoes Walk", url: "https://threehorseshoeswalk.co.uk/" },
    { name: "Union Square", url: "https://unionsquaretorquay.co.uk/" }, // Torquay record
    { name: "White River Place", url: "https://whiteriverplace.co.uk/" },
    { name: "Wharfside Shopping Centre", url: "https://wharfsidepz.co.uk/" },
    { name: "Westway Centre", url: "https://westwayfrome.co.uk/" },

    // Batch C
    { name: "Willow Brook Centre", url: "https://willowbrookshopping.co.uk/" },
    { name: "Yate Shopping Centre", url: "https://yateshoppingcentre.co.uk/" },
    { name: "The Galleries", url: "https://galleriesbristol.co.uk/" },
    { name: "West Swindon Shopping Centre", url: "https://wssc.co.uk/" },
    { name: "Clifton Down Shopping Centre", url: "https://cliftondown.co.uk/" },
    { name: "County Walk Shopping Centre", url: "https://countywalktaunton.co.uk/" },
    { name: "Emery Gate Shopping Centre", url: "https://emerygate.co.uk/" },
    { name: "Five Valleys Shopping Centre", url: "https://fivevalleysstroud.co.uk/" },
    { name: "Fleet Walk Shopping Centre", url: "https://fleetwalkshoppingtorquay.co.uk/" },
    { name: "Kings Chase Shopping Centre", url: "https://kingschase.co.uk/" },
    { name: "Kings Walk Shopping Centre", url: "https://thekingsquarter.co.uk/" }, // Gloucester
    { name: "Market Walk Shopping Centre", url: "https://mwshopping.co.uk/" },
    { name: "Armada Centre", url: "https://armadacentre.co.uk/" },

    // Batch D
    { name: "Regent Arcade Shopping Centre", url: "https://regentarcade.co.uk/" },
    { name: "Drake Circus Shopping Centre", url: "https://drakecircus.com/" },
    { name: "Brewery Square", url: "https://brewerysquare.com/" },
    { name: "Tower Park", url: "https://towerparkentertainment.co.uk/" },
    { name: "Old George Mall", url: "https://oldgeorgemall.co.uk/" },
    { name: "Cabot Circus", url: "https://cabotcircus.co.uk/" },
    { name: "Guildhall Shopping Centre", url: "https://guildhallshoppingexeter.co.uk/" },
    { name: "Green Lanes Shopping Centre", url: "https://greenlanes.co.uk/" },
    { name: "Angel Place Shopping Centre", url: "https://angel-place.co.uk/" },
    { name: "Cross Keys Shopping Centre", url: "https://crosskeysshoppingcentre.co.uk/" }
];

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log(`🚀 Starting South West Enrichment (${TARGETS.length} Sites)...`);
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

        // Ideally we filter by region if names are ambiguous, but here names are fairly specific
        // or duplicated within the region (e.g. Quedam).
        // Let's take the first match that looks reasonable (unmanaged).
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

    console.log(`\n🎉 South West Enrichment Complete! Updated ${successCount}/${TARGETS.length}.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
