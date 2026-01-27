
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const TARGETS = [
    // Batch A
    { name: "Abbey Centre", url: "https://lesleyabbeycentre.co.uk/" }, // Newtownabbey
    { name: "Ards Shopping Centre", url: "https://ardsshoppingcentre.com/" }, // Newtownards
    { name: "Beacon Centre", url: "https://thebeaconcentre.co.uk/" }, // North Shields
    { name: "Bloomfield Shopping Centre", url: "https://bloomfieldcentre.co.uk/" }, // Bangor NI
    { name: "Bow Street Mall", url: "https://bowstreetmall.co.uk/" }, // Lisburn
    { name: "The Bridges Shopping Centre", url: "https://www.thebridges-shopping.com/" }, // Sunderland
    { name: "Buttercrane Shopping Centre", url: "https://www.buttercranecentre.co.uk/" }, // Newry
    { name: "Byron Place", url: "https://byronplace.co.uk/" }, // Seaham
    { name: "Captain Cook Square", url: "https://captaincooksq.co.uk/" }, // Middlesbrough
    { name: "Castle Dene Shopping Centre", url: "https://castledeneshoppingcentre.co.uk/" }, // Peterlee
    { name: "CastleCourt", url: "https://castlecourt-uk.com/" }, // Belfast
    { name: "Cleveland Centre", url: "https://www.clevelandcentre.co.uk/" }, // Middlesbrough
    { name: "Cornmill Shopping Centre", url: "https://cornmillcentre.co.uk/" }, // Darlington
    { name: "Dundas Shopping Centre", url: "https://dundasshoppingcentre.co.uk/" }, // Middlesbrough

    // Batch B
    { name: "Eldon Square", url: "https://eldonsquare.co.uk/" }, // Newcastle
    { name: "Erneside Shopping Centre", url: "https://ernesidecentre.com/" }, // Enniskillen
    { name: "Fairhill Shopping Centre", url: "https://fairhillshopping.co.uk/" }, // Ballymena
    { name: "Forestside Shopping Centre", url: "https://forestside.co.uk/" }, // Belfast
    { name: "Foyleside Shopping Centre", url: "https://foyleside.co.uk/" }, // Derry
    { name: "Galleries Shopping Centre", url: "https://www.gallerieswashington.co.uk/" }, // Washington
    { name: "Hillstreet Centre", url: "https://hillstreetshopping.com/" }, // Middlesbrough
    { name: "Kennedy Centre", url: "https://kennedycentre.co.uk/" }, // Belfast
    { name: "Manor Walks Shopping Centre", url: "https://www.manorwalks.co.uk/" }, // Cramlington
    { name: "Metrocentre", url: "https://themetrocentre.co.uk/" }, // Gateshead
    { name: "Middleton Grange Shopping Centre", url: "http://www.middleton-grange.co.uk/" }, // Hartlepool
    { name: "Newgate Shopping Centre", url: "https://newgateshopping.com/" }, // Bishop Auckland
    { name: "Park Centre", url: "https://theparkcentre.co.uk/" }, // Belfast

    // Batch C
    { name: "Park View Shopping Centre", url: "https://parkviewshoppingcentre.co.uk/" }, // Whitley Bay
    { name: "Prince Bishops Place", url: "https://princebishopsplace.co.uk/" }, // Durham
    { name: "Queen Street Shopping Centre", url: "https://queenstreetshoppingcentre.co.uk/" }, // Darlington
    { name: "Richmond Centre", url: "https://richmondcentre.co.uk/" }, // Derry
    { name: "Rushmere Shopping Centre", url: "https://rushmereshopping.com/" }, // Craigavon
    { name: "Sanderson Arcade", url: "https://sandersonarcade.co.uk/" }, // Morpeth
    { name: "The Forum Shopping Centre", url: "https://theforumshoppingcentre.co.uk/" }, // Wallsend
    { name: "The Gate", url: "https://www.thegatenewcastle.co.uk/" }, // Newcastle
    { name: "The Quays Shopping Centre", url: "https://thequays.co.uk/" }, // Newry
    { name: "The Riverwalk", url: "https://theriverwalk.co.uk/" }, // Durham
    { name: "Tower Centre", url: "https://towercentre.com/" }, // Ballymena
    { name: "Trinity Square", url: "https://trinitysquaregateshead.co.uk/" }, // Gateshead
    { name: "Victoria Square", url: "https://victoriasquare.com/" }, // Belfast
    { name: "Wellington Square", url: "https://wellingtonshops.co.uk/" } // Stockton
];

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log(`🚀 Starting North East & NI Enrichment (${TARGETS.length} Sites)...`);
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

    console.log(`\n🎉 North East & NI Enrichment Complete! Updated ${successCount}/${TARGETS.length}.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
