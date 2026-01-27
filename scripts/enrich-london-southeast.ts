
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const TARGETS = [
    // London Batch
    { name: "The Mall Wood Green", url: "https://themallwoodgreen.co.uk/" },
    { name: "The Brewery", city: "Greater London", url: "https://thebreweryromford.com/" },
    { name: "Pavilions Shopping Centre", city: "Greater London", url: "https://thepavilions.co.uk/" }, // Uxbridge
    { name: "Stratford Centre", url: "https://stratfordshopping.co.uk/" },
    { name: "St. Ann's Shopping Centre", city: "Greater London", url: "https://stannsshopping.co.uk/" }, // Harrow
    { name: "The Centre, Feltham", url: "https://thecentrefeltham.co.uk/" },
    { name: "Livat Shopping Centre", url: "https://www.livat.com/hammersmith" },
    { name: "St. Nicholas Shopping Centre", city: "Greater London", url: "https://www.stnicssutton.co.uk/" }, // Sutton
    { name: "O2 Centre", url: "https://o2centre.co.uk/" },
    { name: "The Broadwalk Centre", url: "https://thebroadwalkcentre.co.uk/" },
    { name: "Times Square Shopping Centre", url: "https://timessquareshopping.co.uk/" },
    { name: "Victoria Place Shopping Centre", url: "https://victoriaplace.co.uk/" },
    { name: "The Oaks", city: "Greater London", url: "https://oaksacton.co.uk/" },
    { name: "Shopstop Clapham Junction", url: "https://shopstopclaphamjunction.com/" },
    { name: "West One Shopping Centre", url: "https://west1shopping.co.uk/" },
    { name: "Portobello Green", url: "https://portobellofashionmarket.co.uk/" },
    { name: "The Royal Exchange", url: "https://www.theroyalexchange.co.uk/" },
    { name: "St. George's Shopping Centre", city: "Greater London", url: "https://stgeorgesharrow.com/" },
    { name: "Palace Exchange", url: "https://palaceshopping.co.uk/" },
    { name: "The Mall", city: "Greater London", url: "https://theglades.co.uk/" }, // Bromley (Rebranded)
    { name: "The Aylesham Centre", url: "https://theayleshamcentre.community/" },

    // South East Batch
    { name: "Swan Shopping Centre", city: "Leatherhead", url: "https://theswancentre.co.uk/" },
    { name: "The Elmsleigh Centre", url: "https://elmsleigh.co.uk/" },
    { name: "The Heart Of Walton", url: "https://heartshopping.co.uk/" },
    { name: "Tunsgate Quarter", url: "https://tunsgatequarter.co.uk/" },
    { name: "Victoria Place", city: "Woking", url: "https://vpwoking.co.uk/" },
    { name: "The Quintins", url: "https://quintinscentre.co.uk/" },
    { name: "The Chantry Centre", url: "https://thechantrycentre.com/" },
    { name: "The Furlong", url: "https://thefurlong.co.uk/" },
    { name: "The Swan Shopping Centre", city: "Eastleigh", url: "https://swanshoppingcentre.co.uk/" }, // Distinguish from Leatherhead
    { name: "Whiteley Shopping Centre", url: "https://whiteleyshopping.co.uk/" },
    { name: "The Malls", city: "Basingstoke", url: "https://themalls.co.uk/" },
    { name: "The Marlands", url: "https://marlandsshoppingcentre.co.uk/" },
    { name: "The Kidlington Centre", url: "https://thekidlingtoncentre.com/" },
    { name: "Woolgate Shopping Centre", url: "https://woolgateshoppingcentre.co.uk/" },
    { name: "Abbey Shopping Centre", url: "https://burystabingdon.co.uk/" }
];

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log(`🚀 Starting Bulk Enrichment for ${TARGETS.length} Sites (London & SE)...`);
    let successCount = 0;

    for (const t of TARGETS) {
        console.log(`\n📍 Processing: ${t.name}...`);

        // 1. Find Location (More precise matching needed given duplicates)
        const whereClause: any = {
            name: { contains: t.name, mode: 'insensitive' }
        };
        if (t.city) {
            whereClause.city = { contains: t.city, mode: 'insensitive' };
        }

        const locs = await prisma.location.findMany({ where: whereClause });

        if (locs.length === 0) {
            console.log(`   ❌ Could not find location in DB matching "${t.name}"`);
            continue;
        }

        // Use the first match, but prefer one without a website if multiple exist
        let location = locs.find(l => !l.website) || locs[0];
        console.log(`   ✅ Matched: ${location.name} (${location.city})`);

        // 2. Update Website URL
        const socials: any = { website: t.url };

        // 3. Scrape for Socials
        try {
            const resp = await axios.get(t.url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
                timeout: 8000
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

        await delay(300); // Rate limit
    }

    console.log(`\n🎉 Bulk Enrichment Complete! Updated ${successCount}/${TARGETS.length} sites.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
