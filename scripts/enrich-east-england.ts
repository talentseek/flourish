
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const TARGETS = [
    // Batch A
    { name: "Lion Walk Shopping Centre", url: "https://lionwalkshopping.com/" },
    { name: "The Harvey Centre", url: "https://harveycentre.com/" },
    { name: "The Meadows", url: "https://themeadows.co.uk/" },
    { name: "Bond Street Chelmsford", url: "https://bondstreetchelmsford.co.uk/" },
    { name: "Eastgate Shopping Centre", url: "https://eastgateshoppingcentre.com/" }, // Basildon
    { name: "Buttermarket Shopping Centre", url: "https://buttermarketipswich.com/" },
    { name: "Arc Shopping Centre", url: "https://arc-burystedmunds.com/" },
    { name: "George Yard Shopping Centre", url: "https://georgeyard.co.uk/" },
    { name: "The Harpur Centre", url: "https://harpurcentre.co.uk/" },
    { name: "Newlands Shopping Centre", url: "https://newlandswitham.co.uk/" },
    { name: "Pavilions Shopping Centre", url: "https://pavilionsshoppingcentre.co.uk/" },
    { name: "Quadrant Centre", url: "https://quadrantdunstable.co.uk/" }, // Dunstable

    // Batch B
    { name: "The Baytree Centre", url: "https://baytreeshoppingcentre.com/" },
    { name: "The Britten Shopping Centre", url: "https://brittencentre.com/" },
    { name: "The Howard Centre", url: "https://howardcentre.co.uk/" }, // Welwyn
    { name: "The Grove Shopping Centre", url: "https://groveshopping.co.uk/" },
    { name: "The Marlowes Shopping Centre", url: "https://themarlowes.co.uk/" },
    { name: "Victoria Shopping Centre", url: "https://thevictoriacentre.co.uk/" }, // Southend
    { name: "The Water Gardens Shopping Centre", url: "https://thewatergardensharlow.com/" },
    { name: "Vancouver Quarter Shopping Centre", url: "https://vancouverquarter.com/" },
    { name: "The Guineas Shopping Centre", url: "https://theguineas-shopping.co.uk/" },

    // Batch C
    { name: "Ortongate Shopping Centre", url: "http://www.ortongate.co.uk/" },
    { name: "Westgate Shopping Centre", url: "https://westgateshopping.co.uk/" },
    { name: "Serpentine Green", url: "https://serpentine-green.com/" },
    { name: "Castle Quarter", url: "https://castlequarter.com/" },
    { name: "Chequers Shopping Centre", url: "https://chequersshopping.co.uk/" },
    { name: "Garden Square Shopping Centre", url: "https://gardensquare-shopping.co.uk/" },
    { name: "Horsefair Shopping Centre", url: "https://horsefairshoppingcentre.co.uk/" },
    { name: "Jackson Square", url: "https://jacksonsquareshopping.co.uk/" },
    { name: "Knightswick Shopping Centre", url: "https://knightswickshoppingcentre.co.uk/" },
    { name: "Maltings Shopping Centre", url: "https://themaltingsstalbans.co.uk/" },

    // Batch D
    { name: "Atria Watford", url: "https://harlequinwatford.com/" }, // Rebranded
    { name: "Christopher Place Shopping Centre", url: "https://christopher-place.co.uk/" },
    { name: "Queensgate Shopping Centre", url: "https://queensgate-shopping.co.uk/" },
    { name: "Lion Yard Shopping Centre", url: "https://thelionyard.co.uk/" },
    { name: "Riverside Leisure Park", url: "https://riversidenorwich.co.uk/" },
    { name: "Grays Shopping Centre", url: "https://graysshoppingcentre.co.uk/" },
    { name: "Market Gates Shopping Centre", url: "https://marketgates-shopping.co.uk/" },
    { name: "Grand Arcade", url: "https://grandarcade.co.uk/" },
    { name: "The Grafton", url: "https://graftoncentre.co.uk/" },
    { name: "Luton Point", url: "https://lutonpoint.co.uk/" },
    { name: "Culver Square", url: "https://culversquare.co.uk/" },
    { name: "Chantry Place", url: "https://chantryplace.co.uk/" },
    { name: "Riverside Shopping Centre", url: "https://riversidehemel.com/" },
    { name: "The Royals Shopping Centre", url: "https://royalsshoppingcentre.co.uk/" },
    { name: "High Chelmer Shopping Centre", url: "https://highchelmer.com/" }
];

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log(`🚀 Starting East of England Enrichment (${TARGETS.length} Sites)...`);
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

    console.log(`\n🎉 East of England Enrichment Complete! Updated ${successCount}/${TARGETS.length}.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
